// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "keywords": Keywords). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { KeywordCreateSchema, KeywordUpdateSchema, QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const keywordsTools = [
  defineOperation({
    name: "apple_ads_delete_keyword",
    group: "keywords",
    operationId: "keywordsIdDelete",
    kind: "delete",
    method: "DELETE",
    path: "/v1/keywords/{id}",
    scope: "adAccount",
    annotations: {"title":"Delete Keyword","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Delete a keyword by ID.\n\nHTTP: DELETE /v1/keywords/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nDESTRUCTIVE: removes the entity; confirm with the user before calling.",
    args: [{"role":"path","sdk":"id","name":"keywordId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "keywordId": idParam("ID of the keyword."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_keyword",
    group: "keywords",
    operationId: "keywordsIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/keywords/{id}",
    scope: "adAccount",
    annotations: {"title":"Get Keyword","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one keyword by ID.\n\nHTTP: GET /v1/keywords/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"keywordId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "keywordId": idParam("ID of the keyword."),
    },
  }),
  defineOperation({
    name: "apple_ads_update_keyword",
    group: "keywords",
    operationId: "keywordsIdPut",
    kind: "update",
    method: "PUT",
    path: "/v1/keywords/{id}",
    scope: "adAccount",
    annotations: {"title":"Update Keyword","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Update a keyword (bid, status).\n\nHTTP: PUT /v1/keywords/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"keywordId","type":"string"},{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"keywordUpdate","mode":"nested","name":"body"}],
    shape: {
      "keywordId": idParam("ID of the keyword."),
      "body": KeywordUpdateSchema.describe("Request body (KeywordUpdate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_create_keyword",
    group: "keywords",
    operationId: "keywordsPost",
    kind: "create",
    method: "POST",
    path: "/v1/keywords",
    scope: "adAccount",
    annotations: {"title":"Create Keyword","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create a keyword in an ad group.\n\nHTTP: POST /v1/keywords.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"keywordCreate","mode":"nested","name":"body"}],
    shape: {
      "body": KeywordCreateSchema.describe("Request body (KeywordCreate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_keywords",
    group: "keywords",
    operationId: "keywordsQueryPost",
    kind: "read",
    method: "POST",
    path: "/v1/keywords/query",
    scope: "adAccount",
    annotations: {"title":"Query Keywords","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query keywords with filters (e.g. adGroupId), sorting and pagination.\n\nHTTP: POST /v1/keywords/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
];
