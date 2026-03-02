import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVendorSlots, toUTCMidnight } from '@/lib/slotEngine';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const startParam = searchParams.get('startDate');
  const endParam   = searchParams.get('endDate');

  if (!startParam || !endParam)
    return NextResponse.json({ error: 'startDate and endDate are required (YYYY-MM-DD)' }, { status: 400 });

  const startDate = toUTCMidnight(startParam);
  const endDate   = toUTCMidnight(endParam);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
  if (startDate > endDate)
    return NextResponse.json({ error: 'startDate must be before or equal to endDate' }, { status: 400 });

  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
  if (diffDays > 90)
    return NextResponse.json({ error: 'Date range cannot exceed 90 days' }, { status: 400 });

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      select: { id: true, businessName: true, maxEventsPerDay: true },
    });
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const summary = await getVendorSlots(id, startDate, endDate);
    return NextResponse.json({
      vendorId: vendor.id, businessName: vendor.businessName,
      maxEventsPerDay: vendor.maxEventsPerDay,
      startDate: startParam, endDate: endParam,
      totalDays: summary.slots.length, slots: summary.slots,
    });
  } catch (err) {
    console.error('[GET /api/vendor/[id]/slots]', err);
    return NextResponse.json({ error: 'Failed to fetch slot calendar' }, { status: 500 });
  }
}
