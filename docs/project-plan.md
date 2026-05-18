# WatchComparisonAI Project Plan

## Product Goal

WatchComparisonAI is a luxury watch comparison platform for enthusiasts who want deeper buying context than standard manufacturer spec sheets provide.

The product should help users compare watches by real-world fit, dimensions, movement, bracelet/clasp details, weight, MSRP, budget, and enthusiast-focused wearability data. Long term, the platform should support personalized recommendations, affiliate commerce, and paid features such as collection tracking.

## End State Vision

Users should be able to:

- Compare watches side by side with collector-grade details.
- Filter and receive recommendations by budget, wrist size, category, brand, use case, and desired features.
- Understand real-world wearability beyond basic case diameter.
- Click through to affiliate partners when they are ready to buy.
- Eventually create accounts, save watches, track personal collections, and use premium tools.

## Current Tools And Stack

- **Next.js / React**: Public web app and internal admin UI.
- **Supabase**: Primary database for brands, collections, watches, watch specs, and candidate spec data.
- **Supabase Admin Client**: Server-side admin access for internal review workflows.
- **Spec Review Tool**: Internal `/admin/spec-review` page for entering sourced candidate values.
- **GitHub**: Source control and future deployment workflow.
- **VS Code Supabase Extension / Supabase Connector**: Database inspection and management.
- **Exquisite Timepieces**: Current MVP curation and retail inspiration source.
- **Future Affiliate Partners**: Exquisite Timepieces, Jomashop, and other watch retailers.
- **Future AI Backend**: AI-assisted sourcing of hard-to-find enthusiast specs.

## Completed So Far

- Defined the product concept as a more luxurious, enthusiast-focused alternative to WatchSize.
- Created the initial Next.js application.
- Connected the app to Supabase.
- Built the public watch comparison page.
- Fixed watch picklist readability and styling issues.
- Created Supabase tables/views for watches and detailed specs.
- Added MVP spec fields:
  - Case material
  - Case size
  - Case thickness
  - Lug-to-lug
  - Lug width
  - Weight
  - Water resistance
  - Movement type
  - Caliber
  - Power reserve
  - Date
  - Chronograph
  - GMT
  - Bracelet taper
  - Clasp type
  - Micro-adjustment
  - Wearability summary
  - MSRP
- Built the internal `/admin/spec-review` workflow.
- Improved the spec review UI with compact, collapsible watch sections.
- Added candidate values with source URL, source name, source type, confidence score, notes, and evidence excerpt.
- Added MVP boolean fields for chronograph and GMT.
- Added MSRP into the comparison and spec review workflows.
- Updated the MVP watch list based on Exquisite Timepieces popularity plus a budget-friendly under-$1,000 selection.
- Preserved watches where spec data had already been entered.
- Marked the MVP watch set with `is_featured`.
- Created `watch_specs` rows for every featured MVP watch so they appear in the review workflow.
- Established the affiliate-ready architecture direction:
  - Core watch specs remain stable in the main watch/spec tables.
  - Retailer price, availability, inventory, and affiliate links should eventually live in a separate retailer listings layer.

## Phase 1: Finish MVP Data

Goal: Make the comparison tool genuinely useful for real users.

High-level steps:

1. Complete missing MVP specs for all featured watches.
2. Use manufacturer pages as the preferred source for MSRP and official specs.
3. Use trusted retailer, review, forum, and video sources for hard-to-find enthusiast details.
4. Keep source URLs and confidence scores with each candidate value.
5. Build an approval/promotion flow from `watch_spec_candidates` into canonical `watch_specs`.
6. Review the MVP list and hide or remove watches that are not ready.
7. Add consistent watch images with similar size, crop, and photographic style.

## Phase 2: MVP Product Experience

Goal: Make the app feel polished and launch-worthy.

High-level steps:

