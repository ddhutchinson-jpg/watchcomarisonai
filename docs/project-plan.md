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
- **AI Pair Comparison API**: Server route, OpenAI integration, Supabase cache, and event tracking for on-demand AI comparisons between selected watches.
- **Future AI Backend Expansion**: AI-assisted sourcing of hard-to-find enthusiast specs.

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
- Redesigned the public UI with a more premium visual direction:
  - Textured monochrome background inspired by watch dial finishing.
  - No-photo watch cards that can later accept licensed imagery.
  - Cleaner picklist display with reference numbers shown once as secondary text.
  - Grouped comparison table sections for buying context, fit/case, movement/function, and bracelet/wearability.
- Moved single-watch AI wearability review from the compare page to individual watch detail pages.
- Added individual watch detail pages at `/watches/[slug]` with:
  - SEO-friendly watch URLs.
  - Watch identity, reference number, and optional product imagery.
  - AI wearability/ownership review using existing `overall_wearability_summary`, `wearability_notes`, and `comfort_notes`.
  - Key specs and complete saved spec sheet.
  - CTA back into the comparison workflow.
- Added an **AI Pair Review** interaction:
  - Users intentionally click **Compare With AI** to prompt the tool.
  - Results are not shown automatically.
  - Cached pair reviews are reused behind the scenes.
  - The app can generate new AI pair comparisons when `OPENAI_API_KEY` is configured.
- Configured and tested OpenAI pair generation end to end with `OPENAI_API_KEY` and `OPENAI_MODEL`.
- Tuned the AI pair-review prompt for enthusiast-oriented comparison, scorecards, recommendations, and final verdicts.
- Added a visual AI comparison output that includes:
  - Category summaries.
  - Scorecard rows with Watch A / Watch B scores out of 10.
  - A cleaned final verdict.
  - Decision Snapshot buyer-fit bullets grouped by watch.
- Added the `watch_pair_comparisons` Supabase table and local migration for cached pair-level AI outputs.
- Applied the live `watch_comparison_events` Supabase migration and confirmed prompted comparison event logging.
- Added `/api/compare-ai` to normalize watch pairs, check cached results, generate missing comparisons, and save outputs for future reuse.
- Confirmed A-to-B and B-to-A comparisons reuse the same normalized cached AI comparison.
- Added an About page at `/about` explaining scoring, data sources, AI guardrails, and affiliate revenue/disclosure direction.
- Added `/about` and individual watch detail pages to the sitemap.
- Reconnected the project in the canonical local folder `/Users/derickhutchinson/Documents/Codex/Watch Comparison` with VS Code, GitHub, Supabase MCP, and local environment configuration.
- Pushed previous milestone work to GitHub through commit `b71daae`.

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

1. Continue refining the premium public comparison experience.
2. Improve watch search, filtering, and picklist usability.
3. Add filters for brand, category, price range, case size, movement type, GMT, chronograph, and date.
4. Add clear empty states and “data not verified yet” states.
5. Create shareable comparison URLs.
6. Continue improving individual watch detail pages for SEO and buyer research.
7. Add licensed/professional watch images once the image-rights plan is settled.

Recently completed:

- Added budget/MSRP display and buying-context fields.
- Added basic SEO structure for `/compare`, `/about`, sitemap, and individual watch pages.
- Simplified the compare page so the main selling point is the pair comparison and AI verdict.
- Removed repetitive/decorative comparison UI sections that did not help decision-making.

## Phase 3: AI Comparison And Spec Intelligence

Goal: Make AI feel intentional, useful, and efficient.

Completed foundation:

- Built the `watch_pair_comparisons` cache table.
- Applied the `watch_comparison_events` table in the live Supabase project.
- Built `/api/compare-ai` for on-demand pair comparisons.
- Added a **Compare With AI** prompt button to the public comparison page.
- Preserved the product rule that users must click before seeing the AI pair review.
- Added OpenAI key/model configuration and confirmed live generation.
- Confirmed cache behavior for repeated pairs and reversed A/B order.
- Added prompted comparison event tracking for popular-pair defaults.
- Upgraded the AI output from prose-only to a more visual decision tool:
  - Category scorecard.
  - Final verdict.
  - Watch-specific buyer-fit recommendations.
  - Prompt versioning in the cache hash.

High-level next steps:

