// src/lib/aiInterpreter.ts — Gemini 2.0 Flash interpretation layer
// NEVER generates numbers. Only interprets pre-computed values from riskEngine.ts.

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const MODEL = 'gemini-2.5-flash';

export interface AIInterpretation {
  aiSummary:       string;
  recommendations: string[];
  alerts:          string[];
}

const FALLBACK: AIInterpretation = {
  aiSummary: 'AI analysis unavailable. Review risk scores and factor breakdown manually.',
  recommendations: ['Manually review all HIGH and CRITICAL risk factors before proceeding.'],
  alerts: [],
};

const JSON_RULE = `Respond ONLY with valid JSON — no markdown, no code fences, no text outside JSON.
Required shape: { "aiSummary": "2-3 sentences", "recommendations": ["..."], "alerts": ["..."] }
Max 5 recommendations. Max 5 alerts. Do NOT generate or invent any numbers.`;

export interface PlannerAIData {
  eventName: string; eventDate: string; location: string; guestCount: number;
  riskScore: number; riskLevel: string; factors: Record<string, number>;
  weather: { condition: string; precipitationProbPct: number; windspeedMax: number; riskLevel: string } | null;
  financials: { totalBudget: number; currentSpend: number; predictedFinalSpend: number; profitMargin: number; highExposure: boolean };
  openIncidents: number; criticalIncidents: number; delayedTasks: number; totalTasks: number;
  changeRequests: number; unconfirmedBookings: number; totalBookings: number;
}

export interface VendorAIData {
  businessName: string; riskScore: number; riskLevel: string; factors: Record<string, number>;
  financials: { wageCost: number; logisticsCost: number; totalCost: number; revenue: number; profitMargin: number; highProfitRisk: boolean };
  staffCount: number; onSiteStaff: number; inventoryStrain: number;
  delayedDeliveries: number; totalDeliveries: number; lastMinuteRequests: number; totalOrders: number;
}

export interface ClientAIData {
  eventName: string; eventDate: string; riskScore: number; riskLevel: string;
  factors: Record<string, number>;
  weather: { condition: string; precipitationProbPct: number; riskLevel: string } | null;
  budget: { totalBudget: number; actualSpend: number; overrunPct: number; refundExposure: number; budgetUtilizationPct: number; flags: Record<string, boolean> };
  unconfirmedVendors: number; totalVendors: number;
}

function buildPlannerPrompt(d: PlannerAIData): string {
  return `You are an AI risk analyst for EventFlow. Provide strategic risk intelligence for the Event Planner.

EVENT: ${d.eventName} | ${d.eventDate} | ${d.location} | ${d.guestCount} guests
RISK: ${d.riskScore}/100 — ${d.riskLevel}

FACTORS (0-100 each):
Vendor Reliability: ${d.factors.vendorReliability ?? 0} (${d.unconfirmedBookings}/${d.totalBookings} unconfirmed)
Open Incidents: ${d.factors.openIncidents ?? 0} (${d.openIncidents} open, ${d.criticalIncidents} CRITICAL)
Task Delays: ${d.factors.taskDelays ?? 0} (${d.delayedTasks}/${d.totalTasks} delayed)
Staff Issues: ${d.factors.staffIssues ?? 0}
Weather Risk: ${d.factors.weatherRisk ?? 0}
Stakeholder Pressure: ${d.factors.stakeholderPressure ?? 0} (${d.changeRequests} change requests)

WEATHER: ${d.weather ? `${d.weather.condition}, ${d.weather.precipitationProbPct}% rain, ${d.weather.windspeedMax} km/h wind, ${d.weather.riskLevel}` : 'Unavailable'}

FINANCIALS: Budget ₹${d.financials.totalBudget.toLocaleString()} | Spent ₹${d.financials.currentSpend.toLocaleString()} | Predicted ₹${d.financials.predictedFinalSpend.toLocaleString()} | Margin ${d.financials.profitMargin}% | High Exposure: ${d.financials.highExposure ? 'YES' : 'No'}

${JSON_RULE}`;
}

