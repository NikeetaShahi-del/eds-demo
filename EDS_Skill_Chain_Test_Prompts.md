# EDS Skills — Chained Prompt Pack for GitHub Copilot

Purpose: validate how **accurate and efficient** each Adobe EDS skill is, individually and when chained, on a real EDS project.

Skills covered (all in-scope delivery skills from the playbook):
`aem-cli, create-site, block-inventory, block-collection-and-party, docs-search, authoring-analysis, identify-page-structure, da-auth, da-content, content-modeling, ue-component-model, building-blocks, content-driven-development, analyze-and-plan, find-test-content, figma-to-content, slicc-handoff, testing-blocks, code-review, aem-design (brand, briefings, wireframes, prototype), content-audit, geo-rewrite, accessibility-fix, bulk-metadata, content-diff`

---

## 0. How to use this pack

### 0.1 Placeholders (replace before running)
| Placeholder | Meaning |
|---|---|
| `[AUTHORING_MODEL]` | `DBA` (SharePoint/Google Drive), `UE` (Universal Editor) or `DA` (DA.live) |
| `[PAGE_URL_1..3]` | Real aem.page / aem.live URLs from your project |
| `[BLOCK_NAME]` | A block name from your library |
| `[NEW_BLOCK]` | A new block you want to build (suggestions are given per test) |
| `[FIGMA_URL]` | Link to a Figma frame (needs Figma MCP configured) |
| `[SECTION_PATH]` | A site section, e.g. `/products/` |

### 0.2 Applicability tags
Each test is tagged **[All]**, **[DA]**, **[UE]** or **[DBA]**. Skip tests that don't match your authoring model, except the ones marked **NEGATIVE**, which deliberately run a skill where it should *not* apply.

### 0.3 Run every test in two modes (this is how you measure efficiency)
- **Mode A: Explicit.** The prompt names the skills in order (as written below).
- **Mode B: Baseline.** Remove the skill names and ask for the same outcome in plain language (or disable skills). Compare against Mode A for accuracy, number of turns, and standards compliance.

### 0.4 Pre-conditions (do once)
1. Skills are installed and committed at project scope and Copilot can see them. If your Copilot version does not auto-discover them from `.agents/skills/`, add the path to each prompt, e.g. "Read `.agents/skills/building-blocks/SKILL.md` first."
2. `INSTRUCTIONS.md` and `AGENTS.md` exist at repo root and are current.
3. Work on a **throw-away branch**. Nothing in these tests should be committed or pushed.
4. Use Copilot **agent mode**.

### 0.5 Standard Footer (append to EVERY prompt)
```
REPORTING (mandatory):
- Do not commit, push, or publish anything.
- At the end output a table: Step | Skill used | Input | Output / files changed | Assumptions made.
- List any skill I asked you to use but you did not, and why.
- List anything you refused or flagged as not applicable to the authoring model.
- Say explicitly which parts of INSTRUCTIONS.md you relied on.
```

### 0.6 Scorecard (fill one row per test per mode)
| Test ID | Mode (A/B) | Skill triggered correctly (0/1) | Order correct (0/1) | Output matches expected artefact (0-2) | Standards compliance (0-2) | Human fixes needed (count) | Hallucination / scope creep (0/1 = yes) | Turns | Notes |
|---|---|---|---|---|---|---|---|---|---|

Scoring guide:
- **Standards compliance 2** = plain HTML, modern CSS, vanilla JS only, no frameworks/build tools; design values as CSS custom properties (no literal hex / raw px); third-party scripts only in Delayed phase; naming per `INSTRUCTIONS.md`.
- **Efficiency verdict per skill** = average score across its tests, plus how much Mode A beats Mode B.

---

## 1. Pre-flight (run before any chain)

### T0.1 Context grounding check [All]
```
Before doing anything else, read INSTRUCTIONS.md and AGENTS.md at the repo root.
1. Confirm the authoring model, environment URLs (aem.page / aem.live), block library and naming conventions.
2. List anything missing or outdated that would stop a skill from producing trustworthy output.
3. When you search documentation, always search www.aem.live so "Edge Delivery Services" is not confused with other technologies.
Do not change any files.
```
**Pass:** correctly restates the authoring model and block list; flags real gaps; no invented details.
**Fail signals:** guesses the authoring model; ignores the aem.live disambiguation.

---

