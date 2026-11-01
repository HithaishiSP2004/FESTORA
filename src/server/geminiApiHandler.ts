import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

/**
 * Model cascade:
 * 1. gemini-3.5-flash-lite: High capacity (15 RPM, 500 RPD, 1.3s latency)
 * 2. gemini-3.1-flash-lite: High capacity (15 RPM, 500 RPD, 1.5s latency)
 * 3. gemini-2.5-flash: Stable standard fallback (1.6s latency)
 * 4. gemini-3.8-flash: Latest Flash model
 */
export const MODEL_CASCADE = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.8-flash',
] as const;

/**
 * Retrieves GEMINI_API_KEY from environment or directly from .env file
 */
export function getApiKey(): string | undefined {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
    return process.env.GEMINI_API_KEY;
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const match = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
      if (match && match[1]) {
        const key = match[1].trim();
        if (key && key !== 'your_gemini_api_key_here') {
          process.env.GEMINI_API_KEY = key;
          return key;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading .env directly:', e);
  }
  return undefined;
}

// Rate Limiting helper: max 30 requests per minute
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (entry.count >= 30) {
    return false;
  }
  entry.count++;
  return true;
}

/**
 * Resolves allowed CORS origin for same-origin Vercel deployment,
 * preview environments, and local development.
 */
export function getAllowedOrigin(req: IncomingMessage): string {
  const origin = req.headers.origin;
  const host = req.headers.host;

  if (!origin) {
    return host ? `https://${host}` : '*';
  }

  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.vercel.app') ||
      (host && (origin === `https://${host}` || origin === `http://${host}`))
    ) {
      return origin;
    }
  } catch {
    // Malformed origin URL
  }

  return host ? `https://${host}` : 'null';
}

// Request validation schemas
export const GenerateConceptRequestSchema = z.object({
  occasion: z.string().min(1),
  subType: z.string().optional(),
  city: z.string().min(1),
  totalBudget: z.number().positive(),
  guestCount: z.number().positive(),
  priorities: z.record(z.string()),
});

export const BudgetCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['venue', 'catering', 'decor', 'photography', 'entertainment', 'attire', 'buffer']),
  allocatedAmount: z.number(),
  committedAmount: z.number().default(0),
  percentageOfTotal: z.number(),
  priority: z.enum(['high', 'medium', 'low']),
  isLocked: z.boolean(),
  costSource: z.enum(['system_estimated', 'user_provided']).default('system_estimated'),
  calculationBasis: z.string(),
  assumptions: z.string().optional().default(''),
  costPerUnit: z.number().optional(),
  unitLabel: z.string().optional(),
  unitCount: z.number().optional(),
});

export const AdaptPlanRequestSchema = z.object({
  changePrompt: z.string(),
  previousPlan: z.object({
    title: z.string(),
    occasion: z.string(),
    totalBudget: z.number(),
    guestCount: z.number(),
    city: z.string(),
    priorities: z.record(z.string()),
    budgetCategories: z.array(BudgetCategorySchema),
  }),
  proposedChanges: z.object({
    newBudget: z.number(),
    newGuestCount: z.number(),
    newDate: z.string().optional(),
  }),
});

// Output Zod Schemas
export const ConceptOutputSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  editorialSummary: z.string(),
  colorPalette: z.array(z.object({ name: z.string(), hex: z.string() })).min(2),
  culturalElements: z.array(z.string()).min(2),
  suggestedActivities: z.array(z.string()).min(2),
});

export const AdaptOutputSchema = z.object({
  strategicAdvice: z.string(),
  compromiseSuggestions: z.array(z.object({
    category: z.string(),
    description: z.string(),
    suggestedSavings: z.number(),
  })),
  culinaryAdjustments: z.string(),
  decorOptimizations: z.string(),
});

interface ServerlessRequest extends IncomingMessage {
  body?: unknown;
}

