# Orangy Carpels V1 — Complete Build Plan
> Timesheet Management System · Orangy Design Studio
> Stack: Laravel · React · Tailwind · MySQL · Redis
> Generated: March 2026

---

## PHASE 1 — Idea Reality Check ✅

**What it does:** Internal timesheet platform where design studio employees log billable hours per client/project, managers approve them, and the Super Admin views revenue with multi-currency support.

**Who it's for:** Orangy Design Studio team — Employees, Project Managers, and one Super Admin.

**The ONE core action:** Employee fills a weekly timesheet grid → submits → PM approves → Admin sees revenue.

**Complexity Rating:** `Complex (8–12 sessions)` — Multi-role auth, approval workflow, weekly grid UI, multi-currency calculations, role-based dashboards.

**Platform:** Web app (responsive for desktop + tablet).

---

## PHASE 2 — MVP Feature Scope ✅

### Product Definition
Orangy Carpels is a web-based timesheet management platform that helps Orangy Design Studio track billable hours against clients and projects through a structured approval workflow, giving the Super Admin real-time revenue visibility with multi-currency support — without the overhead of a generic PM tool.

### V1 Feature List (Ship These)

| # | Feature | Why Essential |
|---|---------|--------------|
| 1 | **Auth + RBAC** | 3-role system is the backbone of every module |
| 2 | **Employee Management** | Users need accounts before anything works |
| 3 | **Client Management** | Projects are grouped under clients |
| 4 | **Project Management** | Timesheets log against projects |
| 5 | **Activity Types** | Categorized dropdown on timesheet form |
| 6 | **Weekly Timesheet Grid** | The core product action — log, save draft, submit |
| 7 | **Approval Workflow** | PM approve/reject per project, admin override |
| 8 | **Exchange Rates** | Semi-auto fetch, versioned, lock per client/month |
| 9 | **Role-Based Dashboards** | 3 different views (Employee / PM / Admin) |

### V2 Parking Lot (These Can Wait)

| Feature | Why It Can Wait |
|---------|----------------|
| Attendance / Check-in | Independent system, no overlap with timesheets |
| Leave Management | Separate approval workflow entirely |
| Document Uploads | Employee records work without attachments |
| Invoice Generation | Rate lock covers the billing need for now |
| Budget Alerts | Dashboard shows data; manual reading is fine for V1 |
| Email Notifications | Manual workflow is acceptable at studio scale |
| PDF / Excel Export | Admin can screenshot dashboards for now |
| Live Currency API (auto-fetch) | Semi-auto is sufficient and safer |
| Comp-off Workflow | Part of leave system (parked above) |

---

## PHASE 3 — Tech Stack ✅

```
Backend      Laravel 11 (PHP 8.3)
Frontend     React 18 + Vite + Tailwind CSS v3
Database     MySQL 8.0 + stancl/tenancy (tenant-ready schema)
Auth         Laravel Passport (OAuth2, JWT tokens)
Permissions  spatie/laravel-permission (roles + permissions)
Actions      lorisleiva/laravel-actions
API          RESTful, versioned — /api/v1/
Async        Laravel Queues (Redis driver) + Laravel Horizon
Dev Env      Laravel Sail (Docker) or Herd
Deployment   Forge + DigitalOcean (or Railway for quick launch)
```

**Why this stack:**
- Laravel's service-layer maps perfectly to the module-based requirements doc
- `spatie/laravel-permission` handles the 3-role matrix out of the box
- `stancl/tenancy` keeps the schema tenant-ready for future studio expansion
- Laravel Horizon gives a UI to monitor the async rate-fetch jobs
- Vite + React SPA communicates with Laravel via versioned API — clean separation

---

## PHASE 4 — CLAUDE.md (AI Memory File)

> Save this as `CLAUDE.md` in the project root. Update "Current Status" after every phase.

