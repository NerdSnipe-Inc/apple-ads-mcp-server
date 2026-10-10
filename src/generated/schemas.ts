// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (request-model schemas from @apple/apple-ads-platform@1.109.0). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
/* eslint-disable */
import { z } from "zod";

export const AdvertiserResourceTypeSchema = z.enum(["CONTENT_PROVIDER","BUSINESS_BRAND"] as [string, ...string[]]);

export const DelegationUpdateSchema = z.object({
  "resourceId": z.string().nullable().optional(),
  "resourceType": AdvertiserResourceTypeSchema.nullable().optional(),
}).passthrough();

export const AdAccountUpdateSchema = z.object({
  "name": z.string().optional(),
  "delegations": z.array(DelegationUpdateSchema).nullable().optional(),
  "productFeatures": z.array(z.string()).nullable().optional(),
}).passthrough();

export const DelegationCreateSchema = z.object({
  "resourceId": z.string(),
  "resourceType": AdvertiserResourceTypeSchema,
}).passthrough();

export const AdAccountCreateSchema = z.object({
  "name": z.string(),
  "delegations": z.array(DelegationCreateSchema).nullable().optional(),
  "productFeatures": z.array(z.string()),
}).passthrough();

export const AdGroupStatusSchema = z.enum(["ENABLED","PAUSED"] as [string, ...string[]]);

export const BidStrategyTypeSchema = z.enum(["MANUAL_CPT","MAX_CONVERSIONS","MANUAL_CPM","MAX_ENGAGEMENTS"] as [string, ...string[]]);

export const BidStrategyGoalSchema = z.enum(["IMPRESSION","INSTALL","TAP"] as [string, ...string[]]);

export const MoneySchema = z.object({
  "amount": z.string().describe("The monetary value in the specified currency. The API uses amount whenever a currency value is necessary. The string can contain up to two decimal digits."),
  "currency": z.string().nullable().optional().describe("The organization’s default currency that is set up in the Apple Search Ads UI."),
}).passthrough();

export const BidStrategyUpdateSchema = z.object({
  "bidStrategyType": BidStrategyTypeSchema.nullable().optional(),
  "bidStrategyGoal": BidStrategyGoalSchema.nullable().optional(),
  "bid": MoneySchema.optional(),
}).passthrough();

export const CPAGoalUpdateSchema = z.object({
  "value": MoneySchema.optional(),
}).passthrough();

export const TargetingDataUpdateSchema = z.object({
  "include": z.array(z.string()).nullable().optional(),
  "exclude": z.array(z.string()).nullable().optional(),
}).passthrough();

export const AdGroupTargetingUpdateSchema = z.object({
  "country": TargetingDataUpdateSchema.nullable().optional(),
  "adminArea": TargetingDataUpdateSchema.nullable().optional(),
  "locality": TargetingDataUpdateSchema.nullable().optional(),
  "postalCode": TargetingDataUpdateSchema.nullable().optional(),
  "deviceClass": TargetingDataUpdateSchema.nullable().optional(),
  "minAge": TargetingDataUpdateSchema.nullable().optional(),
  "maxAge": TargetingDataUpdateSchema.nullable().optional(),
  "gender": TargetingDataUpdateSchema.nullable().optional(),
  "appCategory": TargetingDataUpdateSchema.nullable().optional(),
  "appDownloader": TargetingDataUpdateSchema.nullable().optional(),
  "daypart": TargetingDataUpdateSchema.nullable().optional(),
  "radius": TargetingDataUpdateSchema.nullable().optional(),
  "locationGroup": TargetingDataUpdateSchema.nullable().optional(),
  "travelIntent": TargetingDataUpdateSchema.nullable().optional(),
}).passthrough();

export const AdGroupUpdateSchema = z.object({
  "name": z.string().optional(),
  "startTime": z.string().optional(),
  "endTime": z.string().nullable().optional(),
  "automatedKeywordsOptIn": z.boolean().nullable().optional(),
  "status": AdGroupStatusSchema.optional(),
  "automatedKeywordsRequired": z.boolean().nullable().optional(),
  "bidStrategy": BidStrategyUpdateSchema.nullable().optional(),
  "cpaCap": CPAGoalUpdateSchema.nullable().optional().describe("Use Max Conversion bid strategy. See BidStrategy. (deprecated)"),
  "targeting": AdGroupTargetingUpdateSchema.nullable().optional(),
}).passthrough();