interface ServerlessResponse extends ServerResponse {
  status?: (code: number) => { json: (data: unknown) => void };
  json?: (data: unknown) => void;
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function parseJsonBody(req: IncomingMessage): Promise<unknown> {
  const serverlessReq = req as ServerlessRequest;
  // If running in Vercel Serverless environment where req.body is pre-parsed
  if (serverlessReq.body) {
    if (typeof serverlessReq.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(serverlessReq.body));
      } catch {
        return Promise.resolve({});
      }
    }
    return Promise.resolve(serverlessReq.body);
  }

  // Otherwise, stream-parse in standard Node / Vite dev server environment
  return new Promise((resolve, reject) => {
    let data = '';
    const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1MB payload ceiling (DOS security guard)
    let currentBytes = 0;

    req.on('data', chunk => {
      currentBytes += chunk.length;
      if (currentBytes > MAX_PAYLOAD_BYTES) {
        req.destroy(new Error('Payload Too Large: request body exceeds 1MB limit'));
        return;
      }
      data += chunk;
    });

    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown, req?: IncomingMessage) {
  const allowedOrigin = req ? getAllowedOrigin(req) : '*';
  const serverlessRes = res as ServerlessResponse;

  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }

  // Support both Vercel Serverless response helper and standard Node.js ServerResponse
  if (typeof serverlessRes.status === 'function') {
    const chain = serverlessRes.status(statusCode);
    if (chain && typeof chain.json === 'function') {
      chain.json(data);
      return;
    }
  }

  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  });
  res.end(JSON.stringify(data));
}

/**
 * Executes content generation across the model cascade.
 * Automatically tries fallback models if rate limits (429), timeouts or errors occur.
 */
async function generateWithCascade(
  ai: GoogleGenAI,
  prompt: string,
  timeoutMs: number = 6000
): Promise<{ text: string; modelUsed: string }> {
  let lastError: unknown = null;

  for (const model of MODEL_CASCADE) {
    try {
      console.log(`[Gemini Cascade] Attempting call with model: ${model}`);
      
      const callPromise = ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms on model ${model}`)), timeoutMs)
      );

      const response = await Promise.race([callPromise, timeoutPromise]);
      const text = response.text || '';
      if (text && text.trim()) {
        console.log(`[Gemini Cascade] Succeeded with model: ${model}`);
        return { text, modelUsed: model };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini Cascade] Model ${model} failed (${msg}). Cascading to next fallback...`);
      lastError = err;
    }
  }

  throw (lastError instanceof Error ? lastError : new Error('All cascade models failed'));
}

/**
 * Fallback concept generator when API key is missing or all remote models exhausted
 */
function getFallbackConcept(body: z.infer<typeof GenerateConceptRequestSchema>) {
  const occasion = body.occasion.toLowerCase();
  if (occasion.includes('wedding')) {
    return {
      title: 'Regal Heritage & Starlit Elegance',
      tagline: 'Timeless familial traditions elevated with contemporary warmth.',
      editorialSummary: `A meticulously balanced celebration for ${body.guestCount} guests in ${body.city}. The plan prioritizes culinary artistry and lasting memories while keeping logistics effortless.`,
      colorPalette: [
        { name: 'Heritage Emerald', hex: '#163323' },
        { name: 'Champagne Gold', hex: '#C5A059' },
        { name: 'Royal Ivory', hex: '#FAF8F5' },
        { name: 'Terracotta Coral', hex: '#D9734E' },
      ],
      culturalElements: [
        'Aromatic fresh Jasmine and Marigold floral welcome torans',
        'Live regional shehnai or instrumental acoustic performance during reception',
        'Traditional brass Urlis with floating rose petals and fragrant candles',
      ],
      suggestedActivities: [
        'Family Sangeet celebration with choreographed generational entries',
        'Artisanal Mehendi & Gifting corner with regional souvenirs',
        'Interactive live Mithai / dessert bar featuring regional delicacies',
      ],
    };
  }

  return {
    title: 'Golden Milestone & Joyous Gathering',
    tagline: 'Gathering generations to honor cherished memories and future milestones.',
    editorialSummary: `An intimate and sophisticated celebration for ${body.guestCount} beloved guests in ${body.city}, carefully allocating resources toward culinary delight and guest comfort.`,
    colorPalette: [
      { name: 'Warm Amber', hex: '#C5A059' },
      { name: 'Deep Forest', hex: '#163323' },
      { name: 'Ivory Cream', hex: '#FAF8F5' },
      { name: 'Burgundy Wine', hex: '#6B2D3C' },
    ],
    culturalElements: [
      'Blessing ceremony with floral garland exchange',
      'Memory gallery wall showcasing nostalgic family moments',
      'Curated welcome drinks and traditional savory delights',
    ],
    suggestedActivities: [
      'Generational storytelling and heartfelt toast tributes',
      'Live acoustic melody set featuring vintage celebratory hits',
      'Signature cake-cutting ceremony surrounded by loved ones',
    ],
  };
}