1. Add regeneration controls for stale or low-quality AI pair reviews.
2. Consider an admin review layer for AI pair outputs before public release.
3. Add rate limiting and abuse protection before enabling public AI generation at scale.
4. Track which pair comparisons users request most often and use them for default/popular pair experiences.
5. Continue prompt tuning after more complete spec data is available.

## Phase 4: AI-Assisted Spec Sourcing

Goal: Reduce manual data entry while keeping quality high.

High-level steps:

1. Define which fields AI can safely assist with.
2. Build a backend process that searches and summarizes trusted sources.
3. Store AI-sourced values as candidates, not final canonical specs.
4. Require source URL, confidence score, and review status for AI-sourced data.
5. Keep human approval before publishing canonical specs.
6. Add auditability so each published value can be traced to its source.

## Phase 5: Launch Readiness

Goal: Launch a reliable public MVP.

High-level steps:

1. Commit and push current local changes to GitHub.
2. Deploy the app to Vercel or another hosting provider.
3. Configure production environment variables securely.
4. Confirm Supabase permissions and RLS are appropriate for public use.
5. Add rate limiting or abuse protection for OpenAI-backed routes.
6. Add analytics.
7. Add legal pages:
  - Privacy Policy
  - Terms
  - Affiliate Disclosure
8. QA the full app on desktop and mobile.
9. Launch with a focused, high-quality watch set rather than a large incomplete catalog.

## Phase 6: Traffic Growth

Goal: Bring in users actively researching watches.

High-level steps:

1. Continue building SEO-friendly individual watch pages from approved Supabase data.
2. Create SEO pages around comparison intent:
  - Tudor Black Bay 58 vs Seiko SPB143
  - Best watches under $1,000 by case size
  - Best GMT watches by lug-to-lug
  - Omega Aqua Terra alternatives
3. Create category and collection pages:
  - Best dive watches
  - Best GMT watches
  - Best luxury watches under $5,000
  - Best watches for small wrists
4. Publish data-driven buying guides using unique fit and wearability data.
5. Share useful comparisons carefully on Reddit, forums, YouTube comments, and social channels.
6. Build an email capture flow for saved comparisons or launch updates.
7. Track popular searches, comparisons, and missing watches users request.

## Phase 7: Affiliate Monetization

Goal: Convert high-intent comparison traffic into revenue.

High-level steps:

1. Add a dedicated retailer listings table.
2. Convert current structural affiliate preview fields into a more complete commerce layer.
3. Track retailer-specific fields:
  - Watch ID
  - Retailer name
  - Product URL
  - Affiliate URL
  - Price
  - Currency
  - Availability
  - Last checked date
4. Apply to affiliate programs:
  - Exquisite Timepieces
  - Jomashop
  - Teddy Baldassarre
  - WatchMaxx
  - Chrono24
  - eBay Partner Network
5. Add affiliate disclosures throughout the app where needed.
6. Add purchase links only where they help the user, especially on recommendation, comparison result, and individual watch pages.
7. Refresh retailer price and availability where partner APIs or feeds allow it.
8. Show “last checked” dates when availability or price is used in the product experience.

## Phase 8: Paid Features

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

1. Commit and push the current local milestone to GitHub.
2. Continue filling MVP spec data in `/admin/spec-review`, prioritizing watches with sparse pair-comparison outputs.
3. Prioritize MSRP, fit dimensions, movement, water resistance, clasp, micro-adjustment, and wearability notes.
4. Add rate limiting and abuse protection for `/api/compare-ai` before public launch.
5. Protect `/admin/spec-review` before deployment.
6. Improve individual watch pages with better internal links, structured data, and image handling.
7. Decide on the image-rights strategy before adding broad real watch photos.
8. Add licensed/professional watch images when permitted.
9. Add legal pages, including affiliate disclosure, privacy policy, and terms.
10. Deploy to Vercel staging and QA the full app on desktop and mobile.

## Strategic Positioning

The platform should be positioned as an independent watch research and comparison tool, not a copied retailer catalog.

The strongest affiliate pitch is that WatchComparisonAI can create high-intent referral traffic from users who are already comparing watches by budget, fit, movement, and real-world ownership considerations.

Core watch data should remain separate from retailer inventory. Retailer listings, affiliate URLs, current price, and availability should be added as a commerce layer when the product is ready for monetization.