export const PricingModelSchema = z.enum(["CPA","CPM","CPT"] as [string, ...string[]]);

export const BidStrategyCreateSchema = z.object({
  "bidStrategyType": BidStrategyTypeSchema.nullable().optional(),
  "bidStrategyGoal": BidStrategyGoalSchema.nullable().optional(),
  "bid": MoneySchema.optional(),
}).passthrough();

export const CPAGoalCreateSchema = z.object({
  "value": MoneySchema.optional(),
}).passthrough();

export const TargetingDataCreateSchema = z.object({
  "include": z.array(z.string()).nullable().optional(),
  "exclude": z.array(z.string()).nullable().optional(),
}).passthrough();

export const AdGroupTargetingCreateSchema = z.object({
  "country": TargetingDataCreateSchema.nullable().optional(),
  "adminArea": TargetingDataCreateSchema.nullable().optional(),
  "locality": TargetingDataCreateSchema.nullable().optional(),
  "postalCode": TargetingDataCreateSchema.nullable().optional(),
  "deviceClass": TargetingDataCreateSchema.nullable().optional(),
  "minAge": TargetingDataCreateSchema.nullable().optional(),
  "maxAge": TargetingDataCreateSchema.nullable().optional(),
  "gender": TargetingDataCreateSchema.nullable().optional(),
  "appCategory": TargetingDataCreateSchema.nullable().optional(),
  "appDownloader": TargetingDataCreateSchema.nullable().optional(),
  "daypart": TargetingDataCreateSchema.nullable().optional(),
  "radius": TargetingDataCreateSchema.nullable().optional(),
  "locationGroup": TargetingDataCreateSchema.nullable().optional(),
  "travelIntent": TargetingDataCreateSchema.nullable().optional(),
}).passthrough();

export const AdGroupCreateSchema = z.object({
  "name": z.string(),
  "campaignId": z.number(),
  "startTime": z.string().optional(),
  "endTime": z.string().nullable().optional(),
  "pricingModel": PricingModelSchema,
  "automatedKeywordsOptIn": z.boolean().nullable().optional(),
  "status": AdGroupStatusSchema.optional(),
  "automatedKeywordsRequired": z.boolean().nullable().optional(),
  "bidStrategy": BidStrategyCreateSchema.nullable().optional(),
  "cpaCap": CPAGoalCreateSchema.nullable().optional().describe("Use Max Conversion bid strategy. See BidStrategy. (deprecated)"),
  "targeting": AdGroupTargetingCreateSchema.nullable().optional(),
}).passthrough();

export const QueryFilterOperatorSchema = z.enum(["IS_NOT_NULL","EQUALS","STARTS_WITH","IN","NOT_CONTAINS_ANY","NOT_EQUALS","LESS_THAN_OR_EQUAL_TO","BETWEEN","NOT_IN","LESS_THAN","GREATER_THAN_OR_EQUAL_TO","CONTAINS_ALL","NOT_CONTAINS_ALL","LIKE","IS_NULL","GREATER_THAN","ENDS_WITH","CONTAINS_ANY","NOT_LIKE"] as [string, ...string[]]);

export const QueryFilterSchema = z.object({
  "field": z.string().optional(),
  "operator": QueryFilterOperatorSchema.optional(),
  "value": z.any().optional().describe("The filter value; type depends on the field being filtered"),
  "ignoreCase": z.boolean().optional(),
}).passthrough();

export const QuerySortOrderSchema = z.enum(["ASC","DESC"] as [string, ...string[]]);

export const QuerySortSchema = z.object({
  "field": z.string().optional(),
  "order": QuerySortOrderSchema.optional(),
}).passthrough();

export const QueryPaginationSchema = z.object({
  "pageSize": z.number().optional(),
  "offset": z.number().optional(),
  "fetchTotalCount": z.boolean().optional(),
}).passthrough();

export const AdStatusSchema = z.enum(["ENABLED","PAUSED"] as [string, ...string[]]);

export const AdUpdateSchema = z.object({
  "name": z.string().optional(),
  "status": AdStatusSchema.optional(),
}).passthrough();

export const AdCreateSchema = z.object({
  "adGroupId": z.number(),
  "creativeId": z.number(),
  "name": z.string(),
  "status": AdStatusSchema,
}).passthrough();