/**
 * Fallback adaptation advice
 */
function getFallbackAdaptation(
  body: z.infer<typeof AdaptPlanRequestSchema>,
  guestDiff: number,
  budgetDiff: number
) {
  const compromises = [];
  if (guestDiff > 0 && budgetDiff <= 0) {
    compromises.push({
      category: 'Decoration & Floral Setup',
      description: 'Switch from imported exotic floral arrangements to local seasonal blooms (Marigold, Rajnigandha, and Tuberoses) to save costs without sacrificing aesthetic density.',
      suggestedSavings: 25000,
    });
    compromises.push({
      category: 'Sound, DJ & Entertainment',
      description: 'Opt for an experienced local DJ and playlist orchestration rather than a multi-piece live band.',
      suggestedSavings: 18000,
    });
  }

  return {
    strategicAdvice: guestDiff > 0 && budgetDiff < 0
      ? `To comfortably accommodate ${guestDiff} additional guests while lowering total expenditure by ₹${Math.abs(budgetDiff).toLocaleString('en-IN')}, FESTORA has prioritized food and core banquet comfort. By streamlining decor elements to elegant local botanicals and simplifying live entertainment staging, your guests will experience uncompromised hospitality while remaining safely inside your updated ₹${body.proposedChanges.newBudget.toLocaleString('en-IN')} budget.`
      : `Your celebration plan has been synchronized with the updated parameters. All calculations adhere to your locked priorities.`,
    compromiseSuggestions: compromises,
    culinaryAdjustments: `Focus on high-satisfaction live counters (e.g. Chaat and Dosa stations) alongside an optimized 3-course buffet to maximize guest delight while maintaining per-plate economy.`,
    decorOptimizations: `Concentrate floral embellishments on high-visibility zones (entrance arch and photo backdrop) rather than peripheral guest seating tables.`,
  };
}

/**
 * Handle POST /api/ai/generate
 */