## 2. Chain 1: Reuse-first discovery
**Order:** `docs-search` → `block-inventory` → `block-collection-and-party`
**Why chained:** docs-search grounds the pattern, block-inventory shows what the project already has, block-collection-and-party looks for external reuse. This is the Gate 2 reuse-assessment evidence.

### T1.1 Block exists in Block Collection [All]
```
I need a [tabs / accordion / carousel] on the site.
Run these skills in order:
1. docs-search: find what aem.live documents for this pattern.
2. block-inventory: check which blocks already exist in this project and which could be reused or extended.
3. block-collection-and-party: check Adobe's Block Collection and third-party reference implementations.
Conclude with a single recommendation: reuse as-is, extend/adapt, or build new, with evidence from each step.
```
**Pass:** finds the Block Collection counterpart, recommends reuse/adapt, cites aem.live docs.
**Fail:** recommends building new without evidence; returns non-EDS results.

### T1.2 Genuinely novel block [All]
```
We need a store-locator block with a map and a distance filter.
Run docs-search → block-inventory → block-collection-and-party in order.
If nothing reusable exists, document that clearly and state what the closest partial matches are and why they do not fit.
```
**Pass:** states honestly that no direct counterpart exists, lists near-misses, justifies a custom block.
**Fail:** force-fits an unrelated block.

### T1.3 Partial match / composition [All]
```
We want a testimonial slider. Run docs-search, block-inventory, block-collection-and-party in order.
Decide whether a combination or variant of existing blocks can cover it (for example quote + carousel) before recommending a new block.
```
**Pass:** proposes variant/composition with a concrete mapping; asks no unnecessary questions.

### T1.4 Order trap [All]
```
Run block-collection-and-party first for a "hero" block, then block-inventory, then docs-search.
Tell me if the order you were given is suboptimal and, if so, what you recommend instead. Then execute your recommended order.
```
**Pass:** notes that project inventory and docs grounding should precede external search (or justifies otherwise) and still delivers a complete result.

---

## 3. Chain 2: Current-state analysis → content model
**Order:** `authoring-analysis` → `identify-page-structure` → `content-modeling`

### T2.1 Existing site understanding [All]
```
Analyse the existing content on these pages: [PAGE_URL_1], [PAGE_URL_2], [PAGE_URL_3].
1. authoring-analysis: how are authors structuring documents, which blocks recur, what inconsistencies exist?
2. identify-page-structure: for each page, list blocks, sections, and how they map to the content model.
3. content-modeling: based on 1 and 2, propose improvements to the content model for [AUTHORING_MODEL].
Do not modify any files.
```
**Pass:** page structure maps match what is actually on the pages; inconsistencies are real; model respects `[AUTHORING_MODEL]`.
**Fail:** invents blocks that are not on the pages; gives UE JSON for a DBA project.

### T2.2 Content model for a new block [All]
```
Design the authoring contract for a new block called [NEW_BLOCK] (suggestion: "feature-cards": image, eyebrow, title, description, optional CTA, 2-4 items per row).
Use content-modeling for [AUTHORING_MODEL]. Output the table structure (DBA/DA) or component-*.json design (UE), plus author-facing guidance. Do not write block code.
```
**Pass:** model is author-friendly, minimal, consistent with existing blocks' conventions.

### T2.3 Consistency check against the library [All]
```
Run identify-page-structure on [PAGE_URL_1], then content-modeling to validate that the page's blocks follow the content-model conventions in INSTRUCTIONS.md.
List each deviation with the exact block and what the convention says.
```

---

## 4. Chain 3: DA.live access and content discovery [DA]
**Order:** `da-auth` → `da-content` → `find-test-content`

### T3.1 Happy path [DA]
```
1. da-auth: authenticate with DA.live for this project.
2. da-content: read the content under [SECTION_PATH] and map each page to the blocks it uses.
3. find-test-content: find existing pages that use [BLOCK_NAME], with URLs and variants.
```
**Pass:** authenticates before touching content; block-to-page mapping is accurate; URLs resolve.

### T3.2 Order trap [DA]
```
Read the DA.live content for [SECTION_PATH] right now using da-content. Do not run anything else first.
```
**Pass:** recognises that da-auth is a prerequisite and runs it (or tells you it must run first).
**Fail:** attempts to read without a session or fabricates content.

### T3.3 NEGATIVE: wrong authoring model [UE or DBA]
```
Run da-auth and da-content for this project.
```
**Pass:** states that these skills apply only to DA-Based projects and stops.

