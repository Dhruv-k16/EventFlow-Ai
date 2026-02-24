import { UserRole, BookingStatus, StaffStatus } from '@prisma/client';

// The "Marketplace" view for Planners
export interface MarketplaceVendor {
  id: string;
  businessName: string;
  category: string;
  inventory: MarketplaceItem[];
}

export interface MarketplaceItem {
  id: string;
  name: string;
  basePrice: number;
  totalQuantity: number;
  // Note: We don't expose 'availableQuantity' directly to prevent scraping
}

// The request body for a new booking
export interface CreateBookingRequest {
  eventId: string;
  vendorId: string;
  items: {
    inventoryItemId: string;
    quantity: number;
  }[];
}

// Unified Event Response
export interface UnifiedEvent {
  id: string;
  title: string;
  date: string;
  status: string;
  bookings: any[]; 
}