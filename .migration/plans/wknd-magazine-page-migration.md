# WKND Magazine Listing Page Migration Plan

## Source
**URL:** https://wknd.site/us/en/magazine.html
**Target:** /content/eds-demo/us/en/magazine

## Source Page Analysis

The Magazine listing page contains:
- Hero/Featured article teaser (image + title + description + CTA)
- "All Articles" heading
- Grid of magazine article cards (image + title + description links)
- Standard header/footer

## Existing Assets

The page has already been partially migrated in prior work:
- `content/us/en/magazine.plain.html` exists with imported content
- Import script: `tools/importer/import-magazine-listing.js`
- Parsers: `hero-featured.js`, `cards-article.js`
- Page node exists at `/content/eds-demo/us/en/magazine` (cq:Page)
- Content was populated via Sling POST API with blocks + DAM images

## Migration Steps

### Step 1: Verify Source Page Structure
- Scrape the source page to capture current structure
- Identify all sections, blocks, images, and content sequences
- Compare with existing `content/us/en/magazine.plain.html`

### Step 2: Verify/Update Import Infrastructure
- Confirm `import-magazine-listing.js` parser handles all content correctly
- Ensure field hints are present for xwalk compatibility
- Re-import if content has changed

### Step 3: Verify AEM JCR Content
- Confirm `/content/eds-demo/us/en/magazine` has proper block structure
- Verify `hero-featured` block with `fileReference` for DAM image
- Verify `cards-article` block with card items and DAM image references
- Verify standalone image/title/text components render in Universal Editor

### Step 4: Verify CSS & Style System
- Confirm `blocks/hero-featured/hero-featured.css` matches source styling
- Confirm `blocks/cards-article/cards-article.css` matches source grid layout
- Confirm `styles/styles.css` has proper global tokens (fonts, colors, spacing)
- Compare local preview at `localhost:3000/content/us/en/magazine` with source

### Step 5: Verify Images
- Confirm all images use `fileReference` pointing to `/content/dam/wknd-shared/...`
- Verify images render with Dynamic Media URLs in Universal Editor
- Check hero image, article card thumbnails

### Step 6: Verify Delivery Pipeline
- Test `/bin/franklin.delivery/nikeetashahi-del/eds-demo/main/us/en/magazine`
- Test `https://main--eds-demo--nikeetashahi-del.aem.page/us/en/magazine`
- If 404: EDS delivery feature needs Cloud Manager activation

## Checklist

- [ ] Scrape source page and verify content structure
- [ ] Verify `content/us/en/magazine.plain.html` has correct blocks (hero-featured, cards-article)
- [ ] Verify field hints present in content HTML
- [ ] Verify AEM JCR node `/content/eds-demo/us/en/magazine` is cq:Page with root/section
- [ ] Verify hero-featured block has `fileReference` for DAM image
- [ ] Verify cards-article block has card items with `fileReference` for images
- [ ] Verify nav and footer pages exist and render
- [ ] Compare local preview styling with source page
- [ ] Fix any CSS differences (layout, spacing, fonts, colors)
- [ ] Test delivery endpoint and .aem.page URL
- [ ] Confirm page renders properly in Universal Editor with images and blocks

## Dependencies

- AEM developer token (valid for 24 hours)
- EDS delivery pipeline activation in Cloud Manager (for .aem.page rendering)
- DAM assets at `/content/dam/wknd-shared/` for image references

## Notes

- This page was already migrated in the initial batch of 61 pages
- The primary work is **verification and fixing** rather than fresh migration
- If delivery pipeline is not active, page will work on local dev server but not on .aem.page
- To proceed with implementation, switch to **Execute mode**
