// src/app/api/risk/event/[id]/route.ts
// GET /api/risk/event/:id?role=PLANNER|CLIENT

import { interpretClientRisk, interpretPlannerRisk } from '@/lib/aiInterpreter';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
    calcClientBudget,
    calcClientRisk,
    calcPlannerFinancials,
    calcPlannerRisk,
    calcWeatherRiskScore,
    formatRiskTrend,
    scoreToLevel,
} from '@/lib/riskEngine';
import { getWeatherForecast } from '@/lib/weatherService';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (req: NextRequest, ctx) => {
  const { id } = await (ctx.params as unknown as Promise<{ id: string }>);
  const role = ((new URL(req.url).searchParams.get('role')) ?? 'PLANNER').toUpperCase() as 'PLANNER' | 'CLIENT';

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { bookings: true },
    });
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const liveEvent = await prisma.liveEvent.findUnique({
      where: { eventId: id },
      include: { tasks: true },
    });
    const incidents = liveEvent
      ? await prisma.incident.findMany({ where: { liveEventId: liveEvent.id } })
      : [];

    const staffAssignments = await prisma.staffAssignment.findMany({
      where: { eventId: id },
      include: { staff: { select: { status: true } } },
    });

    // Weather
    const weather = await getWeatherForecast(event.location, event.startDate);
    const weatherRiskScore = calcWeatherRiskScore(weather);
    const enrichedWeather  = { ...weather, riskScore: weatherRiskScore };

    // Aggregates
    const confirmedBookings   = event.bookings.filter(b => ['CONFIRMED','COMPLETED'].includes(b.status));
    const unconfirmedBookings = event.bookings.filter(b => !['CONFIRMED','COMPLETED','CANCELLED','REJECTED_CAPACITY'].includes(b.status));
    const cancelledBookings   = event.bookings.filter(b => b.status === 'CANCELLED');
    const totalCost           = event.bookings.reduce((s, b) => s + Number(b.totalCost),   0);
    const depositPaid         = event.bookings.reduce((s, b) => s + Number(b.depositPaid), 0);
    const openIncidents       = incidents.filter(i => !i.resolvedAt);
    const criticalIncidents   = openIncidents.filter(i => i.severity === 'CRITICAL');
    const tasks               = liveEvent?.tasks ?? [];
    const delayedTasks        = tasks.filter((t: {status:string}) => t.status === 'DELAYED');
    const staffOnLeave        = staffAssignments.filter(a => a.staff.status === 'ON_LEAVE').length;
    const changeRequests      = liveEvent?.changeRequestCount ?? 0;

    let riskScore: number;
    let riskFactors: Record<string, number>;
    let financialData: object;
    let aiResult: Awaited<ReturnType<typeof interpretPlannerRisk>>;

    if (role === 'PLANNER') {
      const { score, factors } = calcPlannerRisk({
        totalBookings:       event.bookings.length,
        unconfirmedBookings: unconfirmedBookings.length,
        staffAssigned:       staffAssignments.length,
        staffOnLeave,
        totalTasks:          tasks.length,
        delayedTasks:        delayedTasks.length,
        changeRequests,
        openIncidents:       openIncidents.map(i => ({ severity: i.severity })),
        weather:             enrichedWeather,
        totalEventCost:      totalCost,
        currentSpend:        depositPaid,
      });
      riskScore   = score;
      riskFactors = factors as unknown as Record<string, number>;
      const fin   = calcPlannerFinancials(totalCost * 1.1, depositPaid, totalCost, riskScore);
      financialData = fin;

      aiResult = await interpretPlannerRisk({
        eventName: event.name, eventDate: event.startDate.toISOString().split('T')[0],
        location: event.location ?? 'Unknown', guestCount: event.guestCount ?? 0,
        riskScore, riskLevel: scoreToLevel(riskScore), factors: riskFactors,
        weather: weather.geocoded ? enrichedWeather : null,
        financials: { totalBudget: fin.totalBudget, currentSpend: fin.currentSpend, predictedFinalSpend: fin.predictedFinalSpend, profitMargin: fin.profitMargin, highExposure: fin.highExposure },
        openIncidents: openIncidents.length, criticalIncidents: criticalIncidents.length,
        delayedTasks: delayedTasks.length, totalTasks: tasks.length,
        changeRequests, unconfirmedBookings: unconfirmedBookings.length, totalBookings: event.bookings.length,
      });
    } else {
      const { score, factors } = calcClientRisk({
        totalBookings:       event.bookings.length,
        unconfirmedBookings: unconfirmedBookings.length,
        actualSpend:         totalCost,
        plannedSpend:        totalCost,
        guestCount:          event.guestCount ?? 0,
        venueCapacity:       Math.ceil((event.guestCount ?? 0) * 1.15),
        weather:             enrichedWeather,
      });
      riskScore   = score;
      riskFactors = factors as unknown as Record<string, number>;
      const bud   = calcClientBudget(totalCost * 1.1, totalCost, totalCost, depositPaid, riskScore);
      financialData = bud;

      aiResult = await interpretClientRisk({
        eventName: event.name, eventDate: event.startDate.toISOString().split('T')[0],
        riskScore, riskLevel: scoreToLevel(riskScore), factors: riskFactors,
        weather: weather.geocoded ? { condition: enrichedWeather.condition, precipitationProbPct: enrichedWeather.precipitationProbPct, riskLevel: enrichedWeather.riskLevel } : null,
        budget: bud,
        unconfirmedVendors: unconfirmedBookings.length, totalVendors: event.bookings.length,
      });
    }

    // Persist snapshot
    await prisma.riskSnapshot.create({
      data: {
        targetId: id, targetType: 'EVENT', role, riskScore,
        factors: riskFactors,
        aiSummary: aiResult.aiSummary,
        recommendations: aiResult.recommendations,
        alerts: aiResult.alerts,
        weatherData:     weather.geocoded ? (enrichedWeather as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
    });

    const snapshots = await prisma.riskSnapshot.findMany({
      where: { targetId: id, targetType: 'EVENT', role },
      orderBy: { createdAt: 'asc' }, take: 30,
      select: { createdAt: true, riskScore: true },
    });

    return NextResponse.json({
      role,
      event: {
        id: event.id, name: event.name,
        startDate: event.startDate.toISOString().split('T')[0],
        endDate:   event.endDate.toISOString().split('T')[0],
        location:  event.location, guestCount: event.guestCount,
      },
      riskAnalysis: {
        overallScore: riskScore, level: scoreToLevel(riskScore),
        breakdown: riskFactors, trend: formatRiskTrend(snapshots),
      },
      weather: weather.geocoded ? {
        date: enrichedWeather.date, condition: enrichedWeather.condition,
        precipitationProbPct: enrichedWeather.precipitationProbPct,
        windspeedMax: enrichedWeather.windspeedMax,
        riskLevel: enrichedWeather.riskLevel, riskScore: weatherRiskScore,
      } : null,
      financialAnalysis: financialData,
      bookingSummary: {
        total: event.bookings.length, confirmed: confirmedBookings.length,
        unconfirmed: unconfirmedBookings.length, cancelled: cancelledBookings.length,
      },
      liveStatus: liveEvent ? {
        isActive: liveEvent.isActive, changeRequestCount: changeRequests,
        totalTasks: tasks.length, delayedTasks: delayedTasks.length,
        openIncidents: openIncidents.length, criticalIncidents: criticalIncidents.length,
      } : null,
      aiSummary:       aiResult.aiSummary,
      recommendations: aiResult.recommendations,
      alerts:          aiResult.alerts,
    });
  } catch (err) {
    console.error('[GET /api/risk/event/[id]]', err);
    return NextResponse.json({ error: 'Failed to generate risk analysis' }, { status: 500 });
  }
}, ['PLANNER', 'CLIENT', 'ADMIN']);
