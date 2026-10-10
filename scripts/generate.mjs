#!/usr/bin/env node
/**
 * Tool generator.
 *
 * Reads the pinned @apple/apple-ads-platform SDK (type declarations + compiled param
 * creators), joins every SDK operation with scripts/curated.mjs and emits:
 *
 *   src/generated/schemas.ts     zod schemas for every request model reachable from an operation
 *   src/tools/<group>.ts         one tool-definition file per API group
 *   src/tools/index.ts           aggregate registry of the generated tools
 *   docs/coverage.json           machine-readable coverage manifest
 *   docs/COVERAGE.md             human-readable coverage manifest (+ per-group counts)
 *   README.md                    only the block between the GENERATED markers
 *
 * Usage:  node scripts/generate.mjs           write files
 *         node scripts/generate.mjs --check   fail (exit 1) if files on disk are stale
 *
 * The generator throws if an SDK operation has no curated mapping or vice versa, so an
 * SDK upgrade that adds an operation can never silently leave it uncovered.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { GROUPS, OPS, PATH_PARAM_NAMES, ID_NOUNS } from "./curated.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SDK_DIR = path.join(ROOT, "node_modules", "@apple", "apple-ads-platform");
const DIST = path.join(SDK_DIR, "dist");

// ───────────────────────────── helpers ─────────────────────────────

const decodeEntities = (s) =>
  s
    .replace(/\\&#(39|x27);/g, "'")
    .replace(/&#x60;|&#96;/g, "`")
    .replace(/&#(39|x27);/g, "'")
    .replace(/&quot;|&#34;|&#x22;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");

const DEFAULT_PROP_DOCS = {
  filters:
    "Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields.",
  sorting: "Sort order, each {field, order: ASC|DESC}. Default is id ascending.",
  pagination: "Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page.",
};

const clean = (s) =>
  decodeEntities(String(s ?? ""))
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .trim();

const oneLine = (s) => clean(s).replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ");

const camel = (snake) => snake.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const J = (v) => JSON.stringify(v);

function jsDocOf(node) {
  const d = node.jsDoc?.[node.jsDoc.length - 1];
  if (!d) return { text: "", tags: [] };
  let text = clean(ts.getTextOfJSDocComment(d.comment) ?? "");
  // The generated file header comment is attached to the first declaration: ignore it.
  if (/Copyright \(c\)|OpenAPI Generator/i.test(text)) text = "";
  return {
    text,
    tags: (d.tags ?? []).map((t) => ({
      name: t.tagName.text,
      param: t.name ? t.name.getText() : undefined,
      text: clean(ts.getTextOfJSDocComment(t.comment) ?? ""),
    })),
  };
}

function parse(file) {
  const text = fs.readFileSync(file, "utf8");
  return ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true);
}

// ───────────────────────────── models ─────────────────────────────

function loadModels() {
  const models = new Map(); // name -> {kind, ...}
  const files = fs
    .readdirSync(path.join(DIST, "model"))
    .filter((f) => f.endsWith(".d.ts") && f !== "index.d.ts")
    .map((f) => path.join(DIST, "model", f));
  files.push(path.join(DIST, "api", "apple-ads-api.d.ts"));
  for (const file of files) {
    const sf = parse(file);
    for (const st of sf.statements) {
      if (ts.isInterfaceDeclaration(st)) {
        const parents = [];
        for (const h of st.heritageClauses ?? []) {
          for (const t of h.types) {
            if (ts.isIdentifier(t.expression) && !t.typeArguments) parents.push(t.expression.text);
          }
        }
        const props = st.members.filter(ts.isPropertySignature).map((m) => ({
          name: m.name.text ?? m.name.getText().replace(/^['"]|['"]$/g, ""),
          optional: !!m.questionToken,
          type: m.type,
          doc: jsDocOf(m).text,
          deprecated: jsDocOf(m).tags.some((t) => t.name === "deprecated"),
        }));
        models.set(st.name.text, { kind: "interface", name: st.name.text, parents, props, doc: jsDocOf(st).text });
      } else if (ts.isEnumDeclaration(st)) {
        const values = st.members.map((m) => {
          const init = m.initializer;
          if (init && ts.isStringLiteral(init)) return init.text;
          if (init && ts.isNumericLiteral(init)) return Number(init.text);
          if (init && ts.isPrefixUnaryExpression(init)) return Number(init.getText());
          return m.name.getText();
        });
        models.set(st.name.text, { kind: "enum", name: st.name.text, values, doc: jsDocOf(st).text });
      }
    }
  }
  return models;
}

// ───────────────────────────── API surface ─────────────────────────────

function loadApi() {
  const sf = parse(path.join(DIST, "api", "apple-ads-api.d.ts"));
  const cls = sf.statements.find((s) => ts.isClassDeclaration(s) && s.name?.text === "AppleAdsApi");
  if (!cls) throw new Error("AppleAdsApi class not found in SDK declarations");
  const methods = new Map();
  for (const m of cls.members) {
    if (!ts.isMethodDeclaration(m)) continue;
    const doc = jsDocOf(m);
    const params = m.parameters
      .filter((p) => p.name.getText() !== "options")
      .map((p) => {
        const name = p.name.getText();
        const tag = doc.tags.find((t) => t.name === "param" && t.param === name);
        return { name, optional: !!p.questionToken, type: p.type, typeText: p.type.getText(), doc: tag?.text ?? "" };
      });
    methods.set(m.name.getText(), {
      id: m.name.getText(),
      params,
      description: doc.text,
      summary: doc.tags.find((t) => t.name === "summary")?.text ?? "",
    });
  }

  // HTTP details from the compiled param creators
  const js = fs.readFileSync(path.join(DIST, "api", "apple-ads-api.js"), "utf8");
  const re = /^ {8}(\w+): async \(([^)]*)\) => \{([\s\S]*?)\n {8}\},?\n/gm;
  let mm;
  while ((mm = re.exec(js))) {
    const [, id, , body] = mm;
    const op = methods.get(id);
    if (!op) continue;
    const pathM = body.match(/const localVarPath = `([^`]*)`/);
    const methodM = body.match(/method: '(\w+)'/);
    if (!pathM || !methodM) throw new Error(`Cannot parse HTTP details of ${id}`);
    op.path = pathM[1];
    op.method = methodM[1];
    op.pathParams = [...body.matchAll(/replace\(`\{\$\{"(\w+)"\}\}`, encodeURIComponent\(String\((\w+)\)\)\)/g)].map((x) => ({ placeholder: x[1], variable: x[2] }));
    op.queryParams = [...body.matchAll(/localVarQueryParameter\['(\w+)'\] = (\w+);/g)].map((x) => ({ wire: x[1], variable: x[2] }));
    op.hasContext = /X-Ap-Context/.test(body);
    op.multipart = /multipart\/form-data/.test(body);
    op.formParams = [...body.matchAll(/localVarFormParams\.append\('(\w+)', (\w+)\)/g)].map((x) => ({ wire: x[1], variable: x[2] }));
    const dataM = body.match(/serializeDataIfNeeded\)?\((\w+),/);
    op.bodyVar = dataM ? dataM[1] : null;
  }
  for (const op of methods.values()) {
    if (!op.path) throw new Error(`No HTTP details found for SDK operation ${op.id}`);
  }
  return methods;
}

// ───────────────────────────── zod generation ─────────────────────────────

class SchemaEmitter {
  constructor(models) {
    this.models = models;
    this.done = new Map(); // name -> const name
    this.visiting = new Set();
    this.order = []; // [{name, code}]
    this.warnings = [];
  }

  constName(name) {
    return `${name}Schema`;
  }

  /** Make sure model `name` is emitted; returns the expression to reference it. */
  ref(name) {
    const model = this.models.get(name);
    if (!model) {
      this.warnings.push(`unknown type ${name} -> z.any()`);
      return `z.any()`;
    }
    if (this.done.has(name)) return this.constName(name);
    if (this.visiting.has(name)) return `z.any().describe(${J(`Recursive reference to ${name} (see its definition above).`)})`;
    this.visiting.add(name);
    let code;
    if (model.kind === "enum") {
      const vals = model.values;
      if (vals.every((v) => typeof v === "string")) code = `z.enum(${J(vals)} as [string, ...string[]])`;
      else code = `z.union([${vals.map((v) => `z.literal(${J(v)})`).join(", ")}])`;
    } else {
      const props = this.collectProps(model);
      const fields = props
        .map((p) => {
          let expr = this.type(p.type);
          if (p.optional) expr += ".optional()";
          const doc = [p.doc, p.deprecated && !/deprecated/i.test(p.doc) ? "(deprecated)" : ""].filter(Boolean).join(" ");
          if (doc) expr += `.describe(${J(oneLine(doc))})`;
          return `  ${J(p.name)}: ${expr},`;
        })
        .join("\n");
      code = `z.object({\n${fields}\n}).passthrough()`;
    }
    if (model.doc) code += `.describe(${J(oneLine(model.doc))})`;
    this.visiting.delete(name);
    this.done.set(name, this.constName(name));
    this.order.push({ name, code });
    return this.constName(name);
  }

  collectProps(model, seen = new Set()) {
    if (seen.has(model.name)) return [];
    seen.add(model.name);
    const out = [];
    for (const p of model.parents ?? []) {
      const parent = this.models.get(p);
      if (parent?.kind === "interface") out.push(...this.collectProps(parent, seen));
    }
    const own = new Map(model.props.map((p) => [p.name, p]));
    return [...out.filter((p) => !own.has(p.name)), ...model.props];
  }

  type(node) {
    switch (node.kind) {
      case ts.SyntaxKind.StringKeyword:
        return "z.string()";
      case ts.SyntaxKind.NumberKeyword:
        return "z.number()";
      case ts.SyntaxKind.BooleanKeyword:
        return "z.boolean()";
      case ts.SyntaxKind.AnyKeyword:
      case ts.SyntaxKind.UnknownKeyword:
        return "z.any()";
      case ts.SyntaxKind.ObjectKeyword:
        return "z.record(z.any())";
      case ts.SyntaxKind.ParenthesizedType:
        return this.type(node.type);
      case ts.SyntaxKind.ArrayType:
        return `z.array(${this.type(node.elementType)})`;
      case ts.SyntaxKind.LiteralType: {
        const lit = node.literal;
        if (ts.isStringLiteral(lit)) return `z.literal(${J(lit.text)})`;
        if (ts.isNumericLiteral(lit)) return `z.literal(${Number(lit.text)})`;
        if (lit.kind === ts.SyntaxKind.TrueKeyword) return "z.literal(true)";
        if (lit.kind === ts.SyntaxKind.FalseKeyword) return "z.literal(false)";
        return "z.null()";
      }
      case ts.SyntaxKind.TypeLiteral: {
        const idx = node.members.find(ts.isIndexSignatureDeclaration);
        if (idx) return `z.record(z.string(), ${this.type(idx.type)})`;
        const fields = node.members
          .filter(ts.isPropertySignature)
          .map((m) => `${J(m.name.getText().replace(/^['"]|['"]$/g, ""))}: ${this.type(m.type)}${m.questionToken ? ".optional()" : ""}`);
        return `z.object({ ${fields.join(", ")} }).passthrough()`;
      }
      case ts.SyntaxKind.UnionType: {
        let nullable = false;
        const parts = [];
        for (const t of node.types) {
          if (t.kind === ts.SyntaxKind.NullKeyword || (t.kind === ts.SyntaxKind.LiteralType && t.literal.kind === ts.SyntaxKind.NullKeyword)) {
            nullable = true;
          } else if (t.kind === ts.SyntaxKind.UndefinedKeyword) {
            // optional handled by caller
          } else parts.push(this.type(t));
        }
        let expr = parts.length === 1 ? parts[0] : `z.union([${parts.join(", ")}])`;
        if (nullable) expr += ".nullable()";
        return expr;
      }
      case ts.SyntaxKind.TypeReference: {
        const name = node.typeName.getText();
        const args = node.typeArguments ?? [];
        if (name === "Array" && args.length === 1) return `z.array(${this.type(args[0])})`;
        if (name === "Record" && args.length === 2) return `z.record(${this.type(args[0])}, ${this.type(args[1])})`;
        if (name === "Date") return "z.string()";
        return this.ref(name);
      }
      default:
        this.warnings.push(`unsupported type node ${ts.SyntaxKind[node.kind]} -> z.any()`);
        return "z.any()";
    }
  }
}

