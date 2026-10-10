# Design decisions and deviations

1. **Ad account is the "context".** Apple's Platform API scopes calls with `X-AP-Context: adAccountId=<id>`. Every tool takes an optional `adAccountId`; default `APPLE_ADS_AD_ACCOUNT_ID`; if unset and exactly one account is reachable via ACLs it is auto-discovered (cached 5 min). `GET /me`, `/acls`, `/orgs/{id}`, `/advertiser-resources` and `POST /ad-accounts` need no context.
2. **`APPLE_ADS_ORG_ID`** is used for org-level calls and to resolve the ad account when not otherwise given. The brief calls it an org override; the API itself only needs the ad account header.
3. **Node floor is 20** (CI runs 20/22/24), not 18/20/22 as in the brief: the MCP SDK and Vitest 3 toolchain target current LTS releases; Node 18 is end-of-life.
4. **axios override (1.20.0)** in `package.json`: the SDK's transitive axios had production advisories; the override is verified by the full test suite.
5. **Base URL trailing slash** is stripped from `APPLE_ADS_BASE_URL` (test-only variable, alongside `APPLE_ADS_TOKEN_URL`).
6. **Read-only mode** is defined by each tool's `readOnlyHint`. Report and search style POST operations are marked read-only so they remain available. The escape hatch only allows GET (and read-only POST search/report paths) in read-only mode.
7. **Transport:** stdio only; no Streamable HTTP.
8. **Request bodies:** top-level arguments are strict, while nested body models are passthrough so new Apple fields work without a release. Models that are cyclic in the SDK types are `z.any()` at the cut point. Array bodies are passed as `items`; query-like bodies are flattened.
9. **Inline PEM** (`APPLE_ADS_PRIVATE_KEY`) is written to a 0600 temp file because the SDK's key mode reads a path.
10. **No bulk delete tools:** Apple lists them as "coming soon"; the SDK has none. `apple_ads_request` can call them once available.
11. **Uploads** use `File` from `node:buffer` (`filePath` or `contentBase64`).
12. **Tool listing size** is about 214 KB for all 102 tools; trim with `APPLE_ADS_ENABLED_GROUPS` / `APPLE_ADS_DISABLED_GROUPS`.
13. **Platform API v1, not Campaign Management API v5.**
14. **Generator** reads the installed SDK and `scripts/curated.mjs`; it fails on any SDK operation without a curated entry (and vice versa), so SDK upgrades cannot silently lose coverage.
