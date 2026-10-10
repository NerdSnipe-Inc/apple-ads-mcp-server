// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "product_pages": App Store product pages and locale details). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam, numParam } from "../tooling.js";
import { QueryFilterSchema, QueryPaginationSchema, QuerySortSchema } from "../generated/schemas.js";

export const productPagesTools = [
  defineOperation({
    name: "apple_ads_get_product_page",
    group: "product_pages",
    operationId: "getProductPageById",
    kind: "read",
    method: "GET",
    path: "/v1/product-pages/{productPageId}",
    scope: "adAccount",
    annotations: {"title":"Get Product Page","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one product page by its productPageId.\n\nRetrieves a specific Product Page (DPP, CPP, or PPO) by its ID\n\nHTTP: GET /v1/product-pages/{productPageId}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"productPageId","name":"productPageId","type":"string"}],
    shape: {
      "productPageId": idParam("Product Page ID"),
    },
  }),
  defineOperation({
    name: "apple_ads_query_app_locale_details",
    group: "product_pages",
    operationId: "queryAppLocaleDetails",
    kind: "read",
    method: "POST",
    path: "/v1/apps/{adamId}/locale-details/query",
    scope: "adAccount",
    annotations: {"title":"Query App Locale Details","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query the default product page's localized metadata for an app by Adam ID.\n\nRetrieves localized content for the Default Product Page of a specific app. Common filters include productPageId, language, languageCode, etc.\n\nHTTP: POST /v1/apps/{adamId}/locale-details/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"adamId","name":"adamId","type":"number"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "adamId": numParam("App Store Connect Adam ID"),
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_product_page_locale_details",
    group: "product_pages",
    operationId: "queryProductPageLocaleDetails",
    kind: "read",
    method: "POST",
    path: "/v1/product-pages/locale-details/query",
    scope: "adAccount",
    annotations: {"title":"Query Product Page Locale Details","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query localized metadata (name, subtitle, promo text, screenshots) of product pages.\n\nRetrieves localized content for Product Pages including app names, descriptions, and assets by device. Common filters include productPageId, language, languageCode, etc.\n\nHTTP: POST /v1/product-pages/locale-details/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
  defineOperation({
    name: "apple_ads_query_product_pages",
    group: "product_pages",
    operationId: "queryProductPages",
    kind: "read",
    method: "POST",
    path: "/v1/product-pages/query",
    scope: "adAccount",
    annotations: {"title":"Query Product Pages","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query App Store product pages (default, custom and optimized) available to the ad account.\n\nRetrieves a list of Product Pages (DPP, CPPs, PPOs) based on filtering, sorting, and pagination criteria. Common filters include adamId, state, etc.\n\nHTTP: POST /v1/product-pages/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
];