// ───────────────────────────── operation assembly ─────────────────────────────

const stripOptional = (code) => code;

function resourceOf(p) {
  return p.split("/").filter(Boolean)[0];
}

function pathParamName(op, pp) {
  if (pp.placeholder === "id") {
    const seg = resourceOf(op.path);
    if (seg === "ad-accounts") return "id"; // special: defaults to adAccountId
    return PATH_PARAM_NAMES[seg] ?? "id";
  }
  return pp.placeholder;
}

function unwrapArray(typeNode) {
  if (typeNode.kind === ts.SyntaxKind.ArrayType) return typeNode.elementType;
  if (typeNode.kind === ts.SyntaxKind.TypeReference && typeNode.typeName.getText() === "Array") return typeNode.typeArguments[0];
  return null;
}

function buildOperation(op, curated, emitter, models) {
  const [group, toolName, kind, summary] = curated;
  const paramByName = new Map(op.params.map((p) => [p.name, p]));
  const args = [];
  const shape = []; // {name, code}
  const takenNames = new Set();
  const addShape = (name, code) => {
    if (takenNames.has(name)) throw new Error(`${op.id}: duplicate tool argument ${name}`);
    takenNames.add(name);
    shape.push({ name, code });
  };

  // scope
  const ctxParam = paramByName.get("xApContext");
  let scope = "none";
  if (ctxParam) scope = ctxParam.optional ? "optional" : "adAccount";
  if (ctxParam) takenNames.add("adAccountId");

  const bodyParam = op.bodyVar ? paramByName.get(op.bodyVar) : null;
  let bodyModelName = null;
  let bodyIsArray = false;
  if (bodyParam) {
    const arrEl = unwrapArray(bodyParam.type);
    const refNode = arrEl ?? bodyParam.type;
    bodyIsArray = !!arrEl;
    if (refNode.kind === ts.SyntaxKind.TypeReference) bodyModelName = refNode.typeName.getText();
  }

  // Decide whether to flatten the body into top-level tool args.
  let flattenKeys = null;
  if (bodyParam && !bodyIsArray && bodyModelName && kind === "read") {
    const model = models.get(bodyModelName);
    if (model?.kind === "interface") {
      const props = emitter.collectProps(model);
      const names = props.map((p) => p.name);
      const reserved = new Set(["adAccountId", ...op.pathParams.map((pp) => pathParamName(op, pp)), ...op.queryParams.map((q) => q.wire)]);
      if (!names.some((n) => reserved.has(n))) flattenKeys = names;
    }
  }

  for (const p of op.params) {
    if (p.name === "xApContext") {
      args.push({ role: "context", sdk: p.name });
      continue;
    }
    const pp = op.pathParams.find((x) => x.variable === p.name);
    if (pp) {
      const name = pathParamName(op, pp);
      const isNum = p.type.kind === ts.SyntaxKind.NumberKeyword;
      const seg = resourceOf(op.path);
      let def;
      if (seg === "ad-accounts") def = "adAccountId";
      else if (seg === "orgs") def = "orgId";
      const noun = ID_NOUNS[name];
      let desc = p.doc || (noun ? `ID of the ${noun}.` : `${name} (path parameter).`);
      if (def === "adAccountId") desc = (p.doc || "ID of the ad account.") + " Defaults to adAccountId (the ad account in context).";
      if (def === "orgId") desc = (p.doc || "ID of the organization.") + " Defaults to APPLE_ADS_ORG_ID or the orgId returned by GET /me.";
      args.push({ role: "path", sdk: p.name, name, type: isNum ? "number" : "string", default: def });
      const base = isNum ? `numParam(${J(oneLine(desc))})` : `idParam(${J(oneLine(desc))})`;
      addShape(name, def ? `${base}.optional()` : base);
      continue;
    }
    const qp = op.queryParams.find((x) => x.variable === p.name);
    if (qp) {
      args.push({ role: "query", sdk: p.name, name: qp.wire });
      let code = emitter.type(p.type);
      if (p.optional) code += ".optional()";
      if (p.doc) code += `.describe(${J(oneLine(p.doc))})`;
      addShape(qp.wire, code);
      continue;
    }
    if (op.multipart && p.name === "file") {
      args.push({ role: "file", sdk: p.name });
      addShape("filePath", `z.string().optional().describe("Absolute path to a local image file (PNG, JPG or HEIC) on the machine running this MCP server. Provide this OR contentBase64.")`);
      addShape("contentBase64", `z.string().optional().describe("Base64-encoded image bytes (alternative to filePath). Also provide fileName.")`);
      addShape("fileName", `z.string().optional().describe("File name including extension, e.g. logo.png. Required with contentBase64; defaults to the basename of filePath.")`);
      addShape("contentType", `z.string().optional().describe("MIME type, e.g. image/png. Inferred from the file extension when omitted.")`);
      continue;
    }
    if (op.formParams.some((f) => f.variable === p.name)) {
      args.push({ role: "form", sdk: p.name, name: p.name });
      let code = emitter.type(p.type);
      if (!p.optional) { /* required */ } else code += ".optional()";
      if (p.doc) code += `.describe(${J(oneLine(p.doc))})`;
      addShape(p.name, code);
      continue;
    }
    if (bodyParam && p.name === bodyParam.name) {
      const model = bodyModelName ? models.get(bodyModelName) : null;
      if (flattenKeys) {
        const props = emitter.collectProps(model);
        args.push({ role: "body", sdk: p.name, mode: "flatten", keys: flattenKeys });
        for (const prop of props) {
          let code = emitter.type(prop.type);
          if (prop.optional) code += ".optional()";
          const pdoc = prop.doc || DEFAULT_PROP_DOCS[prop.name];
          if (pdoc) code += `.describe(${J(oneLine(pdoc))})`;
          addShape(prop.name, code);
        }
      } else {
        const name = bodyIsArray ? "items" : "body";
        args.push({ role: "body", sdk: p.name, mode: "nested", name });
        let code = emitter.type(p.type);
        if (bodyIsArray || !model?.doc) {
          const suffix = bodyIsArray ? `Array of ${bodyModelName ?? "item"} objects (the request body).` : `Request body (${bodyModelName ?? "object"}).`;
          code += `.describe(${J(oneLine([suffix, p.doc].filter(Boolean).join(" ")))})`;
        }
        addShape(name, code);
      }
      continue;
    }
    throw new Error(`${op.id}: cannot classify SDK parameter ${p.name}`);
  }

  // description
  const lines = [];
  lines.push(summary);
  const sdkDesc = op.description;
  const sdkDescNorm = oneLine(sdkDesc ?? "").toLowerCase();
  if (sdkDesc && sdkDescNorm !== oneLine(summary).toLowerCase() && sdkDescNorm !== oneLine(op.summary ?? "").toLowerCase() && sdkDesc.split(/\s+/).length > 5) {
    lines.push("", sdkDesc);
  }
  lines.push("");
  lines.push(`HTTP: ${op.method} /v1${op.path}.`);
  if (scope === "adAccount") lines.push("Ad-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.");
  else if (scope === "optional") lines.push("Ad account context (adAccountId) is optional for this operation.");
  else lines.push("Org-level operation: needs no ad account context.");
  const names = new Set([...takenNames]);
  if (flattenKeys?.includes("pagination") || names.has("limit") || names.has("pageSize")) {
    if (flattenKeys?.includes("pagination")) lines.push("Pagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.");
    else if (names.has("limit")) lines.push("Pagination: use `limit` (page size) and `offset` (start position); fetch the next page by adding limit to offset.");
    else lines.push("Pagination: use `pageSize` and `offset`; fetch the next page by adding pageSize to offset.");
  } else if (bodyModelName && models.get(bodyModelName) && emitter.collectProps(models.get(bodyModelName)).some((p) => p.name === "pagination")) {
    lines.push("Pagination: set body.pagination.pageSize and body.pagination.offset; the response's `pagination` block reports totalCount when requested.");
  }
  if (kind === "delete") lines.push("DESTRUCTIVE: removes the entity; confirm with the user before calling.");
  if (kind === "action") lines.push("This changes account state (apply modifies the campaign; dismiss is terminal).");

  // annotations
  const readOnly = kind === "read";
  const annotations = {
    title: toolName.replace(/^apple_ads_/, "").split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "),
    readOnlyHint: readOnly,
    destructiveHint: kind === "delete" || kind === "update" || kind === "action",
    idempotentHint: readOnly || kind === "update" || kind === "delete",
    openWorldHint: true,
  };
  if (kind === "create" || readOnly) annotations.destructiveHint = false;

  return {
    id: op.id,
    group,
    toolName,
    kind,
    method: op.method,
    path: `/v1${op.path}`,
    summary,
    description: lines.join("\n"),
    scope,
    args,
    shape,
    annotations,
    bodyModel: bodyModelName,
    flattened: !!flattenKeys,
  };
}

