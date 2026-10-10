// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "change_history": Audit log of changes (summaries and field-level details)). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { AuditFilterSchema, AuditQueryOptionsSchema, AuditSortingSchema, PaginationSchema } from "../generated/schemas.js";

export const changeHistoryTools = [
  defineOperation({
    name: "apple_ads_get_change_details",
    group: "change_history",
    operationId: "getChangeDetails",
    kind: "read",
    method: "GET",
    path: "/v1/change-history/{detailId}",
    scope: "adAccount",
    annotations: {"title":"Get Change Details","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get field-level before/after values for one change, by detailId (format EntityType.entityId.txnId).\n\nReturns field-level change details for a single entity change. The detailId format is `EntityType.entityId.txnId` (e.g. `Campaign.123.abc-def`).\n\nHTTP: GET /v1/change-history/{detailId}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: use `limit` (page size) and `offset` (start position); fetch the next page by adding limit to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"detailId","name":"detailId","type":"string"},{"role":"query","sdk":"limit","name":"limit"},{"role":"query","sdk":"offset","name":"offset"}],
    shape: {
      "detailId": idParam("Composite ID in format: EntityType.entityId.txnId"),
      "limit": z.number().optional(),
      "offset": z.number().optional(),
    },
  }),
  defineOperation({
    name: "apple_ads_query_change_history",
    group: "change_history",
    operationId: "queryAuditSummary",
    kind: "read",
    method: "POST",
    path: "/v1/change-history/query",
    scope: "adAccount",
    annotations: {"title":"Query Change History","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query the change history (audit) summary grouped by transaction. An eventTime filter is required; set options.metadata to latest or snapshot to get detailIds.\n\nReturns audit summaries grouped by (userType, userId, txnId, eventType, entityType). Requires at least an eventTime filter. Use options.needTotals=false to skip the COUNT query.\n\nHTTP: POST /v1/change-history/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"auditQuery","mode":"flatten","keys":["filters","sorting","pagination","options"]}],
    shape: {
      "filters": z.array(AuditFilterSchema).optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(AuditSortingSchema).optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": PaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
      "options": AuditQueryOptionsSchema.optional(),
    },
  }),
];