export const RecommendationMoneySchema = z.object({
  "amount": z.string().describe("Decimal amount as string (e.g., \\\"1.50\\\")"),
  "currency": z.string().describe("ISO 4217 currency code"),
}).passthrough().describe("Monetary amount with currency");

export const ApplyDailyCapRecommendationSchema = z.object({
  "id": z.string().describe("Recommendation ID to apply/dismiss"),
  "appliedDailyBudget": RecommendationMoneySchema.optional(),
  "historyId": z.string().optional().describe("Optional history ID for tracking"),
  "promotedObjectId": z.string().describe("Campaign identifier"),
  "promotedObjectType": z.string().describe("Type of promoted object"),
}).passthrough().describe("Request to apply or dismiss a daily budget recommendation");

export const ApplyTargetCpaRecommendationSchema = z.object({
  "id": z.string().describe("Recommendation ID to apply/dismiss"),
  "appliedTargetCPA": RecommendationMoneySchema.optional(),
  "historyId": z.string().optional().describe("Optional history ID for tracking"),
  "promotedObjectId": z.string().describe("Campaign identifier"),
  "promotedObjectType": z.string().describe("Type of promoted object"),
}).passthrough().describe("Request to apply or dismiss a target CPA recommendation");

export const RequestPaginationSchema = z.object({
  "offset": z.number().optional(),
  "pageSize": z.number().optional().describe("Maximum 5000. Default 100."),
}).passthrough();

export const SortingOrderEnumSchema = z.enum(["ASC","DESC"] as [string, ...string[]]);

export const SortingSchema = z.object({
  "field": z.string().optional(),
  "order": SortingOrderEnumSchema.optional(),
}).passthrough();

export const FilterOperatorEnumSchema = z.enum(["EQUALS","GREATER_THAN","LESS_THAN","IN","LIKE","STARTS_WITH","CONTAINS","ENDS_WITH","CONTAINS_ANY","CONTAINS_ALL","BETWEEN","GREATER_THAN_OR_EQUAL_TO","LESS_THAN_OR_EQUAL_TO","NOT_EQUALS"] as [string, ...string[]]);

export const FilterSchema = z.object({
  "field": z.string().optional(),
  "operator": FilterOperatorEnumSchema.optional(),
  "value": z.any().optional().describe("For single-value operators (EQUALS, NOT_EQUALS, GREATER_THAN, etc.), pass either a bare string or a single-element array. For multi-value operators (IN, BETWEEN, CONTAINS_ANY, CONTAINS_ALL), pass an array. Operator-specific cardinality is enforced server-side."),
}).passthrough();

export const AppsReportingRequestGroupByEnumSchema = z.enum(["deviceClass","ageRange","gender","countryCode","adminArea","locality","storefront","countryOrRegion"] as [string, ...string[]]);

export const TimeRangeTimeZoneEnumSchema = z.enum(["UTC","ORTZ"] as [string, ...string[]]);

export const TimeRangeGranularityEnumSchema = z.enum(["MONTHLY","WEEKLY","DAILY","HOURLY"] as [string, ...string[]]);

export const TimeRangeSchema = z.object({
  "start": z.string().optional().describe("Start date in YYYY-MM-DD format. For HOURLY granularity: must be within the last 7 days. For DAILY granularity: must be within the last 90 days. For WEEKLY granularity: must be within the last 365 days."),
  "end": z.string().optional().describe("End date in YYYY-MM-DD format. For WEEKLY granularity: must be at least 14 days in the past. For MONTHLY granularity: must be at least 90 days in the past."),
  "timeZone": TimeRangeTimeZoneEnumSchema.optional().describe("Timezone for the report date range. ORTZ uses the ad account\\'s local timezone. Note: UTC is not supported for the SEARCHTERM entity (both APPS and BRANDS)."),
  "granularity": TimeRangeGranularityEnumSchema.optional().describe("Time granularity for the report rows. HOURLY: Not supported for SEARCHTERM or AD entities. Date range must start within the last 7 days. DAILY: Date range start must be within the last 90 days. WEEKLY: Date range start within the last 365 days; end date at least 14 days in the past. MONTHLY: End date must be at least 90 days in the past."),
}).passthrough();

export const AppsOptionsIncludeRowsEnumSchema = z.enum(["GRAND_TOTAL","EMPTY_METRICS"] as [string, ...string[]]);

