// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "recommendations": Daily budget and target CPA recommendations (query, apply, dismiss)). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation } from "../tooling.js";
import { ApplyDailyCapRecommendationSchema, ApplyTargetCpaRecommendationSchema, RecommendationFilterConditionSchema, RecommendationQueryRequestPaginationSchema, RecommendationSortingSchema } from "../generated/schemas.js";

export const recommendationsTools = [
  defineOperation({
    name: "apple_ads_apply_daily_budget_recommendations",
    group: "recommendations",
    operationId: "applyDailyBudgetRecommendations",
    kind: "action",
    method: "POST",
    path: "/v1/recommendations/daily-budgets/apply",
    scope: "adAccount",
    annotations: {"title":"Apply Daily Budget Recommendations","readOnlyHint":false,"destructiveHint":true,"idempotentHint":false,"openWorldHint":true},
    description: "Apply daily budget recommendations, which updates the campaigns' daily budgets. All items must share one promotedObjectId.\n\nApply one or more daily budget recommendations to campaigns. **Requirements:** - All items must have the same `promotedObjectId`\n\nHTTP: POST /v1/recommendations/daily-budgets/apply.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nThis changes account state (apply modifies the campaign; dismiss is terminal).",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"applyDailyCapRecommendation","mode":"nested","name":"items"}],
    shape: {
      "items": z.array(ApplyDailyCapRecommendationSchema).describe("Array of ApplyDailyCapRecommendation objects (the request body)."),
    },
  }),
  defineOperation({
    name: "apple_ads_apply_target_cpa_recommendations",
    group: "recommendations",
    operationId: "applyTargetCpaRecommendations",
    kind: "action",
    method: "POST",
    path: "/v1/recommendations/target-cpas/apply",
    scope: "adAccount",
    annotations: {"title":"Apply Target Cpa Recommendations","readOnlyHint":false,"destructiveHint":true,"idempotentHint":false,"openWorldHint":true},
    description: "Apply target CPA recommendations, updating the target CPA used by Maximize Conversions bidding.\n\nApply one or more target CPA recommendations to campaigns. **Requirements:** - All items must have the same `promotedObjectId`\n\nHTTP: POST /v1/recommendations/target-cpas/apply.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nThis changes account state (apply modifies the campaign; dismiss is terminal).",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"applyTargetCpaRecommendation","mode":"nested","name":"items"}],
    shape: {
      "items": z.array(ApplyTargetCpaRecommendationSchema).describe("Array of ApplyTargetCpaRecommendation objects (the request body)."),
    },
  }),
  defineOperation({
    name: "apple_ads_dismiss_daily_budget_recommendations",
    group: "recommendations",
    operationId: "dismissDailyBudgetRecommendations",
    kind: "action",
    method: "POST",
    path: "/v1/recommendations/daily-budgets/dismiss",
    scope: "adAccount",
    annotations: {"title":"Dismiss Daily Budget Recommendations","readOnlyHint":false,"destructiveHint":true,"idempotentHint":false,"openWorldHint":true},
    description: "Dismiss daily budget recommendations without changing any campaign.\n\nDismiss one or more daily budget recommendations. **Requirements:** - All items must have the same `promotedObjectId`\n\nHTTP: POST /v1/recommendations/daily-budgets/dismiss.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nThis changes account state (apply modifies the campaign; dismiss is terminal).",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"applyDailyCapRecommendation","mode":"nested","name":"items"}],
    shape: {
      "items": z.array(ApplyDailyCapRecommendationSchema).describe("Array of ApplyDailyCapRecommendation objects (the request body)."),
    },
  }),
  defineOperation({
    name: "apple_ads_dismiss_target_cpa_recommendations",
    group: "recommendations",
    operationId: "dismissTargetCpaRecommendations",
    kind: "action",
    method: "POST",
    path: "/v1/recommendations/target-cpas/dismiss",
    scope: "adAccount",
    annotations: {"title":"Dismiss Target Cpa Recommendations","readOnlyHint":false,"destructiveHint":true,"idempotentHint":false,"openWorldHint":true},
    description: "Dismiss target CPA recommendations without changing any campaign.\n\nDismiss one or more target CPA recommendations. **Requirements:** - All items must have the same `promotedObjectId`\n\nHTTP: POST /v1/recommendations/target-cpas/dismiss.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nThis changes account state (apply modifies the campaign; dismiss is terminal).",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"applyTargetCpaRecommendation","mode":"nested","name":"items"}],
    shape: {
      "items": z.array(ApplyTargetCpaRecommendationSchema).describe("Array of ApplyTargetCpaRecommendation objects (the request body)."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_daily_budget_recommendations",
    group: "recommendations",
    operationId: "queryDailyBudgetRecommendations",
    kind: "read",
    method: "POST",
    path: "/v1/recommendations/daily-budgets/query",
    scope: "adAccount",
    annotations: {"title":"Query Daily Budget Recommendations","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query daily budget recommendations. promotedObjectId and promotedObjectType filters are mandatory.\n\nRetrieve daily budget recommendations for campaigns. **Required Filters:** - `promotedObjectId` (campaign ID) - `promotedObjectType` (type of promoted object)\n\nHTTP: POST /v1/recommendations/daily-budgets/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"recommendationQueryRequest","mode":"flatten","keys":["pagination","sorting","filters"]}],
    shape: {
      "pagination": RecommendationQueryRequestPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
      "sorting": z.array(RecommendationSortingSchema).optional().describe("Sort order for results (multiple fields supported)"),
      "filters": z.array(RecommendationFilterConditionSchema).optional().describe("Filter conditions (promotedObjectId and promotedObjectType are REQUIRED)"),
    },
  }),
  defineOperation({
    name: "apple_ads_query_target_cpa_recommendations",
    group: "recommendations",
    operationId: "queryTargetCpaRecommendations",
    kind: "read",
    method: "POST",
    path: "/v1/recommendations/target-cpas/query",
    scope: "adAccount",
    annotations: {"title":"Query Target Cpa Recommendations","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query target CPA recommendations for App Store campaigns using Maximize Conversions.\n\nRetrieve target cost-per-acquisition recommendations for campaigns. **Required Filters:** - `promotedObjectId` (campaign ID) - `promotedObjectType` (type of promoted object)\n\nHTTP: POST /v1/recommendations/target-cpas/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"recommendationQueryRequest","mode":"flatten","keys":["pagination","sorting","filters"]}],
    shape: {
      "pagination": RecommendationQueryRequestPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
      "sorting": z.array(RecommendationSortingSchema).optional().describe("Sort order for results (multiple fields supported)"),
      "filters": z.array(RecommendationFilterConditionSchema).optional().describe("Filter conditions (promotedObjectId and promotedObjectType are REQUIRED)"),
    },
  }),
];
