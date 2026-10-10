// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "suggestions": Keyword, phrase, category and target CPA suggestions). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation } from "../tooling.js";
import { RecommendationFilterConditionSchema, RecommendationQueryRequestPaginationSchema, RecommendationSortingSchema } from "../generated/schemas.js";

export const suggestionsTools = [
  defineOperation({
    name: "apple_ads_query_category_suggestions",
    group: "suggestions",
    operationId: "queryCategorySuggestions",
    kind: "read",
    method: "POST",
    path: "/v1/suggestions/categories/query",
    scope: "adAccount",
    annotations: {"title":"Query Category Suggestions","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get category suggestions for an app or brand, or search categories by name.\n\nQuery category suggestions. Supports two query routes based on `queryType`: **Route 1: SUGGESTION** (discover categories for an app) - `queryType` = `SUGGESTION` (REQUIRED) - `promotedObjectId` (REQUIRED) - `promotedObjectType` (REQUIRED) Returns suggested categories based on the promoted object. **Route 2: SEARCH** (look up or search categories) - `queryType` = `SEARCH` (REQUIRED) - `category` (REQUIRED) with operator: - `IN`: fetches popularity for each provided category - `LIKE`: performs a string match search across categories\n\nHTTP: POST /v1/suggestions/categories/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"recommendationQueryRequest","mode":"flatten","keys":["pagination","sorting","filters"]}],
    shape: {
      "pagination": RecommendationQueryRequestPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
      "sorting": z.array(RecommendationSortingSchema).optional().describe("Sort order for results (multiple fields supported)"),
      "filters": z.array(RecommendationFilterConditionSchema).optional().describe("Filter conditions (promotedObjectId and promotedObjectType are REQUIRED)"),
    },
  }),
  defineOperation({
    name: "apple_ads_query_keyword_suggestions",
    group: "suggestions",
    operationId: "queryKeywordSuggestions",
    kind: "read",
    method: "POST",
    path: "/v1/suggestions/keywords/query",
    scope: "adAccount",
    annotations: {"title":"Query Keyword Suggestions","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get ranked keyword suggestions for an app (popularity 0-100). Feed good ones into apple_ads_create_keyword.\n\nQuery keyword suggestions based on search terms and storefronts using structured filters. **Required Filters:** - `promotedObjectId` (campaign or app ID) - `promotedObjectType` (type of promoted object) **Optional Filters:** - `terms` (search terms to get suggestions for) - `countriesOrRegions` (storefront codes to target)\n\nHTTP: POST /v1/suggestions/keywords/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"recommendationQueryRequest","mode":"flatten","keys":["pagination","sorting","filters"]}],
    shape: {
      "pagination": RecommendationQueryRequestPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
      "sorting": z.array(RecommendationSortingSchema).optional().describe("Sort order for results (multiple fields supported)"),
      "filters": z.array(RecommendationFilterConditionSchema).optional().describe("Filter conditions (promotedObjectId and promotedObjectType are REQUIRED)"),
    },
  }),
  defineOperation({
    name: "apple_ads_query_phrase_suggestions",
    group: "suggestions",
    operationId: "queryPhraseSuggestions",
    kind: "read",
    method: "POST",
    path: "/v1/suggestions/phrases/query",
    scope: "adAccount",
    annotations: {"title":"Query Phrase Suggestions","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get natural-language search phrase suggestions for an app or brand, or look up phrase popularity.\n\nQuery phrase suggestions. Supports two query routes based on `queryType`: **Route 1: SUGGESTION** (discover phrases for an app) - `queryType` = `SUGGESTION` (REQUIRED) - `promotedObjectId` (REQUIRED) - `promotedObjectType` (REQUIRED) Returns suggested phrases based on the promoted object. **Route 2: SEARCH** (look up or search phrases) - `queryType` = `SEARCH` (REQUIRED) - `phrase` (REQUIRED) with operator: - `IN`: fetches popularity for each provided phrase - `LIKE`: performs a string match search across phrases\n\nHTTP: POST /v1/suggestions/phrases/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"recommendationQueryRequest","mode":"flatten","keys":["pagination","sorting","filters"]}],
    shape: {
      "pagination": RecommendationQueryRequestPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
      "sorting": z.array(RecommendationSortingSchema).optional().describe("Sort order for results (multiple fields supported)"),
      "filters": z.array(RecommendationFilterConditionSchema).optional().describe("Filter conditions (promotedObjectId and promotedObjectType are REQUIRED)"),
    },
  }),
  defineOperation({
    name: "apple_ads_query_target_cpa_suggestion",
    group: "suggestions",
    operationId: "queryTargetCpaSuggestion",
    kind: "read",
    method: "POST",
    path: "/v1/suggestions/target-cpas/query",
    scope: "adAccount",
    annotations: {"title":"Query Target Cpa Suggestion","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get a suggested target CPA for an App Store app based on recent tap-install CPI data.\n\nRetrieve the suggested Target CPA bid for a new Max Conversions campaign on the App Store. The suggestion is the maximum tap-install CPI across the requested countries or regions that have at least 10 installs in the last 28 days. **Required Filters:** - `promotedObjectId` (single numeric app ID, `EQUALS`) - `promotedObjectType` (`EQUALS` `APPSTORE_APP`) **Optional Filters:** - `countryOrRegion` (one or more ISO country/region codes). When omitted, all countries or regions with eligible install volume are considered. Rate limited to 5 QPS per (user, organization).\n\nHTTP: POST /v1/suggestions/target-cpas/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"recommendationQueryRequest","mode":"flatten","keys":["pagination","sorting","filters"]}],
    shape: {
      "pagination": RecommendationQueryRequestPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
      "sorting": z.array(RecommendationSortingSchema).optional().describe("Sort order for results (multiple fields supported)"),
      "filters": z.array(RecommendationFilterConditionSchema).optional().describe("Filter conditions (promotedObjectId and promotedObjectType are REQUIRED)"),
    },
  }),
];