```markdown
# Orangy Carpels — AI Memory File

## Product
Internal timesheet management platform for Orangy Design Studio.
Employees log weekly hours against projects. PMs approve. Super Admin sees revenue.

## Users
- Employee: log + submit own timesheets, view own data
- Project Manager: approve/reject assigned projects, view team hours (no financials)
- Super Admin: full access including financials, client finalization, exchange rates

## Tech Stack
- Backend: Laravel 11 / PHP 8.3 (API only — no Blade views)
- Frontend: React 18 + Vite + Tailwind CSS v3 (SPA, separate /frontend dir)
- Database: MySQL 8.0
- Multi-tenancy: stancl/tenancy (tenant-ready, single tenant for V1)
- Auth: Laravel Passport (Bearer tokens)
- Permissions: spatie/laravel-permission
- Actions: lorisleiva/laravel-actions
- API prefix: /api/v1/
- Async: Laravel Queues with Redis driver + Laravel Horizon

## Repository Structure
/backend  → Laravel application
/frontend → React + Vite SPA
CLAUDE.md → This file
plan.md   → Phase-by-phase build tracker

## Backend Architecture Rules
- ALL business logic goes in App\Actions\ (lorisleiva pattern) — never in controllers
- Controllers are thin: validate request → call Action → return response
- Use App\Services\ for complex orchestration between multiple Actions
- Models live in App\Models\ — relationships and scopes only, no business logic
- API routes in routes/api.php, grouped by role and version (/api/v1/)
- FormRequests in App\Http\Requests\ for all validation
- Resources in App\Http\Resources\ for all JSON responses (never return raw models)
- Policies in App\Policies\ for all authorization checks
- Database: soft deletes on ALL models (never hard delete)
- Migrations: one file per table, run php artisan migrate:fresh --seed for dev resets

## Frontend Architecture Rules
- Pages in /frontend/src/pages/ organized by role: /admin, /pm, /employee
- Shared components in /frontend/src/components/ui/
- Feature components in /frontend/src/components/[feature]/
- API calls only via /frontend/src/services/api.js (axios instance with auth headers)
- Auth state managed in /frontend/src/store/authStore.js (Zustand)
- Route protection via PrivateRoute component checking role
- Design: clean, minimal, light palette — Orangy brand feel
  - Primary accent: #F97316 (orange-500) — Orangy brand
  - Background: #F9FAFB (gray-50)
  - Surface: #FFFFFF
  - Text primary: #111827
  - Text muted: #6B7280
  - Border: #E5E7EB

## Code Style — Backend
- PSR-12 code style
- Strict types: declare(strict_types=1) in every file
- Actions are invokable classes: public function handle(...)
- Always use Eloquent Resources, never return $model->toArray()
- Enum classes for status fields (EntryStatus, BillingType, etc.)
- Use $request->validated() always — never $request->input()

## Code Style — Frontend
- Functional components only — no class components
- async/await everywhere — no raw .then() chains
- Every API call wrapped in try/catch
- Loading + error states on every data-fetching component
- Files: kebab-case (weekly-grid.jsx) — Components: PascalCase (WeeklyGrid)
- Keep components under 150 lines — split if longer

## Key Business Rules (Never Break These)
- Timesheets are WEEKLY (Monday–Sunday)
- Submission splits by project — each goes to its assigned PM
- Rejection requires a reason — employee edits SAME entry and resubmits
- After approval → LOCKED — only Super Admin can unlock
- Status flow: Draft → Submitted → Approved/Rejected → (edit) → Submitted
- Week shows "Partially Approved" until ALL project PMs approve
- Inactive projects hidden from dropdowns, no new entries allowed
- Deactivated employees cannot log in; their drafts stay in draft
- Financial/revenue data is SUPER ADMIN ONLY — never expose to PM or Employee
- Soft delete only — never hard delete any record
- Exchange rates are versioned — no overwrites; lock per client per month

## Build Commands
# Backend
cd backend && php artisan serve        # Dev server :8000
php artisan migrate:fresh --seed       # Reset DB
php artisan horizon                    # Start queue worker UI
php artisan test                       # Run tests

# Frontend
cd frontend && npm run dev             # Dev server :5173
npm run build                          # Production build
npm run lint                           # ESLint

## Current Status
- Phase: NOT STARTED
- Completed: []
- In Progress: —
- Blocked: —
```

---

## PHASE 5 — Architecture & File Structure

