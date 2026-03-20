// src/lib/api.ts
// Central API client — handles auth headers, token refresh, all endpoint calls.
// Every page imports from here — never fetch() directly in a component.

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// ── Token storage ─────────────────────────────────────────────────────────────

export const tokens = {
  getAccess:    ()      => localStorage.getItem('ef_access')  ?? '',
  getRefresh:   ()      => localStorage.getItem('ef_refresh') ?? '',
  setAccess:    (t: string) => localStorage.setItem('ef_access',  t),
  setRefresh:   (t: string) => localStorage.setItem('ef_refresh', t),
  clear:        ()      => { localStorage.removeItem('ef_access'); localStorage.removeItem('ef_refresh'); },
};

// ── Core fetch with auto-refresh ──────────────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokens.getRefresh();
  if (!refreshToken) return false;

  try {
    const res  = await fetch(`${BASE}/api/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;

    const data = await res.json();
    tokens.setAccess(data.accessToken);
    tokens.setRefresh(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(
  path:    string,
  options: RequestInit = {}
): Promise<T> {
  const call = async (token: string) =>
    fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

  let res = await call(tokens.getAccess());

  // 401 → try refresh once, then retry
  if (res.status === 401) {
    if (!refreshPromise) refreshPromise = tryRefresh().finally(() => { refreshPromise = null; });
    const ok = await refreshPromise;
    if (!ok) {
      tokens.clear();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    res = await call(tokens.getAccess());
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }

  return res.json() as Promise<T>;
}

// Unauthenticated fetch (login, register, marketplace)
export async function publicFetch<T = unknown>(
  path:    string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  user: {
    id:        string;
    email:     string;
    firstName: string;
    lastName:  string;
    role:      'PLANNER' | 'VENDOR' | 'CLIENT' | 'ADMIN';
    vendorId:  string | null;
    plannerId: string | null;
  };
  accessToken:  string;
  refreshToken: string;
}

export interface Event {
  id:          string;
  name:        string;
  eventType:   string | null;
  type:        'SINGLE' | 'MULTI_FUNCTION';
  startDate:   string;
  endDate:     string;
  location:    string | null;
  venueName:   string | null;
  guestCount:  number | null;
  totalBudget: string | null;
  clientId:    string;
  plannerId:   string | null;
  functions:   Event[];
  _count:      { functions: number; bookings: number };
}

export interface Vendor {
  id:             string;
  businessName:   string;
  category:       string;
  description:    string | null;
  tagline:        string | null;
  rating:         string;
  location:       string | null;
  city:           string | null;
  priceRange:     string | null;
  phone:          string | null;
  email:          string | null;
  website:        string | null;
  services:       string[];
  specialties:    string[];
  yearsInBusiness:number | null;
  totalReviews:   number;
  coverImageUrl:  string | null;
  avatarUrl:      string | null;
  portfolioItems: PortfolioItem[];
  inventory:      InventoryItem[];
  _count:         { bookings: number };
  confirmedBookings: number;
  completedBookings: number;
}

export interface PortfolioItem {
  id:          string;
  title:       string;
  description: string | null;
  imageUrl:    string | null;
  eventType:   string | null;
  tags:        string[];
  displayOrder:number;
}

export interface InventoryItem {
  id:            string;
  name:          string;
  description:   string | null;
  basePrice:     string;
  totalQuantity: number;
  unit:          string;
}

export interface Booking {
  id:         string;
  status:     string;
  eventId:    string;
  vendorId:   string;
  totalCost:  string;
  depositPaid:string;
  notes:      string | null;
  createdAt:  string;
  event:      { name: string; startDate: string; endDate: string };
  vendor:     { id: string; businessName: string; category: string };
  items:      BookingItem[];
  MeetingRecord: MeetingRecord[];
}

export interface BookingItem {
  id:             string;
  quantity:       number;
  priceAtBooking: string;
  inventoryItem:  { id: string; name: string };
}

export interface MeetingRecord {
  id:          string;
  phase:       number;
  status:      string;
  scheduledAt: string;
  completedAt: string | null;
  meetingLink: string | null;
  notes:       string | null;
}

export interface PlannerStaff {
  id:             string;
  name:           string;
  role:           string;
  email:          string | null;
  phone:          string | null;
  status:         'Available' | 'Busy' | 'On Leave';
  assignedEvents: number;
  initials:       string;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const auth = {
  login: (email: string, password: string) =>
    publicFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body:   JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string; password: string; firstName: string; lastName: string;
    role: string; businessName?: string; category?: string; phone?: string;
  }) =>
    publicFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body:   JSON.stringify(data),
    }),
};

// ── Events endpoints ──────────────────────────────────────────────────────────

export const events = {
  list: (params: { plannerId?: string; clientId?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return apiFetch<{ events: Event[] }>(`/api/events?${qs}`);
  },

  get: (id: string) =>
    apiFetch<Event>(`/api/events/${id}`),

  create: (data: {
    name: string; eventType?: string; description?: string;
    type?: 'SINGLE' | 'MULTI_FUNCTION';
    date?: string; endDate?: string; time?: string;
    location?: string; venueName?: string; guestCount?: number;
    totalBudget?: number; clientId: string; plannerId?: string;
    functions?: { name: string; date?: string; location?: string; venueName?: string; guestCount?: number; allocatedBudget?: number }[];
  }) =>
    apiFetch<Event>('/api/events', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<Event>) =>
    apiFetch<Event>(`/api/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/events/${id}`, { method: 'DELETE' }),

  getFunctions: (id: string) =>
    apiFetch<{ parent: Event; functions: Event[] }>(`/api/events/${id}/sub-events`),

  addFunction: (id: string, data: { name: string; date?: string; location?: string; venueName?: string; guestCount?: number; allocatedBudget?: number }) =>
    apiFetch<Event>(`/api/events/${id}/sub-events`, { method: 'POST', body: JSON.stringify(data) }),
};

// ── Marketplace + Vendor endpoints ────────────────────────────────────────────

export const marketplace = {
  search: (params?: { category?: string; city?: string; q?: string; date?: string; qty?: number }) => {
    const qs = params ? new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v !== undefined).map(([k,v]) => [k, String(v)]))).toString() : '';
    return publicFetch<{ vendors: Vendor[]; total: number }>(`/api/marketplace/search${qs ? '?' + qs : ''}`);
  },
};

export const vendor = {
  get: (id: string) =>
    apiFetch<Vendor>(`/api/vendor/${id}`),

  update: (id: string, data: Partial<Vendor>) =>
    apiFetch<Vendor>(`/api/vendor/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getPortfolio: (id: string) =>
    apiFetch<PortfolioItem[]>(`/api/vendor/${id}/portfolio`),

  addPortfolioItem: (id: string, data: { title: string; description?: string; imageUrl?: string; eventType?: string; tags?: string[] }) =>
    apiFetch<PortfolioItem>(`/api/vendor/${id}/portfolio`, { method: 'POST', body: JSON.stringify(data) }),

  updatePortfolioItem: (id: string, portfolioId: string, data: Partial<PortfolioItem>) =>
    apiFetch<PortfolioItem>(`/api/vendor/${id}/portfolio/${portfolioId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deletePortfolioItem: (id: string, portfolioId: string) =>
    apiFetch<{ success: boolean }>(`/api/vendor/${id}/portfolio/${portfolioId}`, { method: 'DELETE' }),

  getInventory: (id: string, date?: string) =>
    apiFetch<{ vendorId: string; businessName: string; items: (InventoryItem & { availableQty: number; allocatedQty: number })[] }>(`/api/vendors/${id}/inventory${date ? '?date=' + date : ''}`),

  getStaff: (id: string) =>
    apiFetch<{ staff: any[] }>(`/api/vendor/${id}/staff`),

  addStaff: (id: string, data: { name: string; role: string; phone?: string; status?: string }) =>
    apiFetch<any>(`/api/vendor/${id}/staff`, { method: 'POST', body: JSON.stringify(data) }),

  updateStaff: (id: string, staffId: string, data: any) =>
    apiFetch<any>(`/api/vendor/${id}/staff/${staffId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteStaff: (id: string, staffId: string) =>
    apiFetch<{ success: boolean }>(`/api/vendor/${id}/staff/${staffId}`, { method: 'DELETE' }),
};

// ── Bookings endpoints ────────────────────────────────────────────────────────

export const bookings = {
  list: (params?: { eventId?: string }) => {
    const qs = params?.eventId ? `?eventId=${params.eventId}` : '';
    return apiFetch<Booking[]>(`/api/bookings${qs}`);
  },

  get: (id: string) =>
    apiFetch<Booking>(`/api/bookings/${id}`),

  create: (data: { eventId: string; vendorId: string; items: { inventoryItemId: string; quantity: number }[]; notes?: string }) =>
    apiFetch<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),

  updateStatus: (id: string, status: string, rejectionReason?: string) =>
    apiFetch<Booking>(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status, rejectionReason }) }),

  // Vendor's own bookings
  vendorList: (params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : '';
    return apiFetch<Booking[]>(`/api/vendor/bookings${qs}`);
  },
};

