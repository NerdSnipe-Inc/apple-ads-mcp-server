// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "bulk": Bulk create/update of keywords and negative keywords). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation } from "../tooling.js";
import { KeywordCreateBulkRequestSchema, KeywordUpdateBulkRequestSchema, NegativeKeywordCreateBulkRequestSchema, NegativeKeywordUpdateBulkRequestSchema } from "../generated/schemas.js";

export const bulkTools = [
  defineOperation({
    name: "apple_ads_bulk_create_keywords",
    group: "bulk",
    operationId: "keywordsBulkCreatePost",
    kind: "create",
    method: "POST",
    path: "/v1/keywords/bulk-create",
    scope: "adAccount",
    annotations: {"title":"Bulk Create Keywords","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create many keywords in one request (counts as one call against the rate limit). Set allowPartialSuccess to keep valid items when others fail.\n\nHTTP: POST /v1/keywords/bulk-create.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"keywordCreateBulkRequest","mode":"nested","name":"body"}],
    shape: {
      "body": KeywordCreateBulkRequestSchema.describe("Request body (KeywordCreateBulkRequest)."),
    },
  }),
  defineOperation({
    name: "apple_ads_bulk_update_keywords",
    group: "bulk",
    operationId: "keywordsBulkUpdatePost",
    kind: "update",
    method: "POST",
    path: "/v1/keywords/bulk-update",
    scope: "adAccount",
    annotations: {"title":"Bulk Update Keywords","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Update many keywords in one request. Each item's data must include the keyword id plus only the fields to change.\n\nHTTP: POST /v1/keywords/bulk-update.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"keywordUpdateBulkRequest","mode":"nested","name":"body"}],
    shape: {
      "body": KeywordUpdateBulkRequestSchema.describe("Request body (KeywordUpdateBulkRequest)."),
    },
  }),
  defineOperation({
    name: "apple_ads_bulk_create_negative_keywords",
    group: "bulk",
    operationId: "negativeKeywordsBulkCreatePost",
    kind: "create",
    method: "POST",
    path: "/v1/negative-keywords/bulk-create",
    scope: "adAccount",
    annotations: {"title":"Bulk Create Negative Keywords","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create many negative keywords in one request.\n\nHTTP: POST /v1/negative-keywords/bulk-create.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"negativeKeywordCreateBulkRequest","mode":"nested","name":"body"}],
    shape: {
      "body": NegativeKeywordCreateBulkRequestSchema.describe("Request body (NegativeKeywordCreateBulkRequest)."),
    },
  }),
  defineOperation({
    name: "apple_ads_bulk_update_negative_keywords",
    group: "bulk",
    operationId: "negativeKeywordsBulkUpdatePost",
    kind: "update",
    method: "POST",
    path: "/v1/negative-keywords/bulk-update",
    scope: "adAccount",
    annotations: {"title":"Bulk Update Negative Keywords","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Update many negative keywords in one request. Each item's data must include the id plus only the fields to change.\n\nHTTP: POST /v1/negative-keywords/bulk-update.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"negativeKeywordUpdateBulkRequest","mode":"nested","name":"body"}],
    shape: {
      "body": NegativeKeywordUpdateBulkRequestSchema.describe("Request body (NegativeKeywordUpdateBulkRequest)."),
    },
  }),
];
