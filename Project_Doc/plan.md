# Orangy Carpels V1 — Implementation Plan
> Update CLAUDE.md "Current Status" after completing each phase.
> Start a FRESH Claude Code session (/clear) for each phase.
> Never proceed past a phase until its TEST passes.

---

## PHASE A: Backend Foundation
- [ ] Create Laravel 11 project: `composer create-project laravel/laravel backend`
- [ ] Install packages:
      `composer require laravel/passport spatie/laravel-permission lorisleiva/laravel-actions stancl/tenancy laravel/horizon`
- [ ] Configure .env: DB_DATABASE, DB_USERNAME, DB_PASSWORD, REDIS_HOST, APP_URL
- [ ] Write migration: users (id, name, email, password, role, designation, status, timestamps, softDeletes)
- [ ] Write migration: clients (id, client_code, name, billing_currency, status, timestamps, softDeletes)
- [ ] Write migration: projects (id, project_code, name, client_id, billing_type, hourly_rate, monthly_cost, project_cost, rate_currency, start_date, end_date, pm_id, status, timestamps, softDeletes)
- [ ] Write migration: project_user pivot (project_id, user_id)
- [ ] Write migration: activity_categories (id, name, sort_order, timestamps)
- [ ] Write migration: activity_types (id, category_id, name, sort_order, timestamps, softDeletes)
- [ ] Write migration: timesheet_entries (id, user_id, week_start, date, project_id, activity_type_id, description, hours, is_billable, project_cost, ai_credits, miscellaneous, status, rejection_reason, timestamps, softDeletes)
- [ ] Write migration: exchange_rates (id, base_currency, target_currency, rate, fetched_at, is_locked, locked_at, client_id, period_month, timestamps)
- [ ] Create Enum: App\Enums\UserRole (Employee, ProjectManager, SuperAdmin)
- [ ] Create Enum: App\Enums\EntryStatus (Draft, Submitted, Approved, Rejected)
- [ ] Create Enum: App\Enums\BillingType (TM, MonthlyFixed, ProjectFixed)
- [ ] Create Enum: App\Enums\Currency (USD, INR, EUR, GBP)
- [ ] Create RolesPermissionsSeeder: create 3 roles + permission matrix
- [ ] Create SuperAdminSeeder: one admin user (admin@orangy.in / password)
- [ ] Create ActivityTypeSeeder: UX Design + Development + General categories with types
- [ ] Run: `php artisan migrate:fresh --seed`
- [ ] Run: `php artisan passport:install`

**TEST:** `php artisan migrate:fresh --seed` runs with zero errors.
Roles table has 3 rows. Users table has 1 admin row. Activity categories seeded.
`php artisan passport:install` outputs encryption keys.
**Time:** 45–60 min

---

## PHASE B: Auth API
- [ ] Create App\Actions\Auth\LoginAction (validate credentials, check active status, issue Passport token)
- [ ] Create App\Http\Requests\Auth\LoginRequest (email required, password required)
- [ ] Create App\Http\Resources\UserResource (id, name, email, role, designation)
- [ ] Create App\Http\Controllers\Api\V1\AuthController (login, logout, me)
- [ ] Create App\Http\Middleware\EnsureRole middleware
- [ ] Add routes to routes/api.php:
      POST /api/v1/auth/login
      POST /api/v1/auth/logout (auth:api)
      GET  /api/v1/auth/me (auth:api)
- [ ] Register middleware in bootstrap/app.php

**TEST:** 
- POST /api/v1/auth/login {email: admin@orangy.in, password: password} → 200 + token + user
- POST /api/v1/auth/login {email: admin@orangy.in, password: wrong} → 401
- Deactivate admin in DB → login attempt → 403
- GET /api/v1/auth/me with valid token → user object returned
**Time:** 30–40 min

---

## PHASE C: Employee Module (Backend)
- [ ] Create App\Models\User (fillable, casts, HasRoles, scopeActive, relationships)
- [ ] Create App\Actions\Employees\CreateEmployeeAction
- [ ] Create App\Actions\Employees\UpdateEmployeeAction
- [ ] Create App\Actions\Employees\ToggleEmployeeStatusAction
- [ ] Create App\Http\Requests\Employees\StoreEmployeeRequest
- [ ] Create App\Http\Requests\Employees\UpdateEmployeeRequest
- [ ] Create App\Http\Controllers\Api\V1\EmployeeController (index, store, show, update, toggleStatus)
- [ ] Routes under /api/v1/admin/employees (Super Admin only)

