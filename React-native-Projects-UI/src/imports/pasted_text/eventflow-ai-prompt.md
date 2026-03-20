EventFlow AI
Figma Make — Complete App Rebuild Prompt
v5  ·  Full Rebuild from Scratch  ·  All Roles  ·  All Pages


🔴  This is a FULL REBUILD prompt. Figma Make must create every single page from scratch. Do not reuse any previous design decisions that contradict this document.

💡  DESIGN GOAL: Apple iOS quality — fluid, smooth, minimal, purposeful. Every animation, transition, shadow, and spacing decision must feel premium. Think Stripe + Linear + Apple combined into an event planning product.


Complete Page Index — All 3 Roles:

SHARED  (2 pages)  — Login, Register

    1. 01. Login Page — /login
    2. 02. Register Page — /register

PLANNER  (10 pages)

    3. 03. Planner Dashboard — /dashboard
    4. 04. Create Event — /events/new
    5. 05. Event Detail — /events/:id (6 tabs: Overview, Bookings, Tasks, Staff, Financials, Live)
    6. 06. Marketplace Search — /marketplace
    7. 07. Vendor Profile — /marketplace/vendor/:id
    8. 08. Book Vendor — /bookings/new
    9. 09. Bookings List — /bookings (role-aware)
    10. 10. Booking Detail — /bookings/:id (role-aware)
    11. 11. Planner Risk Analysis — /risk/:eventId (PLANNER view)
    12. 12. Planner Financials — /financials

VENDOR  (8 pages)

    13. 13. Vendor Dashboard — /vendor/dashboard
    14. 14. Inventory Management — /vendor/inventory
    15. 15. Staff Management — /vendor/staff
    16. 16. Vendor Financials — /vendor/financials
    17. 17. Vendor Risk Analysis — /vendor/risk (VENDOR view)
    18. 18. Bookings List — /bookings (vendor role-aware)
    19. 19. Booking Detail — /bookings/:id (vendor role-aware)
    20. 20. Booking Request Detail — /vendor/bookings/:id

CLIENT  (7 pages)

    21. 21. Client Dashboard — /client/dashboard
    22. 22. My Events — /client/events
    23. 23. Event Detail (read-only) — /events/:id (CLIENT view)
    24. 24. Bookings List — /bookings (client role-aware)
    25. 25. Booking Detail — /bookings/:id (client role-aware)
    26. 26. Client Risk Analysis — /risk/:eventId (CLIENT view)
    27. 27. Client Financials — /client/financials
— paste this entire document into Figma Make —

0.  Design System — Follow Exactly
🔴  These are non-negotiable. Every page, every component, every interaction must follow these specs. This is the single source of truth for the entire app.

0.1  Philosophy — Apple iOS Quality
The UI must feel like a native iOS app in a browser. This means:
    • Fluid 60fps transitions — nothing should feel jerky or abrupt.
    • Purposeful white space — cards breathe, content is not crammed.
    • Micro-interactions — buttons scale on press (scale-95), cards lift on hover, spinners are smooth.
    • Consistent rhythm — spacing follows an 8px grid. Padding: 8, 16, 24, 32, 48px.
    • Depth through shadow — not through heavy borders. Use shadows to create layers.
    • Typography hierarchy — clear distinction between heading, body, caption, mono.

0.2  Colour Palette
Token	Hex	CSS Class / Usage
purple-900  (brand)	#49225B	Primary headings, logo, active sidebar bg, gradient start. DO NOT use on body text.
purple-800	#6E3482	Sub-headings, table headers, hover states, chart primary fill
purple-600  (mid)	#A56ABD	Gradient end, secondary buttons, muted icons, chart secondary fill
purple-200	#E7DBEF	Borders on inputs, dividers, card borders on hover
purple-100  (light)	#F3E8FF	Badge/tag backgrounds, alt table rows, drawer sub-panels, hover bg
purple-50   (page bg)	#F5EBFA	PAGE BACKGROUND — the body of every single page. Never use white as page bg.
white	#FFFFFF	Card bg, modal bg, drawer bg, input bg, sidebar bg
gray-900	#111827	Only for the darkest text — event names, large headings inside cards
gray-700	#374151	Primary body text — table content, descriptions, form values
gray-500	#6B7280	Secondary text — timestamps, labels, placeholders
gray-300	#D1D5DB	Input borders, table dividers, card borders
gray-100	#F3F4F6	Input backgrounds on focus, skeleton loaders, disabled states
green-500	#10B981	CONFIRMED, positive values, success states, low risk
amber-500	#F59E0B	PENDING, medium risk, warnings, featured badges
orange-500	#F97316	HIGH risk, overdue items, strong warnings
red-500	#EF4444	CRITICAL risk, errors, destructive buttons, rejected
blue-700	#1D4ED8	COMPLETED status, info banners

