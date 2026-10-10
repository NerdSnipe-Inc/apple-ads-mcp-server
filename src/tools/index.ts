// GENERATED FILE - DO NOT EDIT.
// Source: scripts/generate.mjs (aggregate of generated tool groups). Run `npm run generate` to refresh.
// Tool names, groups and summaries live in scripts/curated.mjs.
import type { ToolDef } from "../types.js";
import { accountsTools } from "./accounts.js";
import { appsTools } from "./apps.js";
import { eligibilityTools } from "./eligibility.js";
import { brandsTools } from "./brands.js";
import { locationGroupsTools } from "./location_groups.js";
import { campaignsTools } from "./campaigns.js";
import { adGroupsTools } from "./ad_groups.js";
import { adsTools } from "./ads.js";
import { creativesTools } from "./creatives.js";
import { assetsTools } from "./assets.js";
import { keywordsTools } from "./keywords.js";
import { negativeKeywordsTools } from "./negative_keywords.js";
import { bulkTools } from "./bulk.js";
import { geoTools } from "./geo.js";
import { productPagesTools } from "./product_pages.js";
import { budgetOrdersTools } from "./budget_orders.js";
import { reportsAppsTools } from "./reports_apps.js";
import { reportsBrandsTools } from "./reports_brands.js";
import { insightsTools } from "./insights.js";
import { recommendationsTools } from "./recommendations.js";
import { suggestionsTools } from "./suggestions.js";
import { changeHistoryTools } from "./change_history.js";

export const GENERATED_GROUPS: Record<string, ToolDef[]> = {
  "accounts": accountsTools,
  "apps": appsTools,
  "eligibility": eligibilityTools,
  "brands": brandsTools,
  "location_groups": locationGroupsTools,
  "campaigns": campaignsTools,
  "ad_groups": adGroupsTools,
  "ads": adsTools,
  "creatives": creativesTools,
  "assets": assetsTools,
  "keywords": keywordsTools,
  "negative_keywords": negativeKeywordsTools,
  "bulk": bulkTools,
  "geo": geoTools,
  "product_pages": productPagesTools,
  "budget_orders": budgetOrdersTools,
  "reports_apps": reportsAppsTools,
  "reports_brands": reportsBrandsTools,
  "insights": insightsTools,
  "recommendations": recommendationsTools,
  "suggestions": suggestionsTools,
  "change_history": changeHistoryTools,
};

export const GENERATED_TOOLS: ToolDef[] = Object.values(GENERATED_GROUPS).flat();
