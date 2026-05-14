# CSS & Design Context — WKND Migration

This file documents the exact design specifications extracted from the source site (wknd.site) and common CSS mistakes made during migration. Always reference this file before writing or reviewing block CSS.

---

## Critical Mistakes (Do NOT Repeat)

### Mistake 1: Content goes to git, not AEM Author (xwalk projects)
- This is an xwalk project. Content is served from AEM JCR, NOT from `.plain.html` files in git.
- The `.plain.html` files in `content/` are local artifacts only.
- To make content appear, you MUST create JCR nodes via the Sling POST servlet on AEM Author.
- Every page needs: root → section → blocks as JCR child nodes.
- CSRF token is required for POST calls to AEM Author.

### Mistake 2: Hero Featured — image RIGHT, text LEFT
- On the Magazine page, the featured article teaser has TEXT on the LEFT and IMAGE on the RIGHT.
- Source uses `flex-direction: row` with content (flex: 1, ~30%) first, then image (flex: 2, ~60%).
- **Never** put image first/left on this block.

### Mistake 3: Adventures Hero — column-reverse layout, not side-by-side
- The Adventures hero uses `flex-direction: column-reverse` (image on top, content below).
- Image: full-width, 400px height, `object-fit: cover`.
- Content panel: below image, full-width, transparent background.
- This is NOT a side-by-side layout.

### Mistake 4: Always check source page computed styles before writing CSS
- Do NOT assume layouts from page names. Always inspect the source.
- Different pages use different hero layouts even for similar-looking blocks.

---

## Page-by-Page Design Specifications

### Magazine Page (`/us/en/magazine`)

**Featured Article Hero (`hero-featured`)**
- Layout: flexbox row — text LEFT (flex: 1, ~30%), image RIGHT (flex: 2, ~60%)
- Content padding: 63px 36px 36px
- Content text-align: left
- Container padding: 0px 14px
- Container width: 100% of content area (780px at desktop)
- "Featured Article" label above H2 title
- "Read More" CTA link

**Article Cards (`cards`)**
- 5 articles in a vertical list (not grid)
- Each card: image thumbnail + linked title + description
- Cards displayed as list items in the source

**Section titles (H2)**
- "All Articles" and "Members Only" use H2 with yellow underline decoration
- Font: Asar serif, ~36px

---

### Adventures Page (`/us/en/adventures`)

**Hero Teaser**
- Layout: `flex-direction: column-reverse`
- Full-width hero image: 400px height on desktop, `object-fit: cover`
- Content panel: below image, full-width, transparent bg
- Content: H2 "Experience the world with us" + description paragraph
- Total teaser height: ~535px

**Tabs with Adventure Cards**
- 6 category tabs: All, Climbing, Cycling, Skiing, Surfing, Travel
- Tab content shows a list of adventure cards
- Cards: 4 columns per row, ~260px each, flex wrap
- Card images: 200px height, `object-fit: cover`
- Card layout: image on top, title link below, description text

**Section Title ("Current Adventures")**
- Font: Asar serif, 36px
- Yellow underline decoration via `::after` pseudo-element
- No extra left padding — follows container alignment

**Mobile responsive:**
- Cards go to 2 columns, then 1 column
- Hero panel becomes full-width
- Tabs scroll horizontally

---

### FAQs Page (`/us/en/faqs`)

**Layout**
- Two-column layout: main content (left ~65%) + sidebar (right ~35%)
- Main container: 780px width, centered

**Hero Image**
- Landscape image: ~492px wide, ~328px tall
- Positioned above the intro paragraph

**Accordion**
- 7 expandable FAQ items
- Each item: H3 question as button, expandable answer panel
- Button: 13px font, 13px padding, 2px solid light grey bottom border
- Accordion width: ~752px (full content area)
- Expand/collapse caret icon on right side

**Sidebar ("Need more help?")**
- H3 heading
- Contact info: phone number + email link
- Separated from main content by vertical divider

---

### About Us Page (`/us/en/about-us`)

**Section 1: Our Contributors**
- H1 "About Us"
- H2 "Our Contributors" with yellow underline
- Italic description paragraph
- 4 contributor cards in a row (grid: 4 columns)
- Each card: circular portrait photo, H3 name, H5 role, social icons (Facebook, Twitter, Instagram)

**Section 2: WKND Guides**
- H2 "WKND Guides" with yellow underline
- Italic description paragraph
- 3 guide cards in a row (grid: 3 columns)
- Same card structure as contributors

**Card Styling (cards-team)**
- Portrait images: circular (border-radius: 50%)
- Image size: consistent across cards
- Name: H3, bold
- Role: H5, lighter weight
- Social icons: inline row below role

---

## Global Design Tokens (from source wknd.site)

### Typography
- Headings (H1-H3): `Asar, Georgia, "Times New Roman", Times, serif`
- Body text: `"Source Sans Pro", Helvetica, Arial, sans-serif`
- H1: 40px
- H2: 36px (with yellow underline on section headings)
- H3: varies by context

### Colors
- Primary yellow: `#ffea00` (used for underlines, accents)
- Text dark: `#333` or `#222`
- Background: `#fff` (white)
- Light grey borders: `rgb(235, 235, 235)`

### Layout
- Max content width: 780px (constrained container)
- Content padding: 0 14px
- Sections separated by `<hr>` horizontal rules

### Yellow Underline Pattern
- Applied via `::after` pseudo-element on H2 titles
- Width: ~120px
- Height: 4-5px
- Color: `#ffea00`
- Positioned below the heading text

---

## Block CSS Checklist

Before pushing any block CSS, verify:
- [ ] Inspected the source page's computed styles (not assumed)
- [ ] Text/image order matches source (LEFT/RIGHT correct)
- [ ] Flex direction matches source (row vs column vs column-reverse)
- [ ] Image dimensions and object-fit match source
- [ ] Font family and size match source
- [ ] Color values match source
- [ ] Mobile breakpoints tested
- [ ] xwalk DOM has no `.block-wrapper` / `.block-container` — use direct selectors
- [ ] Block JS has `export default function decorate(block) {}` (required for CSS loading)
