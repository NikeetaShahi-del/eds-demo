# Agents and Skills Configuration

**Project:** eds-demo  
**Last updated:** 2026-10-01  
**Scope:** Adobe Edge Delivery Services (EDS) skills for validation and development

---

## Overview

This project uses **GitHub Copilot skills** installed as Adobe agents. Skills are invoked through natural language prompts in agent mode and executed in a specific order to validate code quality and development processes.

### Skill discovery
Skills are automatically discovered from:
- Installed GitHub Copilot agent marketplace
- References in prompts (e.g., "Use the building-blocks skill to...")

If Copilot cannot auto-discover skills, add the skill path explicitly to prompts:
```
Before doing anything, read `.agents/skills/{skill-name}/SKILL.md`.
Then run the {skill-name} skill to...
```

---

## Adobe EDS Skills (25 total)

### 1. Documentation & Discovery

#### `docs-search`
- **Purpose:** Find official aem.live documentation
- **Usage:** "Use docs-search to find documentation for [pattern]"
- **Input:** Pattern name (e.g., "tabs", "carousel", "cards")
- **Output:** Links to aem.live docs, code examples
- **Scope:** All
- **Reference:** https://www.aem.live/docs/

#### `block-inventory`
- **Purpose:** List existing blocks in the project
- **Usage:** "Use block-inventory to check which blocks exist"
- **Input:** None (reads from `blocks/` directory)
- **Output:** List of blocks, status (complete/partial), readiness
- **Scope:** All
- **Reference:** `blocks/` directory

#### `block-collection-and-party`
- **Purpose:** Check Adobe Block Collection and third-party implementations
- **Usage:** "Run block-collection-and-party to find reusable blocks"
- **Input:** Block pattern name
- **Output:** Available implementations, recommendations (reuse/adapt/build new)
- **Scope:** All
- **Reference:** https://www.aem.live/developer/block-collection

---

### 2. Content Analysis & Modeling

#### `authoring-analysis`
- **Purpose:** Analyze how content is structured in existing pages
- **Usage:** "Use authoring-analysis on [PAGE_URL] to check structure"
- **Input:** Page URL(s), authoring model context
- **Output:** Block usage map, inconsistencies, authoring patterns
- **Scope:** All
- **Note:** Requires real page URLs

#### `identify-page-structure`
- **Purpose:** Map page content to blocks and sections
- **Usage:** "Run identify-page-structure on [PAGE_URL]"
- **Input:** Page URL
- **Output:** Block-by-block structure, section hierarchy
- **Scope:** All
- **Note:** Requires real page URLs

#### `content-modeling`
- **Purpose:** Design authoring contracts (field schemas)
- **Usage:** "Use content-modeling for [AUTHORING_MODEL] to design [BLOCK_NAME]"
- **Input:** Authoring model (DBA/UE/DA), block requirements
- **Output:** Field schema, author-facing labels, defaults
- **Scope:** All
- **Current model:** UE (Universal Editor)
- **Reference:** `component-models.json`

---

### 3. Universal Editor (UE) Specific

#### `ue-component-model`
- **Purpose:** Generate UE JSON files (component-definition, component-models, component-filters)
- **Usage:** "Use ue-component-model to generate files for [NEW_BLOCK]"
- **Input:** Component definitions, field schemas, nesting rules
- **Output:** Valid `component-*.json` entries
- **Scope:** UE only
- **Reference:** `component-definition.json`, `component-models.json`, `component-filters.json`
- **Note:** Not applicable to DA or DBA projects

---

### 4. Block Development

#### `analyze-and-plan`
- **Purpose:** Plan block implementation (what fields, what structure, dependencies)
- **Usage:** "Run analyze-and-plan for a new block [NEW_BLOCK]"
- **Input:** Block requirements, design specs
- **Output:** Implementation plan, field list, dependencies
- **Scope:** All

#### `building-blocks`
- **Purpose:** Generate block code (JS, CSS, HTML structure)
- **Usage:** "Use building-blocks to create [NEW_BLOCK]"
- **Input:** Block model, design tokens, requirements
- **Output:** Block .js, .css, and folder structure
- **Scope:** All
- **Standards enforced:**
  - Vanilla JS only
  - CSS custom properties (no hardcoded colors/px)
  - No build tools
  - WCAG 2.1 AA minimum
  - Responsive design
- **Refusal:** Will refuse requests for React, Tailwind, frameworks, or build tools

