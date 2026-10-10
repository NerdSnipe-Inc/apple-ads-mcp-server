// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "insights": Impression share and search term popularity). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation } from "../tooling.js";
import { FilterSchema, ImpressionShareOptionsSchema, ImpressionShareTimeRangeSchema, RequestPaginationSchema, SearchTermPopularityTimeRangeSchema, SortingSchema } from "../generated/schemas.js";

export const insightsTools = [
  defineOperation({
    name: "apple_ads_query_impression_share",
    group: "insights",
    operationId: "impressionShareQuery",
    kind: "read",
    method: "POST",
    path: "/v1/insights/apps/impression-share/query",
    scope: "adAccount",
    annotations: {"title":"Query Impression Share","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query App Store impression share for keywords over a time range. A promotedObjectId filter is required.\n\nRetrieve impression share data for promoted apps. Returns paginated JSON results directly (synchronous). Supports DAILY and WEEKLY granularity and two report types via options.impressionShareReportType: FIRST_SLOT (first ad position only) and ALL_SLOTS (all ad positions aggregated). A filter on **promotedObjectId** is mandatory. **Timezone** is fixed to UTC. Maximum **pageSize** is 5000. Maximum **2 sort fields**.\n\nHTTP: POST /v1/insights/apps/impression-share/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"impressionShareQueryRequest","mode":"flatten","keys":["filters","sorting","timeRange","pagination","options"]}],
    shape: {
      "filters": z.array(FilterSchema).describe("Filter conditions. At minimum, a promotedObjectId filter must be provided."),
      "sorting": z.array(SortingSchema).optional().describe("Sort criteria. Maximum 2 sort fields."),
      "timeRange": ImpressionShareTimeRangeSchema,
      "pagination": RequestPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
      "options": ImpressionShareOptionsSchema.optional(),
    },
  }),
  defineOperation({
    name: "apple_ads_query_search_term_popularity",
    group: "insights",
    operationId: "searchTermPopularityQuery",
    kind: "read",
    method: "POST",
    path: "/v1/insights/apps/search-term-popularity/query",
    scope: "adAccount",
    annotations: {"title":"Query Search Term Popularity","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query App Store search term popularity rankings by country or region and genre.\n\nRetrieve search term popularity data showing top search terms by search volume within a Country or Region and Genre. Supports WEEKLY and MONTHLY granularity. **Timezone** is fixed to UTC. Maximum **pageSize** is 5000. Maximum **2 sort fields**. Mandatory dimension fields (always returned): countryOrRegion, genre, searchTerm, plus the date field for the selected granularity (week or month). Optional dimension fields: rankInGenre, searchPopularityInGenre, searchPopularity1to100, searchPopularity1to5.\n\nHTTP: POST /v1/insights/apps/search-term-popularity/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"searchTermPopularityQueryRequest","mode":"flatten","keys":["filters","sorting","timeRange","pagination"]}],
    shape: {
      "filters": z.array(FilterSchema).optional().describe("Filter conditions to narrow results."),
      "sorting": z.array(SortingSchema).optional().describe("Sort criteria. Maximum 2 sort fields. Default genre ASC, rankInGenre ASC."),
      "timeRange": SearchTermPopularityTimeRangeSchema,
      "pagination": RequestPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
];
