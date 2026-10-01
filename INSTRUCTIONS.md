# Project Instructions

**Project:** eds-demo (AEM Edge Delivery Services + Universal Editor)  
**Last updated:** 2026-10-01  
**Status:** Development + Validation in Progress

---

## Authoring model

This project uses:
- **Universal Editor (UE)** for authoring
- **xwalk-style** content architecture (content in AEM JCR, code in git)
- **Edge Delivery Services (EDS)** for delivery

### Key difference from other AEM projects
Content is **served from AEM Author JCR, not from `.plain.html` files in git**. The `.html` files in `content/` are local development artifacts only.

To make content appear in the live site:
1. Author content in AEM Author via the Universal Editor
2. Create JCR nodes (root → section → blocks as child nodes)
3. Use the Sling POST servlet to persist
4. Include CSRF token in POST requests

---

## Environment URLs

### Template (update with your actual values)
- **Preview:** `https://main--{repo}--{owner}.aem.page/`
- **Live:** `https://main--{repo}.aem.live/`
- **Author (backend):** `https://author-p11300-e47725.adobeaemcloud.com/`

### How to find your actual values
- `{repo}` = GitHub repository name (usually same as folder name)
- `{owner}` = GitHub organization or username
- Contact your AEM Cloud administrator for author instance details

---

## Block library (23 blocks)

All blocks follow **kebab-case naming** and are located in `blocks/`:

### Container/Layout blocks
- `columns` — responsive multi-column layout
- `section` — top-level section container

### Text/Content blocks
- `text` — plain text content
- `title` — heading/title with level selector (H1-H6)
- `quote` — blockquote with attribution
- `embed` — third-party iframe content
- `form` — form reference (e.g., Marketo forms)
- `fragment` — reusable content fragment

### Image/Media blocks
- `hero` — full-width image + text overlay
- `hero-adventure` — image (top) + content (below) layout
- `hero-featured` — text (left) + image (right) layout
- `carousel` — rotating image carousel with navigation
- `carousel-hero` — hero-style carousel (large images)
- `video` — embedded video player with placeholder

### Card/List blocks
- `cards` — grid of linked cards with image + text
- `cards-article` — article card list (image + title + description)
- `cards-team` — team member cards (circular images, name, role, social icons)

### Interactive blocks
- `accordion` — expandable FAQ/content accordion
- `accordion-faq` — FAQ-specific accordion variant
- `tabs` — tabbed content navigation
- `tabs-adventure` — styled tabs variant

### Utility blocks
- `search` — site search UI
- `table` — data table with filtering options
- `modal` — modal dialog (triggered from other blocks)
- `footer` — site footer (static/hardcoded)
- `header` — site header/navigation (static/hardcoded)

### Block status
- **23/23 blocks ready to use** (all have JS, CSS, and models)
- **21/23 have component models** for authoring (footer, header are static)
- **All follow EDS naming conventions**

---

## Component models and naming conventions

### Model file locations
- **Component definitions:** `component-definition.json` (tells UE which blocks exist)
- **Field schemas:** `component-models.json` (defines author-facing fields)
- **Nesting rules:** `component-filters.json` (defines parent-child relationships)

### Naming patterns

**Component IDs** (used in filters and definitions):
```
kebab-case (e.g., feature-cards, hero-adventure, cards-team)
```

**Component names** (human-readable labels in UE):
```
PascalCase with spaces (e.g., "Feature Cards", "Hero Adventure", "Cards Team")
```

**Component model field names** (used in JS decorate functions):
```
Compound fields: snake_case with namespace prefix
  - media_image, media_imageAlt
  - content_text, content_heading, content_headingType
  - link, linkText, linkType
Simple fields: lowercase
  - title, image, text, description, eyebrow
```

### Rule: Block name in JCR must match CSS class
- JCR `name="Hero"` renders as CSS class `.hero` → uses `blocks/hero/hero.css`
- JCR `name="Hero Adventure"` renders as CSS class `.hero-adventure` → uses `blocks/hero-adventure/hero-adventure.css`
- JCR `name="Cards Team"` renders as CSS class `.cards-team` → uses `blocks/cards-team/cards-team.css`

If you create a JCR block with the wrong name, it gets the wrong CSS. **Always match the block name exactly.**

---

## Code standards (do NOT deviate)

### JavaScript
- **Vanilla JS only.** No frameworks (React, Vue, Svelte, etc.)
- **No build tools.** Code must work as-is in the browser.
- **Module exports:** Every block must export a `decorate()` function:
  ```javascript
  export default function decorate(block) {
    // Transform block HTML structure
    // Attach event listeners
  }
  ```
- **Async support:** Decorate functions can be async:
  ```javascript
  export default async function decorate(block) {
    // Can await promises here
  }
  ```

### CSS
- **CSS custom properties for design tokens.** No hardcoded hex colors or px values.
- **No Tailwind, Bootstrap, or frameworks.** Plain CSS only.
- **Mobile-first responsive design.**
- **Example (good):**
  ```css
  :root {
    --primary-color: #ffea00;
    --heading-font: 'Asar', serif;
  }
  
  .card {
    color: var(--primary-color);
    font-family: var(--heading-font);
  }
  
  @media (max-width: 768px) {
    .card { font-size: 14px; }
  }
  ```
- **Example (bad):**
  ```css
  .card {
    color: #ffea00;  /* ❌ hardcoded */
    font-family: 'Asar', serif;  /* ❌ not tokenized */
    width: 100px;  /* ❌ hardcoded px */
  }
  ```

