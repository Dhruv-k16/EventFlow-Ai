// shared/types.ts
// Single source of truth for types shared between Next.js API and Expo app.
// Do NOT import from @prisma/client here — this file is consumed by Metro
// (Expo bundler) which cannot process Prisma's generated code.

// ── Enums (mirrored from Prisma schema) ──────────────────────────────────────

export type UserRole = 'VENDOR' | 'PLANNER' | 'CLIENT' | 'ADMIN';

export type BookingStatus =
  | 'REQUESTED'
  | 'MEETING_PHASE_1'
  | 'CONFIRMATION_PENDING'
  | 'MEETING_PHASE_2'
  | 'CONFIRMED'
  | 'REJECTED_CAPACITY'
  | 'CANCELLED'
  | 'COMPLETED';

export type MeetingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type StaffStatus   = 'AVAILABLE' | 'ON_SITE' | 'ON_LEAVE';
export type TaskStatus    = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id:        string;
  email:     string;
  firstName: string;
  lastName:  string;
  role:      UserRole;
  vendorId:  string | null;
  plannerId: string | null;
}

export interface AuthTokens {
  accessToken:  string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

// Stored in SecureStore (mobile) / localStorage (web)
export interface StoredSession {
  user:         AuthUser;
  accessToken:  string;
  refreshToken: string;
}

// ── Vendor & Marketplace ──────────────────────────────────────────────────────

export interface VendorProfile {
  id:             string;
  businessName:   string;
  category:       string;
  description:    string | null;
  maxEventsPerDay: number;
  rating:         number;
  location:       string | null;
}

export interface InventoryItem {
  id:            string;
  vendorId:      string;
  name:          string;
  description:   string | null;
  totalQuantity: number;
  basePrice:     number;
  unit:          string;
  imageUrl:      string | null;
  // Computed by the API — available quantity for a specific date
  availableQty?: number;
}

export interface MarketplaceVendor extends VendorProfile {
  inventory: InventoryItem[];
  // Slot availability for a specific date (computed server-side)
  availableSlots: number;
  totalSlots:     number;
  isAvailable:    boolean; // false if manually blocked or fully booked
}

export interface MarketplaceSearchParams {
  date:      string;  // ISO date — "2026-09-20"
  query?:    string;
  category?: string;
  qty?:      number;
}

// ── Booking Lifecycle ─────────────────────────────────────────────────────────

export interface CreateBookingRequest {
  eventId:  string;
  vendorId: string;
  items: {
    inventoryItemId: string;
    quantity:        number;
  }[];
  notes?: string;
}

export interface BookingItem {
  id:              string;
  inventoryItemId: string;
  inventoryItem:   InventoryItem;
  quantity:        number;
  priceAtBooking:  number;
}

export interface MeetingRecord {
  id:          string;
  bookingId:   string;
  phase:       number;
  status:      MeetingStatus;
  scheduledAt: string;
  completedAt: string | null;
  meetingLink: string | null;
  notes:       string | null;
}

export interface Booking {
  id:              string;
  status:          BookingStatus;
  eventId:         string;
  vendorId:        string;
  vendor:          VendorProfile;
  items:           BookingItem[];
  meetings:        MeetingRecord[];
  totalCost:       number;
  depositPaid:     number;
  notes:           string | null;
  rejectionReason: string | null;
  createdAt:       string;
  updatedAt:       string;
}

// ── Events ────────────────────────────────────────────────────────────────────

export interface CreateEventRequest {
  name:        string;
  eventType?:  string;
  startDate:   string;
  endDate:     string;
  location?:   string;
  guestCount?: number;
  description?: string;
  plannerId?:  string;
}

export interface Event {
  id:          string;
  name:        string;
  eventType:   string | null;
  startDate:   string;
  endDate:     string;
  isMultiDay:  boolean;
  location:    string | null;
  guestCount:  number | null;
  clientId:    string;
  plannerId:   string | null;
  bookings:    Booking[];
  createdAt:   string;
  updatedAt:   string;
}

// ── Staff ─────────────────────────────────────────────────────────────────────

export interface StaffMember {
  id:       string;
  vendorId: string;
  name:     string;
  role:     string;
  wage:     number;
  status:   StaffStatus;
  phone:    string | null;
}

// ── Live Event ────────────────────────────────────────────────────────────────

export interface LiveTask {
  id:          string;
  liveEventId: string;
  title:       string;
  description: string | null;
  assignedTo:  string | null;
  scheduledAt: string;
  status:      TaskStatus;
  completedAt: string | null;
  delayReason: string | null;
}

export interface LiveEvent {
  id:          string;
  eventId:     string;
  isActive:    boolean;
  startedAt:   string;
  concludedAt: string | null;
  tasks:       LiveTask[];
}

// ── Risk Engine ───────────────────────────────────────────────────────────────

export interface RiskFactors {
  slotOverload:      boolean;
  inventoryStrain:   boolean;
  staffOverload:     boolean;
  meetingDelays:     boolean;
  multiDayFatigue:   boolean;
  liveTaskDelays:    boolean;
}

export interface RiskSnapshot {
  id:            string;
  eventId:       string;
  riskScore:     number; // 0–100
  factors:       RiskFactors;
  aiExplanation: string | null;
  createdAt:     string;
}

// ── WebSocket Message Protocol ────────────────────────────────────────────────

export type WSMessageType =
  | 'TASK_STATUS_UPDATE'
  | 'RISK_SCORE_UPDATE'
  | 'BOOKING_STATUS_UPDATE'
  | 'LIVE_EVENT_STARTED'
  | 'LIVE_EVENT_CONCLUDED'
  | 'PING'
  | 'PONG';

export interface WSMessage<T = unknown> {
  type:      WSMessageType;
  eventId?:  string;
  payload:   T;
  timestamp: string;
}