export const AppsOptionsSchema = z.object({
  "includeRows": z.array(AppsOptionsIncludeRowsEnumSchema).optional().describe("GRAND_TOTAL includes a summary row with aggregated totals. EMPTY_METRICS includes rows with zero metrics. Not supported for the SEARCHTERM entity."),
}).passthrough().describe("Report options for APPS promoted object type.");

export const BrandsReportingRequestGroupByEnumSchema = z.enum(["deviceClass","locationId","supplyPlacement"] as [string, ...string[]]);

export const BrandsOptionsIncludeRowsEnumSchema = z.enum(["GRAND_TOTAL"] as [string, ...string[]]);

export const BrandsOptionsSchema = z.object({
  "includeRows": z.array(BrandsOptionsIncludeRowsEnumSchema).optional().describe("GRAND_TOTAL includes a summary row with aggregated totals."),
}).passthrough().describe("Report options for BRANDS promoted object type. EMPTY_METRICS is not supported for any BRANDS entity on external calls.");

export const CampaignStatusSchema = z.enum(["ENABLED","PAUSED"] as [string, ...string[]]);

export const DailyBudgetUpdateSchema = z.object({
  "value": MoneySchema.optional(),
}).passthrough();

export const SharedBudgetAssignmentUpdateSchema = z.object({
  "budgetId": z.number().optional(),
}).passthrough();

export const CampaignTargetingUpdateSchema = z.object({
  "supplySource": TargetingDataUpdateSchema.nullable().optional(),
  "supplyPlacement": TargetingDataUpdateSchema.nullable().optional(),
  "countryOrRegion": TargetingDataUpdateSchema.nullable().optional(),
}).passthrough();

export const InvoiceDetailUpdateSchema = z.object({
  "orderNumber": z.string().nullable().optional(),
  "clientName": z.string().nullable().optional(),
  "primaryBuyerName": z.string().nullable().optional(),
  "primaryBuyerEmail": z.string().nullable().optional(),
  "billingEmail": z.string().nullable().optional(),
}).passthrough();

export const RegulationTypeSchema = z.enum(["CAC","CAMPAIGN_SAPIN_LAW","ORG_SAPIN_LAW"] as [string, ...string[]]);

export const RegulationResponseValueSchema = z.enum(["AGENT","FALSE","FRENCH_BUSINESS","NOT_AGENT","NOT_ANSWERED","NOT_FRENCH_BUSINESS","TRUE"] as [string, ...string[]]);

export const RegulationResponseUpdateSchema = z.object({
  "regulationType": RegulationTypeSchema.optional(),
  "responseValue": RegulationResponseValueSchema.optional(),
}).passthrough();

export const CampaignUpdateSchema = z.object({
  "name": z.string().optional(),
  "startTime": z.string().optional(),
  "endTime": z.string().nullable().optional(),
  "status": CampaignStatusSchema.optional(),
  "dailyBudget": DailyBudgetUpdateSchema.optional(),
  "sharedBudgets": z.array(SharedBudgetAssignmentUpdateSchema).nullable().optional(),
  "targeting": CampaignTargetingUpdateSchema.optional(),
  "bidStrategy": BidStrategyUpdateSchema.nullable().optional(),
  "invoiceDetail": InvoiceDetailUpdateSchema.nullable().optional(),
  "regulationResponses": z.array(RegulationResponseUpdateSchema).nullable().optional(),
}).passthrough();

export const BillingEventSchema = z.enum(["IMPRESSIONS","INSTALLS","TAPS"] as [string, ...string[]]);

export const PromotedObjectTypeSchema = z.enum(["APPSTORE_APP","BUSINESS_BRAND"] as [string, ...string[]]);

export const DailyBudgetCreateSchema = z.object({
  "value": MoneySchema.optional(),
}).passthrough();

export const SharedBudgetAssignmentCreateSchema = z.object({
  "budgetId": z.number().optional(),
}).passthrough();

export const CampaignTargetingCreateSchema = z.object({
  "supplySource": TargetingDataCreateSchema.nullable().optional(),
  "supplyPlacement": TargetingDataCreateSchema.nullable().optional(),
  "countryOrRegion": TargetingDataCreateSchema.nullable().optional(),
}).passthrough();

export const InvoiceDetailCreateSchema = z.object({
  "orderNumber": z.string().nullable().optional(),
  "clientName": z.string().nullable().optional(),
  "primaryBuyerName": z.string(),
  "primaryBuyerEmail": z.string(),
  "billingEmail": z.string(),
}).passthrough();

