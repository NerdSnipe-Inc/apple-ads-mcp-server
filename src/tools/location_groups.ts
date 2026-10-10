// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "location_groups": Apple Maps location groups (create, query, get, update, delete)). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { LocationGroupCreateSchema, LocationGroupUpdateSchema, QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const locationGroupsTools = [
  defineOperation({
    name: "apple_ads_create_location_group",
    group: "location_groups",
    operationId: "createLocationGroup",
    kind: "create",
    method: "POST",
    path: "/v1/location-groups",
    scope: "adAccount",
    annotations: {"title":"Create Location Group","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create an Apple Maps location group (STATIC list of location IDs or DYNAMIC rule-based) for ad group targeting.\n\nHTTP: POST /v1/location-groups.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"locationGroupCreate","mode":"nested","name":"body"}],
    shape: {
      "body": LocationGroupCreateSchema.describe("Request body (LocationGroupCreate). Location group details to create"),
    },
  }),
  defineOperation({
    name: "apple_ads_delete_location_group",
    group: "location_groups",
    operationId: "deleteLocationGroup",
    kind: "delete",
    method: "DELETE",
    path: "/v1/location-groups/{id}",
    scope: "adAccount",
    annotations: {"title":"Delete Location Group","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Permanently delete a location group. Ad groups targeting it lose that targeting constraint immediately.\n\nDeletes a location group (soft delete)\n\nHTTP: DELETE /v1/location-groups/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nDESTRUCTIVE: removes the entity; confirm with the user before calling.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"id","name":"locationGroupId","type":"string"}],
    shape: {
      "locationGroupId": idParam("Business Connect entity identifier"),
    },
  }),
  defineOperation({
    name: "apple_ads_get_location_group",
    group: "location_groups",
    operationId: "getLocationGroup",
    kind: "read",
    method: "GET",
    path: "/v1/location-groups/{id}",
    scope: "adAccount",
    annotations: {"title":"Get Location Group","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one location group by ID.\n\nRetrieves a single location group by its Business Connect ID\n\nHTTP: GET /v1/location-groups/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"id","name":"locationGroupId","type":"string"}],
    shape: {
      "locationGroupId": idParam("Business Connect entity identifier"),
    },
  }),
  defineOperation({
    name: "apple_ads_query_location_groups",
    group: "location_groups",
    operationId: "queryLocationGroups",
    kind: "read",
    method: "POST",
    path: "/v1/location-groups/query",
    scope: "adAccount",
    annotations: {"title":"Query Location Groups","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query location groups with filters, sorting and pagination.\n\nRetrieves a list of location groups based on filtering, sorting, and pagination criteria. Using `\\\"fields\\\": [\\\"providerObjectId\\\"]` returns a validation error. Filtering on `id` matches the Business Connect provider object ID. ### Supported Filter Fields | Field | Type | Operators | Notes | |-------|------|-----------|-------| | `id` | string | EQUALS, IN | Maps to provider object ID | | `name` | string | EQUALS, CONTAINS | Group name | | `brandId` | string | EQUALS | Parent brand | | `businessOrgId` | string | EQUALS | Parent org | | `groupType` | string (enum) | EQUALS, IN | STATIC or DYNAMIC | | `deleted` | boolean | EQUALS | Soft-delete flag | | `isAllLocationsGroup` | boolean | EQUALS | All-locations flag | | `eligibility.status` | string (enum) | EQUALS, IN | Eligibility status | | `eligibility.blockedGroups.supplyPlacement` | string | CONTAINS_ANY | Blocked placement | | `eligibility.blockedGroups.countryOrRegion` | string | CONTAINS_ANY | Blocked country | | `eligibility.allowedGroups.supplyPlacement` | string | CONTAINS_ANY | Allowed placement | | `eligibility.allowedGroups.countryOrRegion` | string | CONTAINS_ANY | Allowed country |\n\nHTTP: POST /v1/location-groups/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
  defineOperation({
    name: "apple_ads_update_location_group",
    group: "location_groups",
    operationId: "updateLocationGroup",
    kind: "update",
    method: "PUT",
    path: "/v1/location-groups/{id}",
    scope: "adAccount",
    annotations: {"title":"Update Location Group","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Update a location group (name, description, location IDs or rules). INVALID/PENDING groups cannot be updated.\n\nHTTP: PUT /v1/location-groups/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"id","name":"locationGroupId","type":"string"},{"role":"body","sdk":"locationGroupUpdate","mode":"nested","name":"body"}],
    shape: {
      "locationGroupId": idParam("Business Connect entity identifier"),
      "body": LocationGroupUpdateSchema.describe("Request body (LocationGroupUpdate). Updated location group details"),
    },
  }),
];