function buildVendorPrompt(d: VendorAIData): string {
  return `You are an AI risk analyst for EventFlow. Provide tactical operational insights for this vendor.

VENDOR: ${d.businessName} | RISK: ${d.riskScore}/100 — ${d.riskLevel}

FACTORS (0-100 each):
Inventory Strain: ${d.factors.inventoryStrain ?? 0} (${d.inventoryStrain}% utilized)
Open Incidents: ${d.factors.openIncidents ?? 0}
Payment Delays: ${d.factors.paymentDelays ?? 0}
Staff Overload: ${d.factors.staffOverload ?? 0} (${d.onSiteStaff}/${d.staffCount} on site)
Transport Risk: ${d.factors.transportRisk ?? 0} (${d.delayedDeliveries}/${d.totalDeliveries} delayed)
Last-Minute Changes: ${d.factors.lastMinuteChanges ?? 0} (${d.lastMinuteRequests}/${d.totalOrders} orders)

FINANCIALS: Wages ₹${d.financials.wageCost.toLocaleString()} | Logistics ₹${d.financials.logisticsCost.toLocaleString()} | Total Cost ₹${d.financials.totalCost.toLocaleString()} | Revenue ₹${d.financials.revenue.toLocaleString()} | Margin ${d.financials.profitMargin}% | High Risk: ${d.financials.highProfitRisk ? 'YES' : 'No'}

Focus on profitability and capacity management.
${JSON_RULE}`;
}

function buildClientPrompt(d: ClientAIData): string {
  return `You are an AI risk analyst for EventFlow. Provide simple, clear advisory for the event client. Avoid jargon.

EVENT: ${d.eventName} | ${d.eventDate} | RISK: ${d.riskScore}/100 — ${d.riskLevel}

FACTORS (0-100 each):
Vendor Cancellation: ${d.factors.vendorCancellation ?? 0} (${d.unconfirmedVendors}/${d.totalVendors} unconfirmed)
Budget Overrun: ${d.factors.budgetOverrun ?? 0}
Weather Risk: ${d.factors.weatherRisk ?? 0}
Guest Overload: ${d.factors.guestOverload ?? 0}

WEATHER: ${d.weather ? `${d.weather.condition}, ${d.weather.precipitationProbPct}% rain, ${d.weather.riskLevel}` : 'Unavailable'}

BUDGET: Total ₹${d.budget.totalBudget.toLocaleString()} | Spent ₹${d.budget.actualSpend.toLocaleString()} | Overrun ${d.budget.overrunPct}% | Refund Exposure ₹${d.budget.refundExposure.toLocaleString()} | Utilization ${d.budget.budgetUtilizationPct}%

Keep language simple and decision-focused.
${JSON_RULE}`;
}

async function callGemini(prompt: string): Promise<AIInterpretation> {
  if (!genAI) { console.warn('[aiInterpreter] GEMINI_API_KEY not set'); return FALLBACK; }
  try {
    const model  = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(prompt);
    const text   = result.response.text().trim()
      .replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(text) as AIInterpretation;
    return {
      aiSummary:       String(parsed.aiSummary ?? FALLBACK.aiSummary),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5).map(String) : FALLBACK.recommendations,
      alerts:          Array.isArray(parsed.alerts) ? parsed.alerts.slice(0, 5).map(String) : [],
    };
  } catch (err) {
    console.error('[aiInterpreter] Gemini failed:', err);
    return FALLBACK;
  }
}

export const interpretPlannerRisk = (d: PlannerAIData) => callGemini(buildPlannerPrompt(d));
export const interpretVendorRisk  = (d: VendorAIData)  => callGemini(buildVendorPrompt(d));
export const interpretClientRisk  = (d: ClientAIData)  => callGemini(buildClientPrompt(d));