export async function handleAiGenerate(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' }, req);
    return;
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    sendJson(res, 429, { error: 'Rate limit exceeded. Please wait a minute.' }, req);
    return;
  }

  try {
    const rawBody = await parseJsonBody(req);
    const parsed = GenerateConceptRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      sendJson(res, 400, { error: 'Invalid request body', details: parsed.error.issues }, req);
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      // Deterministic cultural fallback mode (zero downtime guarantee)
      const fallback = getFallbackConcept(parsed.data);
      sendJson(res, 200, { concept: fallback, source: 'fallback_template', modelUsed: 'offline_cultural_template' }, req);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are the executive celebration designer for FESTORA, an intelligent celebration planning platform for Indian families.
Generate a tailored, culturally refined celebration concept in strict JSON format.

Occasion: ${parsed.data.occasion} (${parsed.data.subType || 'Traditional & Modern'})
City: ${parsed.data.city}
Total Budget: ₹${parsed.data.totalBudget.toLocaleString('en-IN')}
Guest Count: ${parsed.data.guestCount}
Priorities: ${JSON.stringify(parsed.data.priorities)}

Respond ONLY with a JSON object matching this schema:
{
  "title": "Creative celebration title (e.g., 'Royal Marigold & Champagne Splendor')",
  "tagline": "Inspiring one-line tagline",
  "editorialSummary": "2-3 sentences explaining the design philosophy and balancing tradition with modern hospitality",
  "colorPalette": [
    { "name": "Emerald Green", "hex": "#163323" },
    { "name": "Champagne Gold", "hex": "#C5A059" },
    { "name": "Warm Ivory", "hex": "#FAF8F5" },
    { "name": "Rose Blush", "hex": "#DCA5A5" }
  ],
  "culturalElements": [
    "3 specific, authentic cultural or regional ritual touches tailored for ${parsed.data.city}"
  ],
  "suggestedActivities": [
    "3 engaging, high-warmth guest experiences"
  ]
}
`;

    const { text, modelUsed } = await generateWithCascade(ai, prompt);
    const cleanJson = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    const validated = ConceptOutputSchema.parse(cleanJson);

    sendJson(res, 200, { concept: validated, source: 'gemini', modelUsed }, req);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown generation error';
    console.error('Gemini generate error, engaging cultural template fallback:', errorMsg);
    const fallback = getFallbackConcept({
      occasion: 'wedding',
      city: 'India',
      totalBudget: 800000,
      guestCount: 200,
      priorities: {},
    });
    // Sanitize user-facing message to prevent leaking internal stack traces or API details
    sendJson(res, 200, {
      concept: fallback,
      source: 'error_fallback',
      warning: 'AI generation temporarily unavailable; resilient cultural template engaged.',
      modelUsed: 'offline_cultural_template'
    }, req);
  }
}

/**
 * Handle POST /api/ai/adapt
 */
export async function handleAiAdapt(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' }, req);
    return;
  }

  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    sendJson(res, 429, { error: 'Rate limit exceeded. Please wait a minute.' }, req);
    return;
  }

  try {
    const rawBody = await parseJsonBody(req);
    const parsed = AdaptPlanRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      sendJson(res, 400, { error: 'Invalid request body', details: parsed.error.issues }, req);
      return;
    }

    const prev = parsed.data.previousPlan;
    const proposed = parsed.data.proposedChanges;
    const guestDiff = proposed.newGuestCount - prev.guestCount;
    const budgetDiff = proposed.newBudget - prev.totalBudget;

    const apiKey = getApiKey();
    if (!apiKey) {
      const fallback = getFallbackAdaptation(parsed.data, guestDiff, budgetDiff);
      sendJson(res, 200, { adaptation: fallback, source: 'fallback_template', modelUsed: 'offline_cultural_template' }, req);
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are the Adaptive Intelligence Engine of FESTORA, an event planner for Indian celebrations.
The user is requesting a change to their celebration plan:
"${parsed.data.changePrompt}"

Original Plan:
- Budget: ₹${prev.totalBudget.toLocaleString('en-IN')}
- Guests: ${prev.guestCount}
- Priorities: ${JSON.stringify(prev.priorities)}

Proposed Plan:
- New Budget: ₹${proposed.newBudget.toLocaleString('en-IN')}
- New Guests: ${proposed.newGuestCount}
- Budget Difference: ₹${budgetDiff.toLocaleString('en-IN')}
- Guest Difference: ${guestDiff > 0 ? '+' : ''}${guestDiff}

Provide strategic trade-off advice and realistic compromise ideas that protect their high-priority items.
Respond ONLY with a JSON object matching this schema:
{
  "strategicAdvice": "Insightful 2-3 sentence strategic explanation of how to manage this transition gracefully.",
  "compromiseSuggestions": [
    {
      "category": "Specific category name (e.g. Decoration & Floral Setup)",
      "description": "Concrete, actionable compromise recommendation",
      "suggestedSavings": 25000
    }
  ],
  "culinaryAdjustments": "Actionable advice on catering menu optimization or plate efficiency.",
  "decorOptimizations": "Advice on stage, entrance, or floral adjustments."
}
`;

    const { text, modelUsed } = await generateWithCascade(ai, prompt);
    const cleanJson = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    const validated = AdaptOutputSchema.parse(cleanJson);

    sendJson(res, 200, { adaptation: validated, source: 'gemini', modelUsed }, req);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown adaptation error';
    console.error('Gemini adapt error, engaging fallback:', errorMsg);
    const fallback = getFallbackAdaptation({
      changePrompt: 'Adjust parameters',
      previousPlan: {
        title: 'Celebration',
        occasion: 'wedding',
        totalBudget: 800000,
        guestCount: 200,
        city: 'India',
        priorities: {},
        budgetCategories: [],
      },
      proposedChanges: {
        newBudget: 700000,
        newGuestCount: 250,
      }
    }, 50, -100000);
    // Sanitize user-facing message to prevent leaking internal stack traces or API details
    sendJson(res, 200, {
      adaptation: fallback,
      source: 'error_fallback',
      warning: 'AI adaptation temporarily unavailable; resilient trade-off fallback engaged.',
      modelUsed: 'offline_cultural_template'
    }, req);
  }
}