```
orangy-app/
├── CLAUDE.md                          ← AI memory (Phase 4)
├── plan.md                            ← Build tracker (Phase 6)
│
├── backend/                           ← Laravel 11 API
│   ├── app/
│   │   ├── Actions/
│   │   │   ├── Auth/
│   │   │   │   └── LoginAction.php
│   │   │   ├── Employees/
│   │   │   │   ├── CreateEmployeeAction.php
│   │   │   │   ├── UpdateEmployeeAction.php
│   │   │   │   └── ToggleEmployeeStatusAction.php
│   │   │   ├── Clients/
│   │   │   │   ├── CreateClientAction.php
│   │   │   │   └── UpdateClientAction.php
│   │   │   ├── Projects/
│   │   │   │   ├── CreateProjectAction.php
│   │   │   │   ├── UpdateProjectAction.php
│   │   │   │   └── AssignEmployeesAction.php
│   │   │   ├── ActivityTypes/
│   │   │   │   ├── CreateCategoryAction.php
│   │   │   │   └── CreateActivityTypeAction.php
│   │   │   ├── Timesheets/
│   │   │   │   ├── SaveDraftAction.php
│   │   │   │   ├── SubmitWeekAction.php
│   │   │   │   ├── ApproveEntriesAction.php
│   │   │   │   ├── RejectEntriesAction.php
│   │   │   │   └── UnlockEntriesAction.php       ← Super Admin only
│   │   │   └── ExchangeRates/
│   │   │       ├── FetchRateAction.php            ← Dispatches async job
│   │   │       └── FinalizeClientMonthAction.php
│   │   │
│   │   ├── Enums/
│   │   │   ├── UserRole.php                       ← Employee/PM/SuperAdmin
│   │   │   ├── EntryStatus.php                    ← Draft/Submitted/Approved/Rejected
│   │   │   ├── BillingType.php                    ← TM/MonthlyFixed/ProjectFixed
│   │   │   └── Currency.php                       ← USD/INR/EUR/GBP
│   │   │
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── EmployeeController.php
│   │   │   │   ├── ClientController.php
│   │   │   │   ├── ProjectController.php
│   │   │   │   ├── ActivityTypeController.php
│   │   │   │   ├── TimesheetController.php
│   │   │   │   ├── ExchangeRateController.php
│   │   │   │   └── DashboardController.php
│   │   │   ├── Middleware/
│   │   │   │   └── EnsureRole.php
│   │   │   └── Requests/
│   │   │       ├── Auth/LoginRequest.php
│   │   │       ├── Employees/StoreEmployeeRequest.php
│   │   │       ├── Clients/StoreClientRequest.php
│   │   │       ├── Projects/StoreProjectRequest.php
│   │   │       ├── Timesheets/SaveDraftRequest.php
│   │   │       ├── Timesheets/SubmitWeekRequest.php
│   │   │       └── Timesheets/RejectRequest.php
│   │   │
│   │   ├── Models/
│   │   │   ├── User.php                           ← Employee (uses HasRoles)
│   │   │   ├── Client.php
│   │   │   ├── Project.php
│   │   │   ├── ActivityCategory.php
│   │   │   ├── ActivityType.php
│   │   │   ├── TimesheetEntry.php
│   │   │   ├── ExchangeRate.php
│   │   │   └── RateVersion.php                    ← Versioned rate history
│   │   │
│   │   ├── Http/Resources/
│   │   │   ├── UserResource.php
│   │   │   ├── ClientResource.php
│   │   │   ├── ProjectResource.php
│   │   │   ├── ActivityTypeResource.php
│   │   │   ├── TimesheetEntryResource.php
│   │   │   ├── ExchangeRateResource.php
│   │   │   └── Dashboard/
│   │   │       ├── EmployeeDashboardResource.php
│   │   │       ├── PMDashboardResource.php
│   │   │       └── AdminDashboardResource.php
│   │   │
│   │   ├── Policies/
│   │   │   ├── TimesheetPolicy.php
│   │   │   ├── ProjectPolicy.php
│   │   │   └── ClientPolicy.php
│   │   │
│   │   └── Jobs/
│   │       └── FetchExchangeRateJob.php            ← Redis queued
│   │
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── 0001_create_users_table.php
│   │   │   ├── 0002_create_clients_table.php
│   │   │   ├── 0003_create_projects_table.php
│   │   │   ├── 0004_create_project_user_table.php  ← Pivot: assigned employees
│   │   │   ├── 0005_create_activity_categories_table.php
│   │   │   ├── 0006_create_activity_types_table.php
│   │   │   ├── 0007_create_timesheet_entries_table.php
│   │   │   ├── 0008_create_exchange_rates_table.php
│   │   │   └── 0009_create_rate_versions_table.php
│   │   └── seeders/
│   │       ├── RolesPermissionsSeeder.php          ← MUST run first
│   │       ├── SuperAdminSeeder.php
│   │       └── ActivityTypeSeeder.php
│   │
│   └── routes/
│       └── api.php                                 ← All routes here, versioned
│
└── frontend/                          ← React 18 + Vite SPA
    ├── src/
    │   ├── main.jsx                   ← Entry point, router setup
    │   ├── App.jsx                    ← Root with auth routing
    │   │
    │   ├── store/
    │   │   └── authStore.js           ← Zustand: user, token, role
    │   │
    │   ├── services/
    │   │   └── api.js                 ← Axios instance (base URL, auth headers, interceptors)
    │   │
    │   ├── components/
    │   │   ├── ui/                    ← Reusable: Button, Input, Badge, Modal, Table, Spinner
    │   │   ├── layout/
    │   │   │   ├── AppShell.jsx       ← Sidebar + topbar wrapper
    │   │   │   ├── Sidebar.jsx        ← Role-aware nav links
    │   │   │   └── PrivateRoute.jsx   ← Auth + role guard
    │   │   ├── timesheets/
    │   │   │   ├── WeeklyGrid.jsx     ← The core component — Mon–Sun grid
    │   │   │   ├── EntryRow.jsx       ← One row: project + activity + 7 day inputs
    │   │   │   ├── WeekNavigator.jsx  ← Prev/Next week selector
    │   │   │   └── ApprovalBadge.jsx  ← Status pill with color
    │   │   └── dashboard/
    │   │       ├── StatCard.jsx
    │   │       ├── PieChart.jsx       ← Billable vs Non-billable
    │   │       └── RevenueTable.jsx
    │   │
    │   └── pages/
    │       ├── auth/
    │       │   └── LoginPage.jsx
    │       ├── employee/
    │       │   ├── TimesheetPage.jsx  ← Weekly grid + submit
    │       │   └── DashboardPage.jsx
    │       ├── pm/
    │       │   ├── ApprovalsPage.jsx  ← List of submitted timesheets
    │       │   └── DashboardPage.jsx
    │       └── admin/
    │           ├── DashboardPage.jsx
    │           ├── employees/
    │           │   ├── EmployeeListPage.jsx
    │           │   └── EmployeeFormPage.jsx
    │           ├── clients/
    │           │   ├── ClientListPage.jsx
    │           │   └── ClientFormPage.jsx
    │           ├── projects/
    │           │   ├── ProjectListPage.jsx
    │           │   └── ProjectFormPage.jsx
    │           ├── activity-types/
    │           │   └── ActivityTypePage.jsx
    │           └── exchange-rates/
    │               └── ExchangeRatePage.jsx
    │
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## PHASE 6 — Implementation Plan (plan.md)

> Track your progress here. Check off tasks, update CLAUDE.md status after each phase.

```markdown
# Orangy Carpels — Implementation Tracker

