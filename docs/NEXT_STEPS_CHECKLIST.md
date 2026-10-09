# Quick Start: Adobe Skills Validation — Next Steps

**Status:** Session 1 complete ✅  
**Start time for Session 2:** Now  
**Expected duration:** 30-60 minutes for unblocking all tests

---

## ✅ What was already done (Session 1)

- [x] Validated 4 key tests (T0.1, T1.1, T4.1, T9.3)
- [x] Created INSTRUCTIONS.md (263 lines)
- [x] Created AGENTS.md (365 lines)
- [x] Documented 5 evidence files (~1,500 lines)
- [x] Identified 9 blockers + 8 resolved gaps

---

## 🚀 What you need to do NOW (Session 2)

### Blocking issue 1: CSS linting errors (QUICK FIX)

**Files to fix:** 3 CSS files  
**Issue:** Stylelint expects modern media query syntax  
**Fix takes:** ~5 minutes

```powershell
# Option 1: Auto-fix (recommended)
npm install -g @adobe/aem-cli
# Then run test to verify

# Option 2: Manual fix
# Edit these 3 files and change this line:
#   @media (max-width: 768px) {
# To:
#   @media (width <= 768px) {

# Files:
# 1. blocks/cards-team/cards-team.css (line 57)
# 2. blocks/hero-adventure/hero-adventure.css (line 38)
# 3. blocks/hero-featured/hero-featured.css (line 50)
```

### Blocking issue 2: aem CLI not installed

**Current:** `npx @adobe/aem-cli up` (works, slower)  
**Desired:** `aem up` (installed globally, faster)

```powershell
npm install -g @adobe/aem-cli

# Verify:
aem --version
```

### Blocking issue 3: CRLF/LF line ending violations

**Status:** Optional (blocking only strict enforcement)  
**Fix takes:** ~2 minutes

```powershell
# View current setting:
git config core.autocrlf

# Set to auto-convert:
git config core.autocrlf true

# Convert existing files:
git add -A
git commit -m "Convert line endings to LF"
```

---

## 📋 Session 2 Test Plan (Pick one of 3 paths)

### 🟢 Path A: Fastest validation (30 min)
```
1. Fix CSS errors (5 min)
2. Install aem CLI (2 min)
3. Run T8.1: aem up --no-open (3 min, verify server starts)
4. Run T0.1 again (should PASS now, 10 min)
5. Run T1.1 again with Mode A vs Mode B (10 min, compare turns)
```

### 🟡 Path B: Comprehensive governance (45 min)
```
1. Fix CSS errors (5 min)
2. Add .github/CODEOWNERS (5 min)
3. Update CONTRIBUTING.md with ai-assisted requirement (5 min)
4. Run T9.3 again (should improve to 75%+, 10 min)
5. Fix CRLF/LF line endings (5 min)
6. Run full lint suite (npm run lint, 10 min)
```

### 🔵 Path C: Full block build (60 min)
```
1. Fix CSS errors (5 min)
2. Install aem CLI (2 min)
3. Run aem up (start dev server, 3 min)
4. Run T5.1 content-driven-development (build new "feature-cards" block, 30 min)
5. Run testing-blocks on the new block (Lighthouse validation, 15 min)
6. Run code-review on the new block (standards check, 5 min)
```

---

## 📁 Files to reference

### Critical documentation (read these first)
- `INSTRUCTIONS.md` — Project conventions, block library, code standards
- `AGENTS.md` — Adobe skill guide and invocation patterns

### Evidence files (read for context)
- `docs/SESSION_1_SUMMARY.md` — Overview of what was done
- `docs/T0.1-context-grounding-evidence.md` — Authoring model validation
- `docs/T1.1-block-reuse-evidence.md` — Block reuse discovery
- `docs/T4.1-ue-component-model-evidence.md` — UE JSON validation
- `docs/T9.3-governance-evidence.md` — Governance and merge-readiness