**TEST:**
- POST /api/v1/admin/employees → creates employee → appears in GET list
- PUT /api/v1/admin/employees/{id} → updates designation
- POST /api/v1/admin/employees/{id}/toggle-status → deactivates → login with that account → 403
- PM token hits /api/v1/admin/employees → 403
**Time:** 30 min

---

## PHASE D: Client + Project Modules (Backend)
- [ ] Create App\Models\Client (fillable, casts, scopeActive, hasMany projects)
- [ ] Create App\Actions\Clients\CreateClientAction
- [ ] Create App\Actions\Clients\UpdateClientAction
- [ ] Create App\Http\Controllers\Api\V1\ClientController (index, store, show, update, toggleStatus)
- [ ] Create App\Models\Project (fillable, casts, billingType enum, belongsTo client, belongsTo pm, belongsToMany employees)
- [ ] Create App\Actions\Projects\CreateProjectAction (validate billing type fields conditionally)
- [ ] Create App\Actions\Projects\UpdateProjectAction
- [ ] Create App\Actions\Projects\AssignEmployeesAction (sync pivot table)
- [ ] Create App\Http\Controllers\Api\V1\ProjectController
- [ ] Create App\Policies\ProjectPolicy (PM sees assigned only, Admin sees all)
- [ ] Routes:
      /api/v1/admin/clients (Super Admin CRUD)
      /api/v1/admin/projects (Super Admin CRUD)
      /api/v1/pm/projects (PM — assigned projects only)
      GET /api/v1/projects (Employee — returns only assigned projects, for timesheet dropdown)

**TEST:**
- Create client → create T&M project under client (hourly_rate required) → assign employee
- Create MonthlyFixed project (monthly_cost required, hourly_rate not required)
- Employee token: GET /api/v1/projects → only shows assigned projects
- PM token: GET /api/v1/pm/projects → only assigned projects
**Time:** 45 min

---

## PHASE E: Activity Types Module (Backend)
- [ ] Create App\Models\ActivityCategory (hasMany activityTypes)
- [ ] Create App\Models\ActivityType (belongsTo category, scopeActive)
- [ ] Create App\Http\Controllers\Api\V1\ActivityTypeController
      - index: returns grouped { category, types[] } for all roles
      - store/update/delete: Super Admin only
- [ ] Create App\Http\Resources\ActivityTypeResource (nested with category)
- [ ] Routes:
      GET  /api/v1/activity-types (all authenticated roles — dropdown data)
      POST /api/v1/admin/activity-types/categories
      POST /api/v1/admin/activity-types
      PUT  /api/v1/admin/activity-types/{id}
      DELETE /api/v1/admin/activity-types/{id}

**TEST:**
- GET /api/v1/activity-types as employee → returns grouped categories with nested types
- POST new category as admin → appears in list
- POST new type under category as admin → appears nested under category
- Employee token: POST /api/v1/admin/activity-types → 403
**Time:** 20 min

---

## PHASE F: Timesheet Core CRUD (Backend)
- [ ] Create App\Models\TimesheetEntry (all fields, status cast to EntryStatus enum, all relationships, scopeForWeek)
- [ ] Create App\Actions\Timesheets\SaveDraftAction (upsert per employee+date+project+activity, keep status as Draft)
- [ ] Create App\Http\Requests\Timesheets\SaveDraftRequest
      Validate: hours > 0, ≤ 24, date not future, project active, employee assigned, 0.25 increments
- [ ] Create App\Http\Resources\TimesheetEntryResource
- [ ] Create App\Http\Controllers\Api\V1\TimesheetController (index by week, store draft, show)
- [ ] Routes:
      GET  /api/v1/timesheets?week_start=YYYY-MM-DD → all entries for that week, current user
      POST /api/v1/timesheets/draft → upsert draft entries (accepts array of entries)
      GET  /api/v1/timesheets/{id}

**TEST:**
- POST 3 entries for week 2026-03-02 → all saved as Draft
- GET ?week_start=2026-03-02 → returns 3 entries grouped by project
- Update hours on one entry → hours change, status still Draft
- Try to log for future date → 422 validation error
- Try to log on inactive project → 422 validation error
- Log 25 hours on a day → 422 (over limit)
**Time:** 45 min

---

