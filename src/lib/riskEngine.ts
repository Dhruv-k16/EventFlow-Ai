// src/lib/riskEngine.ts
// ============================================================
// EVENTFLOW AI — DETERMINISTIC RISK CALCULATION ENGINE v2
// ============================================================
// Specification: EventFlow AI Final Risk & Financial Analysis Engine v2
// AI layer (Gemini) only interprets these results — never generates numbers.
//
// Formula: Final Risk Score = Σ (factor_score × weight)
//   factor_score ∈ [0, 100]
//   Σ weights = 1.0
// ============================================================

import { WeatherForecast } from './weatherService';

// ── Clamp helper ───────────────────────────────────────────────────────────────
const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

// ── Score → Risk Level ─────────────────────────────────────────────────────────
export function scoreToLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

// ── Severity mapping (shared) ──────────────────────────────────────────────────
const SEVERITY_SCORE: Record<string, number> = {
  CRITICAL: 100, HIGH: 75, MEDIUM: 40, LOW: 15,
};

// ============================================================
// SECTION 1 — WEATHER RISK ENGINE
// v2 improvement: continuous wind scaling (windRisk = min(25, windSpeed/4))
// instead of step bonuses — smoother, more realistic curves
// ============================================================

export function calcWeatherRiskScore(weather: WeatherForecast): number {
  const precipScore = (weather.precipitationProbPct / 100) * 50;

  // v2: continuous scaling
  const windRisk = Math.min(25, weather.windspeedMax / 4);

  // WMO weather condition bonus
  let conditionBonus = 0;
  const code = weather.weatherCode;
  if (code >= 95)      conditionBonus = 25;  // Thunderstorm
  else if (code >= 80) conditionBonus = 15;  // Heavy rain
  else if (code >= 51) conditionBonus = 10;  // Light rain/drizzle
  else if (code >= 45) conditionBonus = 5;   // Fog
  else if (code >= 1)  conditionBonus = 2;   // Cloudy

  return clamp(precipScore + windRisk + conditionBonus);
}

// ============================================================
// SECTION 2 — PLANNER / MANAGER RISK ENGINE
// Weights: vendor 0.20, incidents 0.20, taskDelays 0.20,
//          staff 0.15, weather 0.15, stakeholder 0.10
// v2 addition: stakeholderRisk = (changeRequests / totalTasks) × 100
// ============================================================

const PLANNER_WEIGHTS = {
  vendorReliability:   0.20,
  openIncidents:       0.20,
  taskDelays:          0.20,
  staffIssues:         0.15,
  weatherRisk:         0.15,
  stakeholderPressure: 0.10,
} as const;

export interface PlannerRiskInput {
  totalBookings:       number;
  unconfirmedBookings: number;
  staffAssigned:       number;
  staffOnLeave:        number;
  totalTasks:          number;
  delayedTasks:        number;
  changeRequests:      number;  // v2: from LiveEvent.changeRequestCount
  openIncidents:       { severity: string }[];
  weather:             WeatherForecast;
  totalEventCost:      number;
  currentSpend:        number;  // v2: actual spend (not payment timing)
}

export interface PlannerRiskFactors {
  vendorReliability:   number;
  openIncidents:       number;
  taskDelays:          number;
  staffIssues:         number;
  weatherRisk:         number;
  stakeholderPressure: number;
}

export function calcPlannerRisk(input: PlannerRiskInput): { score: number; factors: PlannerRiskFactors } {
  // 1. Vendor reliability: unconfirmed ratio
  const vendorReliability = input.totalBookings > 0
    ? clamp((input.unconfirmedBookings / input.totalBookings) * 100) : 0;

  // 2. Open incidents: severity-weighted average, capped at 3 incidents
  let incidentScore = 0;
  if (input.openIncidents.length > 0) {
    const avg = input.openIncidents.reduce(
      (s, i) => s + (SEVERITY_SCORE[i.severity] ?? 15), 0
    ) / input.openIncidents.length;
    incidentScore = clamp(avg * Math.min(1, input.openIncidents.length / 3));
  }

  // 3. Task delays
  const taskDelays = input.totalTasks > 0
    ? clamp((input.delayedTasks / input.totalTasks) * 100) : 0;

  // 4. Staff issues: on-leave ratio
  const staffIssues = input.staffAssigned > 0
    ? clamp((input.staffOnLeave / input.staffAssigned) * 100) : 0;

  // 5. Weather risk (v2 continuous wind scaling via calcWeatherRiskScore)
  const weatherRisk = clamp(input.weather.riskScore);

  // 6. Stakeholder pressure (v2 new factor)
  const stakeholderPressure = input.totalTasks > 0
    ? clamp((input.changeRequests / input.totalTasks) * 100) : 0;

  const factors: PlannerRiskFactors = {
    vendorReliability,
    openIncidents: incidentScore,
    taskDelays,
    staffIssues,
    weatherRisk,
    stakeholderPressure,
  };

  const score = clamp(
    factors.vendorReliability   * PLANNER_WEIGHTS.vendorReliability   +
    factors.openIncidents       * PLANNER_WEIGHTS.openIncidents       +
    factors.taskDelays          * PLANNER_WEIGHTS.taskDelays          +
    factors.staffIssues         * PLANNER_WEIGHTS.staffIssues         +
    factors.weatherRisk         * PLANNER_WEIGHTS.weatherRisk         +
    factors.stakeholderPressure * PLANNER_WEIGHTS.stakeholderPressure
  );

  return { score, factors };
}