// ───────────────────────────── emit ─────────────────────────────

const HEADER = (what) => `// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (${what}). Run \`npm run generate\` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
`;

function emitSchemas(emitter, sdkVersion) {
  const body = emitter.order.map((o) => `export const ${emitter.constName(o.name)} = ${o.code};`).join("\n\n");
  return `${HEADER(`request-model schemas from @apple/apple-ads-platform@${sdkVersion}`)}/* eslint-disable */
import { z } from "zod";

${body}
`;
}

function groupVar(group) {
  return `${camel(group)}Tools`;
}

function emitGroupFile(group, ops, schemaNames) {
  const used = new Set();
  for (const o of ops) for (const s of o.shape) for (const m of s.code.matchAll(/\b(\w+Schema)\b/g)) used.add(m[1]);
  const imports = [...used].filter((n) => schemaNames.has(n)).sort();
  const needsNum = ops.some((o) => o.shape.some((s) => s.code.startsWith("numParam(")));
  const needsId = ops.some((o) => o.shape.some((s) => s.code.startsWith("idParam(")));
  const helpers = ["defineOperation", needsId && "idParam", needsNum && "numParam"].filter(Boolean);
  const entries = ops
    .map((o) => {
      const shape = o.shape.map((s) => `      ${J(s.name)}: ${s.code},`).join("\n");
      return `  defineOperation({
    name: ${J(o.toolName)},
    group: ${J(o.group)},
    operationId: ${J(o.id)},
    kind: ${J(o.kind)},
    method: ${J(o.method)},
    path: ${J(o.path)},
    scope: ${J(o.scope)},
    annotations: ${J(o.annotations)},
    description: ${J(o.description)},
    args: ${J(o.args)},
    shape: {
${shape}
    },
  }),`;
    })
    .join("\n");
  return `${HEADER(`group "${group}": ${GROUPS[group]}`)}import { z } from "zod";
import { ${helpers.join(", ")} } from "../tooling.js";
${imports.length ? `import { ${imports.join(", ")} } from "../generated/schemas.js";\n` : ""}
export const ${groupVar(group)} = [
${entries}
];
`;
}