## PHASE A: Backend Foundation
- [ ] Create Laravel 11 project in /backend
- [ ] Install packages: passport, spatie/permission, laravel-actions, stancl/tenancy, horizon
- [ ] Configure .env (DB, Redis, APP_URL)
- [ ] Write all 9 migrations (users → entries → exchange_rates)
- [ ] Create all Enum classes (UserRole, EntryStatus, BillingType, Currency)
- [ ] Run RolesPermissionsSeeder — define all 3 roles + permission matrix
- [ ] Run SuperAdminSeeder — create one admin login
- [ ] Run ActivityTypeSeeder — pre-populate UX/Dev/General categories
TEST: php artisan migrate:fresh --seed runs clean. 
      php artisan passport:install succeeds.
      Roles exist in DB.
TIME: 45–60 min

## PHASE B: Auth API
- [ ] Install and configure Laravel Passport
- [ ] Build AuthController: login, logout, me endpoints
- [ ] LoginAction — validate credentials, check active status, return token + role
- [ ] EnsureRole middleware
- [ ] FormRequest: LoginRequest with validation
- [ ] UserResource (id, name, email, role, designation)
- [ ] Routes: POST /api/v1/auth/login, POST /api/v1/auth/logout, GET /api/v1/auth/me
TEST: POST /api/v1/auth/login with seeded admin returns token + role.
      Inactive user login returns 403.
TIME: 30–40 min

## PHASE C: Employee Module (Backend)
- [ ] User model: fillable, casts, roles relationship, scopeActive
- [ ] EmployeeController: index, store, show, update, toggleStatus
- [ ] CreateEmployeeAction, UpdateEmployeeAction, ToggleEmployeeStatusAction
- [ ] StoreEmployeeRequest, UpdateEmployeeRequest
- [ ] UserResource
- [ ] Routes: CRUD under /api/v1/admin/employees (admin only)
TEST: Create employee via API → appears in list → deactivate → login attempt returns 403.
TIME: 30 min

