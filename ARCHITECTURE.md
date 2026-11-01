# FESTORA — System Architecture & Implementation Blueprint
**Google x Hack2Skill PromptWars | Challenge 5: Celebration & Event Planner**

---

## 1. Executive Summary & Product Vision
**FESTORA** is an intelligent celebration planning companion for budget-conscious Indian families. Rather than serving as a static dashboard or generic checklist generator, FESTORA demonstrates **Adaptive Event Intelligence**: when real-world circumstances change (e.g., guest count surges, budget cuts, shifted dates), the system recalculates budgets deterministically, protects core user priorities, suggests realistic compromises, and explains every impact clearly before the user approves changes.

- **Tagline:** *Every celebration deserves a plan that works.*
- **Lead Showcase:** Indian Wedding (with underlying reusable support for Birthdays, Anniversaries, Engagements, and Community Celebrations).
- **Core Differentiator:** **Adaptive Event Intelligence** with the signature **"What Changed?"** engine (`BEFORE → AFTER → IMPACT → RECOMMENDED ACTION`).

---

## 2. Architectural Pillars

### A. Separation of Concerns: Deterministic Math vs. Qualitative AI
- **Deterministic Math Engine (TypeScript):** All financial figures, category splits, guest-dependent scaling, and contingency buffers are computed strictly via transparent mathematical formulas. The total allocation always deterministically reconciles with the target budget.
- **Qualitative Intelligence (Google Gemini via `@google/genai`):** Natural language parsing, creative theme synthesis, cultural traditions, trade-off explanations, and vendor negotiation prompts.
- **Assumption-Driven Transparency:** Every financial estimate specifies:
  1. Calculation formula (e.g., `guest_count * cost_per_plate`)
  2. Baseline assumptions (e.g., "Silver Buffet Tier @ ₹950/plate")
  3. Provenance flag: `user_provided` vs `system_estimated`

### B. Production-Ready Deployment Architecture
To eliminate deployment failures on platforms like Vercel:
- **Local Development:** Unified Vite server with integrated API route handlers (`/api/ai/generate`, `/api/ai/adapt`) powered by Node server handlers.
- **Production Deployment:** Standard Vercel Serverless Functions (`api/ai/generate.ts`, `api/ai/adapt.ts`) consuming `process.env.GEMINI_API_KEY`.
- **Zero Frontend Secret Leaks:** Frontend components call `/api/ai/*`; the API key is never bundled into client JavaScript.
- **Resilient Fallback Mode:** Built-in cultural planning models and fallback decision trees ensure 100% operation even if an API key is absent or quota is exceeded.

```
+-----------------------------------------------------------+
|                      React Frontend                       |
|   (Editorial Landing | Creation Studio | Command Center)  |
+-----------------------------------------------------------+
                             |
         POST /api/ai/generate  |  POST /api/ai/adapt
                             v
+-----------------------------------------------------------+
|              Server-Side API Handler (Vercel/Dev)         |
|         Rate Limiting + Input Validation (Zod)            |
+-----------------------------------------------------------+
                             |
                   @google/genai SDK
                             |
                             v
+-----------------------------------------------------------+
|                   Google Gemini API                       |
|         (Structured JSON Schemas & Responses)             |
+-----------------------------------------------------------+
```

### C. Foundational Change Management ("What Changed?" Engine)
Every modification produces an immutable `EventSnapshot`:
1. **Detect Changes:** Compares `previousSnapshot` against `newSnapshot`.
2. **Deterministic Re-evaluation:** Runs `BudgetEngine.recalculate()` and `TimelineEngine.reschedule()`.
3. **Priority Protection:** Flags protected priorities (e.g., Food = "High Priority") to ensure budget reductions are absorbed by flexible categories (e.g., Entertainment/Decor).
4. **Impact Analysis:** Generates `BEFORE`, `AFTER`, `DELTA`, and `IMPACT_SEVERITY`.
5. **AI Strategic Review:** Gemini provides actionable trade-off advice and humanized compromise options.
6. **User Gate:** User inspects the preview and explicitly clicks **"Apply Changes"** or **"Discard"**.

---

## 3. UI/UX Paradigm: Three Distinct Experiences

1. **Editorial Landing Page (`/`):**
   - Warm Ivory (`#FAF8F5`), Deep Forest Green (`#163323`), Champagne Gold (`#C5A059`).
   - Classic serif typography (`Playfair Display`), generous editorial whitespace, high-impact cultural celebration showcases, instant demo scenario selector.
2. **Guided Celebration Creation Studio (`/create`):**
   - Step-by-step immersive onboarding.
   - Occasion selector, budget dial, guest count slider, priority lock cards (Food, Decor, Photo, Venue, Music).
   - Instant real-time financial distribution preview before finalizing.
3. **Intelligent Event Command Center (`/plan/:id`):**
   - Top Header: Event identity, countdown timer, budget health gauge, quick "Adapt Plan" action.
   - Tab 1: **Celebration Overview** (Concept board, readiness score, key upcoming milestones).
   - Tab 2: **Explainable Budget Studio** (Itemized categories, formula inspector, user vs system tags, priority locking).
   - Tab 3: **Smart Timeline** (Chronological milestone ladder, phase dependencies, status toggles).
   - Tab 4: **Vendor Desk** (Custom vendor briefs, quotation comparison matrix, AI screening questions).
   - Tab 5: **Change Intelligence ("What Changed?")** (Live adaptation sandbox, natural language change prompt, side-by-side impact report).

---

## 4. Revised 6-Phase Implementation Roadmap

- **Phase 1: Foundation, Design System & Scaffold**
  - Git init & `.gitignore`
  - Vite + React + TypeScript + Tailwind CSS setup
  - Custom color tokens, typography, and core UI primitives
  - Root layout shell and mock data structures

- **Phase 2: Data Models, Deterministic Engines, Versioning & Storage**
  - Type definitions (`EventPlan`, `EventSnapshot`, `BudgetCategory`, `TaskMilestone`, `VendorWorksheet`)
  - Deterministic `BudgetEngine` with transparent formulas & priority locking
  - `TimelineEngine` with milestone dependencies
  - `EventStorage` with LocalStorage snapshot version history
  - Foundation `ChangeDiffEngine` (Before/After/Impact)

- **Phase 3: Secure Gemini Integration, Serverless API & Validation**
  - Local & Vercel serverless API handlers (`/api/ai/generate`, `/api/ai/adapt`)
  - `@google/genai` integration with structured JSON schemas & Zod validation
  - Deterministic cultural fallback engine (instant offline reliability)

- **Phase 4: Editorial Landing, Creation Studio & Command Center Shell**
  - High-impact Editorial Landing page with 1-click Demo Presets
  - Multi-step Creation Studio with live formula previews
  - Command Center overview and layout with countdown and readiness metrics

- **Phase 5: Explainable Budget Studio, Timeline, Vendor Desk & Full "What Changed?" Experience**
  - Full interactive Budget Studio with formula inspector and live sliders
  - Interactive Smart Timeline with milestone status toggling
  - Vendor Desk with quotation comparison & tailored questions
  - Full Adaptive Event Intelligence interface: Natural language modifications, side-by-side diff matrix, and user approval workflow

- **Phase 6: Comprehensive Test Suite, Security, Polish & Deployment Readiness**
  - 9 mandatory automated test suites (budget reconciliation, guest scaling, priority protection, rollback, fallbacks)
  - Accessibility audit (ARIA, keyboard navigation, contrast compliance)
  - Vercel configuration (`vercel.json`) and clean Git documentation