function emitIndex(groups) {
  return `${HEADER("aggregate of generated tool groups")}import type { ToolDef } from "../types.js";
${groups.map((g) => `import { ${groupVar(g)} } from "./${g}.js";`).join("\n")}

export const GENERATED_GROUPS: Record<string, ToolDef[]> = {
${groups.map((g) => `  ${J(g)}: ${groupVar(g)},`).join("\n")}
};

export const GENERATED_TOOLS: ToolDef[] = Object.values(GENERATED_GROUPS).flat();
`;
}

function emitCoverage(ops, sdk, groupsOrder) {
  const counts = groupsOrder.map((g) => [g, ops.filter((o) => o.group === g).length]);
  const total = ops.length;
  const lines = [];
  lines.push(`# Coverage manifest`);
  lines.push("");
  lines.push(`<!-- GENERATED by scripts/generate.mjs - do not edit. Run \`npm run generate\`. -->`);
  lines.push("");
  lines.push(`**SDK:** \`${sdk.name}@${sdk.version}\` (Apple Ads Platform API v1.0, base URL \`https://api.ads.apple.com/v1/\`)`);
  lines.push("");
  lines.push(`**Verdict: ${total}/${total} SDK operations are mapped to exactly one MCP tool (100%).** No operation is covered through the raw request escape hatch because every documented endpoint exists in the SDK.`);
  lines.push("");
  lines.push(`In addition the server ships 3 hand-written meta tools (not SDK operations): \`apple_ads_request\` (raw escape hatch), \`apple_ads_list_operations\` and \`apple_ads_server_status\`. Total tools registered: **${total + 3}**.`);
  lines.push("");
  lines.push(`## Tools per group`);
  lines.push("");
  lines.push(`| Group | Tools | Description |`);
  lines.push(`|---|---:|---|`);
  for (const [g, n] of counts) lines.push(`| \`${g}\` | ${n} | ${GROUPS[g]} |`);
  lines.push(`| \`meta\` | 3 | Raw request escape hatch, operation listing, server status |`);
  lines.push(`| **Total** | **${total + 3}** | ${total} SDK operations + 3 meta tools |`);
  lines.push("");
  lines.push(`## Operation -> tool map`);
  lines.push("");
  lines.push(`Documented but not in the SDK: none. Apple notes "bulk delete endpoints for keywords and negative keywords are coming soon" - they are not yet documented endpoints; use \`apple_ads_delete_keyword\` / \`apple_ads_delete_negative_keyword\`, or \`apple_ads_request\` once Apple ships them.`);
  lines.push("");
  lines.push(`| # | SDK operation | HTTP | Path | MCP tool | Group | Kind | Read-only |`);
  lines.push(`|--:|---|---|---|---|---|---|:-:|`);
  ops.forEach((o, i) => {
    lines.push(`| ${i + 1} | \`${o.id}\` | ${o.method} | \`${o.path}\` | \`${o.toolName}\` | ${o.group} | ${o.kind} | ${o.annotations.readOnlyHint ? "yes" : "no"} |`);
  });
  lines.push("");
  return { md: lines.join("\n"), counts };
}

function emitReadmeBlock(ops, counts, groupsOrder) {
  const total = ops.length;
  const out = [];
  out.push(`**${total + 3} tools** = ${total} Apple Ads Platform API operations (100% of \`@apple/apple-ads-platform\`) + 3 meta tools.`);
  out.push("");
  out.push("| Group | Tools | Covers |");
  out.push("|---|---:|---|");
  for (const [g, n] of counts) out.push(`| \`${g}\` | ${n} | ${GROUPS[g]} |`);
  out.push(`| \`meta\` | 3 | \`apple_ads_request\` (raw escape hatch), \`apple_ads_list_operations\`, \`apple_ads_server_status\` |`);
  out.push(`| **Total** | **${total + 3}** | |`);
  out.push("");
  out.push("### All tools");
  out.push("");
  for (const g of groupsOrder) {
    out.push(`#### ${g}`);
    out.push("");
    out.push("| Tool | Method | Path | Description |");
    out.push("|---|---|---|---|");
    for (const o of ops.filter((x) => x.group === g)) {
      out.push(`| \`${o.toolName}\` | ${o.method} | \`${o.path}\` | ${o.summary.replace(/\|/g, "\\|")} |`);
    }
    out.push("");
  }
  out.push("#### meta");
  out.push("");
  out.push("| Tool | Description |");
  out.push("|---|---|");
  out.push("| `apple_ads_request` | Raw authenticated request to any Platform API path (forward-compat escape hatch) |");
  out.push("| `apple_ads_list_operations` | Lists every SDK operation, its HTTP route and the MCP tool that covers it |");
  out.push("| `apple_ads_server_status` | Redacted configuration/credential diagnostics and rate-limit state |");
  return out.join("\n");
}