## PHASE D: Client + Project Modules (Backend)
- [ ] Client model + ClientController CRUD
- [ ] CreateClientAction, UpdateClientAction
- [ ] Project model (billingType enum, hourlyRate/monthlyCost/projectCost conditionals)
- [ ] ProjectController CRUD + assignEmployees endpoint
- [ ] CreateProjectAction, UpdateProjectAction, AssignEmployeesAction
- [ ] project_user pivot table migration (if not done in Phase A)
- [ ] Policies: ClientPolicy, ProjectPolicy
- [ ] Routes: /api/v1/admin/clients, /api/v1/admin/projects
        PM routes: /api/v1/pm/projects (assigned only)
TEST: Create client → create project under client → assign employees → project appears
      in employee's assigned list only.
TIME: 45 min

## PHASE E: Activity Types Module (Backend)
- [ ] ActivityCategory model + ActivityType model
- [ ] ActivityTypeController: index (grouped), store category, store type, update, delete
- [ ] Routes: /api/v1/admin/activity-types (admin CRUD)
        GET /api/v1/activity-types (all roles — for dropdown)
- [ ] ActivityTypeResource: returns nested { category, types[] }
TEST: GET /api/v1/activity-types returns grouped dropdown data.
TIME: 20 min

## PHASE F: Timesheet Module — Core CRUD (Backend)
- [ ] TimesheetEntry model: all fields, status enum, relationships
- [ ] TimesheetController: index (week view), store/update (draft), show
- [ ] SaveDraftAction — upsert entries for a week
- [ ] Validation: hours > 0, ≤ 24, not future date, project active, employee assigned
- [ ] TimesheetEntryResource
- [ ] Routes: /api/v1/timesheets (employee + PM + admin)
        GET ?week_start=2026-03-02 returns all entries for that week
TEST: Log 3 entries for a week. GET returns them. Edit hours. Status stays Draft.
TIME: 45 min

## PHASE G: Timesheet Workflow — Submit / Approve / Reject (Backend)
- [ ] SubmitWeekAction — batch status change Draft→Submitted, split by project
- [ ] ApproveEntriesAction — PM approves project entries, check all-approved → week locked
- [ ] RejectEntriesAction — requires rejection reason, sets status Rejected
- [ ] UnlockEntriesAction — Super Admin only
- [ ] TimesheetPolicy: who can approve/reject/unlock
- [ ] Week status logic: Draft / Partially Submitted / Submitted / Partially Approved / Approved
- [ ] Routes: POST /api/v1/timesheets/submit-week
        POST /api/v1/timesheets/{id}/approve (PM + admin)
        POST /api/v1/timesheets/{id}/reject (PM + admin)
        POST /api/v1/timesheets/{id}/unlock (admin only)
TEST: Submit week → PM approves one project → week shows Partially Approved → 
      PM approves second → week shows Approved → locked → employee cannot edit.
TIME: 60 min (most complex backend phase)

## PHASE H: Exchange Rates Module (Backend)
- [ ] ExchangeRate model + RateVersion model
- [ ] FetchExchangeRateJob — dispatched to Redis queue, stores new version
- [ ] FetchRateAction — dispatches job, returns "fetching" response
- [ ] FinalizeClientMonthAction — fetches final rate, locks for client/month
- [ ] ExchangeRateController: index (history), fetchRate, finalize
- [ ] Routes: /api/v1/admin/exchange-rates
TEST: Click fetch → job dispatched → new rate version appears in history.
      Finalize month → rate locked → cannot re-finalize.
TIME: 40 min

## PHASE I: Dashboard APIs (Backend)
- [ ] DashboardController with 3 separate endpoints by role
- [ ] Employee dashboard: hours this week/month, pending submissions, projects, billable pie
- [ ] PM dashboard: team hours, pending approvals count, team utilization %, project breakdown
- [ ] Admin dashboard: total hours, revenue (USD+INR), billable split, client revenue, 
      project revenue, team utilization, pending finalizations