// ============================================================
// PLANNER FINANCIAL MODEL v2
// v2 fix: predictedFinalSpend uses currentSpend (actual spend),
//         not totalPaid (payment timing)
// ============================================================

export interface PlannerFinancials {
  totalBudget:         number;
  currentSpend:        number;
  balanceDue:          number;
  contingencyReserve:  number;
  predictedFinalSpend: number;  // v2: currentSpend + (riskScore/100 × contingency)
  variance:            number;  // totalBudget - predictedFinalSpend
  revenue:             number;
  profit:              number;
  profitMargin:        number;  // (profit / revenue) × 100
  highExposure:        boolean; // riskScore > 75 AND profitMargin < 15%
}

export function calcPlannerFinancials(
  totalBudget: number,
  currentSpend: number,
  revenue: number,
  riskScore: number
): PlannerFinancials {
  const contingencyReserve  = totalBudget * 0.10;
  // v2 corrected formula: use currentSpend not totalPaid
  const predictedFinalSpend = currentSpend + (riskScore / 100) * contingencyReserve;
  const variance            = totalBudget - predictedFinalSpend;
  const profit              = revenue - predictedFinalSpend;
  const profitMargin        = revenue > 0 ? (profit / revenue) * 100 : 0;

  return {
    totalBudget:         Math.round(totalBudget         * 100) / 100,
    currentSpend:        Math.round(currentSpend        * 100) / 100,
    balanceDue:          Math.round((totalBudget - currentSpend) * 100) / 100,
    contingencyReserve:  Math.round(contingencyReserve  * 100) / 100,
    predictedFinalSpend: Math.round(predictedFinalSpend * 100) / 100,
    variance:            Math.round(variance            * 100) / 100,
    revenue:             Math.round(revenue             * 100) / 100,
    profit:              Math.round(profit              * 100) / 100,
    profitMargin:        Math.round(profitMargin        * 100) / 100,
    highExposure:        riskScore > 75 && profitMargin < 15,
  };
}

// ============================================================
// SECTION 3 — VENDOR RISK ENGINE v2
// Weights: inventory 0.25, incidents 0.20, payment 0.20,
//          staff 0.15, transport 0.10, lastMinute 0.10
// v2 additions: transportRisk, lastMinuteChangeRisk
// ============================================================

const VENDOR_WEIGHTS = {
  inventoryStrain:     0.25,
  openIncidents:       0.20,
  paymentDelays:       0.20,
  staffOverload:       0.15,
  transportRisk:       0.10,
  lastMinuteChanges:   0.10,
} as const;

export interface VendorRiskInput {
  totalInventoryQty:     number;
  bookedInventoryQty:    number;
  totalStaff:            number;
  onSiteStaff:           number;
  totalRevenue:          number;
  outstandingBalance:    number;
  openIncidents:         { severity: string }[];
  totalDeliveries:       number;   // v2: from Vendor.totalDeliveries
  delayedDeliveries:     number;   // v2: from Vendor.delayedDeliveries
  lastMinuteRequests:    number;   // v2: from Vendor.lastMinuteRequests
  totalOrders:           number;   // v2: from Vendor.totalOrders
}

export interface VendorRiskFactors {
  inventoryStrain:   number;
  openIncidents:     number;
  paymentDelays:     number;
  staffOverload:     number;
  transportRisk:     number;
  lastMinuteChanges: number;
}