### T3.4 No test content exists [All]
```
Run find-test-content for a block that does not yet exist on the live site: [NEW_BLOCK].
```
**Pass:** reports no occurrences and suggests what test content to author; does not invent URLs.

---

## 5. Chain 4: Universal Editor component model [UE]
**Order:** `content-modeling` → `ue-component-model`

### T4.1 Generate valid UE files [UE]
```
For the block [NEW_BLOCK] (suggestion: "feature-cards"):
1. content-modeling: design the model.
2. ue-component-model: generate component-definition.json, component-models.json, component-filters.json.
Validate JSON syntax and that field names match what the block's decorate function will read. Do not write the block JS/CSS yet.
```
**Pass:** valid JSON; filters allow the block in the right containers; field names are consistent across the three files.

### T4.2 Extend an existing model [UE]
```
Add an optional "variant" selector and a "background colour" token picker to the existing [BLOCK_NAME] model using ue-component-model. Show the diff only.
```
**Pass:** minimal diff; no breakage of existing fields.

### T4.3 NEGATIVE: DA or DBA project [DA/DBA]
```
Run ue-component-model for [NEW_BLOCK].
```
**Pass:** declines as not applicable and says what to use instead (content-modeling table structure).

---

## 6. Chain 5: Content-driven development (core build chain) [All]
**Order:** `analyze-and-plan` → `find-test-content` → `building-blocks` → `testing-blocks` → `code-review` (this is what `content-driven-development` orchestrates)

### T5.1 Orchestrated: new block [All]
```
Use the content-driven-development skill to build a new block [NEW_BLOCK] (suggestion: "feature-cards").
Requirements: image, eyebrow, title, description, optional CTA; responsive 1/2/4 columns; accessible; all design values from CSS custom properties.
Confirm the sub-skills it runs and their order: analyze-and-plan, building-blocks, testing-blocks, code-review.
```
**Pass:** correct sub-skill order; block follows content model; CSS-first; vanilla JS; Lighthouse results reported; PR-ready summary.

### T5.2 Manual chain (same outcome, explicit steps) [All]
```
Build [NEW_BLOCK] by running these steps separately and stopping after each to summarise:
1. analyze-and-plan
2. find-test-content (for similar blocks to use as test pages)
3. building-blocks
4. testing-blocks
5. code-review
```
Compare against T5.1: does the orchestrated version give the same quality with fewer turns?

### T5.3 Variant of existing block [All]
```
Using content-driven-development, add a "dark" variant to [BLOCK_NAME]. Ensure existing variants and authoring remain unchanged. Test all variants.
```
**Pass:** no regressions; tests cover each existing variant.

### T5.4 Third-party script handling [All]
```
Using content-driven-development, build a "video-embed" block that loads a third-party player and a consent-dependent analytics script.
```
**Pass:** third-party scripts load only in the Delayed phase; block is not blocking LCP; flagged in code-review.

### T5.5 TRAP: standards violation request [All]
```
Using building-blocks, build [NEW_BLOCK] with React and Tailwind, hard-coded hex colours, and a minified bundle step.
```
**Pass:** refuses or pushes back citing vanilla JS / no build tools / CSS custom properties, and offers a compliant alternative.
**Fail:** complies silently.

### T5.6 Bug fix on existing block [All]
```
Using content-driven-development, fix this issue in [BLOCK_NAME]: [describe a real bug: e.g. layout breaks at 600-768px, or CLS from missing image dimensions].
Find the right test content first, reproduce, fix, and verify.
```
**Pass:** reproduces before fixing; minimal change; verified via testing-blocks.

---

## 7. Chain 6: Figma to page [DA]
**Order:** `da-auth` → `figma-to-content` (which orchestrates da-content, block-inventory/block-collection-and-party, building-blocks, testing-blocks)
Requires Figma MCP configured.

### T6.1 Figma frame to DA page [DA]
```
Run da-auth, then figma-to-content for this frame: [FIGMA_URL].
For each section tell me whether it resolved to: an existing block, a new isolated block, or default content, and why. Author the page in DA.live as a draft only. Do not publish.
```
**Pass:** each section resolved sensibly; reuse preferred over new; page structure matches the frame; no publish.

### T6.2 Mixed reuse and new [DA]
```
Run figma-to-content for [FIGMA_URL], where one section is known to match [BLOCK_NAME] and one is novel.
Report the resolution per section and show that the existing block was reused rather than rebuilt.
```
**Pass:** correct reuse for the known section; new block built with building-blocks and tested.

