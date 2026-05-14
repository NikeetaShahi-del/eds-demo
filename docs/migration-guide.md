# AEM Edge Delivery Migration Guide - Lessons Learned

## Overview

This document captures critical rules and patterns learned during the WKND site migration to AEM Edge Delivery Services (xwalk/crosswalk project). Follow these rules to avoid common mistakes when migrating additional pages.

---

## AEM xwalk Page Creation Rules

### 1. Every page needs a `root` node

Creating just `jcr:content` with page properties is NOT enough. You must also create `jcr:content/root` with the correct resource type. Without this, pages render blank.

```bash
# Create the page
curl -X POST -F "jcr:primaryType=cq:Page" \
  -F "jcr:content/jcr:primaryType=cq:PageContent" \
  -F "jcr:content/jcr:title=Page Title" \
  -F "jcr:content/sling:resourceType=core/franklin/components/page/v1/page" \
  -F "jcr:content/cq:template=/libs/core/franklin/templates/page" \
  "$AEM_HOST/content/eds-demo/path/to/page"

# THEN create the root node (REQUIRED!)
curl -X POST \
  --data-urlencode "jcr:primaryType=nt:unstructured" \
  --data-urlencode "sling:resourceType=core/franklin/components/root/v1/root" \
  "$AEM_HOST/content/eds-demo/path/to/page/jcr:content/root"
```

### 2. Root node resourceType

- ✅ Correct: `core/franklin/components/root/v1/root`
- ❌ Wrong: `core/franklin/components/section/v1/section`

Using section for root causes nested section rendering issues in the Universal Editor.

### 3. Content structure order matters

The order of child nodes in JCR determines rendering order. Use Sling ordering:

```bash
# Move node before another
curl -X POST --data-urlencode ":order=before cards" "$AEM_HOST/path/to/node"

# Move node after another
curl -X POST --data-urlencode ":order=after hero" "$AEM_HOST/path/to/node"
```

---

## CSS/JS Loading in xwalk

### 4. Block CSS only loads if JS has a valid `decorate` function

An empty `.js` file (0 bytes) prevents the EDS framework from loading the corresponding `.css`. Always include at minimum:

```javascript
export default function decorate(block) {
  // Block decoration logic
}
```

### 5. AEM author resource paths

AEM author serves code resources from `/content/eds-demo.resource/` path, NOT from root `/`. When dynamically loading CSS via JS:

```javascript
// Find base path from existing stylesheet
const existingStyle = document.querySelector('link[href*="styles/styles.css"]');
const basePath = existingStyle
  ? existingStyle.href.replace('styles/styles.css', '')
  : '/';

// Use base path for dynamic loading
const link = document.createElement('link');
link.href = `${basePath}styles/my-styles.css`;
```

### 6. Code sync must be triggered per-file

After `git push`, AEM doesn't automatically pick up all changes. Force sync:

```bash
# Sync specific file
curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  "https://admin.hlx.page/code/{owner}/{repo}/{ref}/blocks/hero/hero.css"

# Sync entire repo (may not update all files immediately)
curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  "https://admin.hlx.page/code/{owner}/{repo}/{ref}"
```

### 7. AEM author caches aggressively

After code changes, always:
1. Force code sync via admin API
2. Tell users to hard-refresh (Ctrl+Shift+R)

---

## CSS Specificity in xwalk DOM

### 8. No wrapper classes in xwalk DOM

Unlike EDS preview (which adds `.block-container` and `.block-wrapper`), the xwalk author renders blocks directly as children of section containers.

- ❌ Won't work: `.hero-container .hero-wrapper .hero { ... }`
- ✅ Works: `.hero { ... }`

### 9. Avoid structural pseudo-class selectors

`:first-child` / `:last-child` / `:only-child` are fragile in AEM xwalk DOM because element positions change when authors add/remove components.

**Instead:** Use JS to add distinguishing classes, then target those in CSS.

```javascript
// In hero.js decorate()
if (isFirstHero) {
  block.classList.add('hero-featured');
} else {
  block.classList.add('hero-banner');
}
```

### 10. Global styles.css overrides block CSS

`main .section h1[data-aue-prop="title"]` has high specificity. Block-specific overrides need:
- Equal or higher specificity selectors
- `!important` on pseudo-elements like `::after`
- Or inline styles via JS (most reliable)

### 11. Inline styles are the most reliable override

