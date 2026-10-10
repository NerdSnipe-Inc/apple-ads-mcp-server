// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "assets": Apple Maps creative assets (upload, query, get, delete)). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { QueryFilterSchema, QueryPaginationSchema, QuerySortSchema, UploadAssetPromotedObjectTypeEnumSchema } from "../generated/schemas.js";

export const assetsTools = [
  defineOperation({
    name: "apple_ads_delete_asset",
    group: "assets",
    operationId: "deleteAsset",
    kind: "delete",
    method: "DELETE",
    path: "/v1/assets/{id}",
    scope: "adAccount",
    annotations: {"title":"Delete Asset","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Soft-delete an asset you uploaded.\n\nDeletes an asset by its unique identifier.\n\nHTTP: DELETE /v1/assets/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nDESTRUCTIVE: removes the entity; confirm with the user before calling.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"id","name":"assetId","type":"string"}],
    shape: {
      "assetId": idParam("Unique identifier of the asset to delete"),
    },
  }),
  defineOperation({
    name: "apple_ads_get_asset",
    group: "assets",
    operationId: "getAsset",
    kind: "read",
    method: "GET",
    path: "/v1/assets/{id}",
    scope: "adAccount",
    annotations: {"title":"Get Asset","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get one asset by ID, including eligibility.status. Poll it after upload until ELIGIBLE.\n\nRetrieves a single asset by its unique identifier.\n\nHTTP: GET /v1/assets/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"path","sdk":"id","name":"assetId","type":"string"}],
    shape: {
      "assetId": idParam("Unique identifier of the asset"),
    },
  }),
  defineOperation({
    name: "apple_ads_query_assets",
    group: "assets",
    operationId: "queryAssets",
    kind: "read",
    method: "POST",
    path: "/v1/assets/query",
    scope: "adAccount",
    annotations: {"title":"Query Assets","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Query creative assets (App Store apps and Apple Maps brands) with filters, sorting and pagination.\n\nRetrieves a list of assets based on filtering, sorting, and pagination criteria. Supports: - **Field selection**: Return only specified fields to reduce response size - **Complex filtering**: Multiple operators (EQUALS, NOT_EQUALS, IN, GREATER_THAN, etc.) - **Multi-field sorting**: Sort by multiple fields (ASC/DESC) - **Pagination**: Offset-based pagination with configurable page size An empty request body returns all assets with default pagination (pageSize: 20).\n\nHTTP: POST /v1/assets/query.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.\nPagination: pass pagination.pageSize and pagination.offset (set pagination.fetchTotalCount=true to get totalCount); the response's `pagination` block reports offset, pageSize and totalCount. Fetch the next page by adding pageSize to offset.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"queryRequest","mode":"flatten","keys":["filters","sorting","pagination"]}],
    shape: {
      "filters": z.array(QueryFilterSchema).nullable().optional().describe("Filter conditions, each {field, operator, value, ignoreCase?}. Operators vary by endpoint (EQUALS, NOT_EQUALS, IN, LIKE, STARTS_WITH, CONTAINS, CONTAINS_ANY, CONTAINS_ALL, BETWEEN, GREATER_THAN, LESS_THAN, ...). 'value' may be a scalar or an array (for IN/BETWEEN). Omit to return everything. The tool description lists the supported filter fields."),
      "sorting": z.array(QuerySortSchema).nullable().optional().describe("Sort order, each {field, order: ASC|DESC}. Default is id ascending."),
      "pagination": QueryPaginationSchema.optional().describe("Paging controls {offset, pageSize, fetchTotalCount}. Increase offset by pageSize to get the next page."),
    },
  }),
  defineOperation({
    name: "apple_ads_upload_asset",
    group: "assets",
    operationId: "uploadAsset",
    kind: "create",
    method: "POST",
    path: "/v1/assets/upload",
    scope: "adAccount",
    annotations: {"title":"Upload Asset","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Upload an image asset (PNG, JPG or HEIC) for an Apple Maps brand. Provide a local filePath or base64 content.\n\nUploads a new asset file to the system. Accepts image files (PNG, JPG, HEIC) via multipart form data. The uploaded file is processed and an Asset record is created with extracted metadata (dimensions, format, file size, etc.).\n\nHTTP: POST /v1/assets/upload.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"context","sdk":"xApContext"},{"role":"file","sdk":"file"},{"role":"form","sdk":"promotedObjectId","name":"promotedObjectId"},{"role":"form","sdk":"promotedObjectType","name":"promotedObjectType"}],
    shape: {
      "filePath": z.string().optional().describe("Absolute path to a local image file (PNG, JPG or HEIC) on the machine running this MCP server. Provide this OR contentBase64."),
      "contentBase64": z.string().optional().describe("Base64-encoded image bytes (alternative to filePath). Also provide fileName."),
      "fileName": z.string().optional().describe("File name including extension, e.g. logo.png. Required with contentBase64; defaults to the basename of filePath."),
      "contentType": z.string().optional().describe("MIME type, e.g. image/png. Inferred from the file extension when omitted."),
      "promotedObjectId": z.string().describe("Generic identifier for the promoted object (e.g., brandId for a Business Brand)"),
      "promotedObjectType": UploadAssetPromotedObjectTypeEnumSchema.describe("Type of promoted object. Only BUSINESS_BRAND is supported by this endpoint."),
    },
  }),
];
