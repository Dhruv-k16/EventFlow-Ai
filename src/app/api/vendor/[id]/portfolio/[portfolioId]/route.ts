// src/app/api/vendor/[id]/portfolio/[portfolioId]/route.ts
// PATCH  /api/vendor/:id/portfolio/:portfolioId  → update a portfolio item
// DELETE /api/vendor/:id/portfolio/:portfolioId  → delete a portfolio item

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// ── PATCH — update a portfolio item ──────────────────────────────────────────
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
) {
  const { id, portfolioId } = await params;

  try {
    // Verify the item belongs to this vendor
    const existing = await prisma.portfolioItem.findFirst({
      where: { id: portfolioId, vendorId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, imageUrl, eventType, tags, displayOrder } = body;

    const updated = await prisma.portfolioItem.update({
      where: { id: portfolioId },
      data: {
        ...(title        !== undefined && { title }),
        ...(description  !== undefined && { description }),
        ...(imageUrl     !== undefined && { imageUrl }),
        ...(eventType    !== undefined && { eventType }),
        ...(tags         !== undefined && { tags }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/vendor/:id/portfolio/:portfolioId]', error);
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
  }
}

// ── DELETE — remove a portfolio item ─────────────────────────────────────────
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; portfolioId: string }> }
) {
  const { id, portfolioId } = await params;

  try {
    // Verify the item belongs to this vendor before deleting
    const existing = await prisma.portfolioItem.findFirst({
      where: { id: portfolioId, vendorId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
    }

    await prisma.portfolioItem.delete({ where: { id: portfolioId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/vendor/:id/portfolio/:portfolioId]', error);
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
