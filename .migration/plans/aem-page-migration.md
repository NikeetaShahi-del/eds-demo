Now I have a clear picture of the source page structure. Let me also check the existing blocks in the workspace to understand what's already available.# WKND Homepage Migration Plan

## Overview

Migrate the WKND homepage (`https://wknd.site/us/en.html`) to AEM Edge Delivery Services with full visual fidelity, proper alignment, CSS styling, and JavaScript functionality matching the source page.

## Source Page Analysis

The WKND homepage contains the following sections and components:

| # | Section | Component/Block | Description |
|---|---------|----------------|-------------|
| 1 | **Header** | Header (nav) | Logo, language toggle, navigation links (Magazine, Adventures, FAQs, About Us), search bar |
| 2 | **Hero Carousel** | Carousel | 3-slide carousel with hero content: "WKND Adventures", "San Diego Surf Spots", "Downhill Skiing Wyoming" — each with image, heading, text, CTA button, prev/next controls, and tab indicators |
| 3 | **Featured Article** | Hero (variant) | "Camping in Western Australia" — side-by-side layout with text (label, heading, description, CTA) + full image |
| 4 | **Recent Articles** | Cards | "Recent Articles" heading + 4 article cards (LA Skateparks, Ski Touring, Arctic Surfing, San Diego Surf) with image, title, description + "All Articles" CTA link |
| 5 | **Next Adventures** (divider) | Default content | Section separator / heading "Next Adventures" |
| 6 | **Climbing NZ** | Hero (variant) | "Climbing New Zealand" — dark-themed hero with text + image, CTA "See Trip" |
| 7 | **Adventures Cards** | Cards (variant) | "Where do you want to go?" heading + 4 adventure cards (Yosemite, Whistler, West Coast Cycling, Tahoe) + "All Trips" CTA |
| 8 | **Footer** | Footer | Logo, footer nav links, social media icons, copyright, disclaimer text |

## Existing Workspace Assets

**Available blocks (16):** accordion, cards, carousel, columns, embed, footer, form, fragment, header, hero, modal, quote, search, table, tabs, video

**Key observations:**
- `carousel` block has full JS implementation (slide navigation, prev/next, tabs)
- `cards` block has JS decoration with optimized images
- `hero` block has CSS but JS file is empty (1 line) — may need custom implementation
- `header` and `footer` blocks exist with JS/CSS
- No content files exist yet — clean starting point
- No `page-templates.json` or `metadata.json` — need to be created during migration

## Migration Approach

Use the **`excat-site-migration`** skill to orchestrate the full migration workflow, which includes:

1. **Site analysis** — Create page template skeleton for the homepage URL pattern
2. **Page analysis** — Deep analysis of the page DOM, section boundaries, block mappings, and design tokens
3. **Block variant management** — Identify which existing blocks can be reused vs. which need custom variants (e.g., hero variants for Featured Article and Climbing NZ sections)
4. **Import infrastructure** — Generate block parsers and page transformers to extract content from the source DOM
5. **Content import** — Execute import scripts to produce the HTML content file
6. **Block development** — Implement/enhance block JS and CSS for any new variants needed
7. **Design system adaptation** — Extract colors, fonts, spacing, and apply as CSS custom properties
8. **Visual verification** — Compare migrated page against the source for alignment and fidelity

## Key Technical Considerations

- **Carousel functionality**: Existing carousel block has prev/next, auto-advance, and tab indicators — should map well to the source
- **Hero variants**: The source page has at least 2 distinct hero layouts (Featured Article with side-by-side content, Climbing NZ with dark overlay) — will likely need hero variants
- **Cards variants**: Two card sections with potentially different styling (articles vs adventures) — may need card variants
- **Header/Footer**: Auto-blocks that load from `nav.html` and `footer.html` — need navigation setup
- **Images**: Will reference source URLs (not downloaded locally)
- **Responsive design**: Must preserve mobile navigation hamburger menu and responsive card layouts

## Checklist

- [ ] **1. Site Analysis** — Create page template skeleton for `https://wknd.site/us/en.html`
- [ ] **2. Page Analysis** — Analyze DOM structure, identify sections, blocks, and authoring decisions
- [ ] **3. Block Mapping** — Map source DOM selectors to EDS blocks and identify needed variants
- [ ] **4. Block Variant Management** — Check similarity with existing blocks, create variants as needed
- [ ] **5. Import Infrastructure** — Generate block parsers and page transformers
- [ ] **6. Navigation Setup** — Create `nav.html` with header links and mobile nav structure
- [ ] **7. Content Import** — Execute import to generate `content/us/en.html`
- [ ] **8. Design System** — Extract and apply design tokens (colors, fonts, spacing) from source
- [ ] **9. Block CSS/JS** — Implement/enhance hero variants, cards variants, and carousel styling
- [ ] **10. Footer Setup** — Create `footer.html` with logo, nav, social links, copyright
- [ ] **11. Visual QA** — Preview migrated page and compare section-by-section against source
- [ ] **12. Fix & Iterate** — Address any alignment, styling, or functionality gaps

## Execution

> **This plan requires Execute mode to proceed.** Switch to Execute mode and the `excat-site-migration` skill will orchestrate the full workflow automatically.
