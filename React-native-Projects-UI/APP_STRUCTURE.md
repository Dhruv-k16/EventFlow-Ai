# EventFlow AI - Complete Application Structure

## Overview
EventFlow AI is a comprehensive event planning platform with three distinct user roles: Planner, Vendor, and Client. Built with React, TypeScript, React Router, Motion (Framer Motion), Recharts, and Tailwind CSS.

## Key Features
- ✅ **Role-Based Access Control**: Separate dashboards and features for Planners, Vendors, and Clients
- ✅ **Smooth Animations**: Apple iOS-quality animations with Motion/React
- ✅ **Responsive Design**: Mobile, tablet, and desktop optimized
- ✅ **Risk Analysis**: AI-powered risk dashboards with role-specific views
- ✅ **Real-time Loading States**: Skeleton loaders and smooth transitions
- ✅ **Chart Visualizations**: Beautiful charts using Recharts

## Application Architecture

### Authentication System
- **Location**: `/src/app/contexts/AuthContext.tsx`
- **Features**:
  - Mock authentication with localStorage
  - Three user roles: PLANNER, VENDOR, CLIENT
  - Quick test login buttons for each role
  - Role-based redirects

### Routing & Navigation
- **Router**: `/src/app/routes.ts`
- **Layout**: `/src/app/components/layouts/DashboardLayout.tsx`
- **Role Guards**: Automatic redirects based on user role
- **Protected Routes**: All dashboard routes require authentication

### Design System

#### Colors
- **Purple Scale**: Brand colors from #49225B to #F5EBFA
- **Gradients**: Primary, Accent, Success, Danger
- **Page Background**: Always #F5EBFA (purple-50)
- **Card Background**: White (#FFFFFF)

#### Typography
- **Headings**: Plus Jakarta Sans (600, 700, 800)
- **Body Text**: Inter (400, 500)
- **Numbers**: JetBrains Mono (500, 700)

#### Components
- **KPI Cards**: Animated stat cards with color-coded accent bars
- **Status Badges**: Color-coded pills for booking/risk statuses
- **Loading States**: Skeleton loaders with shimmer animation
- **Cards**: Hover effects with spring easing (translateY + shadow)

## Page Structure (27 Pages Total)

### Shared Pages (2)
1. **Login** (`/login`) - Split layout with quick test logins
2. **Register** (`/register`) - Multi-step with role selection

### Planner Pages (10)
3. **Dashboard** (`/dashboard`) - KPIs, events, bookings, AI insights
4. **Create Event** (`/events/new`) - 3-step form wizard
5. **Event Detail** (`/events/:id`) - 6 tabs: Overview, Bookings, Tasks, Staff, Financials, Live
6. **Marketplace** (`/marketplace`) - Vendor search with filters
7. **Vendor Profile** (`/marketplace/vendor/:id`) - 4 tabs with vendor details
8. **Book Vendor** (`/bookings/new`) - Multi-step booking flow
9. **Bookings List** (`/bookings`) - Role-aware table
10. **Booking Detail** (`/bookings/:id`) - Role-aware actions
11. **Planner Risk** (`/risk/:eventId`) - Full financial + risk analysis
12. **Planner Financials** (`/financials`) - Cross-event budget tracking

### Vendor Pages (8)
13. **Vendor Dashboard** (`/vendor/dashboard`) - Pending requests + revenue
14. **Inventory** (`/vendor/inventory`) - Accordion list with variants
15. **Staff** (`/vendor/staff`) - Team member cards
16. **Vendor Financials** (`/vendor/financials`) - Revenue, costs, profit
17. **Vendor Risk** (`/vendor/risk`) - Operational risk only (NO client financials)
18-20. **Bookings** (shared routes with role-aware views)

### Client Pages (7)
21. **Client Dashboard** (`/client/dashboard`) - Read-only event overview
22. **My Events** (`/client/events`) - Event list with filters
23. **Event Detail** (`/client/events/:id`) - 3 tabs, read-only
24. **Bookings** (shared route, no amounts shown)
25. **Booking Detail** (shared route, read-only)
26. **Client Risk** (`/risk/:eventId`) - Friendly emoji-based view (NO financials)
27. **Client Financials** (`/client/financials`) - Committed amounts only

## Animations & Transitions

### Page Transitions
- Fade + slide up (opacity 0→1 + translateY 8px→0)
- Duration: 250ms ease-out

### Card Hover
- translateY(-4px) + enhanced shadow
- Duration: 300ms cubic-bezier(0.34, 1.56, 0.64, 1) - spring bounce

### Button Press
- scale(0.95) on active
- Duration: 100ms ease-in, 200ms ease-out return

### Number Counters
- Animate from 0 on mount
- Duration: 800ms ease-out

### Progress Bars
- Width animates from 0
- Duration: 700ms ease-out
- Delay: 200ms after mount

### Loading Skeletons
- Shimmer animation (1.5s infinite)
- Gradient slides left to right

## Data Privacy Rules

### Client View
- ❌ NO event budgets
- ❌ NO vendor pricing details
- ❌ NO profit margins
- ✅ Only committed amounts they agreed to pay

### Vendor View
- ❌ NO planner financials
- ❌ NO client personal spend
- ❌ NO event total budgets
- ✅ Only their own revenue and costs

### Planner View
- ✅ Full access to all financial data
- ✅ Complete risk analysis
- ✅ All vendor and client information

## Quick Start

### Login Credentials
Use the quick test login buttons on `/login`:
- **Planner**: Auto-login as Sarah Johnson
- **Vendor**: Auto-login as John Smith (Elegant Decor Co.)
- **Client**: Auto-login as Emily Davis

### Navigation Flow

**As Planner:**
1. Dashboard → View events and bookings
2. Create Event → 3-step wizard
3. Marketplace → Browse and book vendors
4. Risk Analysis → Monitor event health
5. Financials → Track budgets

**As Vendor:**
1. Dashboard → Accept/reject booking requests
2. Inventory → Manage items and variants
3. Staff → Team management
4. Financials → Revenue tracking
5. Risk → Operational health

**As Client:**
1. Dashboard → View your events
2. My Events → Event details (read-only)
3. Risk Analysis → Friendly event status
4. Financials → Your commitments

## Technical Implementation

### State Management
- React Context for auth
- Local state for UI interactions
- Mock data with realistic values

### Performance
- Lazy loading with React Router
- Animated components with Motion/React
- Optimized re-renders with proper key props

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Off-canvas sidebar on mobile
- Stacked layouts on tablets
- Grid layouts on desktop

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast compliance

## Future Enhancements
- [ ] Real backend API integration
- [ ] WebSocket for live updates
- [ ] Advanced filtering and search
- [ ] File upload for images
- [ ] Email notifications
- [ ] Calendar integrations
- [ ] Payment processing
- [ ] Advanced analytics with more charts

## File Structure
```
/src
  /app
    /components
      /layouts (Sidebar, TopBar, DashboardLayout)
      /shared (KPICard, StatusBadge, LoadingSpinner, EmptyState)
      /ui (shadcn components)
    /contexts (AuthContext)
    /pages
      /auth (Login, Register)
      /planner (8 pages)
      /vendor (6 pages)
      /client (4 pages)
      /shared (Risk dashboards, Bookings)
    App.tsx
    routes.ts
  /styles
    fonts.css
    theme.css (Tailwind v4 + custom tokens)
    index.css
```

## Notes
- All pages are fully functional with mock data
- Smooth 60fps animations throughout
- Follows Apple iOS design principles
- Complete role-based access control
- Privacy-first data segregation