export const RegulationResponseCreateSchema = z.object({
  "regulationType": RegulationTypeSchema.optional(),
  "responseValue": RegulationResponseValueSchema.optional(),
}).passthrough();

export const CampaignCreateSchema = z.object({
  "adAccountId": z.number(),
  "name": z.string(),
  "billingEvent": BillingEventSchema,
  "startTime": z.string().optional(),
  "endTime": z.string().nullable().optional(),
  "promotedObjectType": PromotedObjectTypeSchema,
  "promotedObjectId": z.string(),
  "status": CampaignStatusSchema.optional(),
  "dailyBudget": DailyBudgetCreateSchema,
  "sharedBudgets": z.array(SharedBudgetAssignmentCreateSchema).nullable().optional(),
  "targeting": CampaignTargetingCreateSchema,
  "bidStrategy": BidStrategyCreateSchema.nullable().optional(),
  "invoiceDetail": InvoiceDetailCreateSchema.nullable().optional(),
  "regulationResponses": z.array(RegulationResponseCreateSchema).nullable().optional(),
}).passthrough();

export const LocationGroupTypeSchema = z.enum(["DYNAMIC","STATIC"] as [string, ...string[]]).describe("How a LocationGroup is composed. DYNAMIC groups select members via rules; STATIC groups have a fixed, explicitly-enumerated member list.");

export const RuleFieldEnumSchema = z.enum(["adminArea","locality","postalCode","locationId"] as [string, ...string[]]);

export const RuleOperatorEnumSchema = z.enum(["EQUALS","NOT_EQUALS","IN","NOT_IN"] as [string, ...string[]]);

export const RuleSchema = z.object({
  "field": RuleFieldEnumSchema,
  "operator": RuleOperatorEnumSchema,
  "value": z.any().describe("Single value string (for EQUALS/NOT_EQUALS) or array of string value (for IN/NOT_IN)"),
}).passthrough().describe("A single filter rule for DYNAMIC location groups. Use `value` (string) for EQUALS/NOT_EQUALS. Use `value` (array) for IN/NOT_IN.");

export const LocationGroupCreateSchema = z.object({
  "name": z.string(),
  "brandId": z.string(),
  "adAccountId": z.string(),
  "groupType": LocationGroupTypeSchema,
  "rules": z.array(RuleSchema).optional().describe("Structured rules for DYNAMIC groups. Use instead of raw `query`. Supported fields: adminArea, locality, postalCode, locationId. Operators: EQUALS, NOT_EQUALS, IN, NOT_IN. Use `value` for all operators (string for EQUALS/NOT_EQUALS, array for IN/NOT_IN)."),
  "locationIds": z.array(z.string()).optional().describe("Location identifiers for STATIC type"),
  "description": z.string().optional(),
}).passthrough();

export const CreativeUpdateSchema = z.object({
  "name": z.string().optional(),
  "creativeSpec": z.record(z.any()).nullable().optional(),
}).passthrough();

export const CreativeTypeSchema = z.enum(["CUSTOM_PRODUCT_PAGE","DEFAULT_PRODUCT_PAGE","LOCAL_ADS_SEARCH_CREATIVE"] as [string, ...string[]]);

export const DestinationTypeSchema = z.enum(["APP_STORE_PRODUCT_PAGE","LOCAL_ADS_PLACECARD"] as [string, ...string[]]);

export const DestinationParameterSchema = z.object({
  "adamId": z.string().nullable().optional(),
  "productPageId": z.string().nullable().optional(),
}).passthrough();

export const DestinationCreateSchema = z.object({
  "destinationType": DestinationTypeSchema,
  "parameters": DestinationParameterSchema.nullable().optional(),
}).passthrough();

export const CreativeCreateSchema = z.object({
  "name": z.string(),
  "creativeType": CreativeTypeSchema,
  "creativeSpec": z.record(z.any()).nullable().optional(),
  "destination": DestinationCreateSchema,
}).passthrough();

export const GeoEntityTypeSchema = z.enum(["Country","AdminArea","Locality","PostalCode"] as [string, ...string[]]).describe("Geo entity type (a.k.a. dimension).");

export const GeoRequestSchema = z.object({
  "id": z.string().optional().describe("Numeric geo location identifier (geo_location_id). Mutually exclusive with legacyId."),
  "legacyId": z.string().optional().describe("Pipe-delimited geo code (e.g. \\\"US|CA|San Francisco\\\", \\\"US|TX|78238\\\"). Mutually exclusive with id."),
  "entity": GeoEntityTypeSchema,
}).passthrough().describe("A single geo lookup request. Must have either `id` (numeric geo_location_id) or `legacyId` (pipe-delimited geo code), but not both.");