#### `testing-blocks`
- **Purpose:** Browser-based validation (Lighthouse, accessibility, responsiveness)
- **Usage:** "Run testing-blocks on [BLOCK_NAME]"
- **Input:** Block name, URLs for testing pages
- **Output:** Lighthouse scores, accessibility report, responsive testing results
- **Scope:** All
- **Thresholds:**
  - Performance ≥ 95
  - Accessibility = 100
  - Best Practices = 100
  - SEO = 100

#### `code-review`
- **Purpose:** Audit code against standards (syntax, conventions, INSTRUCTIONS.md alignment)
- **Usage:** "Run code-review on [BLOCK_NAME] or current branch"
- **Input:** Code files, standards reference (INSTRUCTIONS.md)
- **Output:** Issues found (grouped by: loading phase, CSS, JS, accessibility, model alignment)
- **Scope:** All
- **Checks:**
  - Vanilla JS (no frameworks)
  - CSS custom properties (no hardcoded values)
  - Accessibility (WCAG 2.1 AA)
  - Standards alignment (INSTRUCTIONS.md)
  - Third-party script loading phase
  - PR governance (labeling, reviewer assignment)

---

### 5. Content-Driven Development (Orchestration)

#### `content-driven-development`
- **Purpose:** Orchestrate the full block build chain
- **Usage:** "Use content-driven-development to build [NEW_BLOCK]"
- **Input:** Block model, test content URLs
- **Output:** Built, tested, reviewed block with Lighthouse green
- **Scope:** All
- **Chain order:** analyze-and-plan → find-test-content → building-blocks → testing-blocks → code-review
- **Automation:** Runs all sub-skills in sequence with evidence capture
- **Note:** May ask for confirmation after each step before proceeding

---

### 6. DA.live Specific (Authoring Model = DA)

#### `da-auth`
- **Purpose:** Authenticate with DA.live
- **Usage:** "Run da-auth first before accessing DA content"
- **Input:** Credentials (browser-based OAuth)
- **Output:** Session token (cached locally)
- **Scope:** DA only
- **Prerequisite:** Must run before any DA content access
- **Refusal:** Will decline on non-DA projects (returns error)

#### `da-content`
- **Purpose:** Read/browse content from DA.live
- **Usage:** "Use da-content to list pages under [SECTION_PATH]"
- **Input:** Section path (e.g., `/products/`), filter criteria
- **Output:** Page list with URLs and metadata
- **Scope:** DA only
- **Prerequisite:** da-auth must run first
- **Refusal:** Will fail if not authenticated

#### `find-test-content`
- **Purpose:** Find existing pages using a specific block
- **Usage:** "Run find-test-content to find pages with [BLOCK_NAME]"
- **Input:** Block name, corpus (preview or live)
- **Output:** List of URLs, block variants found
- **Scope:** All
- **Note:** On DA, searches published content index. On other models, requires real page URLs.

#### `figma-to-content`
- **Purpose:** Convert Figma designs to DA.live pages
- **Usage:** "Run figma-to-content for [FIGMA_URL]"
- **Input:** Figma frame URL (requires Figma MCP configured)
- **Output:** DA page structure, block assignments, authored content
- **Scope:** DA only
- **Prerequisite:** da-auth + Figma MCP configured
- **Chain:** da-auth → figma-to-content (which orchestrates: da-content, block-inventory, building-blocks, testing-blocks)
- **Note:** Requires Figma file access and MCP permissions

#### `create-site`
- **Purpose:** Bootstrap a new DA.live project
- **Usage:** "Run create-site for [PROJECT_NAME]"
- **Input:** Project name, GitHub org
- **Output:** GitHub repo, DA site config, initial content (nav, footer, home)
- **Scope:** DA only
- **Refusal:** Will decline on UE/DBA projects, pointing to correct workflow

---

### 7. Design System (Optional)

#### `aem-design` (requires separate plugin)
- **Purpose:** Generate design phase outputs
- **Sub-skills:**
  - `brand` — Brand profile and design token extraction
  - `briefings` — Project briefings and requirements
  - `wireframes` — Low-fidelity layouts
  - `prototype` — Static prototype (HTML/CSS)
- **Usage:** "Run aem-design to produce brand, briefings, wireframes, and prototype"
- **Input:** Design requirements, campaign context
- **Output:** Static prototype under `aem-design/` folder
- **Scope:** All
- **Note:** Requires separate `@adobe-skills/aem-design` plugin

---

### 8. Content Operations (Post-Launch)

#### `content-audit`
- **Purpose:** Check page quality (SEO, accessibility, performance, EDS best practices)
- **Usage:** "Run content-audit on [PAGE_URL]"
- **Input:** Page URL
- **Output:** 40+ checks, prioritized fix list
- **Scope:** All
- **Checks:** Meta tags, image alt text, heading hierarchy, color contrast, link validity, schema markup, performance metrics

