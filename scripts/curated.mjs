// Hand-curated metadata for every operation exposed by @apple/apple-ads-platform.
//
// The generator (scripts/generate.mjs) reads the SDK, then joins each SDK operation
// with the entry below. The generator FAILS if an SDK operation has no entry here
// (a new SDK operation must be consciously mapped to a tool) or if an entry here
// does not exist in the SDK any more (stale mapping).
//
// Entry shape: operationId -> [group, toolName, kind, summary]
//   kind: read | create | update | delete | action
//     read   - no side effects (GET, and POST ".../query" style lookups)
//     create - creates a new entity
//     update - modifies an existing entity (PUT / bulk-update)
//     delete - removes an entity
//     action - other state change (apply / dismiss a recommendation)
//   summary: one-sentence, LLM-oriented lead of the tool description. The SDK's own
//            (much more detailed) operation docs are appended automatically.

export const GROUPS = {
  accounts: "Org, user identity (me/ACLs), ad accounts and advertiser resources",
  apps: "App Store app search, app details and supported ad languages",
  eligibility: "App eligibility checks and App Store creative rejection reasons",
  brands: "Apple Maps brands, business categories, brand rejection reasons and locations",
  location_groups: "Apple Maps location groups (create, query, get, update, delete)",
  campaigns: "Campaigns (App Store and Apple Maps)",
  ad_groups: "Ad groups (targeting, bid strategy, schedule)",
  ads: "Ads (link a creative to an ad group)",
  creatives: "Ad creatives (product page and Apple Maps creatives)",
  assets: "Apple Maps creative assets (upload, query, get, delete)",
  keywords: "Keywords",
  negative_keywords: "Negative keywords",
  bulk: "Bulk create/update of keywords and negative keywords",
  geo: "Geo targeting lookups",
  product_pages: "App Store product pages and locale details",
  budget_orders: "Budget orders (shared budgets) for monthly-invoiced accounts",
  reports_apps: "App Store performance reports",
  reports_brands: "Apple Maps (business brand) performance reports",
  insights: "Impression share and search term popularity",
  recommendations: "Daily budget and target CPA recommendations (query, apply, dismiss)",
  suggestions: "Keyword, phrase, category and target CPA suggestions",
  change_history: "Audit log of changes (summaries and field-level details)",
};

