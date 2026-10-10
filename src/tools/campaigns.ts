// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "campaigns": Campaigns (App Store and Apple Maps)). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { CampaignCreateSchema, CampaignUpdateSchema, QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const campaignsTools = [
  defineOperation({
    name: "apple_ads_delete_campaign",
    group: "campaigns",
    operationId: "campaignsIdDelete",
    kind: "delete",
    method: "DELETE",
    path: "/v1/campaigns/{id}",
    scope: "adAccount",
    annotations: {"title":"Delete Campaign","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Soft-delete a campaign by ID.\n\nHTTP: DELETE /v1/campaigns/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nDESTRUCTIVE: removes the entity; confirm with the user before calling.",
    args: [{"role":"path","sdk":"id","name":"campaignId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "campaignId": idParam("ID of the campaign."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_campaign",
    group: "campaigns",
    operationId: "campaignsIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/campaigns/{id}",
    scope: "adAccount",
    annotations: {"title":"Get Campaign","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one campaign by ID, including status, systemStatus, bid strategy and budget.\n\nHTTP: GET /v1/campaigns/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"campaignId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "campaignId": idParam("ID of the campaign."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_campaign_legacy_limited_status_details",
    group: "campaigns",
    operationId: "campaignsIdLegacyAppLimitedStatusReasonDetailsGet",
    kind: "read",
    method: "GET",
    path: "/v1/campaigns/{id}/legacy-app-limited-status-reason-details",
    scope: "adAccount",
    annotations: {"title":"Get Campaign Legacy Limited Status Details","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get per-country limited-status reason details for a legacy app campaign.\n\nHTTP: GET /v1/campaigns/{id}/legacy-app-limited-status-reason-details.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"campaignId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "campaignId": idParam("ID of the campaign."),
    },
  }),
  defineOperation({
    name: "apple_ads_update_campaign",
    group: "campaigns",
    operationId: "campaignsIdPut",
    kind: "update",
    method: "PUT",
    path: "/v1/campaigns/{id}",
    scope: "adAccount",
    annotations: {"title":"Update Campaign","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Partially update a campaign (name, status ENABLED/PAUSED, budget, bid strategy, targeting). Only send fields to change; arrays are fully replaced.\n\nHTTP: PUT /v1/campaigns/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"campaignId","type":"string"},{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"campaignUpdate","mode":"nested","name":"body"}],
    shape: {
      "campaignId": idParam("ID of the campaign."),
      "body": CampaignUpdateSchema.describe("Request body (CampaignUpdate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_create_campaign",
    group: "campaigns",
    operationId: "campaignsPost",
    kind: "create",
    method: "POST",
    path: "/v1/campaigns",
    scope: "adAccount",
    annotations: {"title":"Create Campaign","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create a campaign for an App Store app (APPSTORE_APP) or Apple Maps brand (BUSINESS_BRAND). promotedObjectType and promotedObjectId are immutable after creation.\n\nHTTP: POST /v1/campaigns.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"campaignCreate","mode":"nested","name":"body"}],
    shape: {
      "body": CampaignCreateSchema.describe("Request body (CampaignCreate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_campaigns",
    group: "campaigns",
    operationId: "campaignsQueryPost",
    kind: "read",
    method: "POST",
    path: "/v1/campaigns/query",
    scope: "adAccount",
    annotations: {"title":"Query Campaigns","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query campaigns with filters, sorting and pagination. With no filters, returns all non-deleted campaigns in the ad account.\n\nHTTP: POST /v1/campaigns/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
];