export const SearchSupplySourceTypeSchema = z.enum(["APPSTORE","MAPS"] as [string, ...string[]]).describe("Supply source context for geo search.");

export const GeoSearchPaginationSchema = z.object({
  "totalCount": z.number().optional(),
  "offset": z.number().optional(),
  "pageSize": z.number().optional(),
}).passthrough();

export const ImpressionShareTimeRangeTimeZoneEnumSchema = z.enum(["UTC"] as [string, ...string[]]);

export const ImpressionShareTimeRangeGranularityEnumSchema = z.enum(["DAILY","WEEKLY_SUN_SAT"] as [string, ...string[]]);

export const ImpressionShareTimeRangeSchema = z.object({
  "start": z.string().describe("Start date in YYYY-MM-DD format."),
  "end": z.string().describe("End date in YYYY-MM-DD format."),
  "timeZone": ImpressionShareTimeRangeTimeZoneEnumSchema.optional().describe("Fixed to UTC. Not user-configurable."),
  "granularity": ImpressionShareTimeRangeGranularityEnumSchema.describe("DAILY: daily aggregation, uses day date field. WEEKLY_SUN_SAT: fixed weekly aggregation (Sunday-Saturday), uses week date field."),
}).passthrough().describe("Time range for impression share queries. Timezone is fixed to UTC.");

export const ImpressionShareOptionsImpressionShareReportTypeEnumSchema = z.enum(["FIRST_SLOT","ALL_SLOTS"] as [string, ...string[]]);

export const ImpressionShareOptionsSchema = z.object({
  "impressionShareReportType": ImpressionShareOptionsImpressionShareReportTypeEnumSchema.optional().describe("FIRST_SLOT: impression share and metrics for the first (top) ad position only. ALL_SLOTS: impression share and metrics aggregated across all ad positions."),
}).passthrough().describe("Report options for impression share queries.");

export const KeywordMatchTypeSchema = z.enum(["EXACT","BROAD","PHRASE","CATEGORY"] as [string, ...string[]]);

export const KeywordStatusSchema = z.enum(["ENABLED","PAUSED"] as [string, ...string[]]);

export const BulkKeywordCreateSchema = z.object({
  "adGroupId": z.number(),
  "text": z.string(),
  "matchType": KeywordMatchTypeSchema.optional(),
  "bid": MoneySchema.nullable().optional(),
  "status": KeywordStatusSchema.optional(),
}).passthrough();

export const KeywordCreateBulkRequestItemSchema = z.object({
  "correlationId": z.number().optional(),
  "data": BulkKeywordCreateSchema.optional(),
}).passthrough();

export const KeywordCreateBulkRequestSchema = z.object({
  "items": z.array(KeywordCreateBulkRequestItemSchema).optional(),
}).passthrough();

export const BulkKeywordUpdateSchema = z.object({
  "id": z.number(),
  "bid": MoneySchema.nullable().optional(),
  "status": KeywordStatusSchema.optional(),
}).passthrough();

export const KeywordUpdateBulkRequestItemSchema = z.object({
  "correlationId": z.number().optional(),
  "data": BulkKeywordUpdateSchema.optional(),
}).passthrough();

export const KeywordUpdateBulkRequestSchema = z.object({
  "items": z.array(KeywordUpdateBulkRequestItemSchema).optional(),
}).passthrough();

export const KeywordUpdateSchema = z.object({
  "bid": MoneySchema.optional(),
  "status": KeywordStatusSchema.optional(),
}).passthrough();

export const KeywordCreateSchema = z.object({
  "adGroupId": z.number(),
  "text": z.string(),
  "matchType": KeywordMatchTypeSchema.optional(),
  "bid": MoneySchema.optional(),
  "status": KeywordStatusSchema.optional(),
}).passthrough();

export const NegativeKeywordStatusSchema = z.enum(["ENABLED","PAUSED"] as [string, ...string[]]);

export const BulkNegativeKeywordCreateSchema = z.object({
  "campaignId": z.number().nullable().optional(),
  "adGroupId": z.number().nullable().optional(),
  "text": z.string(),
  "matchType": KeywordMatchTypeSchema.optional(),
  "status": NegativeKeywordStatusSchema.optional(),
}).passthrough();

