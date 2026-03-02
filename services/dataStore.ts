// services/dataStore.ts
// NOTE: This file runs in both web (Next.js) and mobile (Expo) contexts.
// Do NOT import expo-secure-store here. Session persistence is handled
// in the Expo layer via expo-app/hooks/useSession.ts

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On Leave' | 'On Break';
  context: 'Planner' | 'Vendor';
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out on Job';
}

export interface TimelineItem {
  id: string;
  time: string;
  activity: string;
  description: string;
  responsible: 'Planner' | 'Vendor' | 'All';
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'Planning' | 'Confirmed' | 'Completed' | 'Requested';
  requiredVendors: string[];
  timeline?: TimelineItem[];
}

// ✅ Added `id` so we can persist the user identity in SecureStore
export interface UserAccount {
  id: string;        // ← NEW
  email: string;
  name: string;
  role: 'Planner' | 'Vendor' | 'Client';
  password: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'info' | 'success' | 'warning';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

// ── Serialisable session shape (stored in SecureStore) ─────────────────────
// Kept here as the single source of truth for both the hook and any consumers.
export interface UserSession {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'planner' | 'vendor' | 'client';
}

// ── Mock Data ───────────────────────────────────────────────────────────────

let MOCK_STAFF: StaffMember[] = [
  { id: '1', name: 'Sarah Jenkins', role: 'Coordinator',    status: 'Active', context: 'Planner' },
  { id: '2', name: 'John Doe',      role: 'Asst. Planner',  status: 'Active', context: 'Planner' },
  { id: '3', name: 'Mike Vendor Pro', role: 'Lead Specialist', status: 'Active', context: 'Vendor' },
];

// ✅ Added `id` fields — used as the userId persisted in SecureStore
export let REGISTERED_USERS: UserAccount[] = [
  { id: 'mock-planner-1', email: 'p@test.com', name: 'Planner User', role: 'Planner', password: '123' },
  { id: 'mock-vendor-1',  email: 'v@test.com', name: 'Vendor User',  role: 'Vendor',  password: '123' },
  { id: 'mock-client-1',  email: 'c@test.com', name: 'Client User',  role: 'Client',  password: '123' },
];

let MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'White Seat Covers', stock: 120, status: 'In Stock'  },
  { id: '2', name: 'Premium Speakers',  stock: 4,   status: 'Out on Job' },
];

let MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    name: 'Wedding: Alex & Sam',
    date: '2024-12-01',
    location: 'Grand Plaza',
    status: 'Confirmed',
    requiredVendors: ['Catering', 'Photography'],
    timeline: [
      { id: 't1', time: '17:00', activity: 'Guest Arrival',  description: 'Welcome drinks in the lobby',        responsible: 'Planner', status: 'Completed'   },
      { id: 't2', time: '18:30', activity: 'Grand Entrance', description: 'Bridal party enters the main hall',  responsible: 'All',     status: 'In Progress' },
      { id: 't3', time: '19:30', activity: 'Dinner Service', description: 'Three-course meal begins',           responsible: 'Vendor',  status: 'Pending'     },
    ],
  },
];

// ── Data Service ─────────────────────────────────────────────────────────────

export const DataService = {
  getStaff: (context: 'Planner' | 'Vendor') =>
    MOCK_STAFF.filter((s) => s.context === context),

  getInventory: () => MOCK_INVENTORY,

  getEvents: () => [...MOCK_EVENTS],

  getVendorJobs: (vendorCategory: string) =>
    MOCK_EVENTS.filter((e) => e.requiredVendors.includes(vendorCategory)),

  getClientEvents: () => MOCK_EVENTS,

  addEvent: (newEvent: Omit<Event, 'id' | 'status'>) => {
    const event: Event = {
      ...newEvent,
      id: Math.random().toString(36).substring(2, 9),
      status: 'Requested',
      timeline: [],
    };
    MOCK_EVENTS = [event, ...MOCK_EVENTS];
    return event;
  },

  updateEventStatus: (eventId: string, newStatus: Event['status']) => {
    MOCK_EVENTS = MOCK_EVENTS.map((e) =>
      e.id === eventId ? { ...e, status: newStatus } : e
    );
    return true;
  },

  updateTimelineStatus: (
    eventId: string,
    itemId: string,
    newStatus: TimelineItem['status']
  ) => {
    MOCK_EVENTS = MOCK_EVENTS.map((event) => {
      if (event.id !== eventId) return event;
      return {
        ...event,
        timeline: event.timeline?.map((t) =>
          t.id === itemId ? { ...t, status: newStatus } : t
        ),
      };
    });
    return true;
  },

  getEventProgress: (eventId: string) => {
    const event = MOCK_EVENTS.find((e) => e.id === eventId);
    if (!event?.timeline?.length) return 0;
    const completed = event.timeline.filter((t) => t.status === 'Completed').length;
    return Math.round((completed / event.timeline.length) * 100);
  },

  assignTask: async (staffId: string, task: string) => {
    console.log(`API CALL: Assigning "${task}" to user ${staffId}`);
    return { success: true };
  },

  getNotifications: (): Notification[] => [
    { id: '1', title: 'Task Completed', body: 'Catering has finished setup.', time: '2m ago', type: 'success' },
    { id: '2', title: 'New Message',    body: 'Planner sent you a message.',  time: '1h ago', type: 'info'    },
  ],

  toggleFavorite: (vendorId: string) => {
    console.log(`Toggled favourite for vendor: ${vendorId}`);
    return true;
  },

  getWeather: () => ({
    temp: '24°C',
    condition: 'Partly Cloudy',
    icon: 'cloud-outline' as any,
  }),
};

// ── Auth Service ──────────────────────────────────────────────────────────────

export const AuthService = {
  signup: (user: Omit<UserAccount, 'id'>) => {
    const exists = REGISTERED_USERS.find(
      (u) => u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (exists) return { success: false, message: 'Email already registered' };

    const newUser: UserAccount = {
      ...user,
      id: `user-${Math.random().toString(36).substring(2, 9)}`,
    };
    REGISTERED_USERS.push(newUser);
    return { success: true };
  },

  // ✅ Now returns the full UserAccount (including `id`) so the caller can
  //    persist userId in SecureStore for authenticated API requests.
  login: (email: string, role: string): UserAccount | undefined => {
    return REGISTERED_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.role.toLowerCase()  === role.toLowerCase()
    );
  },

  resetPassword: (email: string) => {
    const user = REGISTERED_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) return { success: false, message: 'Email not found' };
    return { success: true };
  },
};