When CSS selectors fail due to caching or specificity:

```javascript
export default function decorate(block) {
  const sibling = block.nextElementSibling;
  if (sibling) {
    sibling.style.paddingLeft = '8%';
    sibling.style.fontSize = '24px';
  }
}
```

---

## Content Migration to AEM Author

### 12. Franklin delivery renders from JCR

The page must exist at `/content/eds-demo/{path}` with proper structure for the delivery endpoint to serve it:

```
/content/eds-demo/us/en
  └── jcr:content
      ├── jcr:title = "Page Title"
      ├── sling:resourceType = "core/franklin/components/page/v1/page"
      └── root
          ├── sling:resourceType = "core/franklin/components/root/v1/root"
          └── section1
              ├── sling:resourceType = "core/franklin/components/section/v1/section"
              └── [blocks...]
```

### 13. Title component needs `title` property

Setting only `jcr:title` creates the node but displays "Headline" (default text). Must set BOTH:

```bash
curl -X POST \
  --data-urlencode "jcr:title=My Title" \
  --data-urlencode "title=My Title" \
  --data-urlencode "type=h2" \
  "$AEM_HOST/path/to/title-node"
```

### 14. Images must exist in DAM

Block content referencing `/content/dam/eds-demo/image.jpg` requires the image to be uploaded:

```bash
curl -X POST \
  -F "file=@local-image.jpg;type=image/jpeg;filename=image.jpg" \
  "$AEM_HOST/content/dam/eds-demo.createasset.html"
```

### 15. Admin API requires GitHub token

`admin.hlx.page` does NOT accept AEM IMS tokens. Use GitHub personal access token:

```bash
# Preview a page
curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  "https://admin.hlx.page/preview/{owner}/{repo}/{ref}/us/en"

# Publish a page
curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  "https://admin.hlx.page/live/{owner}/{repo}/{ref}/us/en"
```

---

## Project Configuration

| Setting | Value |
|---------|-------|
| GitHub Repo | NikeetaShahi-del/eds-demo |
| AEM Author | author-p11300-e47725.adobeaemcloud.com |
| Content Path | /content/eds-demo/ |
| DAM Path | /content/dam/eds-demo/ |
| Config Service Org | nikeetashahi-del (lowercase) |
| Project Type | xwalk (crosswalk/Universal Editor) |
| Block Library | https://main--sta-xwalk-boilerplate--aemysites.aem.page/tools/sidekick/library.json |

---

## ⚠️ CRITICAL: xwalk Content Delivery (Lesson from Category Pages)

### 16. Content files in git do NOT render in xwalk

The `content/*.plain.html` files generated by the importer are **local artifacts only**. In an xwalk project, the AEM delivery endpoint (`/bin/franklin.delivery/`) renders content from JCR, not from git.

If a page shows blank in Universal Editor but has `.plain.html` content in git, the JCR `root` node is empty — you must push content via Sling POST API.

### 17. CSRF token required for POST to AEM Author

```bash
# Get CSRF token first
CSRF=$(curl -s -H "Authorization: Bearer $AEM_TOKEN" \
  "$AEM_HOST/libs/granite/csrf/token.json" | jq -r '.token')

# Then use it in every POST
curl -X POST -H "Authorization: Bearer $AEM_TOKEN" -H "CSRF-Token: $CSRF" \
  -F "jcr:primaryType=nt:unstructured" \
  -F "sling:resourceType=core/franklin/components/section/v1/section" \
  "$AEM_HOST/content/eds-demo/path/jcr:content/root/section1"
```

### 18. Richtext fields must be set separately

Large richtext content in `-F` multipart forms causes connection resets (HTTP 000). Split into two calls:

```bash
# Step 1: Create node with non-text properties
curl -X POST -H "CSRF-Token: $CSRF" -F "jcr:primaryType=nt:unstructured" \
  -F "sling:resourceType=core/franklin/components/block/v1/block" \
  -F "name=Hero" -F "model=hero" -F "image=/content/dam/eds-demo/img.jpeg" \
  "$AEM_HOST/path/to/hero"

# Step 2: Set richtext property separately
curl -X POST -H "CSRF-Token: $CSRF" \
  --data-urlencode "text=<h2>Title</h2><p>Description</p>" \
  "$AEM_HOST/path/to/hero"
```

### 19. Always reference docs/context.md for CSS/design specs

