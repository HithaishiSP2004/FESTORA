PHASE 0 — PRODUCT STRATEGY
1. First, let's identify our product

I don't want another generic AI Event Planner with:

A dashboard full of cards.
A chatbot sitting in the corner.
A budget calculator.
A checklist generator.
Some random AI-generated party themes.

That is precisely what hundreds of participants might build.

We need something that demonstrates actual decision-making.

My proposed product: FESTORA

Tagline: Every celebration deserves a plan that works.

A GenAI-powered event planning companion that transforms a person's celebration idea into an executable plan, continuously adapting its budget, priorities, timeline and vendor requirements whenever circumstances change.

The distinguishing feature:

Adaptive Event Intelligence — Your event plan evolves with your decisions.

Imagine this:

A family initially plans a wedding:

Parameter	Initial plan
Budget	₹8,00,000
Guests	200
Planning period	4 months
Priority 1	Food
Priority 2	Photography
Priority 3	Decoration
Event style	Traditional + modern

The AI creates a complete plan.

Now the user says:

"We have to accommodate 50 additional guests, but our budget has decreased to ₹7 lakh."

A generic assistant generates another response.

FESTORA should:

Understand the changes.
Recalculate the estimated expenses.
Identify which categories are affected.
Protect the user's important priorities.
Recommend realistic compromises.
Update the timeline and vendor requirements.
Explain exactly what changed.

That is our competitive advantage.

2. Define our target persona

I recommend focusing on:

Budget-conscious Indian families organizing personal celebrations.

Our supported occasions:

Weddings
Birthdays
Anniversaries
Engagements
Community gatherings

But our primary demonstration scenario will be an Indian wedding.

Why?

Because it naturally demonstrates:

Large budgets.
Multiple vendors.
Guest-count dependencies.
Cultural preferences.
Food and decoration priorities.
Complex timelines.
Last-minute changes.

We can support other occasions without building five separate applications.

3. The core application parameters

These are the features I want Antigravity to implement.

Module	Functionality	Priority
Event Intelligence	Understand event requirements using Gemini	Critical
Adaptive Budget	Category-wise allocation and recalculation	Critical
Smart Timeline	Generate prioritized tasks and deadlines	Critical
Change Intelligence	Recalculate plans when circumstances change	Critical
Vendor Intelligence	Vendor requirements, quotation comparison and questions	High
Celebration Studio	Personalized themes, activities and ideas	High
Event Overview	Unified view of event progress	High
Our special feature: What Changed?

This deserves special attention.

Every time a user modifies an event, the application should display:

BEFORE → AFTER → IMPACT → RECOMMENDED ACTION

Example:

Guest count: 200 → 250

Catering: Estimated increase.
Seating: Additional arrangements required.
Venue: Capacity must be verified.
Invitations: Guest list needs updating.
Budget: ₹45,000 additional estimated expenditure.

These numbers should come from our transparent calculation engine, not arbitrary Gemini-generated figures.

Gemini interprets the request and recommends decisions. Our application calculates the financial consequences deterministically.

This separation is important for code quality and reliability.

4. UI/UX — No generic Antigravity dashboard

This is where I want us to be particularly strict.

Our visual direction:

Premium editorial event-planning experience meets intelligent command centre.

Think of a sophisticated event-design studio, not a SaaS administration template.

Visual identity:

Warm ivory backgrounds.
Deep forest green.
Champagne gold accents.
Elegant serif display typography.
Modern sans-serif interface typography.
Subtle glass surfaces.
Generous whitespace.
Editorial photography.
Beautiful transitions.
Carefully controlled animations.

Avoid:

Generic purple AI gradients.
Excessive rounded cards.
Every element inside a box.
Standard sidebar-dashboard layouts.
Unnecessary charts.
Floating chatbot widgets.
Excessive glassmorphism.
Proposed application structure
Welcome Experience — A beautiful landing experience introducing FESTORA.
Create Celebration — Conversational event onboarding.
Your Celebration — Main event overview.
Budget Studio — Interactive financial allocation.
Timeline — Prioritized event preparation.
Vendor Desk — Vendor requirements and quotations.
AI Planning Companion — Context-aware planning and modifications.

The experience should be responsive, with mobile interactions designed intentionally rather than squeezed into a desktop layout.

5. Technical architecture

We have Gemini API access, so let's use it where it genuinely matters.

My recommended stack:

Layer	Technology
Frontend	React + Vite + TypeScript
Styling	Tailwind CSS
Components	Custom components
Icons	Lucide
AI	Gemini API
Data validation	Zod
Charts	Recharts, only where useful
Persistence	LocalStorage
Deployment	Vercel
Version control	GitHub
Architecture
             FESTORA
                |
         React Application
                |
       Application State Layer
                |
       ---------------------
       |         |         |
     Budget   Timeline   Vendors
     Engine    Engine    Manager
       |         |         |
       ---------------------
                |
         AI Orchestration
                |
           Gemini API
                |
       Structured JSON Output
                |
        Validation with Zod
                |
       Application State Update
                |
          LocalStorage
