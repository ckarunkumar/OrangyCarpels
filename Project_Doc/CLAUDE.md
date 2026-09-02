# Orangy Carpels — AI Memory File

## Product
Internal timesheet management platform for Orangy Design Studio.
Employees log weekly hours against projects. PMs approve. Super Admin sees revenue.
Platform: Web app (desktop + tablet responsive).

## Users & Roles
- Employee: log + submit own timesheets, view own data only
- Project Manager: approve/reject assigned projects, view team hours (NO financials)
- Super Admin: full access — financials, client finalization, exchange rates, unlock entries

## Tech Stack
- Backend: Laravel 11 / PHP 8.3 (API only — no Blade views)
- Frontend: React 18 + Vite + Tailwind CSS v3 (SPA in /frontend)
- Database: MySQL 8.0 + stancl/tenancy (tenant-ready, single tenant for V1)
- Auth: Laravel Passport (Bearer tokens)
- Permissions: spatie/laravel-permission
- Actions: lorisleiva/laravel-actions
- API prefix: /api/v1/
- Queue: Laravel Queues (Redis driver) + Laravel Horizon

## Repository Layout
/backend   → Laravel 11 API application
/frontend  → React 18 + Vite SPA
CLAUDE.md  → This file (update Current Status after every phase)
plan.md    → Phase-by-phase build tracker

## Backend Architecture Rules
- Controllers are THIN: validate request → call Action → return Resource. Nothing else.
- ALL business logic goes in App\Actions\ (lorisleiva pattern)
- Use App\Services\ only for orchestration across multiple Actions
- Models in App\Models\: relationships, scopes, casts only — no business logic
- FormRequests in App\Http\Requests\ for ALL validation — never validate in controllers
- Always return Eloquent Resources (App\Http\Resources\) — NEVER return raw models
- Policies in App\Policies\ for ALL authorization
- Soft deletes on ALL models — never hard delete anything
- Enum classes for all status/type fields (App\Enums\)
- Use $request->validated() always — never $request->input() or $request->all()

## Frontend Architecture Rules
- Pages in /frontend/src/pages/ organized by role: /admin /pm /employee
- Shared UI in /frontend/src/components/ui/
- Feature components in /frontend/src/components/[feature]/
- ALL API calls via /frontend/src/services/api.js (axios instance with auth headers)
- Auth state in /frontend/src/store/authStore.js (Zustand)
- Route protection via PrivateRoute component checking token + role
- Every data-fetching component needs: loading state + error state + empty state

## Design System (Follow This Exactly)
- Primary accent: #F97316 (Tailwind orange-500) — use only on CTAs + active states
- Background: #F9FAFB (gray-50)
- Surface / cards: #FFFFFF
- Text primary: #111827 (gray-900)
- Text muted: #6B7280 (gray-500)
- Border: #E5E7EB (gray-200)
- Status badges: Draft=gray, Submitted=blue, Approved=green, Rejected=red
- Border radius: rounded-lg on cards, rounded-md on inputs/buttons
- No heavy shadows — shadow-sm maximum
- Style: clean, minimal, light — no decorative clutter

## Non-Negotiable Business Rules
- Timesheet period: Monday 00:00 → Sunday 23:59 (always weekly)
- Submission splits by project — each project's entries go to that project's PM
- Rejection REQUIRES a reason — employee edits SAME entry and resubmits (no new entry)
- Lock trigger: ALL PMs for a week approve → entries auto-lock
- After approval → LOCKED — only Super Admin can unlock (explicit action)
- Week status: Draft | Submitted | Partially Approved | Approved (when all PMs approve)
- Hours: must be > 0, ≤ 24, in 0.25 increments; soft warning if > 10 in a single day
- Future dates: cannot log hours for a date in the future
- Project must be active; employee must be assigned to log time
- Inactive projects: hidden from dropdowns entirely, no new entries allowed
- Deactivated employees: 403 on login, their draft timesheets stay in draft
- Financial/revenue data: SUPER ADMIN ONLY — always return 403 for other roles
- Exchange rates: versioned history (no overwrites), locked per client per month
- Provisional rate used on dashboards until finalized

## Build Commands
# Backend
cd backend
php artisan serve                    # Dev API server :8000
php artisan migrate:fresh --seed     # Full DB reset (dev only)
php artisan horizon                  # Start queue worker + Horizon UI
php artisan passport:install         # Run once after fresh install
php artisan test                     # Run test suite

# Frontend
cd frontend
npm run dev                          # Dev server :5173
npm run build                        # Production build
npm run lint                         # ESLint check

## Code Style — Backend
- PSR-12 code style throughout
- declare(strict_types=1) at top of every PHP file
- Actions are invokable: public function handle(DataObject $data): Resource
- Enum-backed strings for: UserRole, EntryStatus, BillingType, Currency
- Route groups: auth middleware + role middleware per group

## Code Style — Frontend
- Functional components only (no class components)
- async/await everywhere — no .then() chains
- Every API call in try/catch with user-facing error message
- Files: kebab-case (weekly-grid.jsx) — Components: PascalCase (WeeklyGrid)
- Keep components under 150 lines — split if longer
- No inline styles — Tailwind classes only

## Critical Rules for AI
- Do NOT modify working files from previous phases unless fixing a confirmed bug
- Run dev server after every major change to verify nothing broke
- Always ask before installing a new dependency not listed in this file
- Show test results before marking any phase complete
- If an error occurs, explain the cause BEFORE writing any fix

## Current Status
Phase: NOT STARTED
Completed: []
In Progress: —
Blocked: —