Before writing any block CSS, read `docs/context.md` which contains exact computed styles from the source site. Common mistakes:
- Hero Featured: text LEFT, image RIGHT (not reversed)
- Adventures Hero: column-reverse layout (image top, content below)
- Always inspect source page computed styles, never assume

---

## ⚠️ Category Page Migration Mistakes (Magazine, Adventures, FAQs, About Us)

### 20. Block `name` in JCR must match the variant CSS class

The `name` property on a JCR block determines the CSS class EDS renders. Using the wrong name applies the wrong CSS.

- ✅ `name="Hero Adventure"` → renders as `.hero-adventure` → correct column layout
- ❌ `name="Hero"` → renders as `.hero` → wrong side-by-side layout
- ✅ `name="Cards Team"` → renders as `.cards-team` → circular portraits
- ❌ `name="Cards"` → renders as `.cards` → standard rectangular cards

**Always match the JCR block `name` to the intended variant folder name.**

### 21. Adventures page needs Tabs block, not flat Cards

The Adventures page has tabbed navigation (ALL, CLIMBING, CYCLING, etc.) with cards inside each tab. Creating a flat Cards block without tabs is wrong — must create a Tabs Adventure block with tab items.

### 22. DAM image paths in richtext render as text, not images

Storing `/content/dam/eds-demo/image.jpeg` as plain text in richtext renders as plain text. To get it to render as a link (that JS can parse), store it as `<a href="/content/dam/eds-demo/image.jpeg">img</a>`.

Even then, using the raw DAM path as `img.src` may not work in AEM author. Use the rendition URL:
```
/content/dam/eds-demo/image.jpeg/_jcr_content/renditions/cq5dam.web.1280.1280.jpeg
```

### 23. Upload ALL referenced images to DAM before creating content

Missing DAM images cause:
- `<a>` links showing path text instead of `<picture>` for `image@reference` fields
- 404 errors for dynamically created `<img>` elements

**Checklist before creating page content:**
1. List all images referenced in the source page
2. Check which already exist in DAM
3. Download and upload ALL missing images
4. Verify each upload returns HTTP 200

### 24. Sling `:order` requires careful sequencing

The `:order=after {nodeName}` parameter is relative to current sibling order, not absolute. When inserting multiple nodes, order them by moving existing nodes, not just the new ones.

**Pattern:** Create all nodes first, then fix order as a separate step:
```bash
# After creating all nodes, reorder from bottom up
curl --data-urlencode ":order=after description" "$AEM_HOST/path/accordion"
```

### 25. Always migrate ALL visible content, not just blocks

When migrating a page, include:
- ✅ Page title (H1)
- ✅ Hero/featured images
- ✅ Description/intro paragraphs
- ✅ Blocks (cards, accordions, tabs, etc.)
- ✅ Contact info / sidebar content
- ✅ Page metadata (title, description)

Missing the hero image and description paragraph on the FAQs page was a mistake. Always compare against the source page section by section.

### 27. About Us page: missing description paragraphs and portrait images

The About Us page was migrated with only title + cards per section. Missing:
- Italic description paragraph after each section title ("Meet the outstanding individuals..." / "Meet our extraordinary travel guides...")
- All 7 contributor/guide portrait images were not uploaded to DAM

**Fix applied:** Added text components with `<em>` wrapped descriptions. Uploaded all 7 portrait images (stacey-roswells, alex-iby-343837, ian-provo, jacob-wester, ayo-ogunseinde-237739, justin-barr, kumar-selvaraj).

### 26. Verify every page against source after pushing to AEM

After pushing JCR content, always:
1. Hard-refresh the page in AEM author
2. Compare side-by-side with the source page
3. Check: images load, text content matches, layout is correct, all sections present
4. Document any discrepancies before moving to the next page

---

## Quick Reference: Complete Page Migration Steps

1. **Create page node** on AEM author (with `jcr:content`)
2. **Create root node** (`jcr:content/root` with root/v1/root resourceType)
3. **Create sections** (`jcr:content/root/section1` with section/v1/section)
4. **Create blocks** inside sections (with proper `name`, `model`, `filter`)
5. **Upload images** to DAM (`/content/dam/eds-demo/`)
6. **Push richtext** properties separately (avoid connection resets)
7. **Verify node order** with Sling `:order` parameter
8. **Trigger preview** via admin API with GitHub token
9. **Force code sync** if block CSS/JS was updated
10. **Hard refresh** the AEM page in browser
