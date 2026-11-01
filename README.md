# FESTORA — Adaptive Event Intelligence
> **Every celebration deserves a plan that works.**  
> Google x Hack2Skill PromptWars Virtual | **Challenge 5: Celebration & Event Planner**

---

## 🌟 Overview & Differentiator

Most AI event planners are either static card dashboards or generic conversational chatbots that hallucinate shifting budget numbers. 

**FESTORA** is engineered around **Adaptive Event Intelligence**:
Whenever real-world conditions change (e.g. *accommodate 50 extra guests, but budget dropped by ₹1,00,000*), FESTORA:
1. **Recalculates budgets deterministically** in TypeScript down to the exact single rupee.
2. **Protects sacred user priorities** (e.g., shielding Food/Catering or booked Venue from arbitrary cuts).
3. **Absorbs trade-offs proportionally** across flexible categories.
4. **Engages Google Gemini (`@google/genai`)** to formulate strategic compromise advice.
5. **Displays the signature diff:** `BEFORE → AFTER → IMPACT → RECOMMENDED ACTION`.
6. **Requires explicit user approval** before creating an immutable version snapshot.

---

## 🏛️ System Architecture

```
                                  +------------------------------------+
                                  |              FESTORA               |
                                  |     (React 18 + TypeScript + Vite) |
                                  +------------------------------------+
                                                     |
                                                     v
                                  +------------------------------------+
                                  |       Application State Layer      |
                                  |   (Context / State + LocalStorage) |
                                  +------------------------------------+
                                        |            |             |
                 +----------------------+            |             +----------------------+
                 v                                   v                                    v
     +-----------------------+           +-----------------------+            +-----------------------+
     |     Budget Engine     |           |    Timeline Engine    |            |    Vendor Manager     |
     | (Deterministic Math & |           |  (Milestone scheduler,|            |  (Quotation analysis, |
     |  category allocation) |           |   dependencies, tasks)|            |   screening questions)|
     +-----------------------+           +-----------------------+            +-----------------------+
                 \                                   |                                   /
                  +----------------------------------+----------------------------------+
                                                     |
                                                     v
                                  +------------------------------------+
                                  |       AI Orchestration Client      |
                                  +------------------------------------+
                                                     |
                                                     v
                                  +------------------------------------+
                                  |   Secure Server-Side API Handler   |
                                  |  (/api/ai/generate, /api/ai/adapt) |
                                  +------------------------------------+
                                                     |
                                                     v
                                  +------------------------------------+
                                  |        Google Gemini 2.5 Flash     |
                                  |       (@google/genai SDK + Zod)    |
                                  +------------------------------------+
                                                     |
                                                     v
                                  +------------------------------------+
                                  |       "What Changed?" Engine       |
                                  | (Before vs After Diff & Snapshots) |
                                  +------------------------------------+
```

### Key Architectural Decisions:
- **Separation of Math and AI:** Gemini provides qualitative reasoning, cultural nuance, and compromise phrasing. The TypeScript engine computes exact numbers and ensures 100% budget reconciliation.
- **Production-Ready & Secure:** Vite dev server and Vercel Serverless Functions share the exact same API handler (`/api/ai/*`). The Gemini API key remains strictly server-side and is never exposed to the frontend bundle.
- **Resilient Fallback Mode:** Built-in cultural planning benchmarks ensure the application runs smoothly even if an API key is missing or quota is depleted.

---

## 🎨 Three Distinct Editorial Experiences

1. **Editorial Landing Page (`/`):**
   - Palette: Warm Ivory (`#FAF8F5`), Deep Forest Green (`#163323`), Champagne Gold (`#C5A059`).
   - Serif typography (`Playfair Display`, `Cinzel`), generous whitespace, live simulation showcases, and 1-click launch presets.
2. **Guided Celebration Creation Studio (`/create`):**
   - Immersive 4-step wizard: Occasion & City, Budget Dial & Headcount, Priority Shielding, and AI Synthesis.
3. **Intelligent Event Command Center (`/workspace`):**
   - **Header:** Countdown timer, scale metrics, 100% reconcile indicator, and quick "Adapt Plan" trigger.
   - **Tab 1: Celebration Overview:** Gemini-synthesized concept board, color swatches, cultural elements, and readiness score.
   - **Tab 2: Explainable Budget Studio:** Every figure reveals its formula, baseline assumptions, and user-provided vs model-estimated tags.
   - **Tab 3: Smart Timeline:** Milestone dependencies, auto-synchronized target dates, and completion celebrations.
   - **Tab 4: Vendor Desk:** Custom vendor requirements, screening questions, and side-by-side quotation comparison matrix.
   - **Modal: "What Changed?" Engine:** Live simulation sandboxes, natural language modifications, side-by-side BEFORE vs AFTER diffs, and approval gates.
   - **Modal: Snapshot History:** Auditable version tracking with 1-click restore/rollback.

---

## 🧪 Comprehensive Automated Test Suite (9 Scenarios)

All 9 mandatory test scenarios are implemented in `src/tests/festora.test.ts` and pass with 100% success:

| # | Test Scenario | Verified Behavior |
|---|---|---|
| 1 | **Budget Allocation** | Sum of all allocated categories strictly equals target budget to the single rupee with 5% statutory buffer. |
| 2 | **Guest Headcount Scaling** | Guest increases recalculate catering and seating capacity while reconciling total budget. |
| 3 | **Budget Reduction** | Budget cuts trigger calculated compromises in flexible categories while preserving core priorities. |
| 4 | **Event Date Change** | Shifted event dates deterministically recalculate all chronological milestone deadlines. |
| 5 | **Priority Locking** | Shielded categories remain strictly protected during adverse parameter changes. |
| 6 | **Zod AI Validation** | Invalid AI responses throw errors while structured JSON schemas validate cleanly. |
| 7 | **Impact Severity** | Critical double-binds (+guests, -budget) are flagged with appropriate severity badges. |
| 8 | **LocalStorage Persistence** | Current plans and snapshot version histories are preserved across reloads. |
| 9 | **Snapshot Rollback** | Historical plan versions can be restored in 1 click with full state integrity. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- `pnpm` (or `npm`)

### Installation & Run

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure Environment (Optional):**
   Copy `.env.example` to `.env` and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: FESTORA includes intelligent cultural fallback templates, so the application runs 100% offline even without an API key).*

3. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Run Automated Tests:**
   ```bash
   pnpm test
   ```

5. **Build for Production:**
   ```bash
   pnpm run build
   ```
   Output bundle size: **< 350 kB** (extremely lightweight, far under the 10 MB limit).

