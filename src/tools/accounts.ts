// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (group "accounts": Org, user identity (me/ACLs), ad accounts and advertiser resources). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import { z } from "zod";
import { defineOperation, idParam } from "../tooling.js";
import { AdAccountCreateSchema, AdAccountUpdateSchema, AdvertiserResourceTypeSchema } from "../generated/schemas.js";

export const accountsTools = [
  defineOperation({
    name: "apple_ads_get_ad_account",
    group: "accounts",
    operationId: "adAccountsIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/ad-accounts/{id}",
    scope: "adAccount",
    annotations: {"title":"Get Ad Account","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get full details of an ad account (currency, timezone, payment model, status, product features, delegations). Defaults to the adAccountId in context.\n\nHTTP: GET /v1/ad-accounts/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"id","type":"string","default":"adAccountId"},{"role":"context","sdk":"xApContext"}],
    shape: {
      "id": idParam("ID of the ad account. Defaults to adAccountId (the ad account in context).").optional(),
    },
  }),
  defineOperation({
    name: "apple_ads_update_ad_account",
    group: "accounts",
    operationId: "adAccountsIdPut",
    kind: "update",
    method: "PUT",
    path: "/v1/ad-accounts/{id}",
    scope: "adAccount",
    annotations: {"title":"Update Ad Account","readOnlyHint":false,"destructiveHint":true,"idempotentHint":true,"openWorldHint":true},
    description: "Update an ad account's name or delegations. Array fields use full-replacement semantics, so send the complete desired array.\n\nHTTP: PUT /v1/ad-accounts/{id}.\nAd-account scoped: sent with header X-AP-Context: adAccountId=<adAccountId>. adAccountId defaults to APPLE_ADS_AD_ACCOUNT_ID, or to the only ad account your API user can access.",
    args: [{"role":"path","sdk":"id","name":"id","type":"string","default":"adAccountId"},{"role":"context","sdk":"xApContext"},{"role":"body","sdk":"adAccountUpdate","mode":"nested","name":"body"}],
    shape: {
      "id": idParam("ID of the ad account. Defaults to adAccountId (the ad account in context).").optional(),
      "body": AdAccountUpdateSchema.describe("Request body (AdAccountUpdate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_create_ad_account",
    group: "accounts",
    operationId: "adAccountsPost",
    kind: "create",
    method: "POST",
    path: "/v1/ad-accounts",
    scope: "none",
    annotations: {"title":"Create Ad Account","readOnlyHint":false,"destructiveHint":false,"idempotentHint":false,"openWorldHint":true},
    description: "Create a new ad account under the caller's org, optionally delegating an App Store content provider or Apple Maps brand to it. Needs no ad account context.\n\nHTTP: POST /v1/ad-accounts.\nOrg-level operation: needs no ad account context.",
    args: [{"role":"body","sdk":"adAccountCreate","mode":"nested","name":"body"}],
    shape: {
      "body": AdAccountCreateSchema.describe("Request body (AdAccountCreate)."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_advertiser_resources",
    group: "accounts",
    operationId: "getAdvertiserResources",
    kind: "read",
    method: "GET",
    path: "/v1/advertiser-resources",
    scope: "none",
    annotations: {"title":"Get Advertiser Resources","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "List advertiser resources (App Store content providers or Apple Maps business brands) available in the org that can be delegated to an ad account. Needs no ad account context.\n\nRetrieves advertiser resources available to the authenticated API user, filtered by resource type.\n\nHTTP: GET /v1/advertiser-resources.\nOrg-level operation: needs no ad account context.",
    args: [{"role":"query","sdk":"resourceType","name":"resourceType"}],
    shape: {
      "resourceType": AdvertiserResourceTypeSchema.describe("Filter by resource type."),
    },
  }),
  defineOperation({
    name: "apple_ads_get_me",
    group: "accounts",
    operationId: "getMe",
    kind: "read",
    method: "GET",
    path: "/v1/me",
    scope: "none",
    annotations: {"title":"Get Me","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get the authenticated API user's userId and orgId. Needs no ad account context, so it is the best first call to verify credentials.\n\nReturns the userId and orgId of the authenticated API caller.\n\nHTTP: GET /v1/me.\nOrg-level operation: needs no ad account context.",
    args: [],
    shape: {

    },
  }),
  defineOperation({
    name: "apple_ads_get_user_acls",
    group: "accounts",
    operationId: "getUserAcls",
    kind: "read",
    method: "GET",
    path: "/v1/acls",
    scope: "none",
    annotations: {"title":"Get User Acls","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "List every ad account this API user can access, with the user's roles on each. Use it to discover adAccountId values (needs no ad account context).\n\nRetrieves the Access Control List (ACL) for the authenticated user, including their roles and associated ad accounts.\n\nHTTP: GET /v1/acls.\nOrg-level operation: needs no ad account context.",
    args: [],
    shape: {

    },
  }),
  defineOperation({
    name: "apple_ads_get_org",
    group: "accounts",
    operationId: "orgsIdGet",
    kind: "read",
    method: "GET",
    path: "/v1/orgs/{id}",
    scope: "none",
    annotations: {"title":"Get Org","readOnlyHint":true,"destructiveHint":false,"idempotentHint":true,"openWorldHint":true},
    description: "Get an organization's name, currency, timezone, payment model and system status. Defaults to the configured/authenticated org when orgId is omitted.\n\nHTTP: GET /v1/orgs/{id}.\nOrg-level operation: needs no ad account context.",
    args: [{"role":"path","sdk":"id","name":"orgId","type":"string","default":"orgId"}],
    shape: {
      "orgId": idParam("ID of the organization. Defaults to APPLE_ADS_ORG_ID or the orgId returned by GET /me.").optional(),
    },
  }),
];