### Test protocol
- `EDS_Skill_Chain_Test_Prompts.md` — Full 40-test validation framework (how to run tests)

---

## ✅ Checklist for Session 2

### Immediate actions (do these first)
- [ ] Read INSTRUCTIONS.md (10 min)
- [ ] Read AGENTS.md (10 min)
- [ ] Fix the 3 CSS linting errors (5 min)
- [ ] Run `npm run lint:css` to verify fixes (2 min)

### Choose your path
- [ ] **Path A:** Quick validation (30 min total)
- [ ] **Path B:** Governance improvements (45 min total)
- [ ] **Path C:** Full block build (60 min total)

### After completing your path
- [ ] Capture any new evidence in a new file: `docs/T*.2-{test-name}-round2.md`
- [ ] Update `docs/VALIDATION_SUMMARY.md` with new results
- [ ] Note any new blockers or findings

### Before committing (if code changes made)
- [ ] Run `npm run lint` (all tests pass)
- [ ] Verify no console errors
- [ ] If AI-generated: include `ai-assisted` in commit message

---

## 🎯 Success criteria

### T8.1 success
```
✓ aem up starts
✓ Server responds on http://localhost:3000
✓ No auth errors
✓ Preview page loads
```

### T0.1 re-run success
```
✓ INSTRUCTIONS.md is found and read
✓ AGENTS.md is found and read
✓ All 23 blocks are listed
✓ Authoring model confirmed (UE)
✓ No invented details
Result: Should now PASS (was PARTIAL)
```

### T1.1 Mode comparison success
```
Mode A (explicit skill names):
- X turns
- Y accuracy score

Mode B (baseline/plain language):
- Compare turns and accuracy
- Record difference
```

### T5.1 block build success
```
✓ New block .js created
✓ New block .css created
✓ Component model added to component-models.json
✓ Component definition added to component-definition.json
✓ Nesting rules added to component-filters.json
✓ Lighthouse green (Performance ≥95, Accessibility=100, Best Practices=100, SEO=100)
✓ Code review passes all checks
```

---

## 🆘 If you get stuck

1. **"INSTRUCTIONS.md not found"** → It's at repo root, not in docs/
2. **"aem command not found"** → Run `npm install -g @adobe/aem-cli`
3. **"CSS still has errors"** → Check you edited the right lines (line numbers in docs/T9.3-evidence)
4. **"Skill refused to run"** → Check AGENTS.md applicability matrix (skill might not apply to UE)
5. **"Lost track of what to do"** → Read docs/SESSION_1_SUMMARY.md again (has all context)

---

## 📊 Progress tracking

After Session 2, you should have:

| Metric | Session 1 | Session 2 goal | Final |
|---|---|---|---|
| Tests validated | 4/40 | 6-8/40 | 40/40 |
| Pass rate | 50% | 60%+ | 80%+ |
| Average efficiency | 80% | 85%+ | 90%+ |
| Critical blockers | 2 | 0 | 0 |
| Documentation lines | 2,000+ | +500-1000 | ~3,000 |

---

## 🎓 Learning outcomes

After this session, you'll understand:
- ✓ How Adobe EDS skills work (orchestration, chaining, prerequisites)
- ✓ How to validate blocks (T0.1-T4.1 pattern)
- ✓ How to build blocks (T5.x pattern)
- ✓ How to audit content (T10.x pattern)
- ✓ Governance requirements for AI-assisted development

---

## 👉 Start here

1. Open `INSTRUCTIONS.md` and read "Code standards" section (5 min)
2. Open `AGENTS.md` and scan "How to invoke skills" section (5 min)
3. Choose **Path A, B, or C** above
4. Execute your chosen path (30-60 min)
5. Document any new findings
6. Report results to team

**Expected outcome:** More tests validated, better evidence, clearer picture of what works and what needs fixing.

---

**Ready to continue? Start with: `npm install -g @adobe/aem-cli`**


