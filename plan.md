# Implementation Plan — Orangy Carpels

## V1 Scope (Core MVP)
Orangy Carpels is an operations app for design studios.
1. **Employee Management (HR/Staff)**: View/manage employee roles, capacity (hours/week), and cost/billing rates.
2. **Client & Project Registry**: View/manage clients and projects, setting billing rules (hourly vs. fixed retainer) and assignments.
3. **Weekly Timesheet Grid (Core Action)**: A grid interface to log daily hours for selected projects, validating capacity limits.
4. **Timesheet Workflow (Closing/Approvals)**: Submit, approve/reject weekly timesheets, and lock the periods.
5. **Billing Rules Engine & Utilization Report**: Basic automated calculation of hours, billable amounts, and utilization rates.

---

## Phase A — Setup
- [x] Initialize backend (Node.js + Fastify)
- [x] Initialize frontend (React + Vite + Tailwind CSS + TypeScript)
- [x] Setup folder structure
- [x] Create `Gemini.md` & `CLAUDE.md` (Done)
- [x] Verify both local servers run

**TEST**:
- Backend API server runs on port 5001 (returns basic health check)
- Frontend client runs on port 5173 (renders Vite+React landing page)

---

## Phase B — Core UI Layout
- [x] Configure global styling theme (Dylan Field inspired: minimalist, clean, light colors, low cognitive load, soft gray/white/accent borders)
- [x] Layout scaffolding: Sidebar navigation, Header context bar (Employee context, current dates)
- [x] Setup routing structure (V1 Pages: Timesheets, Dashboard/Utilization, Employees, Projects)
- [x] Build basic placeholder pages

**TEST**:
- Navigation works across all routes with no console errors
- Screen layouts are fully responsive (collapsible sidebar for mobile)

---

## Phase C — Core Feature: Weekly Timesheet Entry
- [x] Define JSON schemas and API routes for logging daily hours
- [x] Create service logic to validate timesheet submissions (hours, date ranges)
- [x] Build the frontend weekly grid interface (rows: Project/Task; cols: Mon-Sun)
- [x] Connect grid state to the API endpoints

**TEST**:
- An employee can add/update hours in their grid and save/submit
- API logs the saved timesheet entry correctly and responds with validation confirmation

---

## Phase D — Secondary Feature: HR & Project Registries
- [x] Setup API routes for Employees CRUD
- [x] Setup API routes for Clients & Projects CRUD (including assigning employees)
- [x] Build Employee and Project registry dashboards (lists and basic edit modals)

**TEST**:
- Admins can create and view employees, clients, and projects

---

## Phase E — Database Integration (Prisma + SQLite Local)
- [x] Define database schema in `schema.prisma` (models: User, Employee Profile, Client, Project, Assignment, TimesheetEntry, TimesheetPeriod)
- [x] Run initial migrations to SQLite (dev.db database and client generated)
- [x] Refactor service methods to query database via Prisma client
- [x] Seed script for local development

**TEST**:
- Core CRUD actions persist successfully to local MySQL database

---

## Phase F — Auth & Role-Based Access
- [x] Session-based cookie authentication middleware on Fastify backend
- [x] Login screen in React frontend
- [x] Frontend role guards (locking billing/rates reports to Admins/PMs)

**TEST**:
- Unauthorized users redirected to login
- Non-admin users cannot access rate fields or configuration pages

---

## Phase G — Polish & Validation
- [x] Comprehensive loading states (Skeleton screens)
- [x] Error handling and validation errors (inline alerts and ErrorBoundary)
- [x] Auto-save mechanism for timesheet (debounced save draft loops)
- [x] Review styles (minimal Figma visual parameters alignment)
- [x] Review UI and alignments for strict Dylan Field styling rules

**TEST**:
- All forms show validation errors; no raw exceptions leak to UI
- App runs smoothly at 60 FPS during views transitions

---

## Phase H — Deployment Prep
- [ ] Production configuration (Nginx reverse proxy, PM2 configs)
- [ ] Environment variables validation
- [ ] Create deploy scripts

**TEST**:
- Production build runs cleanly on a local target mimicking live environment
