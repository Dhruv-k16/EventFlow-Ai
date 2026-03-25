import { createBrowserRouter, redirect } from "react-router";
import { lazy } from "react";

// Lazy load all pages
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const DashboardLayout = lazy(() => import("./components/layouts/DashboardLayout").then(m => ({ default: m.DashboardLayout })));
const PlannerDashboard = lazy(() => import("./pages/planner/PlannerDashboard").then(m => ({ default: m.PlannerDashboard })));
const EventsList = lazy(() => import("./pages/planner/EventsList").then(m => ({ default: m.EventsList })));
const CreateEvent = lazy(() => import("./pages/planner/CreateEvent").then(m => ({ default: m.CreateEvent })));
const EventDetail = lazy(() => import("./pages/planner/EventDetail").then(m => ({ default: m.EventDetail })));
const MarketplaceSearch = lazy(() => import("./pages/planner/MarketplaceSearch").then(m => ({ default: m.MarketplaceSearch })));
const VendorProfile = lazy(() => import("./pages/planner/VendorProfile").then(m => ({ default: m.VendorProfile })));
const BookVendor = lazy(() => import("./pages/planner/BookVendor").then(m => ({ default: m.BookVendor })));
const BookingsList = lazy(() => import("./pages/shared/BookingsList").then(m => ({ default: m.BookingsList })));
const BookingDetail = lazy(() => import("./pages/shared/BookingDetail").then(m => ({ default: m.BookingDetail })));
const PlannerFinancials = lazy(() => import("./pages/planner/PlannerFinancials").then(m => ({ default: m.PlannerFinancials })));
const PlannerStaffManagement = lazy(() => import("./pages/planner/PlannerStaffManagement").then(m => ({ default: m.PlannerStaffManagement })));
const VendorDashboard = lazy(() => import("./pages/vendor/VendorDashboard").then(m => ({ default: m.VendorDashboard })));
const InventoryManagement = lazy(() => import("./pages/vendor/InventoryManagement").then(m => ({ default: m.InventoryManagement })));
const StaffManagement = lazy(() => import("./pages/vendor/StaffManagement").then(m => ({ default: m.StaffManagement })));
const VendorFinancials = lazy(() => import("./pages/vendor/VendorFinancials").then(m => ({ default: m.VendorFinancials })));
const VendorPortfolio = lazy(() => import("./pages/vendor/VendorPortfolio").then(m => ({ default: m.VendorPortfolio })));
const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard").then(m => ({ default: m.ClientDashboard })));
const ClientEvents = lazy(() => import("./pages/client/ClientEvents").then(m => ({ default: m.ClientEvents })));
const ClientEventDetail = lazy(() => import("./pages/client/ClientEventDetail").then(m => ({ default: m.ClientEventDetail })));
const ClientFinancials = lazy(() => import("./pages/client/ClientFinancials").then(m => ({ default: m.ClientFinancials })));
const ClientCreateEvent = lazy(() => import("./pages/client/ClientCreateEvent").then(m => ({ default: m.ClientCreateEvent })));
const ClientEventTypeSelection = lazy(() => import("./pages/client/ClientEventTypeSelection").then(m => ({ default: m.ClientEventTypeSelection })));
const ClientMarketplace = lazy(() => import("./pages/client/ClientMarketplace").then(m => ({ default: m.ClientMarketplace })));
const ClientVendorProfile = lazy(() => import("./pages/client/ClientVendorProfile").then(m => ({ default: m.ClientVendorProfile })));
const ClientBookVendor = lazy(() => import("./pages/client/ClientBookVendor").then(m => ({ default: m.ClientBookVendor })));
const RiskDashboard = lazy(() => import("./pages/shared/RiskDashboard").then(m => ({ default: m.RiskDashboard })));
const VendorRiskDashboard = lazy(() => import("./pages/vendor/VendorRiskDashboard").then(m => ({ default: m.VendorRiskDashboard })));
const VendorCreateBooking = lazy(() => import("./pages/vendor/VendorCreateBooking").then(m => ({ default: m.VendorCreateBooking })));

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        loader: () => redirect("/dashboard"),
      },
      // Planner routes
      {
        path: "dashboard",
        Component: PlannerDashboard,
      },
      {
        path: "events",
        Component: EventsList,
      },
      {
        path: "events/new",
        Component: CreateEvent,
      },
      {
        path: "events/:id",
        Component: EventDetail,
      },
      {
        path: "client/events/:id",
        Component: ClientEventDetail,
      },
      {
        path: "marketplace",
        Component: MarketplaceSearch,
      },
      {
        path: "marketplace/vendor/:id",
        Component: VendorProfile,
      },
      {
        path: "bookings/new",
        Component: BookVendor,
      },
      {
        path: "financials",
        Component: PlannerFinancials,
      },
      {
        path: "staff",
        Component: PlannerStaffManagement,
      },
      // Shared routes
      {
        path: "bookings",
        Component: BookingsList,
      },
      {
        path: "bookings/:id",
        Component: BookingDetail,
      },
      {
        path: "risk/:eventId",
        Component: RiskDashboard,
      },
      // Vendor routes
      {
        path: "vendor/dashboard",
        Component: VendorDashboard,
      },
      {
        path: "vendor/inventory",
        Component: InventoryManagement,
      },
      {
        path: "vendor/staff",
        Component: StaffManagement,
      },
      {
        path: "vendor/financials",
        Component: VendorFinancials,
      },
      {
        path: "vendor/risk",
        Component: VendorRiskDashboard,
      },
      {
        path: "vendor/bookings/new",
        Component: VendorCreateBooking,
      },
      {
        path: "vendor/portfolio",
        Component: VendorPortfolio,
      },
      // Client routes
      {
        path: "client/dashboard",
        Component: ClientDashboard,
      },
      {
        path: "client/events",
        Component: ClientEvents,
      },
      {
        path: "client/financials",
        Component: ClientFinancials,
      },
      {
        path: "client/create-event",
        Component: ClientCreateEvent,
      },
      {
        path: "client/create-event/select-type",
        Component: ClientEventTypeSelection,
      },
      {
        path: "client/marketplace",
        Component: ClientMarketplace,
      },
      {
        path: "client/marketplace/:type/:id",
        Component: ClientVendorProfile,
      },
      {
        path: "client/bookings/new",
        Component: ClientBookVendor,
      },
    ],
  },
]);