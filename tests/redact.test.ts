import { describe, expect, it } from "vitest";
import { redact } from "../src/redact.js";
import { AppleAdsToolError, formatError } from "../src/errors.js";

describe("redact", () => {
  it("removes JWTs, bearer tokens, PEM blocks and client secrets", () => {
    const jwt = "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiJ4In0.c2lnbmF0dXJl";
    const out = redact(
      `Authorization: Bearer abcdef1234567890 client_secret=${jwt}&x=1 -----BEGIN EC PRIVATE KEY-----\nMHcCAQEE\n-----END EC PRIVATE KEY-----`
    );
    expect(out).not.toContain("abcdef1234567890");
    expect(out).not.toContain(jwt);
    expect(out).not.toContain("MHcCAQEE");
    expect(out).toContain("[REDACTED");
  });

  it("removes literal secret values", () => {
    expect(redact("the key is SEARCHADS.secret-value here", ["SEARCHADS.secret-value"])).toBe("the key is [REDACTED] here");
  });

  it("formatError redacts and shapes errors", () => {
    const text = formatError(new AppleAdsToolError("boom Bearer abcdef1234567890", { code: "X", hint: "h" }));
    const parsed = JSON.parse(text);
    expect(parsed.error).toBe(true);
    expect(parsed.message).not.toContain("abcdef1234567890");
    expect(parsed.code).toBe("X");
    expect(parsed.hint).toBe("h");
  });

  it("formatError maps ApiRequestError-shaped errors with Apple's envelope", () => {
    const e = Object.assign(new Error("Request failed with status code 400"), {
      name: "ApiRequestError",
      status: 400,
      method: "POST",
      url: "/v1/campaigns",
      data: { error: { code: "VALIDATION_ERROR", message: "Validation errors found", details: [{ code: "DUPLICATE_NAME" }] } },
    });
    const parsed = JSON.parse(formatError(e));
    expect(parsed.status).toBe(400);
    expect(parsed.code).toBe("VALIDATION_ERROR");
    expect(parsed.message).toContain("Validation errors found");
    expect(parsed.details).toEqual([{ code: "DUPLICATE_NAME" }]);
    expect(parsed.hint).toContain("malformed");
  });
});
