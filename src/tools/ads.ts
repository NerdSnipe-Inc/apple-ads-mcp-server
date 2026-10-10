// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "ads": Ads (link a creative to an ad group)). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { AdCreateSchema, AdUpdateSchema, QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const adsTools = [
  defineOperation({
    name: "apple_ads_delete_ad",
    group: "ads",
    operationId: "adsIdDelete",
    kind: "delete",
    method: "DELETE",
    path: "/v1/ads/{id}",
    scope: "adAccount",
    annotations: {"title":"Delete Ad","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Soft-delete an ad by ID.\n\nHTTP: DELETE /v1/ads/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nDESTRUCTIVE: removes the entity; confirm with the user before calling.",
    args: [{"role":"path","sdk":"id","name":"adId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "adId": idParam("ID of the ad."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_ad",
    group: "ads",
    operationId: "adsIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/ads/{id}",
    scope: "adAccount",
    annotations: {"title":"Get Ad","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one ad by ID.\n\nHTTP: GET /v1/ads/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"adId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "adId": idParam("ID of the ad."),
    },
  }),
  defineOperation({
    name: "apple_ads_update_ad",
    group: "ads",
    operationId: "adsIdPut",
    kind: "update",
    method: "PUT",
    path: "/v1/ads/{id}",
    scope: "adAccount",
    annotations: {"title":"Update Ad","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Update an ad. Only name and status (ENABLED/PAUSED) can change after creation.\n\nHTTP: PUT /v1/ads/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"adId","type":"string"},{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"adUpdate","mode":"nested","name":"body"}],
    shape: {
      "adId": idParam("ID of the ad."),
      "body": AdUpdateSchema.describe("Request body (AdUpdate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_create_ad",
    group: "ads",
    operationId: "adsPost",
    kind: "create",
    method: "POST",
    path: "/v1/ads",
    scope: "adAccount",
    annotations: {"title":"Create Ad","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create an ad linking an existing creative to an ad group. Create the creative first.\n\nHTTP: POST /v1/ads.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"adCreate","mode":"nested","name":"body"}],
    shape: {
      "body": AdCreateSchema.describe("Request body (AdCreate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_ads",
    group: "ads",
    operationId: "adsQueryPost",
    kind: "read",
    method: "POST",
    path: "/v1/ads/query",
    scope: "adAccount",
    annotations: {"title":"Query Ads","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query ads with filters, sorting and pagination.\n\nHTTP: POST /v1/ads/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
];