// ── Meetings endpoints ────────────────────────────────────────────────────────

export const meetings = {
  list: (bookingId: string) =>
    apiFetch<MeetingRecord[]>(`/api/meetings?bookingId=${bookingId}`),

  schedule: (data: { bookingId: string; phase: number; scheduledAt: string; meetingLink?: string; notes?: string }) =>
    apiFetch<{ meeting: MeetingRecord; bookingStatus: string }>('/api/meetings', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: { status: string; notes?: string; meetingLink?: string; scheduledAt?: string }) =>
    apiFetch<{ meeting: MeetingRecord; bookingAdvancedTo?: string }>(`/api/meetings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Planner staff endpoints ───────────────────────────────────────────────────

export const plannerStaff = {
  list: () =>
    apiFetch<{ staff: PlannerStaff[]; summary: { total: number; available: number; busy: number; onLeave: number } }>('/api/planner/staff'),

  add: (data: { name: string; role: string; email?: string; phone?: string; status?: string }) =>
    apiFetch<PlannerStaff>('/api/planner/staff', { method: 'POST', body: JSON.stringify(data) }),

  update: (staffId: string, data: Partial<PlannerStaff>) =>
    apiFetch<PlannerStaff>(`/api/planner/staff/${staffId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (staffId: string) =>
    apiFetch<{ success: boolean }>(`/api/planner/staff/${staffId}`, { method: 'DELETE' }),
};

// ── Risk endpoints ────────────────────────────────────────────────────────────

export const risk = {
  getEvent:  (id: string, role: 'PLANNER' | 'CLIENT' = 'PLANNER') =>
    apiFetch<any>(`/api/risk/event/${id}?role=${role}`),

  getVendor: (id: string) =>
    apiFetch<any>(`/api/risk/vendor/${id}`),
};

// ── Live events endpoints ─────────────────────────────────────────────────────

export const liveEvents = {
  list: (eventId?: string) =>
    apiFetch<any[]>(`/api/live-events${eventId ? '?eventId=' + eventId : ''}`),

  get: (id: string) =>
    apiFetch<any>(`/api/live-events/${id}`),

  activate: (eventId: string) =>
    apiFetch<any>('/api/live-events', { method: 'POST', body: JSON.stringify({ eventId }) }),

  conclude: (id: string) =>
    apiFetch<any>(`/api/live-events/${id}`, { method: 'PATCH', body: JSON.stringify({ action: 'conclude' }) }),

  getTasks: (id: string) =>
    apiFetch<any[]>(`/api/live-events/${id}/tasks`),

  addTask: (id: string, data: { title: string; scheduledAt: string; description?: string; assignedTo?: string }) =>
    apiFetch<any>(`/api/live-events/${id}/tasks`, { method: 'POST', body: JSON.stringify(data) }),

  getIncidents: (id: string) =>
    apiFetch<any[]>(`/api/live-events/${id}/incidents`),

  reportIncident: (id: string, data: { title: string; severity?: string; description?: string; reportedBy?: string }) =>
    apiFetch<any>(`/api/live-events/${id}/incidents`, { method: 'POST', body: JSON.stringify(data) }),
};
// ── ADD THIS BLOCK to the bottom of src/lib/api.ts ───────────────────────────
// Planner staff assignment endpoints

export interface StaffAssignment {
  id:          string;
  task:        string | null;
  notes:       string | null;
  assignedAt:  string;
  event: {
    id:        string;
    name:      string;
    eventType: string | null;
    startDate: string;
    endDate?:  string;
    location:  string | null;
    venueName?: string | null;
    type?:     string;
  };
}

export const staffAssignments = {
  list: (staffId: string) =>
    apiFetch<{ staffId: string; staffName: string; total: number; assignments: StaffAssignment[] }>(
      `/api/planner/staff/${staffId}/assignments`
    ),

  assign: (staffId: string, data: { eventId: string; task?: string; notes?: string }) =>
    apiFetch<StaffAssignment>(
      `/api/planner/staff/${staffId}/assignments`,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  unassign: (staffId: string, assignmentId: string) =>
    apiFetch<{ success: boolean }>(
      `/api/planner/staff/${staffId}/assignments/${assignmentId}`,
      { method: 'DELETE' }
    ),
};