// ───────────────────────────── main ─────────────────────────────

export function generateAll() {
  const sdkPkg = JSON.parse(fs.readFileSync(path.join(SDK_DIR, "package.json"), "utf8"));
  const models = loadModels();
  const api = loadApi();

  // Mapping completeness (the drift gate)
  const missing = [...api.keys()].filter((id) => !OPS[id]);
  const stale = Object.keys(OPS).filter((id) => !api.has(id));
  if (missing.length || stale.length) {
    throw new Error(
      `SDK <-> curated mapping drift.\n  SDK operations without a curated tool: ${missing.join(", ") || "(none)"}\n  Curated entries not in SDK: ${stale.join(", ") || "(none)"}\n  Edit scripts/curated.mjs.`
    );
  }
  const names = Object.values(OPS).map((v) => v[1]);
  if (new Set(names).size !== names.length) throw new Error("Duplicate tool names in scripts/curated.mjs");
  for (const n of names) if (!/^[a-z0-9_]{1,64}$/.test(n)) throw new Error(`Invalid tool name ${n}`);
  for (const [id, v] of Object.entries(OPS)) if (!GROUPS[v[0]]) throw new Error(`${id}: unknown group ${v[0]}`);

  const emitter = new SchemaEmitter(models);
  const groupsOrder = Object.keys(GROUPS);
  const ops = [];
  const sdkOrder = [...api.values()];
  for (const op of sdkOrder) ops.push(buildOperation(op, OPS[op.id], emitter, models));
  // stable order: by curated group order, then SDK order
  ops.sort((a, b) => groupsOrder.indexOf(a.group) - groupsOrder.indexOf(b.group));
  if (emitter.warnings.length) console.warn("generator warnings:\n  " + [...new Set(emitter.warnings)].join("\n  "));

  const schemaNames = new Set(emitter.order.map((o) => emitter.constName(o.name)));
  const files = new Map();
  files.set("src/generated/schemas.ts", emitSchemas(emitter, sdkPkg.version));
  for (const g of groupsOrder) files.set(`src/tools/${g}.ts`, emitGroupFile(g, ops.filter((o) => o.group === g), schemaNames));
  files.set("src/tools/index.ts", emitIndex(groupsOrder));

  const sdk = { name: sdkPkg.name, version: sdkPkg.version };
  const cov = emitCoverage(ops, sdk, groupsOrder);
  files.set("docs/COVERAGE.md", cov.md);
  const manifest = {
    generatedBy: "scripts/generate.mjs",
    sdk,
    totals: { sdkOperations: ops.length, metaTools: 3, tools: ops.length + 3 },
    groups: Object.fromEntries(cov.counts),
    operations: ops.map((o) => ({
      operationId: o.id,
      tool: o.toolName,
      group: o.group,
      method: o.method,
      path: o.path,
      kind: o.kind,
      readOnly: o.annotations.readOnlyHint,
      scope: o.scope,
    })),
  };
  files.set("docs/coverage.json", JSON.stringify(manifest, null, 2) + "\n");
  return { files, readmeBlock: emitReadmeBlock(ops, cov.counts, groupsOrder), ops };
}

const BEGIN = "<!-- GENERATED:TOOLS:BEGIN -->";
const END = "<!-- GENERATED:TOOLS:END -->";

export function applyReadme(existing, block) {
  if (!existing.includes(BEGIN) || !existing.includes(END)) return existing;
  const a = existing.indexOf(BEGIN) + BEGIN.length;
  const b = existing.indexOf(END);
  return `${existing.slice(0, a)}\n${block}\n${existing.slice(b)}`;
}

function main() {
  const check = process.argv.includes("--check");
  const { files, readmeBlock } = generateAll();
  const readmePath = path.join(ROOT, "README.md");
  if (fs.existsSync(readmePath)) files.set("README.md", applyReadme(fs.readFileSync(readmePath, "utf8"), readmeBlock));
  let stale = 0;
  for (const [rel, content] of files) {
    const abs = path.join(ROOT, rel);
    const current = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8") : null;
    if (current === content) continue;
    if (check) {
      console.error(`STALE: ${rel}`);
      stale++;
    } else {
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content);
      console.log(`wrote ${rel}`);
    }
  }
  if (check) {
    if (stale) {
      console.error(`${stale} generated file(s) are stale. Run: npm run generate`);
      process.exit(1);
    }
    console.log("generated files are up to date");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
