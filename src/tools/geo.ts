// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "geo": Geo targeting lookups). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation } from "../tooling.js";
import { GeoEntityTypeSchema, GeoRequestSchema, GeoSearchPaginationSchema, SearchSupplySourceTypeSchema } from "../generated/schemas.js";

export const geoTools = [
  defineOperation({
    name: "apple_ads_get_geos_by_ids",
    group: "geo",
    operationId: "getGeosByIds",
    kind: "read",
    method: "POST",
    path: "/v1/search/geo",
    scope: "adAccount",
    annotations: {"title":"Get Geos By Ids","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Look up geo location metadata by entity ID or legacy ID (POST /search/geo).\n\nGets a list of geo locations for the specified list of geo id and entity type. Results are sorted alphabetically by display name, deduplicated, and paginated. Pagination parameters are in the request body (not query params).\n\nHTTP: POST /v1/search/geo.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"geoSearchPostRequest","mode":"flatten","keys":["geoRequest","supplySource","pagination"]}],
    shape: {
      "geoRequest": z.array(GeoRequestSchema).describe("List of geo entity based search criteria."),
      "supplySource": SearchSupplySourceTypeSchema.describe("Supply source context. **Required.** Case-insensitive."),
      "pagination": GeoSearchPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
  defineOperation({
    name: "apple_ads_search_geos",
    group: "geo",
    operationId: "searchGeos",
    kind: "read",
    method: "GET",
    path: "/v1/search/geo",
    scope: "adAccount",
    annotations: {"title":"Search Geos","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Search geo locations (country, admin area, locality, postal code) by name or wildcard to find IDs for ad group geo targeting.\n\nSearches for a list of geo locations based on specified criteria. **Behavior:** - `supplySource` is **required** — specifies the supply source context (APPSTORE or MAPS) - Hard-blocked geos (NO_MUID, NOT_SUPPORTED, SOURCE_REMOVED, COUNTRY_NOT_SUPPORTED, COUNTRY_NOT_SEARCHABLE) are always excluded from results - Soft-blocked geos (LOCALITY_LOW_SEARCH_VOLUME, POSTAL_CODE_SPARSE) pass through with eligibility data by default — the UI decides how to present them - With `eligible=true`: soft-blocked geos are also excluded **Supply source scoping:** - `supplySource=MAPS`: Countries excluded, results restricted to US/CA - `supplySource=APPSTORE`: PostalCode excluded **Query constraints:** - Minimum query length: 2 characters (queries shorter than 2 chars are rejected with `MIN_QUERY_LENGTH`) - Wildcard `*` is accepted and returns all geos - If `countrycode` is omitted and `entity` is not `Country`, defaults to `US`\n\nHTTP: GET /v1/search/geo.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: use `pageSize` and `offset`; fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"query","sdk":"supplySource","name":"supplySource"},{"role":"query","sdk":"query","name":"query"},{"role":"query","sdk":"entity","name":"entity"},{"role":"query","sdk":"offset","name":"offset"},{"role":"query","sdk":"pageSize","name":"pageSize"},{"role":"query","sdk":"countrycode","name":"countrycode"},{"role":"query","sdk":"eligible","name":"eligible"}],
    shape: {
      "supplySource": SearchSupplySourceTypeSchema.describe("Supply source context for eligibility evaluation. **Required.** Case-insensitive (e.g., `maps`, `Maps`, `MAPS` are all equivalent). Hard-blocked geos for the specified supply source are always excluded. Soft-blocked geos pass through with eligibility data unless `eligible=true`."),
      "query": z.string().optional().describe("Query geo search criteria. Minimum 2 characters. Use `*` to return all geos."),
      "entity": GeoEntityTypeSchema.optional().describe("Entity based geo search criteria."),
      "offset": z.number().optional().describe("Offset of the first page result to return."),
      "pageSize": z.number().optional().describe("Maximum number of entries to return on page."),
      "countrycode": z.string().optional().describe("Country code based search criteria (ISO 3166-1 alpha-2). Defaults to US when omitted and entity is not Country."),
      "eligible": z.boolean().optional().describe("Controls soft-block filtering. When `false` (default), only hard-blocked geos are excluded — soft-blocked geos (low search volume, sparse coverage) remain in results with eligibility data for the UI to handle. When `true`, both hard-blocked and soft-blocked geos are excluded."),
    },
  }),
];
