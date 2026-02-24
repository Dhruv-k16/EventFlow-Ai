import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { status } = await request.json(); 

  try {
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status: status as BookingStatus },
        include: { items: true, event: true }
      });

     
        if (status === 'CONFIRMED') {
            for (const item of booking.items) {
                await tx.inventoryAvailability.update({
                  where: {
                    inventoryItemId_date: {
                      inventoryItemId: item.inventoryItemId,
                      date: booking.event.date,
                    },
                  },
                  data: {
                    holdQty: { decrement: item.quantity }, // Remove from soft-lock
                    bookedQty: { increment: item.quantity } // Add to hard-lock
                  }
                });
              }
        }
      return booking;
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}