export function calcVendorRisk(input: VendorRiskInput): { score: number; factors: VendorRiskFactors } {
  const inventoryStrain = input.totalInventoryQty > 0
    ? clamp((input.bookedInventoryQty / input.totalInventoryQty) * 100) : 0;

  const paymentDelays = input.totalRevenue > 0
    ? clamp((input.outstandingBalance / input.totalRevenue) * 100) : 0;

  const staffOverload = input.totalStaff > 0
    ? clamp((input.onSiteStaff / input.totalStaff) * 100) : 0;

  let incidentScore = 0;
  if (input.openIncidents.length > 0) {
    const avg = input.openIncidents.reduce(
      (s, i) => s + (SEVERITY_SCORE[i.severity] ?? 15), 0
    ) / input.openIncidents.length;
    incidentScore = clamp(avg * Math.min(1, input.openIncidents.length / 3));
  }

  // v2 new factors
  const transportRisk = input.totalDeliveries > 0
    ? clamp((input.delayedDeliveries / input.totalDeliveries) * 100) : 0;

  const lastMinuteChanges = input.totalOrders > 0
    ? clamp((input.lastMinuteRequests / input.totalOrders) * 100) : 0;

  const factors: VendorRiskFactors = {
    inventoryStrain,
    openIncidents: incidentScore,
    paymentDelays,
    staffOverload,
    transportRisk,
    lastMinuteChanges,
  };

  const score = clamp(
    factors.inventoryStrain   * VENDOR_WEIGHTS.inventoryStrain   +
    factors.openIncidents     * VENDOR_WEIGHTS.openIncidents     +
    factors.paymentDelays     * VENDOR_WEIGHTS.paymentDelays     +
    factors.staffOverload     * VENDOR_WEIGHTS.staffOverload     +
    factors.transportRisk     * VENDOR_WEIGHTS.transportRisk     +
    factors.lastMinuteChanges * VENDOR_WEIGHTS.lastMinuteChanges
  );

  return { score, factors };
}

// ============================================================
// VENDOR STAFFING ENGINE
// baseStaff = guestCount / workloadRatio
// adjustedStaff = baseStaff × complexityFactor × durationFactor
// distribution: 70% general, 20% skilled, 10% supervisors
// ============================================================

export interface VendorStaffingPlan {
  baseStaff:      number;
  adjustedStaff:  number;
  general:        number;  // 70%
  skilled:        number;  // 20%
  supervisors:    number;  // 10%
}

export function calcVendorStaffing(
  guestCount:        number,
  workloadRatio:     number = 50,   // guests per staff member
  complexityFactor:  number = 1.2,
  eventDays:         number = 1
): VendorStaffingPlan {
  const durationFactor = eventDays / 3;
  const baseStaff      = Math.ceil(guestCount / workloadRatio);
  const adjustedStaff  = Math.ceil(baseStaff * complexityFactor * durationFactor);

  return {
    baseStaff,
    adjustedStaff,
    general:     Math.round(adjustedStaff * 0.70),
    skilled:     Math.round(adjustedStaff * 0.20),
    supervisors: Math.round(adjustedStaff * 0.10),
  };
}

// ============================================================
// VENDOR COST MODEL v2
// v2 expanded: wageCost + logisticsCost + foodCost + materialCost + contingency
// Old model used wages only.
// ============================================================

export interface VendorCostBreakdown {
  wageCost:        number;
  logisticsCost:   number;
  foodCost:        number;
  materialCost:    number;
  contingency:     number;   // 10% of (wage + logistics + material)
  totalCost:       number;
  revenue:         number;
  profit:          number;
  profitMargin:    number;
  breakEven:       number;   // = totalCost
  highProfitRisk:  boolean;  // profitMargin < 10%
}

export function calcVendorCosts(params: {
  wageCost:      number;
  distance:      number;
  transportRate: number;   // cost per km
  staffCount:    number;
  foodPerDay:    number;   // per person per day
  eventDays:     number;
  materialCost:  number;
  revenue:       number;
}): VendorCostBreakdown {
  const wageCost      = params.wageCost;
  const logisticsCost = params.distance * params.transportRate;
  const foodCost      = params.staffCount * params.foodPerDay * params.eventDays;
  const materialCost  = params.materialCost;
  const contingency   = 0.10 * (wageCost + logisticsCost + materialCost);
  const totalCost     = wageCost + logisticsCost + foodCost + materialCost + contingency;
  const profit        = params.revenue - totalCost;
  const profitMargin  = params.revenue > 0 ? (profit / params.revenue) * 100 : 0;

  return {
    wageCost:       Math.round(wageCost      * 100) / 100,
    logisticsCost:  Math.round(logisticsCost * 100) / 100,
    foodCost:       Math.round(foodCost      * 100) / 100,
    materialCost:   Math.round(materialCost  * 100) / 100,
    contingency:    Math.round(contingency   * 100) / 100,
    totalCost:      Math.round(totalCost     * 100) / 100,
    revenue:        Math.round(params.revenue* 100) / 100,
    profit:         Math.round(profit        * 100) / 100,
    profitMargin:   Math.round(profitMargin  * 100) / 100,
    breakEven:      Math.round(totalCost     * 100) / 100,
    highProfitRisk: profitMargin < 10,
  };
}

