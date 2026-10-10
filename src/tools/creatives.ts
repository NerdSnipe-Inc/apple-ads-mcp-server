// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "creatives": Ad creatives (product page and Apple Maps creatives)). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { CreativeCreateSchema, CreativeUpdateSchema, QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const creativesTools = [
  defineOperation({
    name: "apple_ads_delete_creative",
    group: "creatives",
    operationId: "creativesIdDelete",
    kind: "delete",
    method: "DELETE",
    path: "/v1/creatives/{id}",
    scope: "adAccount",
    annotations: {"title":"Delete Creative","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Soft-delete an ad creative by ID.\n\nHTTP: DELETE /v1/creatives/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nDESTRUCTIVE: removes the entity; confirm with the user before calling.",
    args: [{"role":"path","sdk":"id","name":"creativeId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "creativeId": idParam("ID of the ad creative."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_creative",
    group: "creatives",
    operationId: "creativesIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/creatives/{id}",
    scope: "adAccount",
    annotations: {"title":"Get Creative","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one ad creative by ID.\n\nHTTP: GET /v1/creatives/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"creativeId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "creativeId": idParam("ID of the ad creative."),
    },
  }),
  defineOperation({
    name: "apple_ads_update_creative",
    group: "creatives",
    operationId: "creativesIdPut",
    kind: "update",
    method: "PUT",
    path: "/v1/creatives/{id}",
    scope: "adAccount",
    annotations: {"title":"Update Creative","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Update an ad creative.\n\nHTTP: PUT /v1/creatives/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"creativeId","type":"string"},{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"creativeUpdate","mode":"nested","name":"body"}],
    shape: {
      "creativeId": idParam("ID of the ad creative."),
      "body": CreativeUpdateSchema.describe("Request body (CreativeUpdate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_create_creative",
    group: "creatives",
    operationId: "creativesPost",
    kind: "create",
    method: "POST",
    path: "/v1/creatives",
    scope: "adAccount",
    annotations: {"title":"Create Creative","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create an ad creative (DEFAULT_PRODUCT_PAGE, CUSTOM_PRODUCT_PAGE or LOCAL_ADS_SEARCH_CREATIVE). creativeType cannot change later.\n\nHTTP: POST /v1/creatives.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"creativeCreate","mode":"nested","name":"body"}],
    shape: {
      "body": CreativeCreateSchema.describe("Request body (CreativeCreate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_creatives",
    group: "creatives",
    operationId: "creativesQueryPost",
    kind: "read",
    method: "POST",
    path: "/v1/creatives/query",
    scope: "adAccount",
    annotations: {"title":"Query Creatives","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query ad creatives with filters (creativeType, systemStatus, name, eligibility.status), sorting and pagination.\n\nHTTP: POST /v1/creatives/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
];
