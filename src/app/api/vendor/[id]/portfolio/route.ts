// src/app/api/vendor/[id]/portfolio/route.ts
// GET  /api/vendor/:id/portfolio  → list all portfolio items
// POST /api/vendor/:id/portfolio  → add a new portfolio item

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ── GET — all portfolio items for a vendor ────────────────────────────────────
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const items = await prisma.portfolioItem.findMany({
      where: { vendorId: id },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('[GET /api/vendor/:id/portfolio]', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

// ── POST — add a new portfolio item ──────────────────────────────────────────
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { title, description, imageUrl, eventType, tags } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get current max displayOrder so new item goes at the end
    const lastItem = await prisma.portfolioItem.findFirst({
      where: { vendorId: id },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    const nextOrder = (lastItem?.displayOrder ?? -1) + 1;

    const item = await prisma.portfolioItem.create({
      data: {
        vendorId:     id,
        title,
        description:  description  ?? null,
        imageUrl:     imageUrl     ?? null,
        eventType:    eventType    ?? null,
        tags:         tags         ?? [],
        displayOrder: nextOrder,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('[POST /api/vendor/:id/portfolio]', error);
    return NextResponse.json({ error: 'Failed to add portfolio item' }, { status: 500 });
  }
}
