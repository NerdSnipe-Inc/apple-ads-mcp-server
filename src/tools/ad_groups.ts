// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "ad_groups": Ad groups (targeting, bid strategy, schedule)). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { AdGroupCreateSchema, AdGroupUpdateSchema, QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const adGroupsTools = [
  defineOperation({
    name: "apple_ads_delete_ad_group",
    group: "ad_groups",
    operationId: "adgroupsIdDelete",
    kind: "delete",
    method: "DELETE",
    path: "/v1/adgroups/{id}",
    scope: "adAccount",
    annotations: {"title":"Delete Ad Group","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Soft-delete an ad group by ID.\n\nHTTP: DELETE /v1/adgroups/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nDESTRUCTIVE: removes the entity; confirm with the user before calling.",
    args: [{"role":"path","sdk":"id","name":"adGroupId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "adGroupId": idParam("ID of the ad group."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_ad_group",
    group: "ad_groups",
    operationId: "adgroupsIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/adgroups/{id}",
    scope: "adAccount",
    annotations: {"title":"Get Ad Group","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one ad group by ID.\n\nHTTP: GET /v1/adgroups/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"adGroupId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "adGroupId": idParam("ID of the ad group."),
    },
  }),
  defineOperation({
    name: "apple_ads_update_ad_group",
    group: "ad_groups",
    operationId: "adgroupsIdPut",
    kind: "update",
    method: "PUT",
    path: "/v1/adgroups/{id}",
    scope: "adAccount",
    annotations: {"title":"Update Ad Group","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Partially update an ad group (status, bids, targeting, schedule). Arrays are fully replaced.\n\nHTTP: PUT /v1/adgroups/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"adGroupId","type":"string"},{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"adGroupUpdate","mode":"nested","name":"body"}],
    shape: {
      "adGroupId": idParam("ID of the ad group."),
      "body": AdGroupUpdateSchema.describe("Request body (AdGroupUpdate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_create_ad_group",
    group: "ad_groups",
    operationId: "adgroupsPost",
    kind: "create",
    method: "POST",
    path: "/v1/adgroups",
    scope: "adAccount",
    annotations: {"title":"Create Ad Group","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create an ad group inside a campaign (targeting, pricing model, bid strategy, schedule, Search Match).\n\nHTTP: POST /v1/adgroups.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"adGroupCreate","mode":"nested","name":"body"}],
    shape: {
      "body": AdGroupCreateSchema.describe("Request body (AdGroupCreate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_ad_groups",
    group: "ad_groups",
    operationId: "adgroupsQueryPost",
    kind: "read",
    method: "POST",
    path: "/v1/adgroups/query",
    scope: "adAccount",
    annotations: {"title":"Query Ad Groups","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query ad groups with filters (e.g. campaignId), sorting and pagination.\n\nHTTP: POST /v1/adgroups/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
];
