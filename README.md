# Apple Ads MCP Server

A Model Context Protocol (MCP) server that gives AI assistants (Claude Code, Claude Desktop, Cursor, Windsurf, ...) full access to the **Apple Ads Platform API (v1)**, built on the official [`@apple/apple-ads-platform`](https://www.npmjs.com/package/@apple/apple-ads-platform) SDK.

> This targets the **Apple Ads Platform API** (`https://api.ads.apple.com/v1`), not the older Campaign Management API v5.

- One tool per SDK operation, 100% coverage (see [docs/COVERAGE.md](docs/COVERAGE.md))
- Escape hatch tool (`apple_ads_request`) for any endpoint Apple adds before the SDK does
- Automatic OAuth (ES256 client secret, token caching, refresh on 401), Retry-After aware retries on 429/5xx
- Safety switches: read-only mode and tool-group allow/deny lists
- Starts and lists tools even without credentials (calls then return an actionable error)

## Coverage

<!-- GENERATED:TOOLS:BEGIN -->
**102 tools** = 99 Apple Ads Platform API operations (100% of `@apple/apple-ads-platform`) + 3 meta tools.

| Group | Tools | Covers |
|---|---:|---|
| `accounts` | 7 | Org, user identity (me/ACLs), ad accounts and advertiser resources |
| `apps` | 3 | App Store app search, app details and supported ad languages |
| `eligibility` | 3 | App eligibility checks and App Store creative rejection reasons |
| `brands` | 7 | Apple Maps brands, business categories, brand rejection reasons and locations |
| `location_groups` | 5 | Apple Maps location groups (create, query, get, update, delete) |
| `campaigns` | 6 | Campaigns (App Store and Apple Maps) |
| `ad_groups` | 5 | Ad groups (targeting, bid strategy, schedule) |
| `ads` | 5 | Ads (link a creative to an ad group) |
| `creatives` | 5 | Ad creatives (product page and Apple Maps creatives) |
| `assets` | 4 | Apple Maps creative assets (upload, query, get, delete) |
| `keywords` | 5 | Keywords |
| `negative_keywords` | 5 | Negative keywords |
| `bulk` | 4 | Bulk create/update of keywords and negative keywords |
| `geo` | 2 | Geo targeting lookups |
| `product_pages` | 4 | App Store product pages and locale details |
| `budget_orders` | 5 | Budget orders (shared budgets) for monthly-invoiced accounts |
| `reports_apps` | 5 | App Store performance reports |
| `reports_brands` | 5 | Apple Maps (business brand) performance reports |
| `insights` | 2 | Impression share and search term popularity |
| `recommendations` | 6 | Daily budget and target CPA recommendations (query, apply, dismiss) |
| `suggestions` | 4 | Keyword, phrase, category and target CPA suggestions |
| `change_history` | 2 | Audit log of changes (summaries and field-level details) |
| `meta` | 3 | `apple_ads_request` (raw escape hatch), `apple_ads_list_operations`, `apple_ads_server_status` |
| **Total** | **102** | |

### All tools

#### accounts

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_get_ad_account` | GET | `/v1/ad-accounts/{id}` | Get full details of an ad account (currency, timezone, payment model, status, product features, delegations). Defaults to the adAccountId in context. |
| `apple_ads_update_ad_account` | PUT | `/v1/ad-accounts/{id}` | Update an ad account's name or delegations. Array fields use full-replacement semantics, so send the complete desired array. |
| `apple_ads_create_ad_account` | POST | `/v1/ad-accounts` | Create a new ad account under the caller's org, optionally delegating an App Store content provider or Apple Maps brand to it. Needs no ad account context. |
| `apple_ads_get_advertiser_resources` | GET | `/v1/advertiser-resources` | List advertiser resources (App Store content providers or Apple Maps business brands) available in the org that can be delegated to an ad account. Needs no ad account context. |
| `apple_ads_get_me` | GET | `/v1/me` | Get the authenticated API user's userId and orgId. Needs no ad account context, so it is the best first call to verify credentials. |
| `apple_ads_get_user_acls` | GET | `/v1/acls` | List every ad account this API user can access, with the user's roles on each. Use it to discover adAccountId values (needs no ad account context). |
| `apple_ads_get_org` | GET | `/v1/orgs/{id}` | Get an organization's name, currency, timezone, payment model and system status. Defaults to the configured/authenticated org when orgId is omitted. |

#### apps

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_get_app_details` | GET | `/v1/apps/{adamId}` | Get details for one app by its Adam ID (name, genres, device classes, available storefronts). |
| `apple_ads_query_supported_app_languages` | POST | `/v1/metadata/apps/supported-languages/query` | Query the languages supported for App Store advertising in each country or region. |
| `apple_ads_search_apps` | GET | `/v1/search/apps` | Search the App Store for apps by name/developer, by content provider IDs, or list the apps owned by your org. Use it to find the adamId used as a campaign's promotedObjectId. |

#### eligibility

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_check_app_eligibility` | POST | `/v1/eligibilities/apps/query` | Check whether an app is eligible to advertise, per placement and country or region. |
| `apple_ads_query_app_rejection_reasons` | POST | `/v1/rejection-reasons/apps/query` | Query human-readable rejection reasons for App Store ad creatives of an app. |
| `apple_ads_get_app_rejection_reason` | GET | `/v1/rejection-reasons/apps/{rejectionReasonId}` | Get one App Store creative rejection reason by its ID. |

#### brands

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_get_brand` | GET | `/v1/business-brands/{id}` | Get one Apple Maps business brand by ID. |
| `apple_ads_get_business_category` | GET | `/v1/business-categories/{id}` | Get one Apple Maps business category by ID. |
| `apple_ads_get_location` | GET | `/v1/locations/{id}` | Get one Apple Maps business location by ID. |
| `apple_ads_query_brands` | POST | `/v1/business-brands/query` | Query Apple Maps business brands. Filter by eligibility.status ELIGIBLE to find brands usable in campaigns. |
| `apple_ads_query_business_categories` | POST | `/v1/business-categories/query` | Query Apple Maps business categories. |
| `apple_ads_query_locations` | POST | `/v1/locations/query` | Query the business locations of your Apple Maps brands (read-only; filter by brandId and status OPEN to build location groups). |
| `apple_ads_query_brand_rejection_reasons` | POST | `/v1/rejection-reasons/business-brands/query` | Query policy assignments (rejection reasons) for Apple Maps brands and creatives, filtered by the brand's promotedObjectId. |

#### location_groups

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_create_location_group` | POST | `/v1/location-groups` | Create an Apple Maps location group (STATIC list of location IDs or DYNAMIC rule-based) for ad group targeting. |
| `apple_ads_delete_location_group` | DELETE | `/v1/location-groups/{id}` | Permanently delete a location group. Ad groups targeting it lose that targeting constraint immediately. |
| `apple_ads_get_location_group` | GET | `/v1/location-groups/{id}` | Get one location group by ID. |
| `apple_ads_query_location_groups` | POST | `/v1/location-groups/query` | Query location groups with filters, sorting and pagination. |
| `apple_ads_update_location_group` | PUT | `/v1/location-groups/{id}` | Update a location group (name, description, location IDs or rules). INVALID/PENDING groups cannot be updated. |

#### campaigns

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_delete_campaign` | DELETE | `/v1/campaigns/{id}` | Soft-delete a campaign by ID. |
| `apple_ads_get_campaign` | GET | `/v1/campaigns/{id}` | Get one campaign by ID, including status, systemStatus, bid strategy and budget. |
| `apple_ads_get_campaign_legacy_limited_status_details` | GET | `/v1/campaigns/{id}/legacy-app-limited-status-reason-details` | Get per-country limited-status reason details for a legacy app campaign. |
| `apple_ads_update_campaign` | PUT | `/v1/campaigns/{id}` | Partially update a campaign (name, status ENABLED/PAUSED, budget, bid strategy, targeting). Only send fields to change; arrays are fully replaced. |
| `apple_ads_create_campaign` | POST | `/v1/campaigns` | Create a campaign for an App Store app (APPSTORE_APP) or Apple Maps brand (BUSINESS_BRAND). promotedObjectType and promotedObjectId are immutable after creation. |
| `apple_ads_query_campaigns` | POST | `/v1/campaigns/query` | Query campaigns with filters, sorting and pagination. With no filters, returns all non-deleted campaigns in the ad account. |

#### ad_groups

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_delete_ad_group` | DELETE | `/v1/adgroups/{id}` | Soft-delete an ad group by ID. |
| `apple_ads_get_ad_group` | GET | `/v1/adgroups/{id}` | Get one ad group by ID. |
| `apple_ads_update_ad_group` | PUT | `/v1/adgroups/{id}` | Partially update an ad group (status, bids, targeting, schedule). Arrays are fully replaced. |
| `apple_ads_create_ad_group` | POST | `/v1/adgroups` | Create an ad group inside a campaign (targeting, pricing model, bid strategy, schedule, Search Match). |
| `apple_ads_query_ad_groups` | POST | `/v1/adgroups/query` | Query ad groups with filters (e.g. campaignId), sorting and pagination. |

#### ads

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_delete_ad` | DELETE | `/v1/ads/{id}` | Soft-delete an ad by ID. |
| `apple_ads_get_ad` | GET | `/v1/ads/{id}` | Get one ad by ID. |
| `apple_ads_update_ad` | PUT | `/v1/ads/{id}` | Update an ad. Only name and status (ENABLED/PAUSED) can change after creation. |
| `apple_ads_create_ad` | POST | `/v1/ads` | Create an ad linking an existing creative to an ad group. Create the creative first. |
| `apple_ads_query_ads` | POST | `/v1/ads/query` | Query ads with filters, sorting and pagination. |

#### creatives

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_delete_creative` | DELETE | `/v1/creatives/{id}` | Soft-delete an ad creative by ID. |
| `apple_ads_get_creative` | GET | `/v1/creatives/{id}` | Get one ad creative by ID. |
| `apple_ads_update_creative` | PUT | `/v1/creatives/{id}` | Update an ad creative. |
| `apple_ads_create_creative` | POST | `/v1/creatives` | Create an ad creative (DEFAULT_PRODUCT_PAGE, CUSTOM_PRODUCT_PAGE or LOCAL_ADS_SEARCH_CREATIVE). creativeType cannot change later. |
| `apple_ads_query_creatives` | POST | `/v1/creatives/query` | Query ad creatives with filters (creativeType, systemStatus, name, eligibility.status), sorting and pagination. |

#### assets

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_delete_asset` | DELETE | `/v1/assets/{id}` | Soft-delete an asset you uploaded. |
| `apple_ads_get_asset` | GET | `/v1/assets/{id}` | Get one asset by ID, including eligibility.status. Poll it after upload until ELIGIBLE. |
| `apple_ads_query_assets` | POST | `/v1/assets/query` | Query creative assets (App Store apps and Apple Maps brands) with filters, sorting and pagination. |
| `apple_ads_upload_asset` | POST | `/v1/assets/upload` | Upload an image asset (PNG, JPG or HEIC) for an Apple Maps brand. Provide a local filePath or base64 content. |

#### keywords

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_delete_keyword` | DELETE | `/v1/keywords/{id}` | Delete a keyword by ID. |
| `apple_ads_get_keyword` | GET | `/v1/keywords/{id}` | Get one keyword by ID. |
| `apple_ads_update_keyword` | PUT | `/v1/keywords/{id}` | Update a keyword (bid, status). |
| `apple_ads_create_keyword` | POST | `/v1/keywords` | Create a keyword in an ad group. |
| `apple_ads_query_keywords` | POST | `/v1/keywords/query` | Query keywords with filters (e.g. adGroupId), sorting and pagination. |

#### negative_keywords

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_delete_negative_keyword` | DELETE | `/v1/negative-keywords/{id}` | Delete a negative keyword by ID. |
| `apple_ads_get_negative_keyword` | GET | `/v1/negative-keywords/{id}` | Get one negative keyword by ID. |
| `apple_ads_update_negative_keyword` | PUT | `/v1/negative-keywords/{id}` | Update a negative keyword. |
| `apple_ads_create_negative_keyword` | POST | `/v1/negative-keywords` | Create a negative keyword at campaign or ad group level. |
| `apple_ads_query_negative_keywords` | POST | `/v1/negative-keywords/query` | Query negative keywords with filters, sorting and pagination. |

#### bulk

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_bulk_create_keywords` | POST | `/v1/keywords/bulk-create` | Create many keywords in one request (counts as one call against the rate limit). Set allowPartialSuccess to keep valid items when others fail. |
| `apple_ads_bulk_update_keywords` | POST | `/v1/keywords/bulk-update` | Update many keywords in one request. Each item's data must include the keyword id plus only the fields to change. |
| `apple_ads_bulk_create_negative_keywords` | POST | `/v1/negative-keywords/bulk-create` | Create many negative keywords in one request. |
| `apple_ads_bulk_update_negative_keywords` | POST | `/v1/negative-keywords/bulk-update` | Update many negative keywords in one request. Each item's data must include the id plus only the fields to change. |

#### geo

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_get_geos_by_ids` | POST | `/v1/search/geo` | Look up geo location metadata by entity ID or legacy ID (POST /search/geo). |
| `apple_ads_search_geos` | GET | `/v1/search/geo` | Search geo locations (country, admin area, locality, postal code) by name or wildcard to find IDs for ad group geo targeting. |

#### product_pages

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_get_product_page` | GET | `/v1/product-pages/{productPageId}` | Get one product page by its productPageId. |
| `apple_ads_query_app_locale_details` | POST | `/v1/apps/{adamId}/locale-details/query` | Query the default product page's localized metadata for an app by Adam ID. |
| `apple_ads_query_product_page_locale_details` | POST | `/v1/product-pages/locale-details/query` | Query localized metadata (name, subtitle, promo text, screenshots) of product pages. |
| `apple_ads_query_product_pages` | POST | `/v1/product-pages/query` | Query App Store product pages (default, custom and optimized) available to the ad account. |

#### budget_orders

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_delete_budget_order` | DELETE | `/v1/shared-budgets/{id}` | Delete a budget order by ID. |
| `apple_ads_get_budget_order` | GET | `/v1/shared-budgets/{id}` | Get one budget order by ID. |
| `apple_ads_update_budget_order` | PUT | `/v1/shared-budgets/{id}` | Update a budget order. |
| `apple_ads_create_budget_order` | POST | `/v1/shared-budgets` | Create a budget order (shared budget) capping total spend across campaigns. Requires a monthly-invoiced (LOC) ad account. |
| `apple_ads_query_budget_orders` | POST | `/v1/shared-budgets/query` | Query budget orders with filters, sorting and pagination. |

#### reports_apps

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_report_apps_ad_groups` | POST | `/v1/reports/apps/adgroups/query` | App Store ad group performance report for a time range. |
| `apple_ads_report_apps_ads` | POST | `/v1/reports/apps/ads/query` | App Store ad performance report for a time range. |
| `apple_ads_report_apps_campaigns` | POST | `/v1/reports/apps/campaigns/query` | App Store campaign performance report (impressions, taps, installs, spend, ...) for a time range, with optional groupBy. |
| `apple_ads_report_apps_keywords` | POST | `/v1/reports/apps/keywords/query` | App Store keyword performance report for a time range. |
| `apple_ads_report_apps_search_terms` | POST | `/v1/reports/apps/searchterms/query` | App Store search term performance report for a time range. |

#### reports_brands

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_report_brands_ad_groups` | POST | `/v1/reports/business-brands/adgroups/query` | Apple Maps ad group performance report for a time range. |
| `apple_ads_report_brands_ads` | POST | `/v1/reports/business-brands/ads/query` | Apple Maps ad performance report for a time range. |
| `apple_ads_report_brands_campaigns` | POST | `/v1/reports/business-brands/campaigns/query` | Apple Maps campaign performance report for a time range (group by locationId for per-location breakdowns). |
| `apple_ads_report_brands_keywords` | POST | `/v1/reports/business-brands/keywords/query` | Apple Maps keyword performance report for a time range. |
| `apple_ads_report_brands_search_terms` | POST | `/v1/reports/business-brands/searchterms/query` | Apple Maps search term performance report for a time range. |

#### insights

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_query_impression_share` | POST | `/v1/insights/apps/impression-share/query` | Query App Store impression share for keywords over a time range. A promotedObjectId filter is required. |
| `apple_ads_query_search_term_popularity` | POST | `/v1/insights/apps/search-term-popularity/query` | Query App Store search term popularity rankings by country or region and genre. |

#### recommendations

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_apply_daily_budget_recommendations` | POST | `/v1/recommendations/daily-budgets/apply` | Apply daily budget recommendations, which updates the campaigns' daily budgets. All items must share one promotedObjectId. |
| `apple_ads_apply_target_cpa_recommendations` | POST | `/v1/recommendations/target-cpas/apply` | Apply target CPA recommendations, updating the target CPA used by Maximize Conversions bidding. |
| `apple_ads_dismiss_daily_budget_recommendations` | POST | `/v1/recommendations/daily-budgets/dismiss` | Dismiss daily budget recommendations without changing any campaign. |
| `apple_ads_dismiss_target_cpa_recommendations` | POST | `/v1/recommendations/target-cpas/dismiss` | Dismiss target CPA recommendations without changing any campaign. |
| `apple_ads_query_daily_budget_recommendations` | POST | `/v1/recommendations/daily-budgets/query` | Query daily budget recommendations. promotedObjectId and promotedObjectType filters are mandatory. |
| `apple_ads_query_target_cpa_recommendations` | POST | `/v1/recommendations/target-cpas/query` | Query target CPA recommendations for App Store campaigns using Maximize Conversions. |

#### suggestions

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_query_category_suggestions` | POST | `/v1/suggestions/categories/query` | Get category suggestions for an app or brand, or search categories by name. |
| `apple_ads_query_keyword_suggestions` | POST | `/v1/suggestions/keywords/query` | Get ranked keyword suggestions for an app (popularity 0-100). Feed good ones into apple_ads_create_keyword. |
| `apple_ads_query_phrase_suggestions` | POST | `/v1/suggestions/phrases/query` | Get natural-language search phrase suggestions for an app or brand, or look up phrase popularity. |
| `apple_ads_query_target_cpa_suggestion` | POST | `/v1/suggestions/target-cpas/query` | Get a suggested target CPA for an App Store app based on recent tap-install CPI data. |

#### change_history

| Tool | Method | Path | Description |
|---|---|---|---|
| `apple_ads_get_change_details` | GET | `/v1/change-history/{detailId}` | Get field-level before/after values for one change, by detailId (format EntityType.entityId.txnId). |
| `apple_ads_query_change_history` | POST | `/v1/change-history/query` | Query the change history (audit) summary grouped by transaction. An eventTime filter is required; set options.metadata to latest or snapshot to get detailIds. |

#### meta

| Tool | Description |
|---|---|
| `apple_ads_request` | Raw authenticated request to any Platform API path (forward-compat escape hatch) |
| `apple_ads_list_operations` | Lists every SDK operation, its HTTP route and the MCP tool that covers it |
| `apple_ads_server_status` | Redacted configuration/credential diagnostics and rate-limit state |
<!-- GENERATED:TOOLS:END -->

## Prerequisites

1. An Apple Ads account with API access (Account Settings > API) and Node.js 20+.
2. Generate an EC key pair:

   ```bash
   openssl ecparam -genkey -name prime256v1 -noout -out private-key.pem
   openssl ec -in private-key.pem -pubout -out public-key.pem
   ```

3. In Apple Ads go to **Account Settings > API**, paste the contents of `public-key.pem`, and save.
4. Copy the three values shown there: **clientId**, **teamId** and **keyId**.
5. Keep `private-key.pem` secret (for example in `~/.appleads/private_keys/`, `chmod 600`).

## Installation

### Claude Code

```bash
claude mcp add apple-ads --scope user \
  -e APPLE_ADS_CLIENT_ID=SEARCHADS.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  -e APPLE_ADS_TEAM_ID=SEARCHADS.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  -e APPLE_ADS_KEY_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  -e APPLE_ADS_PRIVATE_KEY_PATH=~/.appleads/private_keys/private-key.pem \
  -- npx -y @nerdsnipe-inc/apple-ads-mcp-server
```

From source:

```bash
git clone https://github.com/NerdSnipe-Inc/apple-ads-mcp-server.git
cd apple-ads-mcp-server && npm install && npm run build
claude mcp add apple-ads --scope user -e APPLE_ADS_CLIENT_ID=... -e APPLE_ADS_TEAM_ID=... \
  -e APPLE_ADS_KEY_ID=... -e APPLE_ADS_PRIVATE_KEY_PATH=... \
  -- node /absolute/path/to/apple-ads-mcp-server/dist/index.js
```

Or run `scripts/install-global.sh` for an interactive setup of Claude Code and Claude Desktop (it copies your key to `~/.appleads/private_keys` with mode 600).

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "apple-ads": {
      "command": "/absolute/path/to/npx",
      "args": ["-y", "@nerdsnipe-inc/apple-ads-mcp-server"],
      "env": {
        "APPLE_ADS_CLIENT_ID": "SEARCHADS.xxxxxxxx-...",
        "APPLE_ADS_TEAM_ID": "SEARCHADS.xxxxxxxx-...",
        "APPLE_ADS_KEY_ID": "xxxxxxxx-...",
        "APPLE_ADS_PRIVATE_KEY_PATH": "/Users/you/.appleads/private_keys/private-key.pem"
      }
    }
  }
}
```

GUI apps do not inherit your shell PATH: use the absolute path from `which npx` (or `which node` with `/absolute/path/to/dist/index.js` for a source install).

### Cursor / Windsurf

Add the same `mcpServers` block to `~/.cursor/mcp.json` or `~/.codeium/windsurf/mcp_config.json`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `APPLE_ADS_CLIENT_ID` (`ASA_CLIENT_ID`) | yes | Client ID from Account Settings > API |
| `APPLE_ADS_TEAM_ID` (`ASA_TEAM_ID`) | yes | Team ID |
| `APPLE_ADS_KEY_ID` (`ASA_KEY_ID`) | yes | Key ID |
| `APPLE_ADS_PRIVATE_KEY_PATH` (`ASA_PRIVATE_KEY_PATH`) | yes* | Path to the PEM private key (`~` supported) |
| `APPLE_ADS_PRIVATE_KEY` (`ASA_PRIVATE_KEY`) | yes* | Inline PEM instead of a path (`\n` escapes allowed) |
| `APPLE_ADS_AD_ACCOUNT_ID` (`ASA_AD_ACCOUNT_ID`) | no | Default ad account sent as `X-AP-Context: adAccountId=<id>` |
| `APPLE_ADS_ORG_ID` (`ASA_ORG_ID`) | no | Default organization ID for org-level calls |
| `APPLE_ADS_READ_ONLY` | no | `true` hides every tool that can modify data |
| `APPLE_ADS_ENABLED_GROUPS` | no | Comma list; only these groups are exposed |
| `APPLE_ADS_DISABLED_GROUPS` | no | Comma list of groups to hide |
| `APPLE_ADS_TIMEOUT_MS` | no | Request timeout (default 30000) |
| `APPLE_ADS_MAX_RETRIES` | no | Retries for 429/5xx (default 4) |
| `APPLE_ADS_RETRY_BASE_MS` / `APPLE_ADS_RETRY_MAX_MS` | no | Backoff base/cap (default 2000/16000) |
| `APPLE_ADS_LOG_LEVEL` | no | `error`, `warn` (default), `info`, `debug` (stderr only) |
| `APPLE_ADS_BASE_URL`, `APPLE_ADS_TOKEN_URL` | no | Test-only overrides (local mock servers) |

*One of the two key variables is required. `ASA_*` names are accepted as aliases; `APPLE_ADS_*` wins.

## Usage notes

- **Context = ad account.** Most calls need an ad account. Pass `adAccountId` on any tool, or set `APPLE_ADS_AD_ACCOUNT_ID`. If neither is set and your credentials reach exactly one ad account, it is discovered automatically. Run `apple_ads_get_user_acls` (or `apple_ads_server_status`) to list accounts.
- **Pagination.** Query tools take `pagination: {offset, pageSize, fetchTotalCount}` (page size max 1000); fetch the next page by adding `pageSize` to `offset`. List tools take `limit` and `offset`. Report tools take a date range and a `selector`.
- **Rate limits.** Responses carry `RateLimit-*` headers; on 429 the server waits for `Retry-After` and retries with capped backoff.
- **Token budget.** Listing all tools costs roughly 55k tokens. Use `APPLE_ADS_ENABLED_GROUPS` (for example `accounts,campaigns,ad_groups,keywords,reports_apps`) to trim.
- **Escape hatch.** `apple_ads_request` calls any `/v1` path with a method, query and body.

## Safety switches

```bash
APPLE_ADS_READ_ONLY=true                      # reporting only
APPLE_ADS_ENABLED_GROUPS=campaigns,reports_apps
APPLE_ADS_DISABLED_GROUPS=budget_orders
```

Group names: `accounts, apps, eligibility, brands, location_groups, campaigns, ad_groups, ads, creatives, assets, keywords, negative_keywords, bulk, geo, product_pages, budget_orders, reports_apps, reports_brands, insights, recommendations, suggestions, change_history` (the three meta tools live in `meta`, which is always available unless disabled).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Missing credentials" error naming variables | Set all of client ID, team ID, key ID and a key path/inline key |
| 401 after refresh | Wrong clientId/teamId/keyId, or the public key was not uploaded for that key |
| 403 | The API user lacks a role on that ad account or org |
| "ad account required" | Pass `adAccountId` or set `APPLE_ADS_AD_ACCOUNT_ID` |
| Server not found in Claude Desktop | Use absolute paths to `npx`/`node` |
| Key errors | Must be an EC `prime256v1` private key in PEM format |

Run `npx -y @nerdsnipe-inc/apple-ads-mcp-server --list-tools` to verify installation without credentials.

## Development

```bash
npm install
npm run generate        # regenerate tools, docs and README tables from the SDK
npm run typecheck && npm run build && npm test
```

`npm run generate:check` fails when generated files are stale (used in CI).

## License

MIT, see [LICENSE](LICENSE).