export const OPS = {
  // accounts
  getMe: ["accounts", "apple_ads_get_me", "read", "Get the authenticated API user's userId and orgId. Needs no ad account context, so it is the best first call to verify credentials."],
  getUserAcls: ["accounts", "apple_ads_get_user_acls", "read", "List every ad account this API user can access, with the user's roles on each. Use it to discover adAccountId values (needs no ad account context)."],
  orgsIdGet: ["accounts", "apple_ads_get_org", "read", "Get an organization's name, currency, timezone, payment model and system status. Defaults to the configured/authenticated org when orgId is omitted."],
  adAccountsPost: ["accounts", "apple_ads_create_ad_account", "create", "Create a new ad account under the caller's org, optionally delegating an App Store content provider or Apple Maps brand to it. Needs no ad account context."],
  adAccountsIdGet: ["accounts", "apple_ads_get_ad_account", "read", "Get full details of an ad account (currency, timezone, payment model, status, product features, delegations). Defaults to the adAccountId in context."],
  adAccountsIdPut: ["accounts", "apple_ads_update_ad_account", "update", "Update an ad account's name or delegations. Array fields use full-replacement semantics, so send the complete desired array."],
  getAdvertiserResources: ["accounts", "apple_ads_get_advertiser_resources", "read", "List advertiser resources (App Store content providers or Apple Maps business brands) available in the org that can be delegated to an ad account. Needs no ad account context."],

  // apps
  searchApps: ["apps", "apple_ads_search_apps", "read", "Search the App Store for apps by name/developer, by content provider IDs, or list the apps owned by your org. Use it to find the adamId used as a campaign's promotedObjectId."],
  getAppDetailsByAdamId: ["apps", "apple_ads_get_app_details", "read", "Get details for one app by its Adam ID (name, genres, device classes, available storefronts)."],
  querySupportedAppLanguages: ["apps", "apple_ads_query_supported_app_languages", "read", "Query the languages supported for App Store advertising in each country or region."],

  // eligibility
  eligibilitiesAppsQueryPost: ["eligibility", "apple_ads_check_app_eligibility", "read", "Check whether an app is eligible to advertise, per placement and country or region."],
  rejectionReasonsAppsQueryPost: ["eligibility", "apple_ads_query_app_rejection_reasons", "read", "Query human-readable rejection reasons for App Store ad creatives of an app."],
  rejectionReasonsAppsRejectionReasonIdGet: ["eligibility", "apple_ads_get_app_rejection_reason", "read", "Get one App Store creative rejection reason by its ID."],

  // brands (Apple Maps)
  queryBrands: ["brands", "apple_ads_query_brands", "read", "Query Apple Maps business brands. Filter by eligibility.status ELIGIBLE to find brands usable in campaigns."],
  getBrand: ["brands", "apple_ads_get_brand", "read", "Get one Apple Maps business brand by ID."],
  queryCategories: ["brands", "apple_ads_query_business_categories", "read", "Query Apple Maps business categories."],
  getCategory: ["brands", "apple_ads_get_business_category", "read", "Get one Apple Maps business category by ID."],
  queryRejectionReasonsByBusinessBrand: ["brands", "apple_ads_query_brand_rejection_reasons", "read", "Query policy assignments (rejection reasons) for Apple Maps brands and creatives, filtered by the brand's promotedObjectId."],
  queryLocations: ["brands", "apple_ads_query_locations", "read", "Query the business locations of your Apple Maps brands (read-only; filter by brandId and status OPEN to build location groups)."],
  getLocation: ["brands", "apple_ads_get_location", "read", "Get one Apple Maps business location by ID."],

  // location groups
  createLocationGroup: ["location_groups", "apple_ads_create_location_group", "create", "Create an Apple Maps location group (STATIC list of location IDs or DYNAMIC rule-based) for ad group targeting."],
  queryLocationGroups: ["location_groups", "apple_ads_query_location_groups", "read", "Query location groups with filters, sorting and pagination."],
  getLocationGroup: ["location_groups", "apple_ads_get_location_group", "read", "Get one location group by ID."],
  updateLocationGroup: ["location_groups", "apple_ads_update_location_group", "update", "Update a location group (name, description, location IDs or rules). INVALID/PENDING groups cannot be updated."],
  deleteLocationGroup: ["location_groups", "apple_ads_delete_location_group", "delete", "Permanently delete a location group. Ad groups targeting it lose that targeting constraint immediately."],

  // campaigns
  campaignsPost: ["campaigns", "apple_ads_create_campaign", "create", "Create a campaign for an App Store app (APPSTORE_APP) or Apple Maps brand (BUSINESS_BRAND). promotedObjectType and promotedObjectId are immutable after creation."],
  campaignsQueryPost: ["campaigns", "apple_ads_query_campaigns", "read", "Query campaigns with filters, sorting and pagination. With no filters, returns all non-deleted campaigns in the ad account."],
  campaignsIdGet: ["campaigns", "apple_ads_get_campaign", "read", "Get one campaign by ID, including status, systemStatus, bid strategy and budget."],
  campaignsIdPut: ["campaigns", "apple_ads_update_campaign", "update", "Partially update a campaign (name, status ENABLED/PAUSED, budget, bid strategy, targeting). Only send fields to change; arrays are fully replaced."],
  campaignsIdDelete: ["campaigns", "apple_ads_delete_campaign", "delete", "Soft-delete a campaign by ID."],
  campaignsIdLegacyAppLimitedStatusReasonDetailsGet: ["campaigns", "apple_ads_get_campaign_legacy_limited_status_details", "read", "Get per-country limited-status reason details for a legacy app campaign."],

  // ad groups
  adgroupsPost: ["ad_groups", "apple_ads_create_ad_group", "create", "Create an ad group inside a campaign (targeting, pricing model, bid strategy, schedule, Search Match)."],
  adgroupsQueryPost: ["ad_groups", "apple_ads_query_ad_groups", "read", "Query ad groups with filters (e.g. campaignId), sorting and pagination."],
  adgroupsIdGet: ["ad_groups", "apple_ads_get_ad_group", "read", "Get one ad group by ID."],
  adgroupsIdPut: ["ad_groups", "apple_ads_update_ad_group", "update", "Partially update an ad group (status, bids, targeting, schedule). Arrays are fully replaced."],
  adgroupsIdDelete: ["ad_groups", "apple_ads_delete_ad_group", "delete", "Soft-delete an ad group by ID."],

  // ads
  adsPost: ["ads", "apple_ads_create_ad", "create", "Create an ad linking an existing creative to an ad group. Create the creative first."],
  adsQueryPost: ["ads", "apple_ads_query_ads", "read", "Query ads with filters, sorting and pagination."],
  adsIdGet: ["ads", "apple_ads_get_ad", "read", "Get one ad by ID."],
  adsIdPut: ["ads", "apple_ads_update_ad", "update", "Update an ad. Only name and status (ENABLED/PAUSED) can change after creation."],
  adsIdDelete: ["ads", "apple_ads_delete_ad", "delete", "Soft-delete an ad by ID."],

  // creatives
  creativesPost: ["creatives", "apple_ads_create_creative", "create", "Create an ad creative (DEFAULT_PRODUCT_PAGE, CUSTOM_PRODUCT_PAGE or LOCAL_ADS_SEARCH_CREATIVE). creativeType cannot change later."],
  creativesQueryPost: ["creatives", "apple_ads_query_creatives", "read", "Query ad creatives with filters (creativeType, systemStatus, name, eligibility.status), sorting and pagination."],
  creativesIdGet: ["creatives", "apple_ads_get_creative", "read", "Get one ad creative by ID."],
  creativesIdPut: ["creatives", "apple_ads_update_creative", "update", "Update an ad creative."],
  creativesIdDelete: ["creatives", "apple_ads_delete_creative", "delete", "Soft-delete an ad creative by ID."],

  // assets
  uploadAsset: ["assets", "apple_ads_upload_asset", "create", "Upload an image asset (PNG, JPG or HEIC) for an Apple Maps brand. Provide a local filePath or base64 content."],
  queryAssets: ["assets", "apple_ads_query_assets", "read", "Query creative assets (App Store apps and Apple Maps brands) with filters, sorting and pagination."],
  getAsset: ["assets", "apple_ads_get_asset", "read", "Get one asset by ID, including eligibility.status. Poll it after upload until ELIGIBLE."],
  deleteAsset: ["assets", "apple_ads_delete_asset", "delete", "Soft-delete an asset you uploaded."],

  // keywords
  keywordsPost: ["keywords", "apple_ads_create_keyword", "create", "Create a keyword in an ad group."],
  keywordsQueryPost: ["keywords", "apple_ads_query_keywords", "read", "Query keywords with filters (e.g. adGroupId), sorting and pagination."],
  keywordsIdGet: ["keywords", "apple_ads_get_keyword", "read", "Get one keyword by ID."],
  keywordsIdPut: ["keywords", "apple_ads_update_keyword", "update", "Update a keyword (bid, status)."],
  keywordsIdDelete: ["keywords", "apple_ads_delete_keyword", "delete", "Delete a keyword by ID."],

  // negative keywords
  negativeKeywordsPost: ["negative_keywords", "apple_ads_create_negative_keyword", "create", "Create a negative keyword at campaign or ad group level."],
  negativeKeywordsQueryPost: ["negative_keywords", "apple_ads_query_negative_keywords", "read", "Query negative keywords with filters, sorting and pagination."],
  negativeKeywordsIdGet: ["negative_keywords", "apple_ads_get_negative_keyword", "read", "Get one negative keyword by ID."],
  negativeKeywordsIdPut: ["negative_keywords", "apple_ads_update_negative_keyword", "update", "Update a negative keyword."],
  negativeKeywordsIdDelete: ["negative_keywords", "apple_ads_delete_negative_keyword", "delete", "Delete a negative keyword by ID."],

  // bulk
  keywordsBulkCreatePost: ["bulk", "apple_ads_bulk_create_keywords", "create", "Create many keywords in one request (counts as one call against the rate limit). Set allowPartialSuccess to keep valid items when others fail."],
  keywordsBulkUpdatePost: ["bulk", "apple_ads_bulk_update_keywords", "update", "Update many keywords in one request. Each item's data must include the keyword id plus only the fields to change."],
  negativeKeywordsBulkCreatePost: ["bulk", "apple_ads_bulk_create_negative_keywords", "create", "Create many negative keywords in one request."],
  negativeKeywordsBulkUpdatePost: ["bulk", "apple_ads_bulk_update_negative_keywords", "update", "Update many negative keywords in one request. Each item's data must include the id plus only the fields to change."],

  // geo
  searchGeos: ["geo", "apple_ads_search_geos", "read", "Search geo locations (country, admin area, locality, postal code) by name or wildcard to find IDs for ad group geo targeting."],
  getGeosByIds: ["geo", "apple_ads_get_geos_by_ids", "read", "Look up geo location metadata by entity ID or legacy ID (POST /search/geo)."],

  // product pages
  queryProductPages: ["product_pages", "apple_ads_query_product_pages", "read", "Query App Store product pages (default, custom and optimized) available to the ad account."],
  getProductPageById: ["product_pages", "apple_ads_get_product_page", "read", "Get one product page by its productPageId."],
  queryProductPageLocaleDetails: ["product_pages", "apple_ads_query_product_page_locale_details", "read", "Query localized metadata (name, subtitle, promo text, screenshots) of product pages."],
  queryAppLocaleDetails: ["product_pages", "apple_ads_query_app_locale_details", "read", "Query the default product page's localized metadata for an app by Adam ID."],

  // budget orders
  sharedBudgetsPost: ["budget_orders", "apple_ads_create_budget_order", "create", "Create a budget order (shared budget) capping total spend across campaigns. Requires a monthly-invoiced (LOC) ad account."],
  sharedBudgetsQueryPost: ["budget_orders", "apple_ads_query_budget_orders", "read", "Query budget orders with filters, sorting and pagination."],
  sharedBudgetsIdGet: ["budget_orders", "apple_ads_get_budget_order", "read", "Get one budget order by ID."],
  sharedBudgetsIdPut: ["budget_orders", "apple_ads_update_budget_order", "update", "Update a budget order."],
  sharedBudgetsIdDelete: ["budget_orders", "apple_ads_delete_budget_order", "delete", "Delete a budget order by ID."],

  // reports: App Store
  appsCampaignReports: ["reports_apps", "apple_ads_report_apps_campaigns", "read", "App Store campaign performance report (impressions, taps, installs, spend, ...) for a time range, with optional groupBy."],
  appsAdGroupReports: ["reports_apps", "apple_ads_report_apps_ad_groups", "read", "App Store ad group performance report for a time range."],
  appsAdReports: ["reports_apps", "apple_ads_report_apps_ads", "read", "App Store ad performance report for a time range."],
  appsKeywordReports: ["reports_apps", "apple_ads_report_apps_keywords", "read", "App Store keyword performance report for a time range."],
  appsSearchTermReports: ["reports_apps", "apple_ads_report_apps_search_terms", "read", "App Store search term performance report for a time range."],

  // reports: Apple Maps
  brandsCampaignReports: ["reports_brands", "apple_ads_report_brands_campaigns", "read", "Apple Maps campaign performance report for a time range (group by locationId for per-location breakdowns)."],
  brandsAdGroupReports: ["reports_brands", "apple_ads_report_brands_ad_groups", "read", "Apple Maps ad group performance report for a time range."],
  brandsAdReports: ["reports_brands", "apple_ads_report_brands_ads", "read", "Apple Maps ad performance report for a time range."],
  brandsKeywordReports: ["reports_brands", "apple_ads_report_brands_keywords", "read", "Apple Maps keyword performance report for a time range."],
  brandsSearchTermReports: ["reports_brands", "apple_ads_report_brands_search_terms", "read", "Apple Maps search term performance report for a time range."],

  // insights
  impressionShareQuery: ["insights", "apple_ads_query_impression_share", "read", "Query App Store impression share for keywords over a time range. A promotedObjectId filter is required."],
  searchTermPopularityQuery: ["insights", "apple_ads_query_search_term_popularity", "read", "Query App Store search term popularity rankings by country or region and genre."],

  // recommendations
  queryDailyBudgetRecommendations: ["recommendations", "apple_ads_query_daily_budget_recommendations", "read", "Query daily budget recommendations. promotedObjectId and promotedObjectType filters are mandatory."],
  applyDailyBudgetRecommendations: ["recommendations", "apple_ads_apply_daily_budget_recommendations", "action", "Apply daily budget recommendations, which updates the campaigns' daily budgets. All items must share one promotedObjectId."],
  dismissDailyBudgetRecommendations: ["recommendations", "apple_ads_dismiss_daily_budget_recommendations", "action", "Dismiss daily budget recommendations without changing any campaign."],
  queryTargetCpaRecommendations: ["recommendations", "apple_ads_query_target_cpa_recommendations", "read", "Query target CPA recommendations for App Store campaigns using Maximize Conversions."],
  applyTargetCpaRecommendations: ["recommendations", "apple_ads_apply_target_cpa_recommendations", "action", "Apply target CPA recommendations, updating the target CPA used by Maximize Conversions bidding."],
  dismissTargetCpaRecommendations: ["recommendations", "apple_ads_dismiss_target_cpa_recommendations", "action", "Dismiss target CPA recommendations without changing any campaign."],

  // suggestions
  queryKeywordSuggestions: ["suggestions", "apple_ads_query_keyword_suggestions", "read", "Get ranked keyword suggestions for an app (popularity 0-100). Feed good ones into apple_ads_create_keyword."],
  queryPhraseSuggestions: ["suggestions", "apple_ads_query_phrase_suggestions", "read", "Get natural-language search phrase suggestions for an app or brand, or look up phrase popularity."],
  queryCategorySuggestions: ["suggestions", "apple_ads_query_category_suggestions", "read", "Get category suggestions for an app or brand, or search categories by name."],
  queryTargetCpaSuggestion: ["suggestions", "apple_ads_query_target_cpa_suggestion", "read", "Get a suggested target CPA for an App Store app based on recent tap-install CPI data."],

  // change history
  queryAuditSummary: ["change_history", "apple_ads_query_change_history", "read", "Query the change history (audit) summary grouped by transaction. An eventTime filter is required; set options.metadata to latest or snapshot to get detailIds."],
  getChangeDetails: ["change_history", "apple_ads_get_change_details", "read", "Get field-level before/after values for one change, by detailId (format EntityType.entityId.txnId)."],
};

// Path-parameter renames (SDK name -> tool argument name), keyed by first path segment.
export const PATH_PARAM_NAMES = {
  campaigns: "campaignId",
  adgroups: "adGroupId",
  ads: "adId",
  creatives: "creativeId",
  keywords: "keywordId",
  "negative-keywords": "negativeKeywordId",
  assets: "assetId",
  "location-groups": "locationGroupId",
  locations: "locationId",
  "business-brands": "brandId",
  "business-categories": "categoryId",
  "shared-budgets": "sharedBudgetId",
  orgs: "orgId",
};

// Human noun for path-parameter descriptions, by tool argument name.
export const ID_NOUNS = {
  campaignId: "campaign",
  adGroupId: "ad group",
  adId: "ad",
  creativeId: "ad creative",
  keywordId: "keyword",
  negativeKeywordId: "negative keyword",
  assetId: "asset (UUID)",
  locationGroupId: "location group",
  locationId: "Apple Maps business location",
  brandId: "Apple Maps business brand",
  categoryId: "business category",
  sharedBudgetId: "budget order (shared budget)",
  orgId: "organization",
};