export const NegativeKeywordCreateBulkRequestItemSchema = z.object({
  "correlationId": z.number().optional(),
  "data": BulkNegativeKeywordCreateSchema.optional(),
}).passthrough();

export const NegativeKeywordCreateBulkRequestSchema = z.object({
  "items": z.array(NegativeKeywordCreateBulkRequestItemSchema).optional(),
}).passthrough();

export const BulkNegativeKeywordUpdateSchema = z.object({
  "id": z.number(),
  "status": NegativeKeywordStatusSchema.optional(),
}).passthrough();

export const NegativeKeywordUpdateBulkRequestItemSchema = z.object({
  "correlationId": z.number().optional(),
  "data": BulkNegativeKeywordUpdateSchema.optional(),
}).passthrough();

export const NegativeKeywordUpdateBulkRequestSchema = z.object({
  "items": z.array(NegativeKeywordUpdateBulkRequestItemSchema).optional(),
}).passthrough();

export const NegativeKeywordUpdateSchema = z.object({
  "status": NegativeKeywordStatusSchema.optional(),
}).passthrough();

export const NegativeKeywordCreateSchema = z.object({
  "campaignId": z.number().nullable().optional(),
  "adGroupId": z.number().nullable().optional(),
  "text": z.string(),
  "matchType": KeywordMatchTypeSchema.optional(),
  "status": NegativeKeywordStatusSchema.optional(),
}).passthrough();

export const AuditOperatorSchema = z.enum(["EQUALS","IN","LESS_THAN","LESS_THAN_OR_EQUAL_TO","GREATER_THAN","GREATER_THAN_OR_EQUAL_TO","BETWEEN"] as [string, ...string[]]).describe("operator enum");

export const AuditFilterSchema = z.object({
  "field": z.string().optional().describe("The field to filter on. Standard event fields are always available (`eventTime`, `entityType`, `entityId`, `userId`, `userType`, `txnId`). Some filterable identifiers vary by `entityType` because each event carries its parent\\'s id under a type-specific name: * `Campaign`, `AdGroup` → `adAccountId` * `AdGroup`, `Keyword`, `NegativeKeyword` → `campaignId` * `AdGroup`, `Keyword`, `NegativeKeyword` → `adGroupId` For non-time fields only `EQUALS` and `IN` are supported; `GREATER_THAN` / `LESS_THAN` / `BETWEEN` are reserved for `eventTime`."),
  "operator": AuditOperatorSchema.optional(),
  "value": z.any().optional().describe("single value (long/integer or string or datetime ) or array of (long/integer or string or datetime )"),
}).passthrough().describe("Filter object");

export const AuditSortOrderSchema = z.enum(["ASC","DESC"] as [string, ...string[]]);

export const AuditSortingSchema = z.object({
  "field": z.string().optional(),
  "order": AuditSortOrderSchema.optional(),
}).passthrough().describe("sorting");

export const PaginationSchema = z.object({
  "offset": z.number().optional(),
  "pageSize": z.number().optional(),
  "totalCount": z.number().optional(),
}).passthrough();

export const AuditQueryOptionsNeedTotalsEnumSchema = z.enum(["true","false"] as [string, ...string[]]);

export const AuditQueryOptionsTimeZoneEnumSchema = z.enum(["UTC","ORTZ"] as [string, ...string[]]);

export const AuditQueryOptionsMetadataEnumSchema = z.enum(["none","latest","snapshot"] as [string, ...string[]]);

export const AuditQueryOptionsSchema = z.object({
  "needTotals": AuditQueryOptionsNeedTotalsEnumSchema.optional().describe("Skip the expensive COUNT query when set to \\\"false\\\". Pagination.totalCount will be 0 in the response."),
  "timeZone": AuditQueryOptionsTimeZoneEnumSchema.optional().describe("Timezone for eventTime filters. UTC — filter values are in UTC (default). ORTZ — filter values are in the org\\'s configured timezone; converted to UTC server-side."),
  "metadata": AuditQueryOptionsMetadataEnumSchema.optional().describe("Controls which entity metadata is included in change detail responses. none — no metadata. latest — join current entity_meta (may differ from time of change). snapshot — use metadata captured at snapshot time."),
}).passthrough().describe("Key-value query options");

