// services/dataStore.ts

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
  time: string; // e.g., "18:00"
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

export interface UserAccount {
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

// --- Initial Mock Data ---

let MOCK_STAFF: StaffMember[] = [
  { id: '1', name: 'Sarah Jenkins', role: 'Coordinator', status: 'Active', context: 'Planner' },
  { id: '2', name: 'John Doe', role: 'Asst. Planner', status: 'Active', context: 'Planner' },
  { id: '3', name: 'Mike Vendor Pro', role: 'Lead Specialist', status: 'Active', context: 'Vendor' },
];

// Add some default test users so you don't have to sign up every time
export let REGISTERED_USERS: UserAccount[] = [
  { email: 'p@test.com', name: 'Planner User', role: 'Planner', password: '123' },
  { email: 'v@test.com', name: 'Vendor User', role: 'Vendor', password: '123' },
  { email: 'c@test.com', name: 'Client User', role: 'Client', password: '123' },
];

let MOCK_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'White Seat Covers', stock: 120, status: 'In Stock' },
  { id: '2', name: 'Premium Speakers', stock: 4, status: 'Out on Job' },
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
      { id: 't1', time: '17:00', activity: 'Guest Arrival', description: 'Welcome drinks in the lobby', responsible: 'Planner', status: 'Completed' },
      { id: 't2', time: '18:30', activity: 'Grand Entrance', description: 'Bridal party enters the main hall', responsible: 'All', status: 'In Progress' },
      { id: 't3', time: '19:30', activity: 'Dinner Service', description: 'Three-course meal begins', responsible: 'Vendor', status: 'Pending' },
    ] 
  }
];

// --- Data Service ---

export const DataService = {
  // --- Staff Methods ---
  getStaff: (context: 'Planner' | 'Vendor') => {
    return MOCK_STAFF.filter(s => s.context === context);
  },
  
  // --- Inventory Methods ---
  getInventory: () => {
    return MOCK_INVENTORY;
  },
  
  // --- Event Methods ---
  getEvents: () => [...MOCK_EVENTS],

  getVendorJobs: (vendorCategory: string) => {
    return MOCK_EVENTS.filter(event => 
      event.requiredVendors.includes(vendorCategory)
    );
  },

  getClientEvents: () => {
    return MOCK_EVENTS; 
  },

  addEvent: (newEvent: Omit<Event, 'id' | 'status'>) => {
    const event: Event = {
      ...newEvent,
      id: Math.random().toString(36).substring(2, 9),
      status: 'Requested',
      timeline: [], // Initialize with empty timeline
    };
    MOCK_EVENTS = [event, ...MOCK_EVENTS];
    return event;
  },

  updateEventStatus: (eventId: string, newStatus: Event['status']) => {
    MOCK_EVENTS = MOCK_EVENTS.map(event => 
      event.id === eventId ? { ...event, status: newStatus } : event
    );
    return true;
  },

  // --- Timeline Methods ---
  updateTimelineStatus: (eventId: string, itemId: string, newStatus: TimelineItem['status']) => {
    MOCK_EVENTS = MOCK_EVENTS.map(event => {
      if (event.id === eventId) {
        const updatedTimeline = event.timeline?.map(item => 
          item.id === itemId ? { ...item, status: newStatus } : item
        );
        return { ...event, timeline: updatedTimeline };
      }
      return event;
    });
    return true;
  },

  // --- Progress & Tasks ---
  getEventProgress: (eventId: string) => {
    const event = MOCK_EVENTS.find(e => e.id === eventId);
    if (!event || !event.timeline) return 0;
    
    // Calculate progress based on completed timeline items
    const total = event.timeline.length;
    if (total === 0) return 0;
    const completed = event.timeline.filter(t => t.status === 'Completed').length;
    return Math.round((completed / total) * 100);
  },

  assignTask: async (staffId: string, task: string) => {
    console.log(`API CALL: Assigning ${task} to user ${staffId}`);
    return { success: true };
  },

  // Notification Methods
  getNotifications: (): Notification[] => [
    { id: '1', title: 'Task Completed', body: 'Catering has finished setup.', time: '2m ago', type: 'success' },
    { id: '2', title: 'New Message', body: 'Planner sent you a message.', time: '1h ago', type: 'info' },
  ],

  // Marketplace Favorites (Mock logic)
  toggleFavorite: (vendorId: string) => {
    console.log(`Toggled favorite for: ${vendorId}`);
    return true;
  },

  // Weather Logic (Mock)
  getWeather: () => ({
    temp: '24°C',
    condition: 'Partly Cloudy',
    icon: 'cloud-outline' as any
  })

};

export const AuthService = {
  signup: (user: UserAccount) => {
    // Check if user already exists
    const exists = REGISTERED_USERS.find(u => u.email === user.email);
    if (exists) return { success: false, message: "Email already registered" };
    
    REGISTERED_USERS.push(user);
    return { success: true };
  },

  login: (email: string, role: string) => {
    // We normalize to lowercase to avoid "Planner" vs "planner" mismatches
    return REGISTERED_USERS.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.role.toLowerCase() === role.toLowerCase()
    );
  },

  resetPassword: (email: string) => {
    const user = REGISTERED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, message: "Email not found" };
    // In a real app, this sends an email. Here we just return success.
    return { success: true };
  }
};