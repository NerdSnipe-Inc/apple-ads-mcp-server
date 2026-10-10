/**
 * Secret redaction. Applied to every error message / diagnostic the server emits.
 */

const PATTERNS: Array<[RegExp, string]> = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, "[REDACTED PRIVATE KEY]"],
  [/-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g, "[REDACTED PEM]"],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]*/g, "[REDACTED JWT]"],
  [/(Bearer\s+)[A-Za-z0-9._~+/=-]{4,}/gi, "$1[REDACTED]"],
  [/(client_secret["']?\s*[=:]\s*["']?)[^&\s"',}]+/gi, "$1[REDACTED]"],
  [/(access_token["']?\s*[=:]\s*["']?)[^&\s"',}]+/gi, "$1[REDACTED]"],
  [/(refresh_token["']?\s*[=:]\s*["']?)[^&\s"',}]+/gi, "$1[REDACTED]"],
];

/** Redact known secret shapes plus any literal secret values supplied. */
export function redact(input: unknown, secrets: Array<string | undefined> = []): string {
  let text = typeof input === "string" ? input : safeStringify(input);
  for (const s of secrets) {
    if (s && s.length >= 8) text = text.split(s).join("[REDACTED]");
  }
  for (const [re, rep] of PATTERNS) text = text.replace(re, rep);
  return text;
}

function safeStringify(v: unknown): string {
  try {
    return typeof v === "string" ? v : JSON.stringify(v);
  } catch {
    return String(v);
  }
}
