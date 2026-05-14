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