#### `geo-rewrite`
- **Purpose:** Optimize content for regional audiences
- **Usage:** "Use geo-rewrite to optimize [PAGE_URL] for [REGION]"
- **Input:** Page URL, target region, audience persona
- **Output:** Rewritten content maintaining facts and brand voice
- **Scope:** All
- **Note:** Does NOT change factual meaning

#### `accessibility-fix`
- **Purpose:** Fix WCAG 2.1 AA issues at source-document level
- **Usage:** "Run accessibility-fix on issues from content-audit"
- **Input:** Audit findings, page URL
- **Output:** Fixed source content (in-document changes, not code)
- **Scope:** All
- **Fixes:** Alt text, headings, color contrast, form labels, link text
- **Note:** Works at content level, not code level

#### `bulk-metadata`
- **Purpose:** Audit and fix metadata across a section
- **Usage:** "Run bulk-metadata on [SECTION_PATH]"
- **Input:** Section path (e.g., `/articles/`)
- **Output:** Missing/stale/inconsistent metadata report with corrections
- **Scope:** All

#### `content-diff`
- **Purpose:** Compare preview vs live versions of a page
- **Usage:** "Run content-diff on [PAGE_URL] comparing preview vs live"
- **Input:** Page URL
- **Output:** Diff report (unintended changes, missing content, formatting issues)
- **Scope:** All
- **Note:** Does NOT publish; for review only

---

### 9. Browser Automation (Optional)

#### `slicc-handoff`
- **Purpose:** Hand off in-progress verification to SLICC browser agent
- **Usage:** "Use slicc-handoff to hand over [BLOCK_NAME] to SLICC"
- **Input:** Block name, current state, test objectives
- **Output:** SLICC browser automation session
- **Scope:** All
- **Note:** Requires SLICC connection/session available
- **Refusal:** Will decline if SLICC is not configured

---

### 10. CLI and Local Development

#### `aem-cli`
- **Purpose:** Start local dev server (proxy + hot reload)
- **Usage:** "Run aem-cli to start the dev server"
- **Input:** Port (default 3000), proxy URL
- **Output:** Server running on `http://localhost:3000`
- **Scope:** All
- **Installation:** `npm install -g @adobe/aem-cli` or `npx @adobe/aem-cli up`
- **Commands:**
  - `aem up` — Start dev server
  - `aem import` — Import content from external source
  - `aem content` — Manage DA.live content

---

## How to invoke skills

### In prompts (agent mode)
```
I need to build a new "feature-cards" block.

Use these skills in order:
1. analyze-and-plan: plan the block (fields, structure, dependencies)
2. building-blocks: generate the block code
3. testing-blocks: validate Lighthouse scores and accessibility
4. code-review: check against INSTRUCTIONS.md standards

Append to every prompt:
REPORTING (mandatory):
- At the end, output a table: Step | Skill used | Input | Output / files changed | Assumptions made
- List any skills you tried but couldn't use and why
- List anything you refused or flagged as not applicable to UE
- Say which parts of INSTRUCTIONS.md you relied on
```

### Mode A (explicit skill names)
Ask Copilot to name the skills as it runs them:
```
"When you run each skill, tell me which one you're using and why."
```

### Mode B (baseline/plain language)
Ask for the same outcome without skill names:
```
"I need a feature-cards block.
- First, plan what fields and structure it needs.
- Then, generate the code (JS, CSS, HTML).
- Then, test it on mobile, tablet, desktop.
- Then, review it against project standards.
Don't tell me which skills you're using."
```

**Compare Mode A vs Mode B:** Did the explicit skill names help? How many turns did each take? Which was more accurate?

---

## Skill applicability matrix