### HTML/DOM
- **No wrapper divs in block HTML.** Direct child elements only.
- **Preserve authored structure.** The `decorate()` function enhances, not rewrites.
- **No `innerHTML` with untrusted content.** Use `textContent` or sanitize if needed.

### Performance
- **Lighthouse thresholds (required for merge):**
  - Performance: ≥ 95
  - Accessibility: 100
  - Best Practices: 100
  - SEO: 100

### Accessibility
- **WCAG 2.1 AA minimum.**
- **Color contrast:** 4.5:1 for text, 3:1 for graphics
- **Semantic HTML:** Use `<button>`, `<nav>`, `<section>`, etc. (not `<div>` for interactive elements)
- **ARIA labels:** Provide for screen readers where needed
- **Tab order:** Logical tab navigation, no tabindex > 0
- **Testing:** Use Lighthouse or axe DevTools before commit

### Third-party scripts
- **Loaded in "Delayed" phase only.** Not in the critical rendering path.
- **Example (Google Analytics):**
  ```javascript
  // NOT in block.js directly
  // Instead, add to scripts/delayed.js:
  const gaScript = document.createElement('script');
  gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=...';
  document.head.append(gaScript);
  ```

---

## Design context and tokens

Reference `docs/context.md` for:
- Page-specific design specifications (Magazine, Adventures, FAQs, About Us)
- CSS mistakes to avoid (block layout order, flex direction, etc.)
- Global design tokens (colors, typography, spacing)

**Critical:** Always inspect the source page's computed styles before writing CSS. Do NOT assume layouts from page names.

---

## Before committing

### Code quality checklist
- [ ] Run `npm run lint` (fix all errors)
- [ ] Test block at mobile (< 768px), tablet (768-1024px), desktop (> 1024px)
- [ ] Check browser console for errors
- [ ] Verify Lighthouse scores meet thresholds
- [ ] No `console.log()`, `debugger`, or commented-out code

### Content checklist
- [ ] Block uses existing design tokens (no hardcoded colors/px)
- [ ] Block follows naming conventions (block name matches CSS class)
- [ ] Author-facing labels are clear and short
- [ ] Field order matches the order in `decorate()` function

### Governance checklist
- [ ] **For AI-assisted changes:** Include `ai-assisted` label in PR title or description
- [ ] **Request human review** before merge
- [ ] **No autonomous AI merges.** Wait for human approval.
- [ ] Verify linting passes and Lighthouse scores are green

---

## Documentation and references

### Official EDS/UE documentation
- **Main docs:** https://www.aem.live/docs/
- **Developer tutorial:** https://www.aem.live/developer/ue-tutorial
- **Creating blocks:** https://www.aem.live/developer/universal-editor-blocks
- **Content modeling:** https://www.aem.live/developer/component-model-definitions
- **Block collection:** https://www.aem.live/developer/block-collection
- **Performance guide:** https://www.aem.live/developer/keeping-it-100
- **Anatomy of a project:** https://www.aem.live/developer/anatomy-of-a-project

### Local project documentation
- **Design context:** `docs/context.md` (WKND migration specs, CSS patterns)
- **Block inventory:** This file + `component-definition.json`
- **Component models:** `component-models.json`
- **Nesting rules:** `component-filters.json`
- **Validation protocol:** `EDS_Skill_Chain_Test_Prompts.md`

---

## Getting started

### For authors (content creation)
1. Open Universal Editor in AEM Author
2. Create a new page or edit existing content
3. Drag blocks from the right panel (uses `component-definition.json`)
4. Fill in fields (schema defined in `component-models.json`)
5. Publish to preview/live

### For developers (block implementation)
1. Create a new folder: `blocks/{block-name}/`
2. Add three files:
   - `{block-name}.js` (decorate function)
   - `{block-name}.css` (styling)
   - `_{block-name}.json` (optional model template)
3. Add model definition to `component-models.json`
4. Add component entry to `component-definition.json`
5. Add filter rule to `component-filters.json`
6. Test locally with `aem up`
7. Run `npm run lint` (must pass)
8. Submit PR with `ai-assisted` label if AI-generated
9. Request human code review

### For content operations (audit/maintenance)
1. Use `content-audit` skill to check accessibility, metadata, performance
2. Use `geo-rewrite` to optimize content for regional audiences
3. Use `bulk-metadata` to maintain consistent metadata across sections
4. Use `content-diff` to compare preview vs live before publishing

---

## Troubleshooting

### "Block is not rendering"
- Check: JCR block `name` matches component definition (e.g., "Feature Cards" not "feature-cards")
- Check: `component-filters.json` allows the block in the current container
- Check: Field order in `component-models.json` matches `decorate()` function
- Check: No console errors in browser DevTools

### "CSS is not loading"
- Check: Block folder name matches CSS class (blocks/feature-cards → .feature-cards)
- Check: Decorate function is exported as `export default function decorate(block)`
- Check: No syntax errors in CSS (run `npm run lint:css`)

### "Performance is too low"
- Check: Images have correct dimensions (width/height attributes)
- Check: Third-party scripts are in Delayed phase, not critical path
- Check: No synchronous XHRs or large JSON payloads in decorate()
- Check: CSS custom properties are loaded, not inline styles

### "Lighthouse accessibility is 0"
- Check: Block uses semantic HTML (`<button>`, `<nav>`, not `<div onclick>`)
- Check: All images have alt text
- Check: Color contrast is 4.5:1 or higher
- Check: Form inputs have labels

---

## Questions or Issues?

Refer to:
1. `docs/context.md` for design and CSS patterns
2. `EDS_Skill_Chain_Test_Prompts.md` for validation methodology
3. https://www.aem.live/docs/ for official EDS documentation
4. Code review feedback on your PR for specific issues