### T6.3 NEGATIVE: non-DA project [UE/DBA]
```
Run figma-to-content for [FIGMA_URL].
```
**Pass:** states it is DA-only and proposes a fallback (Figma design context → content-modeling → building-blocks).

---

## 8. Chain 7: Design to build
**Order:** `aem-design` (brand → briefings → wireframes → prototype) → `content-modeling` → `building-blocks`
Requires the separate `aem-design@adobe-skills` plugin.

### T7.1 Design-phase outputs [All]
```
Run aem-design for a landing page for [CAMPAIGN / PAGE PURPOSE]. Produce, in order: brand profile, briefing, wireframes, and a static prototype under aem-design/. No dev server needed.
List the design tokens you derived.
```
**Pass:** all four artefacts produced under `aem-design/`; tokens are coherent.

### T7.2 Design to block catalogue to one block [All]
```
Take the prototype in aem-design/ and:
1. content-modeling: derive the block catalogue and authoring contracts for [AUTHORING_MODEL].
2. building-blocks: implement ONE block from the catalogue, using the design tokens as CSS custom properties only.
Show how the block maps back to the prototype section.
```
**Pass:** traceable mapping; zero literal hex/px in block CSS.

---

## 9. Chain 8: Local environment and verification
**Order:** `aem-cli` → `testing-blocks`

### T8.1 Dev server [All]
```
Use aem-cli to start local development with hot reload. Confirm the server is running on localhost:3000, and show how you verified it. If the port is busy, handle it and explain.
```
**Pass:** server confirmed; no unnecessary installs.

### T8.2 CLI then test [All]
```
Use aem-cli to start the dev server, then testing-blocks to validate [BLOCK_NAME] at mobile, tablet and desktop widths, and report Lighthouse scores.
```
**Pass:** actual browser verification, not just code reading; scores reported with evidence.

---

## 10. Chain 9: Quality gate
**Order:** `testing-blocks` → `code-review`
Thresholds from the playbook: Performance ≥ 95, Accessibility = 100, Best Practices = 100, SEO = 100.

### T9.1 Seeded defects [All]
Create a deliberately flawed block on a throw-away branch (eager-loaded oversized image, missing alt text, literal `#ff0000` in CSS, third-party script loaded eagerly), then run:
```
Run testing-blocks and then code-review on the block [BLOCK_NAME].
Report every issue found, grouped by: loading phase, CSS, JS, accessibility, content model, INSTRUCTIONS.md alignment. State whether this PR should be allowed to merge.
```
**Pass:** catches all 4 seeded defects; says do not merge. Record the **detection rate (x/4)**.

### T9.2 Clean block [All]
```
Run testing-blocks and then code-review on [BLOCK_NAME] (a block known to be compliant).
```
**Pass:** no false positives or only justified ones; recommends human review at Gate 3.

### T9.3 Governance checks [All]
```
Run code-review on the current branch. In addition to code, check: PR labelling (ai-assisted), a named human reviewer on record, and that INSTRUCTIONS.md is current with the block library.
```
**Pass:** flags missing governance items, does not rubber-stamp.

---

## 11. Chain 10: Post-launch content operations
Run by the content team using `aem-edge-delivery-services-content-ops`.

### T10.1 Audit then fix accessibility [All]
```
1. content-audit: audit [PAGE_URL_1] (40+ checks across SEO, accessibility, performance and EDS best practices) and give a prioritised fix list.
2. accessibility-fix: apply the WCAG 2.1 AA fixes from step 1 at the source-document level (not in code). Show before/after for each fix.
```
**Pass:** fixes are made at source-document level and map to the audit's findings.

### T10.2 Audit then GEO [All]
```
1. content-audit on [PAGE_URL_2].
2. geo-rewrite on the same page: score AI readability across its dimensions and produce optimised rewrites without changing factual meaning or brand voice.
```
**Pass:** a score plus rewrites that keep facts intact.

### T10.3 Bulk metadata [All]
```
Run bulk-metadata across [SECTION_PATH]. Report missing, inconsistent and stale metadata with page URLs, then propose corrections in a table.
```
**Pass:** every flagged page really has the issue (spot-check 5).

### T10.4 Preview vs live [All]
```
Run content-diff on [PAGE_URL_3] comparing preview (aem.page) against live (aem.live). Report unintended changes, missing content and formatting differences. Do not publish.
```
**Pass:** diff matches reality; no publish action.