1. Refine the public comparison page with a more premium visual design.
2. Add budget/MSRP display and budget-aware comparison cues.
3. Improve watch search, filtering, and picklist usability.
4. Add filters for brand, category, price range, case size, movement type, GMT, chronograph, and date.
5. Add clear empty states and “data not verified yet” states.
6. Add basic SEO structure for comparison pages.
7. Create shareable comparison URLs.

## Phase 3: AI-Assisted Spec Sourcing

Goal: Reduce manual data entry while keeping quality high.

High-level steps:

1. Define which fields AI can safely assist with.
2. Build a backend process that searches and summarizes trusted sources.
3. Store AI-sourced values as candidates, not final canonical specs.
4. Require source URL, confidence score, and review status for AI-sourced data.
5. Keep human approval before publishing canonical specs.
6. Add auditability so each published value can be traced to its source.

## Phase 4: Launch Readiness

Goal: Launch a reliable public MVP.

High-level steps:

1. Commit and push current local changes to GitHub.
2. Deploy the app to Vercel or another hosting provider.
3. Configure production environment variables securely.
4. Confirm Supabase permissions and RLS are appropriate for public use.
5. Add analytics.
6. Add legal pages:
  - Privacy Policy
  - Terms
  - Affiliate Disclosure
7. QA the full app on desktop and mobile.
8. Launch with a focused, high-quality watch set rather than a large incomplete catalog.

## Phase 5: Traffic Growth

Goal: Bring in users actively researching watches.

High-level steps:

1. Create SEO pages around comparison intent:
  - Tudor Black Bay 58 vs Seiko SPB143
  - Best watches under $1,000 by case size
  - Best GMT watches by lug-to-lug
  - Omega Aqua Terra alternatives
2. Create category and collection pages:
  - Best dive watches
  - Best GMT watches
  - Best luxury watches under $5,000
  - Best watches for small wrists
3. Publish data-driven buying guides using unique fit and wearability data.
4. Share useful comparisons carefully on Reddit, forums, YouTube comments, and social channels.
5. Build an email capture flow for saved comparisons or launch updates.
6. Track popular searches, comparisons, and missing watches users request.

## Phase 6: Affiliate Monetization

Goal: Convert high-intent comparison traffic into revenue.

High-level steps:

1. Add a dedicated retailer listings table.
2. Track retailer-specific fields:
  - Watch ID
  - Retailer name
  - Product URL
  - Affiliate URL
  - Price
  - Currency
  - Availability
  - Last checked date
3. Apply to affiliate programs:
  - Exquisite Timepieces
  - Jomashop
  - Teddy Baldassarre
  - WatchMaxx
  - Chrono24
  - eBay Partner Network
4. Add affiliate disclosures throughout the app where needed.
5. Add purchase links only where they help the user, especially on recommendation and comparison result pages.
6. Refresh retailer price and availability where partner APIs or feeds allow it.
7. Show “last checked” dates when availability or price is used in the product experience.

## Phase 7: Paid Features

Goal: Add recurring revenue beyond affiliate sales.

Potential subscription features:

- Personal collection tracking.
- Saved comparisons.
- Watch wishlist.
- Price alerts.
- Wrist-size-based recommendations.
- Collection value tracking.
- Ownership notes and service history.
- AI buying assistant.
- Premium comparison filters.
- “Find alternatives under my budget” recommendations.

## Immediate Next Steps

1. Continue filling MVP spec data in `/admin/spec-review`.
2. Prioritize MSRP, fit dimensions, movement, water resistance, clasp, micro-adjustment, and wearability notes.
3. Add consistent watch images for the MVP set.
4. Build the candidate approval/promotion workflow.
5. Commit and push the current code changes to GitHub.
6. Polish the public comparison page once the MVP data is solid.

## Strategic Positioning

The platform should be positioned as an independent watch research and comparison tool, not a copied retailer catalog.

The strongest affiliate pitch is that WatchComparisonAI can create high-intent referral traffic from users who are already comparing watches by budget, fit, movement, and real-world ownership considerations.

Core watch data should remain separate from retailer inventory. Retailer listings, affiliate URLs, current price, and availability should be added as a commerce layer when the product is ready for monetization.
