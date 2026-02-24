import { PrismaClient, UserRole, BookingStatus, StaffStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // 1. Create a Vendor User
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@elite.com' },
    update: {},
    create: {
      email: 'vendor@elite.com',
      externalId: 'auth0|vendor123',
      role: UserRole.VENDOR,
      firstName: 'Marcus',
      lastName: 'Chen',
    },
  })

  // 2. Create the Vendor Profile
  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: {
      userId: vendorUser.id,
      businessName: 'Elite Decor & Rentals',
      category: 'Decor',
    },
  })

  // 3. Create Inventory Items
  const items = [
    { name: 'Gold Tiffany Chairs', total: 200, price: 15.00 },
    { name: 'Velvet Sofa (Blue)', total: 10, price: 150.00 },
    { name: 'Round Dining Table', total: 40, price: 45.00 },
  ]

  for (const item of items) {
    await prisma.inventoryItem.create({
      data: {
        vendorId: vendor.id,
        name: item.name,
        totalQuantity: item.total,
        basePrice: item.price,
      },
    })
  }

  // 4. Create Staff
  await prisma.staff.create({
    data: {
      vendorId: vendor.id,
      name: 'Elena Rodriguez',
      role: 'Lead Setup',
      wage: 35.00,
      status: StaffStatus.AVAILABLE,
    },
  })

  console.log('✅ Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })