// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "budget_orders": Budget orders (shared budgets) for monthly-invoiced accounts). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { QueryFilterSchema, QueryPaginationSchema, QuerySortSchema, SharedBudgetCreateSchema, SharedBudgetUpdateSchema } from "../generated/schemas.js";

export const budgetOrdersTools = [
  defineOperation({
    name: "apple_ads_delete_budget_order",
    group: "budget_orders",
    operationId: "sharedBudgetsIdDelete",
    kind: "delete",
    method: "DELETE",
    path: "/v1/shared-budgets/{id}",
    scope: "none",
    annotations: {"title":"Delete Budget Order","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Delete a budget order by ID.\n\nHTTP: DELETE /v1/shared-budgets/{id}.\nOrg-level operation: needs no ad account context.\nDESTRUCTIVE: removes the entity; confirm with the user before calling.",
    args: [{"role":"path","sdk":"id","name":"sharedBudgetId","type":"string"}],
    shape: {
      "sharedBudgetId": idParam("ID of the budget order (shared budget)."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_budget_order",
    group: "budget_orders",
    operationId: "sharedBudgetsIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/shared-budgets/{id}",
    scope: "optional",
    annotations: {"title":"Get Budget Order","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one budget order by ID.\n\nHTTP: GET /v1/shared-budgets/{id}.\nAd account context (adAccountId) is optional for this operation.",
    args: [{"role":"path","sdk":"id","name":"sharedBudgetId","type":"string"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "sharedBudgetId": idParam("ID of the budget order (shared budget)."),
    },
  }),
  defineOperation({
    name: "apple_ads_update_budget_order",
    group: "budget_orders",
    operationId: "sharedBudgetsIdPut",
    kind: "update",
    method: "PUT",
    path: "/v1/shared-budgets/{id}",
    scope: "none",
    annotations: {"title":"Update Budget Order","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Update a budget order.\n\nHTTP: PUT /v1/shared-budgets/{id}.\nOrg-level operation: needs no ad account context.",
    args: [{"role":"path","sdk":"id","name":"sharedBudgetId","type":"string"},{"role":"body","sdk":"sharedBudgetUpdate","mode":"nested","name":"body"}],
    shape: {
      "sharedBudgetId": idParam("ID of the budget order (shared budget)."),
      "body": SharedBudgetUpdateSchema.describe("Request body (SharedBudgetUpdate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_create_budget_order",
    group: "budget_orders",
    operationId: "sharedBudgetsPost",
    kind: "create",
    method: "POST",
    path: "/v1/shared-budgets",
    scope: "none",
    annotations: {"title":"Create Budget Order","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create a budget order (shared budget) capping total spend across campaigns. Requires a monthly-invoiced (LOC) ad account.\n\nHTTP: POST /v1/shared-budgets.\nOrg-level operation: needs no ad account context.",
    args: [{"role":"body","sdk":"sharedBudgetCreate","mode":"nested","name":"body"}],
    shape: {
      "body": SharedBudgetCreateSchema.describe("Request body (SharedBudgetCreate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_budget_orders",
    group: "budget_orders",
    operationId: "sharedBudgetsQueryPost",
    kind: "read",
    method: "POST",
    path: "/v1/shared-budgets/query",
    scope: "optional",
    annotations: {"title":"Query Budget Orders","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query budget orders with filters, sorting and pagination.\n\nHTTP: POST /v1/shared-budgets/query.\nAd account context (adAccountId) is optional for this operation.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
];