Important security decisions
Gemini API key must never appear in committed frontend code.
Use a server-side API endpoint to communicate with Gemini.
Keep .env out of GitHub.
Provide .env.example with placeholder values.
Validate Gemini responses.
Handle API failures gracefully.
Never represent estimated prices as confirmed quotations.

For our three-hour deadline, we should avoid unnecessary databases, authentication systems and complex infrastructure.

PHASE 1 — GIVE ANTIGRAVITY THE PRODUCT CONSTITUTION

Now we start implementation.

Do not ask Antigravity to build the application yet.

First, give it the following prompt. This establishes the product requirements, boundaries and design philosophy.

Your Optimized Prompt — Antigravity Phase 1
PROJECT: FESTORA
CHALLENGE: GOOGLE x HACK2SKILL PROMPTWARS VIRTUAL
CHALLENGE 5: CELEBRATION & EVENT PLANNER

ROLE:

You are acting as a senior product architect, principal
frontend engineer, AI application engineer and premium
product designer.

You are responsible for building FESTORA, a production-
quality GenAI-powered celebration and event planning
application.

This is a competitive hackathon submission.

The application must demonstrate genuine intelligence,
practical usefulness, reliable decision-making,
maintainable code and exceptional UI/UX.

PRODUCT VISION:

FESTORA is an intelligent celebration planning companion
for budget-conscious Indian families.

It helps users transform an event idea into an actionable
plan containing:

1. Personalized event recommendations.
2. Intelligent budget allocation.
3. Prioritized preparation timelines.
4. Vendor requirements and quotation comparisons.
5. Adaptive planning when circumstances change.

SUPPORTED EVENTS:

- Weddings
- Birthdays
- Anniversaries
- Engagements
- Community gatherings

PRIMARY DIFFERENTIATOR:

ADAPTIVE EVENT INTELLIGENCE.

The application must understand that event planning
involves interconnected decisions.

Changes to guest count, budget, date, venue or user
priorities must trigger an appropriate reassessment
of the existing plan.

Example:

Initial:
Budget: ₹8,00,000
Guests: 200
Duration: 4 months

Updated:
Budget: ₹7,00,000
Guests: 250

The application must identify affected categories,
recalculate estimates, explain trade-offs and suggest
appropriate actions.

It must preserve user-defined priorities wherever
possible.

AI RESPONSIBILITIES:

Use Gemini API for:

- Understanding natural language requirements.
- Generating personalized event concepts.
- Recommending budget adjustments.
- Generating practical task timelines.
- Understanding user-requested plan modifications.
- Preparing vendor questions and quotation analyses.

IMPORTANT:

Never allow AI-generated estimates to silently become
confirmed prices.

Use deterministic application logic for financial
calculations.

Validate AI responses before applying changes.

Clearly communicate assumptions and uncertainty.

PRODUCT DESIGN:

Create a distinctive premium editorial experience.

Visual direction:

- Warm ivory.
- Deep forest green.
- Champagne gold.
- Elegant serif headlines.
- Modern sans-serif body typography.
- Refined whitespace.
- Editorial imagery.
- Subtle transitions.
- Sophisticated micro-interactions.

STRICTLY AVOID:

- Generic AI-generated dashboard designs.
- Default SaaS templates.
- Purple AI gradients.
- Excessive rounded cards.
- Unnecessary charts.
- Generic chatbot interfaces.
- Repetitive card grids.
- Unnecessary sidebars.
- Decorative components without functionality.

The interface must feel like a carefully designed
premium consumer product.

TECHNICAL DIRECTION:

- React
- Vite
- TypeScript
- Tailwind CSS
- Gemini API
- Zod
- Lucide icons
- LocalStorage

Use a secure server-side endpoint for Gemini API calls.

Keep credentials in environment variables.

Maintain a clean separation between:

- UI components
- Application state
- AI orchestration
- Budget calculations
- Timeline generation
- Vendor management
- Validation
- Persistence

HACKATHON REQUIREMENTS:

The application must be functional and demonstrable.

Prioritize:

1. Problem statement alignment.
2. Code quality.
3. Security.
4. Efficiency.
5. Testing.
6. Accessibility.

Do not introduce unnecessary infrastructure.

Do not fabricate real vendor availability.

Do not build features that cannot be demonstrated.

DEVELOPMENT RULES:

We will build this application phase by phase.

Do not implement everything immediately.

Do not overwrite existing project files without
first inspecting them.

Do not replace working components unnecessarily.

Do not introduce mock functionality that is presented
as real functionality.

Do not leave broken navigation or nonfunctional buttons.

Every major feature must have a meaningful interaction.

Keep the repository lightweight and below 10 MB.

Maintain a single Git branch.

FIRST TASK:

Inspect the current repository and environment.

Then provide:

1. Current repository structure.
2. Recommended application architecture.
3. Proposed page and component hierarchy.
4. Critical implementation dependencies.
5. Identified risks and constraints.
6. A phased implementation plan.

Do not start implementation yet.

Wait for approval before proceeding.