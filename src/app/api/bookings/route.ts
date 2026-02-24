import { prisma } from '@/lib/prisma'; // Ensure this matches your prisma.ts location
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { eventId, vendorId, items, eventDate } = await request.json();

    const newBooking = await prisma.$transaction(async (tx: any) => {
      // 1. Create the Booking
      const booking = await tx.booking.create({
        data: {
          eventId,
          vendorId,
          status: 'PENDING',
          items: {
            create: items.map((item: any) => ({
              inventoryItemId: item.id,
              quantity: item.qty
            }))
          }
        }
      });

      // 2. Increment holdQty
      for (const item of items) {
        await tx.inventoryAvailability.upsert({
          where: {
            inventoryItemId_date: {
              inventoryItemId: item.id,
              date: new Date(eventDate),
            },
          },
          update: { holdQty: { increment: item.qty } },
          create: {
            inventoryItemId: item.id,
            date: new Date(eventDate),
            holdQty: item.qty,
            bookedQty: 0
          }
        });
      }
      return booking;
    });

    return NextResponse.json(newBooking);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Inquiry failed' }, { status: 500 });
  }
}