## PHASE G: Timesheet Workflow — Submit / Approve / Reject (Backend)
*This is the most complex backend phase. Read all rules before starting.*

- [ ] Create App\Actions\Timesheets\SubmitWeekAction
      - Takes week_start for current user
      - Changes all Draft entries for that week to Submitted
      - Groups by project (for PM notification reference)
      - Cannot submit if any entry is missing required fields
- [ ] Create App\Actions\Timesheets\ApproveEntriesAction
      - PM approves all entries for a specific project+week combination
      - After approving, check if ALL projects for that week are approved → lock entire week
      - Only PM assigned to that project (or Super Admin) can approve
- [ ] Create App\Actions\Timesheets\RejectEntriesAction
      - Requires rejection_reason (non-empty string)
      - Sets entries for that project to Rejected
      - Employee can see reason and edit
- [ ] Create App\Actions\Timesheets\UnlockEntriesAction (Super Admin only)
      - Unlocks entries back to Submitted status
- [ ] Create App\Policies\TimesheetPolicy (who can approve/reject/unlock each entry)
- [ ] Create week status calculation logic (Draft / Submitted / Partially Approved / Approved)
- [ ] Routes:
      POST /api/v1/timesheets/submit-week {week_start}
      POST /api/v1/timesheets/approve {week_start, project_id, employee_id} (PM + Admin)
      POST /api/v1/timesheets/reject {week_start, project_id, employee_id, reason} (PM + Admin)
      POST /api/v1/timesheets/unlock {week_start, project_id, employee_id} (Admin only)
- [ ] GET /api/v1/pm/pending-approvals → list grouped by employee + project + week

**TEST (full flow):**
1. Employee submits week → all entries → Submitted
2. PM approves project A entries → status: Partially Approved (project B still pending)
3. PM approves project B entries → status: Approved → all entries locked
4. Employee tries to edit locked entry → 403
5. PM rejects entry with reason → employee sees reason in GET response
6. Employee re-edits rejected entry → resubmits → PM sees it again in pending
7. Admin unlocks → entries back to Submitted
**Time:** 60–75 min

---

## PHASE H: Exchange Rates Module (Backend)
- [ ] Create App\Models\ExchangeRate (versioned: each fetch = new row, never update)
- [ ] Create App\Jobs\FetchExchangeRateJob (Redis queue, stores new rate row)
- [ ] Create App\Actions\ExchangeRates\FetchRateAction (dispatches job, returns "fetching" response)
- [ ] Create App\Actions\ExchangeRates\FinalizeClientMonthAction
      - Fetches current rate synchronously
      - Marks as locked for that client + period_month
      - Locked rate cannot be changed
- [ ] Create App\Http\Controllers\Api\V1\ExchangeRateController
- [ ] Routes:
      GET  /api/v1/admin/exchange-rates → history list (versioned)
      POST /api/v1/admin/exchange-rates/fetch → dispatches job
      POST /api/v1/admin/exchange-rates/finalize {client_id, period_month}

**TEST:**
- POST fetch → job dispatched → run queue worker → new rate row appears in GET history
- POST finalize for client+month → rate locked → POST finalize same client+month → 422 (already locked)
- Rate history shows all versions, newest first
**Time:** 40 min

---

## PHASE I: Dashboard APIs (Backend)
- [ ] Create App\Http\Controllers\Api\V1\DashboardController
- [ ] Employee dashboard data:
      - My hours this week + this month
      - My pending submissions count
      - My assigned projects list
      - Billable hours vs non-billable hours (for pie chart)
- [ ] PM dashboard data:
      - Team hours this week (assigned employees only)
      - Pending approvals count
      - Team utilization % (billable hours / total hours × 100)
      - Project-wise hours breakdown (for assigned projects only)
      - NO financial/revenue fields
- [ ] Super Admin dashboard data:
      - Total hours (all employees, this month)
      - Revenue this month in USD + INR (using provisional or locked rate)
        T&M: hours × hourly_rate | Monthly Fixed: monthly_cost | Project Fixed: project_cost
      - Billable vs non-billable split
      - Client-wise revenue breakdown
      - Project-wise revenue breakdown
      - Team utilization overview
      - Pending finalizations list (clients with no locked rate for current month)
- [ ] Single route GET /api/v1/dashboard → returns correct shape based on authenticated role

