// src/app/api/vendor/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // FIX: await params

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        portfolioItems: { orderBy: { displayOrder: 'asc' } },
        inventory: {
          select: { id: true, name: true, description: true, basePrice: true, totalQuantity: true, unit: true },
          orderBy: { name: 'asc' },
        },
        user: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { bookings: true } },
      },
    });

    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });

    const confirmedCount = await prisma.booking.count({ where: { vendorId: id, status: 'CONFIRMED' } });
    const completedCount = await prisma.booking.count({ where: { vendorId: id, status: 'COMPLETED' } });

    return NextResponse.json({ ...vendor, confirmedBookings: confirmedCount, completedBookings: completedCount });
  } catch (error) {
    console.error('[GET /api/vendor/:id]', error);
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // FIX: await params

  try {
    const body = await req.json();
    const { businessName, category, description, tagline, phone, email, website, location, city, priceRange, yearsInBusiness, coverImageUrl, avatarUrl, services, specialties } = body;

    const updated = await prisma.vendor.update({
      where: { id },
      data: {
        ...(businessName    !== undefined && { businessName }),
        ...(category        !== undefined && { category }),
        ...(description     !== undefined && { description }),
        ...(tagline         !== undefined && { tagline }),
        ...(phone           !== undefined && { phone }),
        ...(email           !== undefined && { email }),
        ...(website         !== undefined && { website }),
        ...(location        !== undefined && { location }),
        ...(city            !== undefined && { city }),
        ...(priceRange      !== undefined && { priceRange }),
        ...(yearsInBusiness !== undefined && { yearsInBusiness }),
        ...(coverImageUrl   !== undefined && { coverImageUrl }),
        ...(avatarUrl       !== undefined && { avatarUrl }),
        ...(services        !== undefined && { services }),
        ...(specialties     !== undefined && { specialties }),
      },
      include: { portfolioItems: { orderBy: { displayOrder: 'asc' } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/vendor/:id]', error);
    return NextResponse.json({ error: 'Failed to update vendor profile' }, { status: 500 });
  }
}