| Skill | All | DBA | UE | DA | Notes |
|---|---|---|---|---|---|
| docs-search | ✓ | ✓ | ✓ | ✓ | Universal |
| block-inventory | ✓ | ✓ | ✓ | ✓ | Universal |
| block-collection-and-party | ✓ | ✓ | ✓ | ✓ | Universal |
| authoring-analysis | ✓ | ✓ | ✓ | ✓ | Needs page URLs |
| identify-page-structure | ✓ | ✓ | ✓ | ✓ | Needs page URLs |
| content-modeling | ✓ | ✓ | ✓ | ✓ | Adapts to model |
| ue-component-model | ✗ | ✗ | ✓ | ✗ | UE-only |
| analyze-and-plan | ✓ | ✓ | ✓ | ✓ | Universal |
| building-blocks | ✓ | ✓ | ✓ | ✓ | Universal |
| testing-blocks | ✓ | ✓ | ✓ | ✓ | Universal |
| code-review | ✓ | ✓ | ✓ | ✓ | Universal |
| content-driven-development | ✓ | ✓ | ✓ | ✓ | Orchestration |
| da-auth | ✗ | ✗ | ✗ | ✓ | DA-only |
| da-content | ✗ | ✗ | ✗ | ✓ | DA-only |
| find-test-content | ✓ | ✓ | ✓ | ✓ | Adapts to model |
| figma-to-content | ✗ | ✗ | ✗ | ✓ | DA-only |
| create-site | ✗ | ✗ | ✗ | ✓ | DA-only |
| aem-design | ✓ | ✓ | ✓ | ✓ | Optional plugin |
| content-audit | ✓ | ✓ | ✓ | ✓ | Universal |
| geo-rewrite | ✓ | ✓ | ✓ | ✓ | Universal |
| accessibility-fix | ✓ | ✓ | ✓ | ✓ | Universal |
| bulk-metadata | ✓ | ✓ | ✓ | ✓ | Universal |
| content-diff | ✓ | ✓ | ✓ | ✓ | Universal |
| slicc-handoff | ✓ | ✓ | ✓ | ✓ | Optional/conditional |
| aem-cli | ✓ | ✓ | ✓ | ✓ | Local dev |

**Legend:**
- ✓ = applicable to this authoring model
- ✗ = not applicable (skip or expect refusal)
- This project = **UE** only

---

## Skill refusal scenarios (intentional "no" responses)

Skills will **intentionally refuse** in these cases:

1. **da-auth** on UE/DBA project:
   > "This skill applies only to DA.live projects. Use content-modeling instead for authoring contracts."

2. **ue-component-model** on DA/DBA project:
   > "This skill applies only to Universal Editor projects. Use content-modeling for table-based schemas."

3. **create-site** on UE/DBA project:
   > "This skill creates DA.live projects only. For UE/DBA, follow the xwalk bootstrap guide."

4. **figma-to-content** on non-DA project:
   > "This skill requires DA.live. Use aem-design → content-modeling → building-blocks instead."

5. **building-blocks** with React/Tailwind/framework request:
   > "I cannot build with React, Tailwind, or build tools. This project requires vanilla JS and CSS custom properties only. I can suggest a compliant approach."

6. **building-blocks** with hardcoded hex/px request:
   > "Design values must be CSS custom properties, not hardcoded. I'll refactor to use tokens."

7. **testing-blocks** when Lighthouse fails thresholds:
   > "Performance is 82/100 (threshold: 95). Before approving, fix: [list issues]"

8. **code-review** when PR lacks ai-assisted label:
   > "This PR appears AI-generated but lacks the `ai-assisted` label. Please add it for governance."

These refusals are **features, not bugs**. They enforce project standards and prevent mistakes.

---

## Skill troubleshooting

### Skill didn't run
- Check: Copilot is in **agent mode** (not chat mode)
- Check: Skill name is spelled correctly
- Check: Skill is applicable to this authoring model (UE)
- Check: If DA-skill, confirm da-auth was run first

### Skill complained about missing INSTRUCTIONS.md or AGENTS.md
- Fix: These files now exist in repo root (created 2026-10-01)
- The files are automatically discovered by Copilot

### Skill output didn't match expectations
- Check: You provided all required inputs (`[PAGE_URL]`, `[BLOCK_NAME]`, etc.)
- Check: Mode A (explicit) vs Mode B (baseline) — try the other mode
- Record both in the validation scorecard and compare efficiency

### Skill said "not applicable" for something expected to work
- This is **intentional.** Review the skill's applicability matrix above.
- Example: `ue-component-model` is UE-only. Use `content-modeling` for DBA/DA projects.

---

## For the validation framework

When running tests from `EDS_Skill_Chain_Test_Prompts.md`:
1. Use **Mode A (explicit skill names)** first — name each skill as you run it
2. Capture **outputs, Lighthouse scores, accessibility reports**
3. Note **number of turns** (how many back-and-forth interactions)
4. Record **any refusals or "skill not applicable" responses**
5. Then run **Mode B (plain language)** without skill names
6. Compare: Did the explicit skill names help? More accurate? Fewer turns?

**Scorecard columns:**
- Skill triggered correctly (0/1)
- Order correct (0/1)
- Output matches expected artefact (0-2)
- Standards compliance (0-2)
- Human fixes needed (count)
- Hallucination/scope creep (0/1)
- Turns (count)


