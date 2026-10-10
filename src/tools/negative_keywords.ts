// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "negative_keywords": Negative keywords). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { NegativeKeywordCreateSchema, NegativeKeywordUpdateSchema, QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const negativeKeywordsTools = [
  defineOperation({
    name: "apple_ads_delete_negative_keyword",
    group: "negative_keywords",
    operationId: "negativeKeywordsIdDelete",
    kind: "delete",
    method: "DELETE",
    path: "/v1/negative-keywords/{id}",
    scope: "adAccount",
    annotations: {"title":"Delete Negative Keyword","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Delete a negative keyword by ID.\n\nHTTP: DELETE /v1/negative-keywords/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nDESTRUCTIVE: removes the entity; confirm with the user before calling.",
    args: [{"role":"path","sdk":"id","name":"negativeKeywordId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "negativeKeywordId": idParam("ID of the negative keyword."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_negative_keyword",
    group: "negative_keywords",
    operationId: "negativeKeywordsIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/negative-keywords/{id}",
    scope: "adAccount",
    annotations: {"title":"Get Negative Keyword","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one negative keyword by ID.\n\nHTTP: GET /v1/negative-keywords/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"negativeKeywordId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "negativeKeywordId": idParam("ID of the negative keyword."),
    },
  }),
  defineOperation({
    name: "apple_ads_update_negative_keyword",
    group: "negative_keywords",
    operationId: "negativeKeywordsIdPut",
    kind: "update",
    method: "PUT",
    path: "/v1/negative-keywords/{id}",
    scope: "adAccount",
    annotations: {"title":"Update Negative Keyword","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Update a negative keyword.\n\nHTTP: PUT /v1/negative-keywords/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"negativeKeywordId","type":"string"},{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"negativeKeywordUpdate","mode":"nested","name":"body"}],
    shape: {
      "negativeKeywordId": idParam("ID of the negative keyword."),
      "body": NegativeKeywordUpdateSchema.describe("Request body (NegativeKeywordUpdate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_create_negative_keyword",
    group: "negative_keywords",
    operationId: "negativeKeywordsPost",
    kind: "create",
    method: "POST",
    path: "/v1/negative-keywords",
    scope: "adAccount",
    annotations: {"title":"Create Negative Keyword","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create a negative keyword at campaign or ad group level.\n\nHTTP: POST /v1/negative-keywords.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"negativeKeywordCreate","mode":"nested","name":"body"}],
    shape: {
      "body": NegativeKeywordCreateSchema.describe("Request body (NegativeKeywordCreate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_negative_keywords",
    group: "negative_keywords",
    operationId: "negativeKeywordsQueryPost",
    kind: "read",
    method: "POST",
    path: "/v1/negative-keywords/query",
    scope: "adAccount",
    annotations: {"title":"Query Negative Keywords","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query negative keywords with filters, sorting and pagination.\n\nHTTP: POST /v1/negative-keywords/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
];
