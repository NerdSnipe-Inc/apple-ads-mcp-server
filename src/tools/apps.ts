// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "apps": App Store app search, app details and supported ad languages). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, numParam } from "../tooling.js";
import { QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const appsTools = [
  defineOperation({
    name: "apple_ads_get_app_details",
    group: "apps",
    operationId: "getAppDetailsByAdamId",
    kind: "read",
    method: "GET",
    path: "/v1/apps/{adamId}",
    scope: "adAccount",
    annotations: {"title":"Get App Details","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get details for one app by its Adam ID (name, genres, device classes, available storefronts).\n\nRetrieves application details for a specific Adam ID.\n\nHTTP: GET /v1/apps/{adamId}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"adamId","name":"adamId","type":"number"}],
    shape: {
      "adamId": numParam("App Store Connect Adam ID"),
    },
  }),
  defineOperation({
    name: "apple_ads_query_supported_app_languages",
    group: "apps",
    operationId: "querySupportedAppLanguages",
    kind: "read",
    method: "POST",
    path: "/v1/metadata/apps/supported-languages/query",
    scope: "adAccount",
    annotations: {"title":"Query Supported App Languages","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query the languages supported for App Store advertising in each country or region.\n\nRetrieves metadata about supported languages for apps, including language codes and locale information. Common filters include countryCode, name, etc.\n\nHTTP: POST /v1/metadata/apps/supported-languages/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
  defineOperation({
    name: "apple_ads_search_apps",
    group: "apps",
    operationId: "searchApps",
    kind: "read",
    method: "GET",
    path: "/v1/search/apps",
    scope: "adAccount",
    annotations: {"title":"Search Apps","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Search the App Store for apps by name/developer, by content provider IDs, or list the apps owned by your org. Use it to find the adamId used as a campaign's promotedObjectId.\n\nSearches the App Store for apps matching the supplied criteria. **Behavior:** - At least one of `query`, `cpids`, or `returnOwnedApps=true` must be supplied. Calls with none of these are rejected with `INVALID_INPUT`. - When `query` is supplied it must contain at least one alphanumeric character; minimum length is 3 characters (2 for CJK languages). - `storeFronts` may be repeated to filter by multiple country or region codes. All codes must be enabled storefronts. - Results are paginated; `limit` is capped at the service-side maximum (`MAXLIMIT`) regardless of the requested value. - Response items include enrichment such as `appIcon`, `contentProviderId`, `softwareRating`, `displayPolicies` and `eligibilities`.\n\nHTTP: GET /v1/search/apps.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: use `limit` (page size) and `offset` (start position); fetch the next page by adding limit to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"query","sdk":"query","name":"query"},{"role":"query","sdk":"returnOwnedApps","name":"returnOwnedApps"},{"role":"query","sdk":"cpids","name":"cpids"},{"role":"query","sdk":"storeFronts","name":"storeFronts"},{"role":"query","sdk":"offset","name":"offset"},{"role":"query","sdk":"limit","name":"limit"}],
    shape: {
      "query": z.string().optional().describe("Free-text app search criteria. Matched against app name and developer name. Must contain at least one alphanumeric character. Minimum length of 3 characters (2 for CJK languages)."),
      "returnOwnedApps": z.boolean().optional().describe("When `true`, returns apps owned by the caller's organization. May be combined with `query` and `cpids`, or used on its own when neither is supplied."),
      "cpids": z.string().optional().describe("Comma-separated list of iTunes content provider identifiers used to scope the search to apps owned by those providers."),
      "storeFronts": z.array(z.string()).optional().describe("One or more storefront country or region codes (ISO 3166-1 alpha-2) used to filter results. Repeat the parameter to supply multiple values. All values must be enabled storefronts; otherwise the request is rejected with `INVALID_COUNTRY_CODE`."),
      "offset": z.number().optional().describe("Offset of the first page result to return."),
      "limit": z.number().optional().describe("Maximum number of entries to return on a page. Capped at the service-side maximum (`MAXLIMIT`)."),
    },
  }),
];
