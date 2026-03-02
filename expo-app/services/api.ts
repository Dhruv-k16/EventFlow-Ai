// expo-app/services/api.ts
// Central API client for the mobile app.
// All calls go through apiFetch() which auto-refreshes expired tokens.

import type {
  Booking,
  CreateBookingRequest,
  MarketplaceSearchParams,
  MarketplaceVendor,
} from '../../shared/types';
import { apiFetch } from './authService';

// ── Types specific to Phase 1 ─────────────────────────────────────────────────

export interface SlotAvailability {
  date:             string;
  totalSlots:       number;
  confirmedCount:   number;
  remainingSlots:   number;
  isManuallyBlocked: boolean;
  isAvailable:      boolean;
  displayLabel:     string;
}

export interface VendorSlotSummary {
  vendorId:        string;
  maxEventsPerDay: number;
  slots:           SlotAvailability[];
}

export interface AvailabilityBlock {
  id:        string;
  vendorId:  string;
  startDate: string;
  endDate:   string;
  reason:    string | null;
  createdAt: string;
}

export interface InventoryItemWithAvailability {
  id:            string;
  vendorId:      string;
  name:          string;
  description:   string | null;
  totalQuantity: number;
  basePrice:     number;
  unit:          string;
  imageUrl:      string | null;
  availableQty:  number;
  allocatedQty:  number;
}

export interface VendorDetail extends MarketplaceVendor {
  contactEmail:       string;
  slotLabel:          string;
  staff:              { id: string; name: string; role: string; status: string }[];
  availabilityBlocks: AvailabilityBlock[];
}

// ── Vendor endpoints ──────────────────────────────────────────────────────────

export const VendorApi = {
  /** List vendors with slot availability for a specific date */
  list: async (params: MarketplaceSearchParams): Promise<MarketplaceVendor[]> => {
    const qs = new URLSearchParams({
      date: params.date,
      ...(params.category && params.category !== 'All' ? { category: params.category } : {}),
      ...(params.query ? { query: params.query } : {}),
      ...(params.qty   ? { qty: String(params.qty) } : {}),
    });
    const res = await fetch(`/api/vendors?${qs}`); // public endpoint
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to fetch vendors');
    return res.json();
  },

  /** Single vendor profile */
  get: async (vendorId: string, date?: string): Promise<VendorDetail> => {
    const qs = date ? `?date=${date}` : '';
    const res = await fetch(`/api/vendors/${vendorId}${qs}`); // public
    if (!res.ok) throw new Error((await res.json()).error ?? 'Vendor not found');
    return res.json();
  },

  /** Slot calendar — day-by-day availability for a date range */
  getSlots: async (
    vendorId:  string,
    startDate: string,
    endDate:   string
  ): Promise<VendorSlotSummary> => {
    const qs = new URLSearchParams({ startDate, endDate });
    const res = await fetch(`/api/vendors/${vendorId}/slots?${qs}`); // public
    if (!res.ok) throw new Error((await res.json()).error ?? 'Failed to fetch slots');
    return res.json();
  },

  /** List availability blocks for a vendor */
  getAvailabilityBlocks: async (vendorId: string): Promise<AvailabilityBlock[]> => {
    const res = await fetch(`/api/vendors/${vendorId}/availability`); // public
    if (!res.ok) throw new Error('Failed to fetch blocks');
    return res.json();
  },

  /** Add an availability block (vendor only) */
  addAvailabilityBlock: async (
    vendorId:  string,
    startDate: string,
    endDate:   string,
    reason?:   string
  ): Promise<AvailabilityBlock> => {
    const res = await apiFetch(`/api/vendors/${vendorId}/availability`, {
      method: 'POST',
      body:   JSON.stringify({ startDate, endDate, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to add block');
    return data;
  },

  /** Remove an availability block (vendor only) */
  deleteAvailabilityBlock: async (
    vendorId: string,
    blockId:  string
  ): Promise<void> => {
    const res = await apiFetch(
      `/api/vendors/${vendorId}/availability?blockId=${blockId}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? 'Failed to remove block');
    }
  },

  /** List inventory for a vendor */
  getInventory: async (
    vendorId: string,
    date?: string
  ): Promise<InventoryItemWithAvailability[]> => {
    const qs = date ? `?date=${date}` : '';
    const res = await fetch(`/api/vendors/${vendorId}/inventory${qs}`); // public
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  /** Add an inventory item (vendor only) */
  addInventoryItem: async (
    vendorId: string,
    data: {
      name:          string;
      description?:  string;
      totalQuantity: number;
      basePrice:     number;
      unit?:         string;
    }
  ): Promise<InventoryItemWithAvailability> => {
    const res = await apiFetch(`/api/vendors/${vendorId}/inventory`, {
      method: 'POST',
      body:   JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Failed to add item');
    return body;
  },
};

// ── Booking endpoints ─────────────────────────────────────────────────────────

export const BookingApi = {
  /** Create a new REQUESTED booking */
  create: async (data: CreateBookingRequest): Promise<Booking> => {
    const res = await apiFetch('/api/bookings', {
      method: 'POST',
      body:   JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Booking failed');
    return body;
  },

  /** Advance booking status through SRS lifecycle */
  updateStatus: async (
    bookingId:        string,
    status:           string,
    rejectionReason?: string
  ): Promise<Booking> => {
    const res = await apiFetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH',
      body:   JSON.stringify({ status, rejectionReason }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Status update failed');
    return body;
  },

  /** List all bookings (optionally filtered by eventId) */
  list: async (eventId?: string): Promise<Booking[]> => {
    const qs = eventId ? `?eventId=${eventId}` : '';
    const res = await apiFetch(`/api/bookings${qs}`);
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Failed to fetch bookings');
    return body;
  },

  /** Get a single booking by ID */
  get: async (bookingId: string): Promise<Booking> => {
    const res = await apiFetch(`/api/bookings/${bookingId}`);
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Booking not found');
    return body;
  },

  /** Get vendor's own bookings */
  getVendorBookings: async (status?: string): Promise<Booking[]> => {
    const qs = status ? `?status=${status}` : '';
    const res = await apiFetch(`/api/vendor/bookings${qs}`);
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Failed to fetch bookings');
    return body;
  },
};
