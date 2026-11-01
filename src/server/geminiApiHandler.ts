import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

/**
 * Model cascade:
 * Primary: gemini-3.8-flash (Latest state-of-the-art text model)
 * Fallback 1: gemini-3.5-flash-lite (Massive quota: 15 RPM, 500 RPD)
 * Fallback 2: gemini-3.1-flash-lite (Massive quota: 15 RPM, 500 RPD)
 * Fallback 3: gemini-2.5-flash (Standard stable fallback)
 */
export const MODEL_CASCADE = [
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
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

// Request validation schemas
const GenerateConceptRequestSchema = z.object({
  occasion: z.string(),
  subType: z.string().optional(),
  city: z.string(),
  totalBudget: z.number().positive(),
  guestCount: z.number().positive(),
  priorities: z.record(z.string()),
});

const AdaptPlanRequestSchema = z.object({
  changePrompt: z.string(),
  previousPlan: z.object({
    title: z.string(),
    occasion: z.string(),
    totalBudget: z.number(),
    guestCount: z.number(),
    city: z.string(),
    priorities: z.record(z.string()),
    budgetCategories: z.array(z.any()),
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

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
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

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

/**
 * Executes content generation across the model cascade.
 * Automatically tries fallback models if rate limits (429) or errors occur.
 */
async function generateWithCascade(
  ai: GoogleGenAI,
  prompt: string
): Promise<{ text: string; modelUsed: string }> {
  let lastError: any = null;

  for (const model of MODEL_CASCADE) {
    try {
      console.log(`[Gemini Cascade] Attempting call with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '';
      if (text.trim()) {
        console.log(`[Gemini Cascade] Succeeded with model: ${model}`);
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      console.warn(`[Gemini Cascade] Model ${model} failed (Rate limit/Error: ${err?.message}). Cascading to next fallback...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All cascade models failed');
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
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    sendJson(res, 429, { error: 'Rate limit exceeded. Please wait a minute.' });
    return;
  }

  try {
    const rawBody = await parseJsonBody(req);
    const parsed = GenerateConceptRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      sendJson(res, 400, { error: 'Invalid request body', details: parsed.error.issues });
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      // Deterministic cultural fallback mode (zero downtime guarantee)
      const fallback = getFallbackConcept(parsed.data);
      sendJson(res, 200, { concept: fallback, source: 'fallback_template', modelUsed: 'offline_cultural_template' });
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

    sendJson(res, 200, { concept: validated, source: 'gemini', modelUsed });
  } catch (error: any) {
    console.error('Gemini generate error, engaging cultural template fallback:', error);
    const fallback = getFallbackConcept({
      occasion: 'wedding',
      city: 'India',
      totalBudget: 800000,
      guestCount: 200,
      priorities: {},
    });
    sendJson(res, 200, { concept: fallback, source: 'error_fallback', warning: error?.message, modelUsed: 'offline_cultural_template' });
  }
}

/**
 * Handle POST /api/ai/adapt
 */
export async function handleAiAdapt(req: IncomingMessage, res: ServerResponse) {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    sendJson(res, 429, { error: 'Rate limit exceeded. Please wait a minute.' });
    return;
  }

  try {
    const rawBody = await parseJsonBody(req);
    const parsed = AdaptPlanRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      sendJson(res, 400, { error: 'Invalid request body', details: parsed.error.issues });
      return;
    }

    const prev = parsed.data.previousPlan;
    const proposed = parsed.data.proposedChanges;
    const guestDiff = proposed.newGuestCount - prev.guestCount;
    const budgetDiff = proposed.newBudget - prev.totalBudget;

    const apiKey = getApiKey();
    if (!apiKey) {
      const fallback = getFallbackAdaptation(parsed.data, guestDiff, budgetDiff);
      sendJson(res, 200, { adaptation: fallback, source: 'fallback_template', modelUsed: 'offline_cultural_template' });
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

    sendJson(res, 200, { adaptation: validated, source: 'gemini', modelUsed });
  } catch (error: any) {
    console.error('Gemini adapt error, engaging fallback:', error);
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
    sendJson(res, 200, { adaptation: fallback, source: 'error_fallback', warning: error?.message, modelUsed: 'offline_cultural_template' });
  }
}