- [ ] Revenue calculation: T&M (hours × rate), Monthly Fixed, Project Fixed logic
- [ ] Routes: GET /api/v1/dashboard (returns data based on authenticated user's role)
TEST: Login as each role → /api/v1/dashboard returns different shapes.
      Admin sees revenue. PM sees NO revenue. Employee sees NO revenue.
TIME: 60 min

---

## PHASE J: Frontend Foundation
- [ ] Create Vite + React project in /frontend
- [ ] Install: axios, zustand, react-router-dom v6, recharts, @headlessui/react
- [ ] Configure Tailwind (brand colors: orange-500 primary, gray-50 bg)
- [ ] Create api.js — axios instance with base URL, auth header interceptor, 401 handler
- [ ] Create authStore.js — Zustand store: { user, token, role, login(), logout() }
- [ ] Create AppShell: sidebar (role-aware nav) + topbar + main content area
- [ ] Create PrivateRoute (checks token + role)
- [ ] Create LoginPage
TEST: Open localhost:5173 → redirected to /login → login with admin → lands on dashboard.
TIME: 45 min

## PHASE K: Admin CRUD Pages (Frontend)
- [ ] EmployeeListPage: table with status badge, add/edit modal, toggle status
- [ ] ClientListPage: table, add/edit form, currency badge
- [ ] ProjectListPage: table, full form (billing type conditional fields), assign employees
- [ ] ActivityTypePage: category accordion with nested types, add/delete
- [ ] Shared: DataTable, Modal, FormInput, Select, Toggle components in /ui/
TEST: Create employee → create client → create project → assign employee → 
      activity types show grouped.
TIME: 90 min (most visual work)

## PHASE L: Timesheet — Weekly Grid (Frontend)
- [ ] WeekNavigator: prev/next week, display Mon DD – Sun DD MMM YYYY
- [ ] WeeklyGrid: table with rows (project + activity) and columns (Mon–Sun + Total)
- [ ] EntryRow: inline hour inputs per day (0.25 step), description field, billable toggle
- [ ] Add row button: project dropdown (assigned only) + activity type dropdown (grouped)
- [ ] Auto-calculate row total + week total footer
- [ ] Save Draft button → POST entries
- [ ] Status display: Draft / Submitted / Partially Approved / Approved badge
- [ ] Submitted/Approved weeks are read-only (inputs disabled)
TEST: Log hours Mon–Fri → total calculates → Save Draft → reload → data persists.
      Submitted week shows read-only grid.
TIME: 90 min (most complex UI)

## PHASE M: Timesheet — Submit + Approval Flow (Frontend)
- [ ] Submit Week button (only if all required fields filled, status Draft/Rejected)
- [ ] Rejection banner: shows reason + allows re-edit + resubmit
- [ ] PM ApprovalsPage: list of submitted weeks grouped by employee + project
- [ ] Approve button → confirmation → status updates live
- [ ] Reject modal: rejection reason textarea (required) → submit
- [ ] Admin: unlock button on approved entries
TEST: Employee submits → PM sees in approvals → PM rejects with reason → 
      Employee sees rejection banner → edits → resubmits → PM approves → locked.
TIME: 60 min

## PHASE N: Dashboards (Frontend)
- [ ] Employee Dashboard: stat cards, pie chart (Recharts), project list
- [ ] PM Dashboard: team hours card, pending approvals count, utilization %, project table
- [ ] Admin Dashboard: revenue cards (USD/INR toggle), billable pie, 
      client revenue table, pending finalizations list
- [ ] ExchangeRatePage: rate history table, Fetch Rate button (loading state), 
      Finalize Month per client button
TEST: Each role sees correct data. Admin toggles USD↔INR on revenue cards.
      No revenue data visible to PM or Employee.
TIME: 75 min

## PHASE O: Polish + Responsive + Deploy
- [ ] Tablet responsiveness (sidebar collapses to drawer)
- [ ] Loading skeletons on all data-fetching components
- [ ] Empty states (no timesheets logged, no projects assigned)
- [ ] Consistent error toasts (react-hot-toast)
- [ ] Soft warning UI if 10+ hours logged in a day
- [ ] Form validations match backend rules
- [ ] Configure CORS in Laravel for production domain
- [ ] Deploy backend (Forge/Railway), run migrations + passport:install
- [ ] Deploy frontend (Vercel or same server), set VITE_API_URL
TEST: Full end-to-end: Employee logs week → PM approves → Admin sees revenue → Live URL works.
TIME: 60–90 min
```

---

## PHASE 7 — Execution Prompts (Copy-Paste Ready)

### ► SETUP PROMPT (Run Once)

```
I'm building Orangy Carpels — an internal timesheet management platform 
for a design studio with 3 roles: Employee, Project Manager, Super Admin.

Read my memory file carefully before doing ANYTHING:

[PASTE FULL CLAUDE.md CONTENT HERE]

My complete file structure will be:
[PASTE PHASE 5 ARCHITECTURE HERE]

My build plan:
[PASTE PHASE 6 plan.md HERE]

Confirm you understand the project, the roles, and the business rules.
Then execute PHASE A only:
1. Create a Laravel 11 project in /backend
2. Install packages: laravel/passport, spatie/laravel-permission, 
   lorisleiva/laravel-actions, stancl/tenancy, laravel/horizon
3. Write all 9 migrations exactly as described in the architecture
4. Create Enum classes: UserRole, EntryStatus, BillingType, Currency
5. Create and run RolesPermissionsSeeder, SuperAdminSeeder, ActivityTypeSeeder
6. Run php artisan migrate:fresh --seed — confirm it runs clean

Do NOT build any controllers, actions, or API routes yet. Setup only.
Show me the output of migrate:fresh --seed when done.
```

---

### ► PHASE B PROMPT — Auth API

```
Continuing Orangy Carpels. Phase A is complete (migrations, seeders, packages installed).
Starting Phase B: Auth API.

Current status from CLAUDE.md:
- Phase A complete: migrations, enums, seeders, passport installed
- Starting: Auth API

Rules (from CLAUDE.md — follow these strictly):
- Controllers are THIN — validate → call Action → return Resource
- Business logic in Actions only (App\Actions\Auth\LoginAction)
- Always return Eloquent Resources, never raw model data
- Deactivated employees must get 403 on login attempt

Build Phase B tasks:
1. AuthController with login, logout, me methods
2. LoginAction — check credentials, check active status, issue Passport token
3. LoginRequest with validation rules
4. UserResource (id, name, email, role, designation)
5. EnsureRole middleware
6. Routes in routes/api.php under prefix /api/v1/auth/

After building, test with:
- POST /api/v1/auth/login (valid credentials) → returns token + user data
- POST /api/v1/auth/login (inactive user) → returns 403

Show me the test results before marking Phase B complete.
```

---

### ► PHASE F PROMPT — Timesheet Core (Most Complex Backend Phase)

```
Continuing Orangy Carpels. Phases A–E are complete.
Starting Phase F: Timesheet Core CRUD.

This is the most important module. Read these rules carefully:

TIMESHEET RULES (non-negotiable):
- Periods are weekly: Monday to Sunday
- One TimesheetEntry per (employee, date, project, activity_type)
- Hours must be > 0, ≤ 24, in 0.25 increments
- Date cannot be in the future
- Project must be active
- Employee must be assigned to the project
- Status enum: Draft | Submitted | Approved | Rejected
- Soft delete only

SAVE DRAFT behavior:
- Upsert entries for the given week (update if exists, create if not)
- Status stays "Draft" on save
- Return all entries for that week after saving

GET week endpoint:
- GET /api/v1/timesheets?week_start=2026-03-02
- Returns all entries for logged-in user for that Monday-Sunday period
- Groups by project for frontend grid rendering

Build:
1. TimesheetEntry model with all relationships and status cast to Enum
2. SaveDraftAction (upsert logic)
3. TimesheetController: index (week), store (save draft), show
4. SaveDraftRequest with all validation rules
5. TimesheetEntryResource
6. Routes under /api/v1/timesheets

Test:
- Log 3 entries for week 2026-03-02 → GET returns them grouped
- Update hours on one entry → hours updated, status still Draft
- Try to log against inactive project → validation error returned
```

---

### ► PHASE L PROMPT — Weekly Grid UI (Most Complex Frontend Phase)

```
Continuing Orangy Carpels frontend. Phase J (foundation) and Phase K (admin CRUD) are complete.
Starting Phase L: Weekly Timesheet Grid — the core UI of this entire app.

Design system reminder (from CLAUDE.md):
- Primary accent: #F97316 (orange-500)
- Background: #F9FAFB, Surface: white, Text: #111827, Border: #E5E7EB
- Clean, minimal, light — no decorative clutter
- Dylan Field / Figma-style design sensibility

WEEKLY GRID SPEC:
- Columns: Project | Activity | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Total
- Each cell = hour input (step 0.25, min 0, max 24)
- Row = one Project + Activity combination
- Footer row = column totals
- "Add Row" opens a small form: select project (assigned only) + activity (grouped dropdown)
- Totals calculate in real-time as user types
- Soft warning (amber toast) if any day exceeds 10 hours

STATES:
- Draft: inputs editable, Save Draft button + Submit Week button active
- Submitted: all inputs disabled, shows "Pending Approval" badge
- Partially Approved: rows locked, shows per-row status
- Approved: fully locked, shows "Approved" green badge
- Rejected: rejection banner at top with reason, inputs re-enabled for that row only

Build:
1. WeekNavigator component (prev/next week, formatted header)
2. WeeklyGrid component (the table)
3. EntryRow component (one project-activity row)
4. AddRowModal (project + activity dropdowns)
5. Wire to API: GET entries on week change, POST on Save Draft
6. TimesheetPage assembling all above

Do NOT build the Submit/Approve flow yet — that is Phase M.
Test: Log hours → totals update live → Save Draft → reload page → data persists.
```

---

### ► RECOVERY PROMPT (Use When Something Breaks)

```
Something broke in Orangy Carpels. Do not make any other changes until this is fixed.

Error: [PASTE EXACT ERROR MESSAGE OR STACK TRACE]

What I was trying to do: [describe the task]

What was working before this broke: [describe last working state]

Instructions:
1. Explain what caused this error before touching any code
2. Fix ONLY this error — do not refactor anything else
3. Do not change any file that was working before
4. Run the relevant test after fixing to confirm it's resolved
5. Show me the test result

Wait for my confirmation before continuing to the next task.
```

---

### ► POLISH PROMPT (Run After All Features Work)

```
Orangy Carpels is functionally complete. All phases A–N are done and tested.
Now make it visually polished WITHOUT changing any functionality.

Design rules:
- Orange (#F97316) as the only accent — use sparingly on CTAs and active states
- Everything else is grayscale with light borders
- No shadows heavier than shadow-sm
- Consistent 4px border-radius on inputs and cards
- 16px base spacing unit — use multiples of 4 throughout

Polish tasks:
1. Loading skeletons on all data-fetching pages (use Tailwind animate-pulse)
2. Empty states — every list/table needs one (icon + message + CTA)
3. Hover states on all clickable rows and buttons
4. Form field focus rings: ring-2 ring-orange-500/30
5. Consistent badge colors: Draft=gray, Submitted=blue, Approved=green, Rejected=red
6. Soft warning toast (amber) when hours > 10 in a day
7. Tablet breakpoint: sidebar collapses to a drawer (hamburger menu)
8. Page transition: subtle fade-in on route change (200ms)

Test each change. Do NOT touch any API calls, business logic, or routing.
```

---

## PHASE 8 — Pre-Deploy Checklist

```
□ All 9 roles/permission combinations tested with real API calls
□ Timesheet submit → approve → lock flow tested end-to-end
□ Rejection → re-edit → resubmit flow tested
□ Admin sees revenue; PM and Employee get 403 on /dashboard financial fields
□ Inactive employee blocked at login
□ Inactive project hidden from all dropdowns
□ Exchange rate fetch → version history → finalize month → locked
□ No console errors in browser
□ Tablet layout tested at 768px width
□ .env is in .gitignore — no secrets committed
□ CORS configured for production domain in Laravel
□ Laravel Horizon running for queue processing
□ php artisan passport:install run on production
□ All migrations run on production DB
□ VITE_API_URL points to production backend
□ Live URL — all features verified
```

---

## Business Rules Quick Reference Card

> Pin this above your monitor while building.

| Rule | Detail |
|------|--------|
| Week period | Monday 00:00 → Sunday 23:59 |
| Submission | Splits by project → goes to that project's PM |
| Rejection | Reason required → employee edits SAME entry → resubmits |
| Lock trigger | ALL PMs for that week approve → auto-lock |
| Unlock | Super Admin only, explicit action |
| Week status | Partially Approved until ALL project PMs approve |
| Hours limit | Soft warning at >10/day; hard limit at 24/day |
| Financial data | Super Admin ONLY — 403 for everyone else |
| Inactive project | Hidden from dropdowns, no new entries |
| Deactivated employee | 403 on login, drafts stay in draft |
| Delete policy | NEVER hard delete — soft delete / status toggle only |
| Exchange rate | Versioned history, no overwrites, lock per client/month |
| Rate until finalized | Provisional rate used on all dashboards |

---

*Orangy Carpels V1 · Build Plan Generated March 2026 · Orangy Design Studio*
```