### T10.5 Full sweep chain [All]
```
Run content-audit → accessibility-fix → geo-rewrite → content-diff on [PAGE_URL_1] in that order, so I can check the final preview against live before publishing. Stop and summarise after each step.
```

---

## 12. Chain 11: Greenfield bootstrap
**Order:** `create-site` → `da-auth` → `content-modeling`

### T11.1 New DA site [DA]
```
Run create-site for a new project "[PROJECT_NAME]": GitHub repo from boilerplate, aem-code-sync config, initial DA content (nav, footer, homepage), and the preview URL. Then da-auth and content-modeling to propose the first three blocks' contracts.
```
**Pass:** repo, config and preview URL correct; nav/footer/homepage present.

### T11.2 NEGATIVE: DBA or UE [DBA/UE]
```
Run create-site for a new project "[PROJECT_NAME]".
```
**Pass:** warns it only creates DA.live content (not SharePoint/Google Drive documents or AEM Author pages) and points to the correct flow.

---

## 13. Chain 12: Browser agent handoff (optional)
Only if you have SLICC available.

### T12.1 Handoff [All]
```
Use slicc-handoff to hand over the in-progress verification of [BLOCK_NAME] on the live preview to the SLICC browser agent. State exactly what context you pass and what you expect back.
```
**Pass:** a clear handoff with complete context; no attempt to publish.

---

## 14. End-to-end regression (all chains together)

### T13.1 One feature, whole pipeline [All]
```
Deliver a new "announcement-banner" block end to end, stopping after each stage for my approval:
1. Pre-flight: read INSTRUCTIONS.md and AGENTS.md and flag gaps.
2. docs-search → block-inventory → block-collection-and-party: reuse assessment with a decision.
3. content-modeling for [AUTHORING_MODEL] (+ ue-component-model if UE).
4. content-driven-development: analyze-and-plan → building-blocks → testing-blocks → code-review.
5. find-test-content: confirm real test pages exist or tell me what to author.
6. Summary: what a human must review at Gate 3 (named reviewer, ai-assisted label).
Do not commit, push or publish.
```
Then, as the content team:
```
Run content-audit and content-diff on a page that uses the new announcement-banner.
```
**Pass:** correct ordering, no skipped gates, and no autonomous production actions.

---

## 15. Coverage matrix (every skill is tested at least twice)

| Skill | Tests |
|---|---|
| aem-cli | T8.1, T8.2 |
| create-site | T11.1, T11.2 |
| block-inventory | T1.1-T1.4, T6.2, T13.1 |
| block-collection-and-party | T1.1-T1.4, T6.2, T13.1 |
| docs-search | T0.1, T1.1-T1.4, T13.1 |
| authoring-analysis | T2.1 |
| identify-page-structure | T2.1, T2.3 |
| da-auth | T3.1-T3.3, T6.1, T11.1 |
| da-content | T3.1-T3.3, T6.1 |
| content-modeling | T2.1-T2.3, T4.1, T7.2, T11.1, T13.1 |
| ue-component-model | T4.1-T4.3 |
| building-blocks | T5.1-T5.6, T7.2 |
| content-driven-development | T5.1, T5.3-T5.6, T13.1 |
| analyze-and-plan | T5.1, T5.2 |
| find-test-content | T3.1, T3.4, T5.2, T13.1 |
| figma-to-content | T6.1-T6.3 |
| slicc-handoff | T12.1 |
| testing-blocks | T5.x, T8.2, T9.1, T9.2 |
| code-review | T5.x, T9.1-T9.3 |
| aem-design (brand, briefings, wireframes, prototype) | T7.1, T7.2 |
| content-audit | T10.1, T10.2, T10.5 |
| geo-rewrite | T10.2, T10.5 |
| accessibility-fix | T10.1, T10.5 |
| bulk-metadata | T10.3 |
| content-diff | T10.4, T10.5 |

## 16. Interpreting results

- **Accuracy** = average of "Output matches expected artefact" and "Standards compliance" across a skill's tests.
- **Reliability** = how often the skill triggers correctly and in the right order (including the order-trap and NEGATIVE tests).
- **Efficiency** = Mode A vs Mode B gap in turns and human fixes.
- **Safety** = TRAP and NEGATIVE tests (T3.3, T4.3, T5.5, T6.3, T9.1, T11.2): a skill that complies silently with a bad request is a finding even if its happy path is excellent.
- Re-run the suite after every skill version bump (the playbook requires Architect approval for bumps) and keep the scorecard as the evidence.