**TEST:**
- Login as employee → GET /dashboard → sees own hours, NO revenue fields
- Login as PM → GET /dashboard → sees team data, NO revenue fields
- Login as admin → GET /dashboard → sees revenue in both USD and INR
- Login as PM → directly query revenue endpoint → 403
**Time:** 60 min

---

## PHASE J: Frontend Foundation
- [ ] Create Vite + React project: `npm create vite@latest frontend -- --template react`
- [ ] Install: `npm install axios zustand react-router-dom recharts @headlessui/react react-hot-toast`
- [ ] Install + configure Tailwind CSS v3
- [ ] Configure tailwind.config.js with brand colors (orange-500, gray-50, etc.)
- [ ] Create /frontend/src/services/api.js
      - Axios instance with baseURL: http://localhost:8000/api/v1
      - Request interceptor: attach Bearer token from authStore
      - Response interceptor: on 401 → clear auth + redirect to /login
- [ ] Create /frontend/src/store/authStore.js (Zustand)
      - State: { user, token, role }
      - Actions: login(userData, token), logout()
      - Persist token to localStorage
- [ ] Create AppShell component (sidebar + topbar + <Outlet />)
- [ ] Create Sidebar component (role-aware nav links, Orangy branding, orange accent)
- [ ] Create PrivateRoute component (checks token + role, redirects if unauthorized)
- [ ] Create LoginPage (email + password form, POST /auth/login, stores token)
- [ ] Set up React Router in App.jsx with all routes (protected by PrivateRoute)
- [ ] Create shared UI components: Button, Input, Select, Badge, Modal, Spinner, EmptyState

**TEST:**
- npm run dev → localhost:5173 loads
- Unauthenticated → redirected to /login
- Login with admin credentials → lands on /admin/dashboard shell
- Logout → token cleared → redirected to /login
- Employee token → navigating to /admin route → redirected
**Time:** 45–60 min

---

## PHASE K: Admin CRUD Pages (Frontend)
- [ ] EmployeeListPage: data table with columns (name, email, role, designation, status badge)
      - Add Employee button → modal with form
      - Edit row → same modal pre-filled
      - Toggle status → confirmation → inline status badge updates
- [ ] ClientListPage: table (client code, name, currency badge, status)
      - Add/Edit Client modal
- [ ] ProjectListPage: table (project code, name, client, billing type, PM, status)
      - Add Project form (billing type dropdown changes which cost fields appear)
      - Edit project → assign employees (multi-select)
- [ ] ActivityTypePage: accordion by category → types listed within
      - Add category button
      - Add type under category button
      - Delete type (with confirmation)
- [ ] Create shared DataTable component (columns config, loading skeleton, empty state)

**TEST:**
- Create employee → appears in list → toggle inactive → badge changes to red
- Create client with USD currency → create T&M project under that client
- Assign 2 employees to project → employees appear in assignment list
- Activity types page shows seeded categories + types, can add new type
**Time:** 90 min

---

## PHASE L: Timesheet Weekly Grid (Frontend)
*Most complex UI phase. Build incrementally, test each part.*

- [ ] WeekNavigator component: prev/next buttons, displays "Mon 2 Mar – Sun 8 Mar 2026"
      Computes Monday of current week as default
- [ ] WeeklyGrid component: table structure
      Columns: Project | Activity | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Total
      Footer: column totals row (auto-calculated)
- [ ] EntryRow component (one project+activity combination):
      - Hour input per day (type number, step 0.25, min 0, max 24)
      - Inline description field (click to expand)
      - Billable toggle
      - Row total auto-calculated
      - Soft warning (amber toast) if any day > 10 hours
- [ ] AddRowModal: project dropdown (assigned only from /api/v1/projects) + activity dropdown (grouped from /api/v1/activity-types)
- [ ] Save Draft button → POST /api/v1/timesheets/draft with all entries
- [ ] Fetch week data on mount + on week change → populate grid
- [ ] Status bar: show week-level status badge (Draft/Submitted/Partially Approved/Approved)
- [ ] Read-only mode: when week is Submitted/Approved → all inputs disabled + gray overlay hint

**NOT in this phase:** Submit button, approval actions (Phase M)

**TEST:**
- Navigate to /employee/timesheet → current week loads
- Add row → select project + activity → row appears
- Type hours → row total + column totals update in real-time
- Type 11 hours on one day → amber toast warning appears
- Save Draft → reload page → all data persists
- Navigate to previous week → different data loads (or empty)
- Change week to submitted week (manually set DB) → grid is read-only
**Time:** 90 min

