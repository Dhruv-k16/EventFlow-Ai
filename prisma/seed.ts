// prisma/seed.ts
// Seed creates realistic test data for all three roles.
// Run: npx prisma db seed

import {
  BookingStatus,
  MeetingStatus,
  PrismaClient,
  StaffStatus,
  UserRole
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Seeding EventFlow AI database...\n');

  // ── 1. Create Users ──────────────────────────────────────────────────────

  const hash = (pw: string) => bcrypt.hashSync(pw, SALT_ROUNDS);

  const plannerUser = await prisma.user.upsert({
    where: { email: 'planner@eventflow.dev' },
    update: {},
    create: {
      email:        'planner@eventflow.dev',
      passwordHash: hash('password123'),
      firstName:    'Alexandra',
      lastName:     'Chen',
      role:         UserRole.PLANNER,
    },
  });

  const vendorUser1 = await prisma.user.upsert({
    where: { email: 'decor@eventflow.dev' },
    update: {},
    create: {
      email:        'decor@eventflow.dev',
      passwordHash: hash('password123'),
      firstName:    'Marcus',
      lastName:     'Rivera',
      role:         UserRole.VENDOR,
    },
  });

  const vendorUser2 = await prisma.user.upsert({
    where: { email: 'catering@eventflow.dev' },
    update: {},
    create: {
      email:        'catering@eventflow.dev',
      passwordHash: hash('password123'),
      firstName:    'Priya',
      lastName:     'Sharma',
      role:         UserRole.VENDOR,
    },
  });

  const vendorUser3 = await prisma.user.upsert({
    where: { email: 'av@eventflow.dev' },
    update: {},
    create: {
      email:        'av@eventflow.dev',
      passwordHash: hash('password123'),
      firstName:    'James',
      lastName:     'O\'Brien',
      role:         UserRole.VENDOR,
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@eventflow.dev' },
    update: {},
    create: {
      email:        'client@eventflow.dev',
      passwordHash: hash('password123'),
      firstName:    'Sarah',
      lastName:     'Johnson',
      role:         UserRole.CLIENT,
    },
  });

  console.log('✅ Users created');

  // ── 2. Create Planner Profile ─────────────────────────────────────────────

  const plannerProfile = await prisma.plannerProfile.upsert({
    where: { userId: plannerUser.id },
    update: {},
    create: {
      userId:          plannerUser.id,
      businessName:    'Chen Events Studio',
      maxEventsPerDay: 3,
      bio:             'Luxury event specialist with 8 years of experience.',
      yearsExperience: 8,
    },
  });

  console.log('✅ Planner profile created');

  // ── 3. Create Vendor Profiles ─────────────────────────────────────────────

  const decorVendor = await prisma.vendor.upsert({
    where: { userId: vendorUser1.id },
    update: {},
    create: {
      userId:          vendorUser1.id,
      businessName:    'Elite Decor & Rentals',
      category:        'Decor',
      description:     'Premium furniture and décor rental for luxury events.',
      maxEventsPerDay: 2,
      rating:          4.9,
      location:        'Mumbai, MH',
    },
  });

  const cateringVendor = await prisma.vendor.upsert({
    where: { userId: vendorUser2.id },
    update: {},
    create: {
      userId:          vendorUser2.id,
      businessName:    'Spice Route Catering',
      category:        'Catering',
      description:     'Authentic multi-cuisine catering for 50–5000 guests.',
      maxEventsPerDay: 3,
      rating:          4.8,
      location:        'Bengaluru, KA',
    },
  });

  const avVendor = await prisma.vendor.upsert({
    where: { userId: vendorUser3.id },
    update: {},
    create: {
      userId:          vendorUser3.id,
      businessName:    'SoundWave AV Systems',
      category:        'AV',
      description:     'Professional audio-visual and lighting production.',
      maxEventsPerDay: 4,
      rating:          4.7,
      location:        'Pune, MH',
    },
  });

  console.log('✅ Vendor profiles created');

  // ── 4. Create Inventory Items ─────────────────────────────────────────────

  const decorItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        vendorId:      decorVendor.id,
        name:          'Gold Tiffany Chairs',
        description:   'Premium gold-plated Tiffany chairs with cushioned seat.',
        totalQuantity: 500,
        basePrice:     350,
        unit:          'per chair per day',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        vendorId:      decorVendor.id,
        name:          'Royal Blue Velvet Sofa',
        description:   '3-seater velvet sofa, ideal for lounges and photo corners.',
        totalQuantity: 20,
        basePrice:     4500,
        unit:          'per piece per day',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        vendorId:      decorVendor.id,
        name:          'Round Dining Table (5ft)',
        description:   'Seats 8 guests, comes with linen cover.',
        totalQuantity: 80,
        basePrice:     1200,
        unit:          'per table per day',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        vendorId:      decorVendor.id,
        name:          'Floral Arch (12ft)',
        description:   'Custom floral arch — flowers included.',
        totalQuantity: 5,
        basePrice:     18000,
        unit:          'per arch per event',
      },
    }),
  ]);

  const cateringItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        vendorId:      cateringVendor.id,
        name:          'Gourmet Buffet Package',
        description:   'Full buffet setup — 12 dishes, 3 desserts, beverages.',
        totalQuantity: 2000,
        basePrice:     850,
        unit:          'per person',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        vendorId:      cateringVendor.id,
        name:          'Cocktail Hour Package',
        description:   'Canapes, mocktails, and live cooking station.',
        totalQuantity: 1000,
        basePrice:     450,
        unit:          'per person',
      },
    }),
  ]);

  const avItems = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        vendorId:      avVendor.id,
        name:          'Line Array Speaker System',
        description:   'Professional 20kW line array — covers up to 5000 sqft.',
        totalQuantity: 8,
        basePrice:     25000,
        unit:          'per system per day',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        vendorId:      avVendor.id,
        name:          'LED Moving Head Lights (Set of 10)',
        description:   'DMX-controlled moving heads with colour mixing.',
        totalQuantity: 50,
        basePrice:     8000,
        unit:          'per set per day',
      },
    }),
    prisma.inventoryItem.create({
      data: {
        vendorId:      avVendor.id,
        name:          'LED Video Wall (10x6ft)',
        description:   'P3 pixel pitch LED wall — crisp visuals for events.',
        totalQuantity: 4,
        basePrice:     45000,
        unit:          'per panel per day',
      },
    }),
  ]);

  console.log('✅ Inventory items created');

  // ── 5. Create Staff ───────────────────────────────────────────────────────

  await Promise.all([
    prisma.staff.create({
      data: {
        vendorId: decorVendor.id,
        name:     'Elena Rodriguez',
        role:     'Lead Setup Coordinator',
        wage:     2500,
        status:   StaffStatus.AVAILABLE,
        phone:    '+91-98765-43210',
      },
    }),
    prisma.staff.create({
      data: {
        vendorId: decorVendor.id,
        name:     'Rahul Patil',
        role:     'Logistics Driver',
        wage:     1800,
        status:   StaffStatus.AVAILABLE,
      },
    }),
    prisma.staff.create({
      data: {
        vendorId: cateringVendor.id,
        name:     'Chef Arjun Mehta',
        role:     'Executive Chef',
        wage:     5000,
        status:   StaffStatus.AVAILABLE,
      },
    }),
    prisma.staff.create({
      data: {
        vendorId: avVendor.id,
        name:     'Sam O\'Connor',
        role:     'AV Technician',
        wage:     3200,
        status:   StaffStatus.AVAILABLE,
      },
    }),
  ]);

  console.log('✅ Staff created');

  // ── 6. Create a sample Event with full Booking lifecycle ─────────────────

  const sampleEvent = await prisma.event.create({
    data: {
      name:        'Johnson-Williams Wedding',
      eventType:   'Wedding',
      startDate:   new Date('2026-09-20T10:00:00Z'),
      endDate:     new Date('2026-09-20T23:00:00Z'),
      isMultiDay:  false,
      location:    'The Taj Mahal Palace, Mumbai',
      guestCount:  350,
      clientId:    clientUser.id,
      plannerId:   plannerProfile.id,
    },
  });

  // Booking in MEETING_PHASE_2 (almost confirmed)
  const sampleBooking = await prisma.booking.create({
    data: {
      eventId:  sampleEvent.id,
      vendorId: decorVendor.id,
      status:   BookingStatus.MEETING_PHASE_2,
      notes:    'Client wants gold + ivory theme throughout.',
      items: {
        create: [
          {
            inventoryItemId: decorItems[0].id, // Gold Chairs
            quantity:        350,
            priceAtBooking:  decorItems[0].basePrice,
          },
          {
            inventoryItemId: decorItems[2].id, // Dining Tables
            quantity:        44,
            priceAtBooking:  decorItems[2].basePrice,
          },
        ],
      },
      totalCost: 350 * 350 + 44 * 1200,
    },
  });

  // Meeting records for this booking
  await prisma.meetingRecord.create({
    data: {
      bookingId:   sampleBooking.id,
      phase:       1,
      status:      MeetingStatus.COMPLETED,
      scheduledAt: new Date('2026-08-15T14:00:00Z'),
      completedAt: new Date('2026-08-15T15:00:00Z'),
      notes:       'Client confirmed gold theme. Vendor confirmed stock availability.',
    },
  });

  await prisma.meetingRecord.create({
    data: {
      bookingId:   sampleBooking.id,
      phase:       2,
      status:      MeetingStatus.SCHEDULED,
      scheduledAt: new Date('2026-09-01T11:00:00Z'),
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      notes:       'Final logistics walkthrough.',
    },
  });

  console.log('✅ Sample event + booking + meetings created');
  console.log('\n🎉 Seeding complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test credentials (all passwords: password123)');
  console.log('  Planner : planner@eventflow.dev');
  console.log('  Vendor 1: decor@eventflow.dev');
  console.log('  Vendor 2: catering@eventflow.dev');
  console.log('  Vendor 3: av@eventflow.dev');
  console.log('  Client  : client@eventflow.dev');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });