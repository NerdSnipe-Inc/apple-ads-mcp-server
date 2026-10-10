// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "eligibility": App eligibility checks and App Store creative rejection reasons). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, numParam } from "../tooling.js";
import { QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const eligibilityTools = [
  defineOperation({
    name: "apple_ads_check_app_eligibility",
    group: "eligibility",
    operationId: "eligibilitiesAppsQueryPost",
    kind: "read",
    method: "POST",
    path: "/v1/eligibilities/apps/query",
    scope: "adAccount",
    annotations: {"title":"Check App Eligibility","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Check whether an app is eligible to advertise, per placement and country or region.\n\nHTTP: POST /v1/eligibilities/apps/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"eligibilityQueryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_app_rejection_reasons",
    group: "eligibility",
    operationId: "rejectionReasonsAppsQueryPost",
    kind: "read",
    method: "POST",
    path: "/v1/rejection-reasons/apps/query",
    scope: "adAccount",
    annotations: {"title":"Query App Rejection Reasons","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query human-readable rejection reasons for App Store ad creatives of an app.\n\nFind Apps rejection reasons using a query\n\nHTTP: POST /v1/rejection-reasons/apps/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"creativeRejectionReasonQueryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_app_rejection_reason",
    group: "eligibility",
    operationId: "rejectionReasonsAppsRejectionReasonIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/rejection-reasons/apps/{rejectionReasonId}",
    scope: "adAccount",
    annotations: {"title":"Get App Rejection Reason","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one App Store creative rejection reason by its ID.\n\nHTTP: GET /v1/rejection-reasons/apps/{rejectionReasonId}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"rejectionReasonId","name":"rejectionReasonId","type":"number"}],
    shape: {
      "rejectionReasonId": numParam("rejectionReasonId (path parameter)."),
    },
  }),
];