0.3  Gradients
Primary  (gradient-purple-primary)	linear-gradient(to right, #49225B, #A56ABD) — primary buttons, sidebar header, KPI accent bars, avatar circles, hero strips
Accent   (gradient-purple-accent)	linear-gradient(to bottom-right, #A56ABD, #ec4899) — donut chart fills, FAB buttons, special highlights
Success	linear-gradient(to right, #059669, #10B981) — confirmed revenue cards, success banners
Danger	linear-gradient(to right, #DC2626, #EF4444) — critical risk cards, error states

0.4  Typography
Font	Weights	Sizes	Used for
Plus Jakarta Sans	600, 700, 800	14–32px	ALL headings h1–h3, card titles, sidebar labels, stat card values, logo, page titles, modal headers
Inter	400, 500	11–15px	ALL body text: descriptions, table content, labels, badge text, form placeholders, timestamps, sub-labels
JetBrains Mono	500, 700	12–32px	ALL numbers: prices (₹), risk scores, percentages, counts, IDs, dates in tables, financial figures

0.5  Card System — 3 variants

Variant 1 — Standard Card (use for: most content cards, list containers, form panels)
Background	white (#FFFFFF)
Border radius	12px (rounded-xl)
Border	1px solid #F3F4F6 (gray-100)
Shadow (rest)	0 4px 6px rgba(73,34,91,0.08), 0 2px 4px rgba(73,34,91,0.04)
Shadow (hover)	0 20px 40px rgba(73,34,91,0.14), 0 8px 16px rgba(73,34,91,0.08)
Transform	hover: translateY(-4px). Transition: all 300ms cubic-bezier(0.34,1.56,0.64,1)  ← spring easing
Padding	24px desktop, 20px mobile

Variant 2 — KPI Stat Card (use for: dashboard metrics, summary numbers)
Base	Same as Standard Card
Top accent bar	3px full-width bar, rounded-t-xl. Colour: gradient-purple-primary. Green gradient for revenue. Red for costs. Amber for warnings.
Layout	flex items-start justify-between. Left: label (Inter 11px gray-500 uppercase tracking-[0.08em]) + value (Plus Jakarta Sans 700 28–32px purple-900 font-mono) + sub-label (Inter 11px gray-400 mt-1). Right: 40px circle gradient bg + 20px white icon.
Hover	All standard card hover effects PLUS icon circle scales to 1.1

Variant 3 — Accent Card (use for: risk panels, AI summary, alerts, feature callouts)
Base	Same as Standard Card but border: 1px solid #E7DBEF (purple-200)
Left accent	Optional: 4px solid left border in semantic colour (green/amber/orange/red/purple)
Background	Optional: very subtle tint — purple-50/50, green-50/30 etc

0.6  Animations & Motion — iOS-grade smoothness
Page transitions	Fade + slide: opacity 0→1 + translateY 8px→0. Duration 250ms ease-out. Use on route change.
Card hover	translateY(-4px) + shadow-xl. Duration 300ms cubic-bezier(0.34,1.56,0.64,1) — slight spring overshoot.
Button press	scale(0.95) on :active. Duration 100ms ease-in. Returns 200ms ease-out.
Drawer open/close	translateX(100%)→translateX(0). Duration 320ms cubic-bezier(0.32,0.72,0,1). iOS sheet feel.
Modal open/close	scale(0.95)+opacity 0 → scale(1)+opacity 1. Duration 220ms ease-out.
Number counters	KPI values animate up from 0 on mount. Duration 800ms ease-out. Use requestAnimationFrame.
Progress bars	width animates from 0 to final value. Duration 700ms ease-out. Delay 200ms after mount.
Skeleton loaders	gradient shimmer from left to right. Duration 1.5s infinite. bg: gray-100 → gray-200 → gray-100.
Chart entry	Bars grow from bottom (scaleY 0→1, transform-origin bottom). Lines draw from left. Duration 600ms ease-out.
Accordion expand	max-height 0→auto. Duration 280ms ease-in-out. opacity 0→1 simultaneous.
Tab switch	Active indicator slides horizontally. Duration 200ms ease-in-out.
Pulsing live dot	scale 1→1.4→1 + opacity 1→0.4→1. Duration 2s infinite. Use on LIVE status badges.

0.7  Status Badges — Pill style, always these exact values
Status	Background	Text	Border	Special
CONFIRMED	#D1FAE5	#15803D	1px solid #A7F3D0	none
REQUESTED	#F3E8FF	#6D28D9	1px solid #DDD6FE	none
PENDING	#FEF3C7	#B45309	1px solid #FDE68A	none
COMPLETED	#DBEAFE	#1D4ED8	1px solid #BFDBFE	none
CANCELLED	#F3F4F6	#4B5563	1px solid #E5E7EB	none
REJECTED	#FEE2E2	#B91C1C	1px solid #FECACA	none
LIVE	#10B981	#FFFFFF	none	Pulsing green dot left of text + white bg for text
LOW risk	#D1FAE5	#15803D	1px solid #A7F3D0	none
MEDIUM risk	#FEF3C7	#B45309	1px solid #FDE68A	none
HIGH risk	#FFEDD5	#C2410C	1px solid #FED7AA	none
CRITICAL	#FEE2E2	#B91C1C	1px solid #FECACA	Pulsing red glow shadow
All badges: rounded-full, px-2.5 py-0.5, text-xs, font-semibold, inline-flex items-center gap-1.5.

0.8  Chart System — Recharts, these exact configs
Library	Recharts. Always use ResponsiveContainer wrapping every chart.
CartesianGrid	strokeDasharray="4 4" stroke="#f3f4f6". No outer border. Horizontal lines only unless layout=vertical.
Tooltip	White bg, rounded-xl, border 1px solid #E5E7EB, shadow-lg, px-3 py-2. Font: Inter 12px. Numbers: JetBrains Mono 13px font-bold.
Legend	Custom legend — coloured 12px circles + Inter 12px text. Never use default Recharts legend.
Bar charts	Fill: purple-800 (#6E3482) default. radius={[4,4,0,0]}. barSize 28–36. barCategoryGap="30%". Animate: isAnimationActive={true} animationDuration={600} animationEasing="ease-out".
Area charts	Stroke: risk colour or purple-600. strokeWidth 2.5. Fill: gradient (25%→3% opacity). Smooth curve: type="monotone". activeDot: r=5, stroke=white strokeWidth=2.
Pie/Donut charts	innerRadius 40, outerRadius 70 (donut). paddingAngle 3. startAngle 90 endAngle 450. Animate: animationDuration 800. Custom tooltip. NO default labels on slices.
Axis labels	XAxis: tick fontSize 11 fill gray-400. YAxis: tick fontSize 11 fill gray-400. tickLine=false. axisLine=false.
Reference lines	Dashed, stroke gray-200, strokeDasharray="6 3". Use for: budget limits, risk thresholds.
Empty chart	When no data: centred icon + "No data available" text. Same height as chart would be.

0.9  Layout — Sidebar + Top Bar Shell
Sidebar width	256px (w-64). Fixed position. White bg. Right border 1px solid gray-100.
Sidebar header	64px height. gradient-purple-primary bg. Logo: "EventFlow" Plus Jakarta Sans 800 22px white + "AI" text-pink-300 font-bold text-sm.
Nav items	px-3 py-2.5, rounded-lg, mx-2, gap-3. Icon 18px. Label Inter 14px font-medium. Active: gradient-purple-primary bg white text shadow-md. Inactive: gray-600 hover→purple-100 bg purple-800 text. Transition 200ms.
Nav sections	Group vendor nav items under "MANAGEMENT" label (uppercase, gray-400, text-xs, tracking-wider, px-4 py-2). Group analysis under "ANALYTICS".
Sidebar bottom	User card: gray-50 bg, rounded-xl, p-3, flex items-center gap-3. Avatar gradient circle 40px + name Plus Jakarta Sans 600 14px + role Inter 12px gray-500. Logout button below: red hover.
Top bar	64px height. White bg. Shadow-sm. sticky top-0 z-30. Left: hamburger (mobile) + page title Plus Jakarta Sans 700 18px. Right: search bar (hidden on mobile) + bell (red badge count) + avatar circle.
Search bar	Rounded-full. gray-100 bg. border border-gray-200. w-72. focus: border-purple-400 ring-2 ring-purple-100. transition-all 300ms.
Main content	ml-64 (desktop). p-8 (desktop) p-4 (mobile). max-w-7xl mx-auto. Background: purple-50 (#F5EBFA).
Mobile	Sidebar hidden off-screen. Hamburger in top bar reveals it. Backdrop overlay. Touch-friendly tap targets ≥44px.

0.10  Routing — Critical Role-Based Rules
🔴  Each role must ONLY see their own pages. Wrong-role access must redirect immediately.
PLANNER login	Redirects to /dashboard after login.
VENDOR login	Redirects to /vendor/dashboard after login.
CLIENT login	Redirects to /client/dashboard after login.
Route guard	DashboardLayout reads user.role from useAuth(). If VENDOR hits /dashboard, redirect /vendor/dashboard. If CLIENT hits /dashboard, redirect /client/dashboard. Instant — no flash.
Risk routing	/risk/:eventId — RiskDashboard component reads role → renders PlannerRiskDashboard, ClientRiskDashboard, or VendorRiskDashboard. One URL, three completely different views.
/vendor/risk	VendorRiskDashboard only. No eventId param — uses vendor's own ID from auth.
Shared routes	/bookings and /bookings/:id are role-aware — same component, different columns/data shown per role.
Catch-all	Unknown route → redirect to role home.


SHARED PAGES

Login Page
Route: /login
Role: ALL ROLES
Full-screen split layout. No sidebar. No top bar.

Layout	2-column split. Left 45%: gradient-purple-primary bg with illustration area + EventFlow branding + 3 role quick-login buttons. Right 55%: white bg, centred login form.
Left panel	"EventFlow AI" logo Plus Jakarta Sans 800 32px white. Tagline: "Intelligent event planning, powered by AI" Inter 16px purple-200. Three quick test buttons: "Planner Login", "Vendor Login", "Client Login" — white bg, purple-900 text, rounded-xl, shadow-md, hover lift.
Right panel form	"Welcome back 👋" Plus Jakarta Sans 700 28px gray-900. Sub: "Sign in to your account" gray-500. Email input + Password input (show/hide toggle). "Sign in" gradient button full-width. "Don't have an account? Register" link.
Inputs	Rounded-xl border border-gray-200 px-4 py-3.5 text-15px. Focus: border-purple-500 ring-4 ring-purple-100/50. Transition 200ms. Label above: Inter 13px font-medium gray-700.
Sign in button	gradient-purple-primary, text-white, font-semibold, rounded-xl, py-3.5, text-15px, w-full. Hover: opacity-90 + shadow-lg shadow-purple-500/30. Active: scale-95. Loading: spinner replaces text.
Error state	Red banner below button: bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-14px.
Mobile	Single column. Left panel collapses to a top strip (gradient, logo only).

Register Page
Route: /register
Role: ALL ROLES
Similar layout to Login. Multi-step or single-form registration.

Layout	Same 2-col split as Login.
Fields	Full Name, Email, Password, Confirm Password, Role selector (3 cards: Planner/Vendor/Client — click to select, selected gets gradient border + checkmark).
Role cards	Horizontal row of 3 cards. Each: white bg, rounded-xl, border-2 border-gray-200, p-4, icon + role name. Selected: border-purple-600 bg-purple-50 + gradient checkmark top-right.
Submit button	"Create Account" — same style as Login submit.
Vendor extras	If Vendor selected: additional fields slide down — Business Name, Category (select dropdown), Phone.


PLANNER PAGES

Planner Dashboard
Route: /dashboard
Role: PLANNER
The command centre. Overview of all events, upcoming activity, quick stats, and AI insights.

Page header	"Good morning, {name} 👋" Plus Jakarta Sans 800 28px purple-900. Sub: current date + "You have {n} events coming up" gray-500 Inter 14px.

Row 1 — KPI Cards (4 cols desktop, 2 tablet, 1 mobile)
Card	Label	Value	Sub	Icon colour
Total Events	"Total Events"	Event count	"All time"	purple
Active Bookings	"Active Bookings"	Confirmed count	"Confirmed vendors"	green
Total Budget	"Total Budget"	₹ sum all events	"Across all events"	purple
Upcoming (30d)	"Upcoming"	Events in 30 days	"In the next 30 days"	amber

Row 2 — Upcoming Events (horizontal scroll cards) + Quick Actions
Events strip	3 event cards in a row. Each: white card, rounded-2xl, overflow-hidden. Top: 120px gradient image strip. Content: event name, date, location, guest count, status badge. Bottom: "View" + "Risk" links.
Quick actions	Right side column (1/3 width): 4 action buttons stacked. "+ Create Event" gradient. "Browse Marketplace" ghost. "View All Bookings" ghost. "View Risk" ghost. Each: rounded-xl, icon left, full-width.

Row 3 — Recent Bookings Table + Risk Overview Mini
Bookings table	Last 5 bookings. Cols: Vendor, Event, Date, Amount, Status, Action. Standard table style.
Risk mini card	1/3 width right. Mini arc dial (120px) + score + level badge + "View Full Analysis →" purple link. White card.

Row 4 — AI Insights strip (full width)
AI card	gradient-purple-primary bg, rounded-2xl, p-6. Left: 🤖 icon + "AI DAILY BRIEFING" label + 2-3 sentence insight text white. Right: "gemini-2.5-flash" badge + "View Full Risk →" white ghost button.

Create Event
Route: /events/new
Role: PLANNER
Multi-step form to create a new event. Smooth step transitions.

Layout	Full-width white card, rounded-2xl, shadow-lg, p-8. Step indicator row at top.
Step indicator	Horizontal stepper: 3 steps. Active: gradient circle + label. Done: green check. Inactive: gray. Connector line between steps.
Step 1	Event Basics: Name (required), Type (select: Wedding/Corporate/Birthday/Concert/Conference/Other), Description (textarea).
Step 2	Date & Venue: Start Date (date picker), End Date, Venue Name, Location/City, Guest Count (number), Theme (optional).
Step 3	Budget & Review: Total Budget (₹ number input), Budget breakdown sliders (Venue %, Catering %, Decor %, AV %, Other %), Summary card preview.
Nav buttons	"Back" ghost + "Next / Create Event" gradient. Both rounded-xl. Footer of card.
Date picker	shadcn Calendar component. Purple accent colour.

Event Detail
Route: /events/:id
Role: PLANNER
6-tab deep-dive into a single event. Full management capabilities.

Hero card	white bg, rounded-2xl, p-6. Left: event name Plus Jakarta Sans 800 28px + meta row (calendar icon+date | mappin+location | users+guests | clock+time). Status badge top-right. Right: 3 action buttons — "Edit Event" ghost, "View Risk" orange ghost, "Go Live" gradient green.
Tab bar	6 tabs: Overview | Bookings | Tasks | Staff | Financials | Live Event. Sticky below hero card. Active: gradient bg white text. Transition: indicator slides.

Tab 1 — Overview
Layout	2 col (65% + 35%)
Left	Details card: all event fields as label+value rows. Edit button per field (pencil icon, appears on row hover).
Right	Budget ring chart (donut: allocated vs remaining). Upcoming tasks count chip. Weather preview mini card.
Tab 2 — Bookings
Content	Filter tabs (All/Requested/Confirmed/Rejected/Completed) + bookings table. Same table style as Bookings List page. "+ Book Vendor" gradient button top-right.
Tab 3 — Tasks
Content	Kanban-style or simple checklist. Todo | In Progress | Done columns. Add task button. Task cards: title, assignee, due date, priority badge (High/Medium/Low in red/amber/green).
Tab 4 — Staff
Content	Assigned staff members for this event. Same card grid as Staff Management. "Assign Staff" button.
Tab 5 — Financials
Content	Budget vs spend bar chart. Budget allocation donut. Spend by category table. Same chart styles as Financials page.
Tab 6 — Live Event
Content	Only enabled when event is live. Real-time status: tasks completed/total progress bar. Critical incidents count (red). Vendor check-in status list. Live feed of updates.

Marketplace Search
Route: /marketplace
Role: PLANNER
Browse and search all vendors. Filter by category, price, rating.

Search bar	Full-width search at top. Rounded-xl border-gray-200, large (py-4 px-5), magnifier icon left, "Search vendors, services, categories…" placeholder. Focus: purple border ring.
Filter row	Horizontal scroll pill tabs: All | Decor | Catering | AV | Venue | Transport | Florals | Photography | Lighting. Same pill style as filter tabs elsewhere.
Sort	"Sort by" dropdown top-right: Relevance | Rating | Price Low→High | Price High→Low.
Cards grid	3 cols desktop, 2 tablet, 1 mobile. gap-5.
Vendor card	white bg, rounded-2xl, overflow-hidden. Top: 140px category-colour gradient strip with vendor initials circle (64px white, gradient bg). Content p-5: businessName Plus Jakarta Sans 700 16px + category badge + rating (⭐ stars + number) + location text-sm + price range text-sm font-mono purple. Bottom: "View Profile →" ghost button full-width.
Empty state	Search icon + "No vendors found" + "Try different keywords or filters" + clear button.

Vendor Profile
Route: /marketplace/vendor/:id
Role: PLANNER
Full vendor detail before booking. Tabs: Overview, Inventory, Reviews, Availability.

Hero	200px gradient banner. Avatar circle 96px absolute bottom-left half-outside banner. Vendor name Plus Jakarta Sans 800 24px. Category + rating row. "Book Now" gradient button top-right + "Save" ghost button.
Tab bar	4 tabs: Overview | Inventory | Reviews | Availability. Same tab style.
Overview	Description card. Stats row: Total Bookings (font-mono) | Avg Rating | Response Time | Member Since. Service highlights list.
Inventory	Grid of items with name, description, base price (font-mono), per-unit label, quantity chip. Click → expand variants.
Reviews	Star rating summary (large number + breakdown bars). Individual review cards: avatar + name + stars + date + text.
Availability	Calendar view showing booked/available dates. Month navigation.

Book Vendor
Route: /bookings/new
Role: PLANNER
Multi-step booking flow. Select vendor, items, dates, confirm.

Step 1	Select Event: dropdown of planner's events. Shows event name + date + guest count per option.
Step 2	Select Items: vendor's inventory shown as cards with checkboxes. Quantity inputs. Running total ₹ updates live in sidebar summary.
Step 3	Date & Notes: date range picker, special instructions textarea, contact preference.
Step 4	Confirm: full summary card — vendor name + items + dates + total ₹ + event name. "Confirm Booking" gradient button. "Back" ghost.
Sidebar	Sticky booking summary on right (desktop): vendor name + selected items + running total. Updates live.

Bookings List
Route: /bookings
Role: PLANNER / VENDOR / CLIENT  (role-aware)
Same route, same component — different columns and data shown per role.

Header	"My Bookings" title + count. PLANNER: "+ Book Vendor" gradient button. VENDOR/CLIENT: no button.
Filter tabs	All | Requested | Confirmed | Completed | Cancelled | Rejected. Pill style.
PLANNER cols	Vendor (avatar + name) | Event | Date | Amount | Status | View →
VENDOR cols	Client/Planner | Event | Date | Amount | Status | View →
CLIENT cols	Vendor | Event | Date | Status | View → (no amount shown)
Table style	white card container, rounded-xl, shadow-md. Header: gray-50 bg, gray-500 text-xs uppercase tracking-wide. Rows: hover bg-purple-50. Alternating: bg-gray-50/30 on odd. Border-b border-gray-50. Transition-colors 150ms.
Mobile	Stack as cards per booking. Vendor/Client name bold + event name text-xs gray-500. Amount + status badge right. "View →" link.

Booking Detail
Route: /bookings/:id
Role: PLANNER / VENDOR / CLIENT  (role-aware)
Full details of a single booking. Actions differ per role.

Hero card	Booking ID (font-mono gray-400 text-xs) + status badge (large, pill). Vendor name + event name. Amount ₹ (font-mono 700 28px purple-900).
Details card	All booking fields: Service Date, Created At, Items list, Notes. Label+value rows.
PLANNER actions	Can cancel booking (red ghost button). "Contact Vendor" button.
VENDOR actions	Can CONFIRM (green gradient) or REJECT (red ghost) if status=REQUESTED. Can mark complete if confirmed.
CLIENT actions	Read-only. No action buttons. "Contact your planner" note.
Items table	Item name | Quantity | Unit price | Subtotal. Footer: Total row bold.

Planner Risk Analysis
Route: /risk/:eventId  →  PlannerRiskDashboard
Role: PLANNER ONLY
Full risk view. Financial data, budget tracking, all panels visible.

🔴  This page renders when role=PLANNER. The same /risk/:eventId URL shows a completely different page for CLIENT and VENDOR — do not mix them.

Sticky sub-bar	white, shadow-sm, h-14, sticky top-16. Left: "⚡ Risk Analysis" + event name + "PLANNER" green badge. Right: Refresh button + timestamp.

Row 1 — Arc Dial + 3 Stat Cards
Arc dial card	SVG arc dial 180px. Track: gray-100. Fill: risk colour (green/amber/orange/red). Score: JetBrains Mono 800 40px centred. /100 below. Risk level badge below dial. Radial glow behind score at 15% opacity. Shadow: drop-shadow in risk colour.
3 stat cards	Active Alerts (risk colour) | Confirmed Vendors (green) | Unconfirmed (orange if >0). Standard KPI card style. Stacked column right side.
Row 2 — Charts (2 cols)
Left — Risk Factors	Recharts BarChart layout="vertical". Factors: Weather Conditions | Vendor Reliability | Budget Variance | Guest Count Change | Timeline Pressure | External Dependencies. Colour-coded bars (green/amber/orange/red). Y-axis: factor name Inter 11px. X-axis: 0–100.
Right — Risk Trend	Recharts AreaChart. Score over time. Gradient fill in risk colour. Reference lines at 25/50/75 (dashed gray). Stats strip below: Current | Min | Max | Avg in 4 cols font-mono.
Row 3 — Financial Summary + AI Analysis (2 cols)
Financial card	Rows: Total Budget ₹ | Total Spend ₹ | Projected Cost ₹. Each: label gray-500 + value font-mono font-bold. Budget Utilisation progress bar below: animated width, colour changes at >80% amber >95% red. % value right of bar font-mono. "High Exposure" red banner if projected > budget.
AI card	🤖 "GEMINI AI ANALYSIS" label + "gemini-2.5-flash" badge. Summary paragraph text-sm gray-700. Numbered recommendations rows: font-mono "01" gray-400 + text purple-50 bg rounded-lg p-3.
Row 4 — Widgets (3 cols)
Booking donut	Recharts PieChart: Confirmed (green), Unconfirmed (orange), Cancelled (red). Legend rows below chart.
Weather widget	Emoji (☀️/🌧/⛈) + condition text + 3 metrics: Score | Rain% | Wind. Border-l-4 risk colour.
Live status	LIVE pulsing badge + Tasks completed/total + Critical incidents. Green border if ok, red if incidents.
Alerts Banner (full width, conditional)
Alert cards	red-50 bg container. Each alert: white bg, border-l-4 red-500 or orange-400, p-3, message + × dismiss button. Pulsing ring on CRITICAL.

Planner Financials
Route: /financials
Role: PLANNER ONLY
Cross-event financial overview. Budget vs actual vs projected for all events.

KPI row	4 cards: Total Budget (purple) | Total Spent (red) | Net Remaining (green if positive, red if negative) | Avg Budget Utilisation % (colour by level).
Budget gauge	Full-width progress bar card. Same style as Risk financial card. Shows overall spend/budget %.
Charts row	Left: Budget vs Spend per Event — grouped bar chart (2 bars per event: Budget purple-200, Spend purple-800). Right: Spend by Category donut (Venue/Catering/Decor/AV/Staff/Other). Same chart styles.
Events table	All events: Event Name | Budget ₹ | Spent ₹ | Remaining ₹ | Utilisation % progress bar (mini, inline) | Status badge. Hover bg-purple-50.
No planner data shared with vendors/clients	—


VENDOR PAGES

Vendor Dashboard
Route: /vendor/dashboard
Role: VENDOR ONLY
Vendor home. Pending requests, confirmed revenue, upcoming bookings.

KPI row	4 cards: Pending Requests (amber) | Confirmed Revenue ₹ (green) | Confirmed Count (green) | Total Bookings (purple).
Pending row	Section "Pending Requests ⚡" — horizontal scroll cards of REQUESTED bookings. Each: event name + planner name + date + amount + "Confirm" green button + "Reject" red ghost button.
Upcoming table	"Upcoming Bookings" — next 5 confirmed. Cols: Event | Planner | Date | Amount | Status.
Quick actions	Right column: "Manage Inventory" | "Manage Staff" | "View Financials" | "Risk Analysis" — stacked ghost buttons with icons.
Revenue card	Bottom: mini bar chart of revenue last 6 months (Recharts BarChart, purple-800 bars). Summary: This Month ₹ | Last Month ₹ | Growth %.

Inventory Management
Route: /vendor/inventory
Role: VENDOR ONLY
Accordion list of items and their variants.

Header	"Inventory" title + count. Right: search input + "+ Add Item" gradient button.
Item row	white rounded-xl border shadow-sm. hover border-purple-200. Collapsed: chevron + name + description truncated + category badge + price font-mono + qty chip + variants chip. Row actions on hover: Edit pencil + Delete trash.
Expanded	purple-50/40 sub-panel slides down. Variants table: Variant name (with colour swatch circle) | SKU font-mono | Qty font-mono | Price font-mono | Material | Actions. "+ Add Variant" dashed button at bottom.
Add Item drawer	Right slide-in 400px. Fields: Name, Category, Base Price (₹ prefix), Unit, Total Qty, Description, Has Variants toggle → variant builder rows.
Variant builder	When toggle on: each row has Name + colour circle picker (12 swatches) + Qty + Price override + delete. "+ Add Variant" dashed btn.

Staff Management
Route: /vendor/staff
Role: VENDOR ONLY
3-column card grid of team members.

Header	"Staff" title + count. Right: "+ Add Staff Member" gradient button.
Cards grid	3 cols desktop, 2 tablet, 1 mobile. gap-4.
Staff card	white, rounded-xl, shadow-md, p-5, text-center. Avatar: 64px gradient circle (vary gradient per card) white initials Plus Jakarta Sans 700 20px. Name 600 16px. Role badge pill. Phone Inter 13px gray-500. Notes truncated text-xs gray-400. Availability dot (green/amber/gray) + status text. Edit+Remove on hover only (opacity-0 group-hover:opacity-100).
Add drawer	Right slide-in. Fields: Full Name (required), Phone, Role, Notes. "Add Member" gradient submit.

Vendor Financials
Route: /vendor/financials
Role: VENDOR ONLY
Revenue, cost, profit overview. Vendor sees only their own business finances.

KPI row	4 cards: Total Revenue ₹ (green gradient bar) | Total Cost ₹ (red gradient bar) | Net Profit ₹ (purple) | Profit Margin % (colour by level: <10% red, 10-20% amber, ≥20% green).
Margin gauge	Same full-width progress bar card style. Fill colour = margin colour. "Healthy/Moderate/Low" chip right of bar.
Charts row	Left: Revenue by Booking — Recharts BarChart, one bar per confirmed booking, purple-800. Right: Cost Breakdown donut — Wages (purple-900) | Logistics (purple-600) | Material (purple-200) | Contingency (gray-300). Custom legend right of donut.
Revenue table	Cols: Event | Client | Date | Revenue ₹ | Status. Footer: "Total" + total ₹ bold font-mono purple-900.
Privacy	NO event budget shown here. NO client spend. NO planner data. ONLY vendor's own revenue and costs.

Vendor Risk Analysis
Route: /vendor/risk
Role: VENDOR ONLY
Operational risk only. No URL param — uses vendor ID from auth.

🔴  This page shows VENDOR-SPECIFIC operational risk ONLY. Must not show: event total budget, planner finances, client spend. These are private to planners.

Sub-bar	Same style as Planner Risk sub-bar. "VENDOR" emerald badge instead of "PLANNER" badge.
Arc dial	IDENTICAL to Planner Risk arc dial. Same SVG, same colours, same animations. Label: "OPERATIONAL RISK" below dial.
3 stat cards	Active Alerts | Confirmed Orders (green) | Pending Requests (amber if >0).
Factors chart	Factors: Delivery Reliability | Staff Availability | Booking Fulfilment Rate | Financial Exposure | Equipment Readiness | Weather Impact. Same BarChart layout=vertical style.
Trend chart	IDENTICAL style to Planner Risk trend chart. Same gradient, same stats strip.
Op Summary	Left col: Confirmed Bookings | Pending | Rejected | Staff Count | Inventory Items | Confirmed Revenue ₹ (green). NO profit margin. NO event budget.
AI panel	IDENTICAL style to Planner AI panel. Content focuses on: delivery, staffing, equipment, fulfilment.
Widgets row	Booking Status donut (Confirmed/Pending/Rejected) | Staff Readiness (count + availability %) | Equipment Status (total + available + low-stock warning).


CLIENT PAGES
🔴  CLIENT is a CONSUMER. They cannot create events, book vendors, or see financial details. Everything is read-only unless stated otherwise.

Client Dashboard
Route: /client/dashboard
Role: CLIENT ONLY
Overview of the client's events and bookings. No financial details.

Header	"Good to see you, {firstName} 👋" Plus Jakarta Sans 700 26px. Sub: "Here's your event overview" gray-500.
KPI row	4 cards: My Events count | Active Bookings (confirmed vendors) | Total Committed ₹ | Upcoming Events (next 30 days). NO profit margin. NO budget data.
Events grid	3 cols. Same event card style as Planner. Image strip + date + location + guests + status badge. Bottom: "Risk →" orange link + "Details →" purple link. NO edit button.
Bookings strip	Section "Recent Bookings" + "View all →" link. Vendor name + event name + status badge. NO price shown.
Empty states	No events: Calendar icon + "No events yet" + "Your planner will share events with you here." No CTA (client cannot create).

Client My Events
Route: /client/events
Role: CLIENT ONLY
Full event list with filter pills. Larger cards.

Header	"My Events" + count.
Filters	All | Upcoming | Past | Live. Pill tabs.
Cards grid	3 cols desktop. Larger cards (160px image strip). Same card elements. LIVE badge pulsing green top-left if event is live.
Empty state	Calendar 64px gray-300. "No events yet". No CTA button.

Client Event Detail (read-only)
Route: /events/:id  (CLIENT view)
Role: CLIENT ONLY
3-tab read-only view. No edit anywhere.

🔴  Absolutely no edit buttons, no delete buttons, no create buttons. Read-only throughout.
Hero card	Event name Plus Jakarta Sans 800 28px. Meta row: date | location | guests. Status badge. Single action button: "View Risk Analysis →" ghost. NO edit button.
Tabs	Overview | Bookings | Risk
Overview tab	2 col. Left: all event fields as read-only label+value rows. Right: Confirmed/Pending vendor count chips + mini risk dial + "View Full Risk →" link.
Bookings tab	Same table but: NO amount column (hidden from client). NO cancel/edit buttons. Status badge only. Note: "Contact your planner to make changes." text-center gray-400 mt-4.
Risk tab	Embeds ClientRiskDashboard view. Same as /risk/:eventId in CLIENT mode. No financial data.

Client Risk Analysis
Route: /risk/:eventId  →  ClientRiskDashboard
Role: CLIENT ONLY
Friendly risk view. No scores as numbers. No financial data. Emoji-based health meter.

🔴  This renders when role=CLIENT at /risk/:eventId. Completely different from Planner Risk. No ₹ budget, no spend, no utilisation bar.
Sub-bar	EVENT RISK OVERVIEW label (blue). Event name. Guest count. Refresh button. NO role badge.
Health meter	Left col: Circular SVG progress (not an arc dial — a full circle progress). Centre: emoji ✅/⚠️/🔶/🚨 + risk level text. Below: "Your event is on track / needs attention / at risk / critical" status badge. Descriptive paragraph below badge in small italic text.
Vendor status	Right col: Donut chart: Confirmed (green) | Pending (orange). Vendor confirmation % progress bar h-2.5. Amber banner if any pending: "{n} vendor(s) still pending confirmation" + "View bookings →" link.
Factor bars	Horizontal progress bars (NOT a BarChart — simpler inline bars). Label left + coloured bar + risk badge right. Each factor on its own row. "Higher = higher risk" note below.
Trend chart	Same AreaChart style as Planner but Y-axis tick labels replaced with "Safe"/"Critical" instead of numbers.
AI summary	Same card style. Label: "AI EVENT SUMMARY". Content: friendly plain-English summary. Recommendations: bullet list (not numbered). "What to keep in mind" sub-label.
Weather	Same weather card. No risk score number — just condition emoji + description + rain% + wind. Friendly language.
Alerts	Amber bg (not red) container. Label: "Things to be aware of". Alert cards border-l-4 amber. Same dismiss button.
Privacy	ABSOLUTELY NO: profit margin, event budget, vendor pricing, total spend, financial exposure.

Client Financials
Route: /client/financials
Role: CLIENT ONLY
What the client has committed to pay. No vendor cost breakdowns. No profit data.

Purpose	Client sees a friendly summary of what they've agreed to spend — not the event's internal budget or vendor costs.
KPI row	3 cards: Total Committed ₹ (sum of confirmed bookings) | Active Bookings count | Upcoming Payments count.
Committed chart	Donut chart: By category (Decor, Catering, AV etc). Custom legend. Label: "Committed by Category".
Bookings table	Vendor | Category | Date | Committed ₹ | Status. NO vendor internal cost. NO profit margin. Footer: Total ₹ bold.
Privacy	NO: event total budget, vendor cost breakdown, planner margin, any data the client was not directly told.


Master Routing Table — Implement Exactly

🔴  The router must enforce role guards. Wrong-role access = instant redirect to role home.

Path	Component	Role Access	Notes
/login	LoginPage	Public	Redirect to role home if already logged in
/register	RegisterPage	Public	Redirect to role home if already logged in
/	DashboardLayout → index	Auth required	Role-guard redirect on mount
/dashboard	PlannerDashboard	PLANNER only	Redirect vendor→/vendor/dashboard, client→/client/dashboard
/events/new	CreateEvent	PLANNER only	
/events/:id	EventDetail (planner) or ClientEventDetail	PLANNER + CLIENT	Render different component per role
/marketplace	MarketplaceSearch	PLANNER only	
/marketplace/vendor/:id	VendorProfile	PLANNER only	
/bookings	BookingsList	ALL roles	Role-aware columns
/bookings/new	BookVendor	PLANNER only	
/bookings/:id	BookingDetail	ALL roles	Role-aware actions
/financials	PlannerFinancials	PLANNER only	
/vendor/dashboard	VendorDashboard	VENDOR only	Redirect planner/client away
/vendor/inventory	InventoryManagement	VENDOR only	
/vendor/staff	StaffManagement	VENDOR only	
/vendor/financials	VendorFinancials	VENDOR only	
/vendor/risk	VendorRiskDashboard	VENDOR only	No URL param — uses auth user vendorId
/vendor/bookings/:id	BookingDetail	VENDOR only	Vendor-specific booking request detail
/client/dashboard	ClientDashboard	CLIENT only	Redirect planner/vendor away
/client/events	ClientEvents	CLIENT only	
/client/financials	ClientFinancials	CLIENT only	
/risk/:eventId	RiskDashboard → router	PLANNER + CLIENT	Reads role → renders PlannerRiskDashboard or ClientRiskDashboard
*	Navigate to role home	All	Catch-all redirect

RiskDashboard Router Logic (single component, 3 outputs)
export function RiskDashboard() {
  const { user } = useAuth();
  if (user.role === "CLIENT") return <ClientRiskDashboard />;
  if (user.role === "VENDOR") return <VendorRiskDashboard />;  // fallback, prefer /vendor/risk
  return <PlannerRiskDashboard />;
}


Final Quality Checklist

#	Requirement	Why
1	Purple-50 (#F5EBFA) page background on ALL pages	Visual consistency
2	White cards only — never colored card backgrounds	Clean, iOS-like
3	All transitions 200–320ms cubic-bezier spring easing	Smooth iOS feel
4	Cards hover: translateY(-4px) + shadow-xl	Depth and interactivity
5	Buttons scale to 0.95 on :active	Tactile press feedback
6	KPI values animate from 0 on mount with requestAnimationFrame	Premium data reveal
7	Progress bars animate from 0 after 200ms delay	Polished loading
8	Charts animate on entry (bars grow, lines draw)	Professional data viz
9	Skeleton loaders on ALL async content (shimmer animation)	No layout shift
10	All numbers use JetBrains Mono font	Monospace number alignment
11	All headings use Plus Jakarta Sans	Brand typography
12	Recharts used for ALL charts — ResponsiveContainer always wrapping	Responsive charts
13	CLIENT pages: zero financial data (no ₹ budget, no margin)	Data privacy
14	VENDOR risk page: no event budget, no planner data, no client spend	Data privacy
15	/risk/:eventId renders DIFFERENT component per role	Role separation
16	Role-guard redirects in DashboardLayout useEffect	Route security
17	Drawer panels: 400px wide, slide from right, spring animation	Consistent pattern
18	Empty states on ALL lists/tables (icon + heading + sub + optional CTA)	Complete UX
19	Mobile responsive: sidebar off-canvas, grids collapse, tables → cards	Mobile support
20	LIVE status has pulsing green dot animation	Real-time feel


EventFlow AI  ·  Figma Make Prompt v5  ·  Full Rebuild  ·  All 27 Pages
Paste this entire document into Figma Make