// ============================================================
// SECTION 4 — CLIENT RISK ENGINE
// Weights: vendorCancellation 0.30, budgetOverrun 0.35,
//          weather 0.20, guestOverload 0.15
// v2 improvement: guestOverload starts at 85% capacity (was 80%)
//                 multiplier changed to 400 (was 500)
// ============================================================

const CLIENT_WEIGHTS = {
  vendorCancellation: 0.30,
  budgetOverrun:      0.35,
  weatherRisk:        0.20,
  guestOverload:      0.15,
} as const;

export interface ClientRiskInput {
  totalBookings:       number;
  unconfirmedBookings: number;
  actualSpend:         number;
  plannedSpend:        number;
  guestCount:          number;
  venueCapacity:       number;   // v2: actual venue capacity
  weather:             WeatherForecast;
}

export interface ClientRiskFactors {
  vendorCancellation: number;
  budgetOverrun:      number;
  weatherRisk:        number;
  guestOverload:      number;
}

export function calcClientRisk(input: ClientRiskInput): { score: number; factors: ClientRiskFactors } {
  const vendorCancellation = input.totalBookings > 0
    ? clamp((input.unconfirmedBookings / input.totalBookings) * 100) : 0;

  // Budget overrun: multiplier ×2 keeps 50% overrun near max risk
  const overrunPct   = input.plannedSpend > 0
    ? ((input.actualSpend - input.plannedSpend) / input.plannedSpend) * 100 : 0;
  const budgetOverrun = clamp(Math.max(0, overrunPct) * 2);

  const weatherRisk = clamp(input.weather.riskScore);

  // v2: threshold changed from 80% → 85%, multiplier 500 → 400
  const guestRatio   = input.venueCapacity > 0
    ? input.guestCount / input.venueCapacity : 0;
  const guestOverload = clamp(Math.max(0, guestRatio - 0.85) * 400);

  const factors: ClientRiskFactors = {
    vendorCancellation,
    budgetOverrun,
    weatherRisk,
    guestOverload,
  };

  const score = clamp(
    factors.vendorCancellation * CLIENT_WEIGHTS.vendorCancellation +
    factors.budgetOverrun      * CLIENT_WEIGHTS.budgetOverrun      +
    factors.weatherRisk        * CLIENT_WEIGHTS.weatherRisk        +
    factors.guestOverload      * CLIENT_WEIGHTS.guestOverload
  );

  return { score, factors };
}

// ============================================================
// CLIENT FINANCIAL ANALYSIS
// ============================================================

export interface ClientBudgetBreakdown {
  totalBudget:          number;
  actualSpend:          number;
  variance:             number;
  overrunAmount:        number;
  overrunPct:           number;
  budgetUtilizationPct: number;
  refundExposure:       number;   // depositPaid × (riskScore/100)
  flags: {
    overrunAbove10Pct: boolean;   // overrunPct > 10%
    nearBudgetLimit:   boolean;   // budgetUtilization > 85%
  };
}

export function calcClientBudget(
  totalBudget:  number,
  actualSpend:  number,
  plannedSpend: number,
  depositPaid:  number,
  riskScore:    number
): ClientBudgetBreakdown {
  const overrunAmount        = Math.max(0, actualSpend - plannedSpend);
  const overrunPct           = plannedSpend > 0 ? (overrunAmount / plannedSpend) * 100 : 0;
  const budgetUtilizationPct = totalBudget  > 0 ? Math.min(100, (actualSpend / totalBudget) * 100) : 0;
  const refundExposure       = depositPaid * (riskScore / 100);
  const variance             = totalBudget - actualSpend;

  return {
    totalBudget:          Math.round(totalBudget          * 100) / 100,
    actualSpend:          Math.round(actualSpend          * 100) / 100,
    variance:             Math.round(variance             * 100) / 100,
    overrunAmount:        Math.round(overrunAmount        * 100) / 100,
    overrunPct:           Math.round(overrunPct           * 100) / 100,
    budgetUtilizationPct: Math.round(budgetUtilizationPct* 100) / 100,
    refundExposure:       Math.round(refundExposure       * 100) / 100,
    flags: {
      overrunAbove10Pct: overrunPct           > 10,
      nearBudgetLimit:   budgetUtilizationPct > 85,
    },
  };
}

// ============================================================
// TREND HELPER
// ============================================================

export function formatRiskTrend(
  snapshots: { createdAt: Date; riskScore: number }[]
): { date: string; score: number }[] {
  return snapshots
    .slice(-30)
    .map(s => ({ date: s.createdAt.toISOString().split('T')[0], score: s.riskScore }));
}