export const RecommendationQueryRequestPaginationSchema = z.object({
  "offset": z.number().optional().describe("Number of items to skip"),
  "pageSize": z.number().optional().describe("Number of items per page"),
}).passthrough().describe("Pagination parameters");

export const RecommendationSortingOrderSchema = z.enum(["ASC","DESC"] as [string, ...string[]]).describe("Sort direction");

export const RecommendationSortingSchema = z.object({
  "field": z.string().describe("Field name to sort by"),
  "order": RecommendationSortingOrderSchema.optional(),
}).passthrough().describe("Sort specification for query results");

export const RecommendationFilterOperatorSchema = z.enum(["EQUALS","NOT_EQUALS","IN","CONTAINS_ANY","CONTAINS_ALL","LESS_THAN","LESS_THAN_OR_EQUAL_TO","GREATER_THAN","GREATER_THAN_OR_EQUAL_TO","BETWEEN","STARTS_WITH","ENDS_WITH","LIKE"] as [string, ...string[]]).describe("Filter operator for query conditions");

export const RecommendationFilterConditionSchema = z.object({
  "field": z.string().describe("Field name to filter on (must match model field names)"),
  "operator": RecommendationFilterOperatorSchema,
  "value": z.array(z.string()).describe("Filter values (always array, even for single values)"),
  "ignoreCase": z.boolean().optional().describe("Case-insensitive matching for string fields"),
}).passthrough().describe("Individual filter condition for querying recommendations. **Operator Support by Field Type:** - String fields: EQUALS, IN, STARTS_WITH, CONTAINS, LIKE - Numeric fields: EQUALS, IN, GREATER_THAN, LESS_THAN, BETWEEN - Date fields: EQUALS, GREATER_THAN, LESS_THAN - Enum fields: EQUALS, IN - List fields: CONTAINS_ANY, CONTAINS_ALL");

export const SearchTermPopularityTimeRangeTimeZoneEnumSchema = z.enum(["UTC"] as [string, ...string[]]);

export const SearchTermPopularityTimeRangeGranularityEnumSchema = z.enum(["WEEKLY_SUN_SAT","MONTHLY"] as [string, ...string[]]);

export const SearchTermPopularityTimeRangeSchema = z.object({
  "start": z.string().describe("Start date. For WEEKLY_SUN_SAT: YYYY-MM-DD format. For MONTHLY: YYYY-MM-DD format."),
  "end": z.string().describe("End date. For WEEKLY_SUN_SAT: YYYY-MM-DD format. For MONTHLY: YYYY-MM-DD format."),
  "timeZone": SearchTermPopularityTimeRangeTimeZoneEnumSchema.optional().describe("Fixed to UTC. Not user-configurable."),
  "granularity": SearchTermPopularityTimeRangeGranularityEnumSchema.describe("WEEKLY_SUN_SAT: fixed weekly reports (Sunday-Saturday). Generated Mondays at 07:00 UTC. Rolling 65-week retention. MONTHLY: calendar month snapshots. Refreshes on the 5th of each month UTC. Rolling 15-month retention."),
}).passthrough().describe("Time range for search term popularity queries. Timezone is fixed to UTC.");

export const SharedBudgetUpdateSchema = z.object({
  "name": z.string().optional(),
  "startTime": z.string().optional(),
  "endTime": z.string().nullable().optional(),
  "value": MoneySchema.optional(),
  "adAccountIds": z.array(z.number()).optional(),
  "invoiceDetail": InvoiceDetailUpdateSchema.optional(),
}).passthrough();

export const SharedBudgetCreateSchema = z.object({
  "name": z.string(),
  "startTime": z.string(),
  "endTime": z.string().nullable().optional(),
  "value": MoneySchema,
  "adAccountIds": z.array(z.number()),
  "invoiceDetail": InvoiceDetailCreateSchema,
}).passthrough();

export const LocationGroupUpdateSchema = z.object({
  "name": z.string().optional(),
  "groupType": LocationGroupTypeSchema.optional(),
  "rules": z.array(RuleSchema).optional().describe("Structured rules for DYNAMIC groups. Changing rules sets systemStatus to PENDING. Use `value` for all operators (string for EQUALS/NOT_EQUALS, array for IN/NOT_IN)."),
  "locationIds": z.array(z.string()).optional(),
  "description": z.string().optional(),
}).passthrough();

export const UploadAssetPromotedObjectTypeEnumSchema = z.enum(["BUSINESS_BRAND"] as [string, ...string[]]);