---

## PHASE M: Timesheet Submit + Approval Flow (Frontend)
- [ ] Submit Week button (only visible on Draft weeks with at least 1 entry)
      Confirmation modal → POST /api/v1/timesheets/submit-week → grid becomes read-only
- [ ] Rejection banner: when week has any Rejected entries
      Show rejection reason prominently in red banner
      Re-enable inputs on rejected rows only
      "Resubmit" button available
- [ ] PM ApprovalsPage: list pending submissions
      Grouped: Employee name → Week period → Project name → [Approve] [Reject] buttons
      Reject → modal with required reason textarea
      Approve → confirmation → item removed from pending list
- [ ] Admin: unlock button on Approved weeks (in employee's timesheet view)
- [ ] Real-time status updates after approve/reject (re-fetch affected data)

**TEST (full flow in UI):**
1. Employee: fill week → Submit → grid locks → status: Submitted
2. PM: sees submission in Approvals page → Rejects with reason
3. Employee: sees rejection banner with reason → edits → Resubmit
4. PM: sees it again → Approves → gone from pending list
5. Employee: week shows Approved + locked
6. Admin: unlocks week → back to Submitted in employee view
**Time:** 60 min

---

## PHASE N: Dashboards (Frontend)
- [ ] StatCard component: label + value + optional delta/trend
- [ ] Employee Dashboard: 4 stat cards + billable pie chart (Recharts PieChart) + projects list
- [ ] PM Dashboard: team hours card + pending approvals count card + utilization % card + project table
- [ ] Admin Dashboard:
      - Revenue cards with USD/INR toggle (useState for currency)
      - Billable vs non-billable pie chart
      - Client revenue table (sortable)
      - Project revenue table
      - Pending finalizations list with "Finalize" action button
- [ ] ExchangeRatePage (Admin only):
      - Rate history table (newest first, locked rates highlighted)
      - "Fetch Current Rate" button → loading spinner → new row appears
      - Per-client "Finalize Month" button → confirmation modal

**TEST:**
- Login as each of 3 roles → different dashboard content
- Admin: toggle USD/INR → revenue numbers change
- Admin: click Fetch Rate → spinner shows → new rate appears in history table
- PM: navigate to admin dashboard URL → 403 or redirect
- Employee: navigate to /admin/* → redirect
**Time:** 75 min

---

## PHASE O: Polish + Responsive + Deploy
- [ ] Tablet breakpoint (768px): sidebar collapses to hamburger drawer
- [ ] Loading skeletons on all data-fetching pages (Tailwind animate-pulse)
- [ ] Empty states on all lists/tables (icon + message + CTA where applicable)
- [ ] Toast notifications for all success/error actions (react-hot-toast)
- [ ] Form validation: frontend mirrors all backend rules with inline error messages
- [ ] Consistent focus rings: ring-2 ring-orange-500/30 on all form inputs
- [ ] Disabled states: buttons disable + show spinner during API calls
- [ ] Configure CORS in Laravel config/cors.php for production domain
- [ ] Backend: set APP_ENV=production, disable debug, configure logging
- [ ] Backend: deploy to server, run migrations + passport:install + horizon setup
- [ ] Frontend: set VITE_API_URL to production backend URL, npm run build, deploy to Vercel/Nginx

**FINAL TEST (end-to-end on live URL):**
1. Open live URL → login as employee → log a full week → submit
2. Login as PM → approve the submission
3. Login as admin → verify revenue appears on dashboard → fetch rate → finalize month
4. Test at 768px width → sidebar becomes drawer → all pages usable
5. No console errors on any page
**Time:** 60–90 min

---

## Business Rules Quick Reference
| Rule | Detail |
|------|--------|
| Week period | Monday 00:00 → Sunday 23:59 |
| Submission | Splits by project → goes to that project's PM |
| Rejection | Reason required → employee edits SAME entry → resubmits |
| Lock trigger | ALL PMs for week approve → auto-lock |
| Unlock | Super Admin only |
| Week status | Partially Approved until ALL project PMs approve |
| Hours | Soft warning >10/day; hard limit 24/day |
| Financial data | Super Admin ONLY — 403 for all others |
| Inactive project | Hidden from dropdowns, no new entries |
| Deactivated user | 403 on login; drafts stay in draft |
| Delete | NEVER hard delete — soft delete / status toggle only |
| Exchange rate | Versioned history, no overwrites, lock per client+month |
