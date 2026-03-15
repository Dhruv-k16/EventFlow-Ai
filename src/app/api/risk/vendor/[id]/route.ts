// src/app/api/risk/vendor/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma }               from '@/lib/prisma';
import { withAuth, JWTPayload } from '@/lib/auth';
import {
  calcVendorRisk, calcVendorCosts, calcVendorStaffing,
  scoreToLevel, formatRiskTrend,
} from '@/lib/riskEngine';
import { interpretVendorRisk } from '@/lib/aiInterpreter';

// FIX: was dailyAllocations — relation name is InventoryAllocation in schema
type InventoryRow = { totalQuantity: number; _count: { InventoryAllocation: number } };
type StaffRow     = { status: string };
type BookingRow   = { status: string; totalCost: unknown; depositPaid: unknown };
type VendorFull   = {
  id: string; businessName: string; category: string; userId: string;
  inventory:  InventoryRow[];
  staff:      StaffRow[];
  bookings:   BookingRow[];
  totalDeliveries: number; delayedDeliveries: number;
  lastMinuteRequests: number; totalOrders: number;
};

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  const user    = (req as NextRequest & { user: JWTPayload }).user;

  if (user.role === 'VENDOR') {
    const v = await prisma.vendor.findUnique({ where: { userId: user.sub }, select: { id: true } });
    if (!v || v.id !== id) return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        inventory: {
          select: {
            totalQuantity: true,
            // FIX: was dailyAllocations — now InventoryAllocation
            _count: { select: { InventoryAllocation: true } },
          },
        },
        staff:    { select: { status: true } },
        bookings: { select: { status: true, totalCost: true, depositPaid: true } },
      },
    }) as unknown as VendorFull | null;

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const staffAssignments = await prisma.staffAssignment.findMany({
      where:   { staff: { vendorId: id } },
      include: { staff: { select: { wage: true } } },
    });

    const totalInventoryQty  = vendor.inventory.reduce((s, i) => s + i.totalQuantity, 0);
    // FIX: was i._count.dailyAllocations — now i._count.InventoryAllocation
    const bookedInventoryQty = vendor.inventory.reduce((s, i) => s + i._count.InventoryAllocation, 0);
    const inventoryStrainPct = totalInventoryQty > 0
      ? Math.round((bookedInventoryQty / totalInventoryQty) * 100) : 0;

    const totalStaff  = vendor.staff.length;
    const onSiteStaff = vendor.staff.filter(s => s.status === 'ON_SITE').length;
    const onLeave     = vendor.staff.filter(s => s.status === 'ON_LEAVE').length;
    const available   = vendor.staff.filter(s => s.status === 'AVAILABLE').length;

    const confirmed      = vendor.bookings.filter(b => ['CONFIRMED','COMPLETED'].includes(b.status));
    const totalRevenue   = confirmed.reduce((s, b) => s + Number(b.totalCost),   0);
    const totalCollected = confirmed.reduce((s, b) => s + Number(b.depositPaid), 0);
    const outstanding    = totalRevenue - totalCollected;

    const wageCost = staffAssignments.reduce((sum, a) => {
      const hours = (a.endTime.getTime() - a.startTime.getTime()) / 3600000;
      return sum + Number(a.staff.wage) * hours;
    }, 0);

    // FIX: was { event: { bookings: ... } } — relation name is Event (PascalCase) in schema
    const liveEventIds = (await prisma.liveEvent.findMany({
      where:  { Event: { bookings: { some: { vendorId: id } } } },
      select: { id: true },
    })).map(le => le.id);

    const openIncidents = liveEventIds.length > 0
      ? await prisma.incident.findMany({
          where:  { liveEventId: { in: liveEventIds }, resolvedAt: null },
          select: { severity: true },
        })
      : [];

    const totalDeliveries    = vendor.totalDeliveries    ?? 0;
    const delayedDeliveries  = vendor.delayedDeliveries  ?? 0;
    const lastMinuteRequests = vendor.lastMinuteRequests ?? 0;
    const totalOrders        = vendor.totalOrders        ?? 0;

    const { score: riskScore, factors } = calcVendorRisk({
      totalInventoryQty, bookedInventoryQty, totalStaff, onSiteStaff,
      totalRevenue, outstandingBalance: outstanding,
      openIncidents: openIncidents.map(i => ({ severity: i.severity })),
      totalDeliveries, delayedDeliveries, lastMinuteRequests, totalOrders,
    });

    const costs = calcVendorCosts({
      wageCost, distance: 0, transportRate: 0,
      staffCount: totalStaff, foodPerDay: 0, eventDays: 1,
      materialCost: 0, revenue: totalRevenue,
    });

    const staffingPlan = calcVendorStaffing(100);
    const riskFactors  = factors as unknown as Record<string, number>;
    const riskLevel    = scoreToLevel(riskScore);

    const aiResult = await interpretVendorRisk({
      businessName: vendor.businessName, riskScore, riskLevel, factors: riskFactors,
      financials: { wageCost: costs.wageCost, logisticsCost: costs.logisticsCost, totalCost: costs.totalCost, revenue: costs.revenue, profitMargin: costs.profitMargin, highProfitRisk: costs.highProfitRisk },
      staffCount: totalStaff, onSiteStaff, inventoryStrain: inventoryStrainPct,
      delayedDeliveries, totalDeliveries, lastMinuteRequests, totalOrders,
    });

    await prisma.riskSnapshot.create({
      data: {
        targetId: id, targetType: 'VENDOR', role: 'VENDOR', riskScore,
        factors:         riskFactors   as unknown as Prisma.InputJsonValue,
        aiSummary:       aiResult.aiSummary,
        recommendations: aiResult.recommendations as unknown as Prisma.InputJsonValue,
        alerts:          aiResult.alerts           as unknown as Prisma.InputJsonValue,
        weatherData:     Prisma.JsonNull,
      },
    });

    const snapshots = await prisma.riskSnapshot.findMany({
      where:   { targetId: id, targetType: 'VENDOR' } as Record<string, unknown>,
      orderBy: { createdAt: 'asc' }, take: 30,
      select:  { createdAt: true, riskScore: true },
    });

    return NextResponse.json({
      role: 'VENDOR',
      vendor: { id: vendor.id, businessName: vendor.businessName, category: vendor.category },
      riskAnalysis: { overallScore: riskScore, level: riskLevel, breakdown: riskFactors, trend: formatRiskTrend(snapshots) },
      inventorySummary: { totalQty: totalInventoryQty, bookedQty: bookedInventoryQty, strainPct: inventoryStrainPct },
      staffing: { totalStaff, onSite: onSiteStaff, onLeave, available, plan: staffingPlan },
      costBreakdown: { wages: costs.wageCost, logistics: costs.logisticsCost, food: costs.foodCost, material: costs.materialCost, contingency: costs.contingency, total: costs.totalCost },
      profitAnalysis: { revenue: totalRevenue, collected: totalCollected, outstanding, profit: costs.profit, profitMargin: costs.profitMargin, breakEven: costs.breakEven, highProfitRisk: costs.highProfitRisk },
      operationalMetrics: { totalDeliveries, delayedDeliveries, lastMinuteRequests, totalOrders },
      aiSummary: aiResult.aiSummary, recommendations: aiResult.recommendations, alerts: aiResult.alerts,
    });
  } catch (err) {
    console.error('[GET /api/risk/vendor/[id]]', err);
    return NextResponse.json({ error: 'Failed to generate vendor risk analysis' }, { status: 500 });
  }
}, ['VENDOR', 'ADMIN']);
