# Frontend Implementation Roadmap — Weeks 1 to 6
## Web Portal & Mobile App, Built Against the Completed Backend API

This phase begins only once the backend roadmap (Weeks 1–8) is fully complete, tested, and deployed. Every week below consumes an already-finished, documented API contract — no backend logic decisions are made during this phase; if a genuine backend gap is discovered while building the UI (a missing endpoint, a field that isn't exposed), that's logged and fixed as a small backend patch, not treated as new backend design work.

**Why this phase can move faster than the backend phase:** frontend work here is integration, not invention. The data model, permission rules, conflict logic, and workflow states were all already decided and proven correct in the backend phase — this phase is about presenting that correctly to a person, on two different kinds of screen.

Both clients — web (React) and mobile (React Native/Expo) — are built together within each week where it makes sense, since they often consume the exact same endpoints for the exact same underlying feature, just through different UI. Where a feature is genuinely single-client (e.g. the admin analytics dashboard, which is web-only by design), that's called out explicitly.

---

# Week 1 — Scaffolding, Auth & Shell Navigation

**Goal:** both apps run, both can authenticate a real user against the finished backend, and both land the user in a role-appropriate shell — the frame everything else this phase gets built inside of.

## Day 1 — Project Scaffolding

1. Initialize the web app (React + TypeScript + Vite) with TanStack Router, TanStack Query, Tailwind, and the rest of the dependency set already agreed for this project.
2. Initialize the mobile app (Expo + Expo Router) with NativeWind, TanStack Query, and the rest of its dependency set.
3. Set up the typed API client layer on both — ideally generated or hand-typed directly from the backend's finalized OpenAPI schema, so request/response shapes are correct from day one rather than guessed at and corrected later.
4. Set up environment configuration (API base URL per environment) on both clients.

## Day 2 — Auth Screens

1. Build the web login screen: identifier + password, calling the real login endpoint.
2. Build the mobile login screen: same fields, same endpoint.
3. Implement the forced first-login password reset flow on both — redirecting a user with `requires_password_reset = true` to a dedicated reset screen before anything else is reachable.
4. Test against real seeded accounts from the backend phase across every role (student, class rep, lecturer, department/faculty/school admin).

## Day 3 — Token Handling

1. Web: store tokens using a secure approach (not raw `localStorage` for anything sensitive), wire an Axios interceptor to attach the access token to every request and transparently refresh it on expiry.
2. Mobile: store tokens via `expo-secure-store`, with the same transparent refresh behavior.
3. Test: a request made with an expired access token is transparently retried after a silent refresh, on both clients, without the user noticing anything happened.

## Day 4 — Role-Aware Shell Navigation

1. Web: build the route shell using TanStack Router — a layout that renders different navigation/menu options depending on the logged-in user's role and, for admins, their level (department/faculty/school).
2. Mobile: build the equivalent shell using Expo Router's layout routes — a bottom tab or drawer structure appropriate to a student/rep/lecturer's daily use pattern (schedule, notifications, profile), distinct from the admin-focused web shell.
3. Confirm route guarding works — an unauthenticated user is redirected to login; an authenticated user of the wrong role attempting to reach an admin-only route (even by typing the URL directly on web) is blocked client-side, understanding this is a UX convenience layered on top of the backend's own enforcement, not a substitute for it.

## Day 5 — Full Role Walkthrough & Close-Out

1. Log in as every seeded role on both clients, confirming each lands in the correct shell with the correct navigation options visible.
2. Confirm the forced-reset flow works correctly for a fresh account on both clients.
3. Note what's deferred: no actual feature screens exist yet beyond the shell — that starts Week 2.

**End of Week 1 checkpoint:** both apps are scaffolded, both authenticate against the real backend with working token refresh, and both present a role-appropriate navigation shell — nothing functional inside that shell yet.

---

# Week 2 — Web Admin Core: Hierarchy, Venues & Courses

**Goal:** the department/faculty/school hierarchy, venue registry, and course structure (including sharing/grants) are fully manageable through the web admin interface. This week is web-only — these are admin-facing management screens with no equivalent need on mobile.

## Day 1 — Hierarchy Management Screens

1. Build school/faculty/department list, create, and edit screens, with live code-conflict validation surfaced directly in the form (calling the backend's real-time uniqueness check as the admin types, not just on submit).
2. Scope visibility and edit rights correctly by the logged-in admin's own level — a department admin sees their own department's context only; a school admin sees and can manage the full tree.

## Day 2 — Venue Management Screens

1. Build the venue list screen with filtering (by type, facility, owning level).
2. Build the create/edit form, including the facility multi-select and the ownership-level selector — with the ownership options correctly restricted based on the logged-in admin's own scope (a department admin can only create department-owned venues for their own department, matching the backend's own restriction).
3. Build the deactivate action, with a confirmation step given it affects any future booking against that venue.

## Day 3 — Course Management Screens

1. Build the course list screen with filtering (by department, level, ownership).
2. Build the create/edit form, with the same ownership-level restriction pattern as venues.
3. Build the course detail view showing current registration count and assigned lecturers.

## Day 4 — Course Sharing (CourseAccessGrant) Screens

1. Build the "offer access" flow — an admin who owns a course can select a target department/faculty/school and submit a grant offer.
2. Build the "request access" flow — an admin can browse courses they don't own and request access, which routes to the owning admin.
3. Build the grant approval queue — showing pending incoming requests/offers relevant to the logged-in admin, with approve/reject actions.
4. Test the full two-directional flow against the real backend: offer → approval by the target admin; request → approval by the owning admin.

## Day 5 — Integration Pass & Close-Out

1. Full walkthrough as each admin role: create a department-owned venue and course, request access to a course owned by another department, approve an incoming grant request as the owning admin.
2. Confirm every screen's scoping matches the backend's actual enforcement — a mismatch here (something the UI shows that the backend would reject, or vice versa) is worth catching now rather than as a support ticket later.
3. Note what's deferred: timetable entry creation itself starts Week 3; nothing schedules a lecture or exam yet.

**End of Week 2 checkpoint:** the full organizational and academic structure — hierarchy, venues, courses, and course sharing — is manageable end to end through the web admin interface, correctly scoped by role and matching the backend's real enforcement.

---

# Week 3 — Web Scheduling & Discrepancy Workflow

**Goal:** timetable entries can be created and managed through the web app, conflict and routing outcomes from the backend are clearly surfaced, and the discrepancy approval workflow has a working queue.

## Day 1 — Unified Timetable Entry Creation Form

1. Build a single creation form covering all three entry types (lecture, exam, event), with type-specific fields shown conditionally (recurrence pattern for lectures, candidate count and invigilators for exams) rather than three disconnected forms.
2. Build the recurrence pattern input for lectures (day of week, start date, end date) in a way a non-technical admin can use without needing to understand the underlying rule string format.
3. Wire the venue and course selectors to respect the ownership/visibility rules already built in Week 2 — an admin shouldn't be offered a venue or course they have no relationship to at all in the dropdown, even before the backend's own conflict/routing logic is invoked.

## Day 2 — Conflict & Routing Outcome Display

1. On submission, correctly handle and clearly display all three backend outcomes from the conflict engine: immediate success, hard rejection (showing the specific conflicting record and time, exactly as the backend's error response provides), and routed-for-approval (showing a clear "pending approval from [admin/level]" state rather than a false success).
2. Build the pending-request visibility for the submitting admin — they should be able to see the status of something they've submitted for cross-level approval without having to ask around.
3. Test against real conflict scenarios seeded on the backend: a same-level clash, a cross-level request, a fully clean booking — confirming the UI correctly reflects each of the three outcomes.

## Day 3 — Timetable Views

1. Build a calendar/list view of existing timetable entries, filterable by venue, course, department, and date range.
2. Build the individual entry detail view, showing its full materialized session list for recurring lectures.

## Day 4 — Discrepancy Request & Approval Queue

1. Build the discrepancy submission form (shift venue / shift time / postpone / cancel), including the instance-vs-pattern choice for recurring lectures (a single date vs. the whole series).
2. Build the approval queue screen for admins with pending requests routed to them, showing the full context (original booking, proposed change, reason) needed to decide.
3. Build the approve/reject actions, and the withdraw action for the original requester.

## Day 5 — Audit Log Viewer & Close-Out

1. Build a simple, scoped audit log viewer — searchable/filterable by target model, actor, and date range.
2. Full walkthrough: create a recurring lecture, submit a discrepancy against it, approve it as the routed admin, confirm the change reflects in the timetable view and the audit log.
3. Note what's deferred: mobile scheduling views and the reporting flow start Week 4; no notification is visibly wired into the UI yet (Week 5).

**End of Week 3 checkpoint:** admins can fully create and manage lectures, exams, and events through the web app, with conflict and routing outcomes from the backend clearly and correctly surfaced, and the full discrepancy request → approval → audit trail loop is usable end to end.

---

# Week 4 — Mobile Core: Schedules & Class Rep Reporting

**Goal:** the mobile app becomes genuinely useful for its primary daily-use audience — students, class reps, and lecturers — covering schedule viewing and the mandatory reporting flow.

## Day 1 — Student/Rep Schedule View

1. Build the schedule list/calendar view for a logged-in student, pulling their course-linked sessions for the current term.
2. Build the session detail view — venue, time, course, and current status (scheduled/shifted/postponed/cancelled).
3. Confirm the visibility resolution from Week 2's course-sharing work is correctly reflected — a student sees sessions for courses actually visible to them (department-owned, faculty/school-owned, general, or granted), not just their home department's own courses.

## Day 2 — Class Rep Reporting Action

1. Add the reporting action to a session's detail view, visible only to users with `is_class_rep = true`, and only enabled while the session's reporting window is still open — reflecting, not replacing, the backend's own server-side window enforcement from Backend Week 5.
2. Build the report submission form: held/not-held toggle, required reason field.
3. Handle the window-closed state gracefully — if a rep opens a session detail view after the window has expired, the UI should clearly explain why reporting is no longer available, rather than showing a broken or silently-failing button.
4. Test against real backend window behavior: a report submitted just before expiry succeeds; one attempted just after is correctly blocked with a clear message.

## Day 3 — Lecturer Schedule View & Dispute Response

1. Build the lecturer's own schedule view — their assigned sessions across all courses they teach.
2. Build the report visibility for a lecturer — any `ClassRepReport` filed against one of their sessions, shown clearly with the rep's stated reason.
3. Build the dispute/response action — a lecturer can attach their own comment to a report filed against their session.

## Day 4 — Mobile Navigation Polish

1. Refine the mobile shell navigation from Week 1 now that real feature screens exist behind it — confirm the tab/drawer structure genuinely supports fast daily use (checking today's schedule, reporting after a lecture) rather than requiring unnecessary taps to reach the common paths.
2. Add pull-to-refresh and reasonable loading/empty states throughout, since mobile users are far less tolerant of an unclear loading state than desktop admin users.

## Day 5 — Full Role Walkthrough & Close-Out

1. Full walkthrough on a real device/emulator: as a rep, view a session, report on it within the window; as the lecturer of that session, view and respond to the report.
2. Confirm scoping matches the backend exactly — a rep never sees another department's sessions to report on; a lecturer never sees another lecturer's reports.
3. Note what's deferred: push notifications aren't wired in yet (Week 5); this week's flow only works while the user has the app open and navigates to the relevant screen manually.

**End of Week 4 checkpoint:** the mobile app is genuinely usable for its core daily audience — students and reps can view schedules and report on lectures within the enforced window, lecturers can view and respond to reports about their own sessions — all correctly scoped and reflecting real backend state.

---

# Week 5 — Notifications & Remaining Read Views

**Goal:** real-time notification delivery is wired into both clients, and the remaining read-only web views (student and lecturer schedules on web, for users who prefer or need desktop access) are complete.

## Day 1 — Mobile Push Registration

1. Integrate Firebase Cloud Messaging on the mobile app — request notification permission, obtain the device token, and register it against the backend's device registration endpoint from Backend Week 6.
2. Handle the token refresh case (FCM occasionally rotates tokens) by re-registering automatically when it happens.
3. Test: a notification triggered on the backend (e.g. approving a discrepancy in the Week 3 web queue) correctly arrives as a push notification on a real test device.

## Day 2 — In-App Notification Inbox (Web)

1. Build the notification inbox screen on web — list, read/unread state, mark-as-read action.
2. Add an unread-count badge to the shell navigation from Week 1.
3. Test against real triggered events from the backend.

## Day 3 — In-App Notification Inbox (Mobile)

1. Build the equivalent inbox on mobile, consistent in behavior with the web version.
2. Wire tapping a push notification to deep-link into the relevant screen (e.g. tapping a "session shifted" notification opens that session's detail view directly), rather than just opening the app to its default screen.

## Day 4 — Web Student & Lecturer Read Views

1. Build the read-only student schedule view on web, mirroring the mobile version from Week 4, for students who prefer or need desktop access.
2. Build the read-only lecturer schedule and report-response view on web, same mirroring principle.

## Day 5 — Full Test Suite & Close-Out

1. Full cross-client test: trigger a notification-worthy event, confirm it appears correctly on mobile push, mobile in-app inbox, and web in-app inbox, consistently.
2. Confirm deep-linking from a push notification works correctly across both cold-start (app not running) and warm-start (app already open) cases on mobile.
3. Note what's deferred: analytics dashboard and Calendar sync UI start Week 6.

**End of Week 5 checkpoint:** notifications reliably reach the user across mobile push, mobile in-app inbox, and web in-app inbox from real backend-triggered events, with correct deep-linking; the remaining read-only schedule views are available on web for students and lecturers.

---

# Week 6 — Analytics, Calendar Sync, Final Integration & Deployment

**Goal:** the administrative analytics dashboard, the optional Calendar sync connection flow, and a final full-system integration pass across both clients — ending in both apps being ready for real use.

## Day 1 — Analytics Dashboard (Web Only)

1. Build the analytics dashboard screen — charts (via Recharts) for lecture-hold rate, venue utilization, and discrepancy frequency, consuming Backend Week 7's aggregation endpoints.
2. Add date-range and grouping controls matching what the backend endpoints support.
3. Scope the dashboard correctly to the logged-in admin's level, same downward-resolving pattern as everything else.

## Day 2 — Calendar Sync Connect Flow

1. Build the "connect Google Calendar" settings screen on web and mobile — triggering the OAuth flow from Backend Week 7, and clearly showing connected/disconnected state.
2. Build the disconnect action on both.
3. Confirm — deliberately, as a test, not an assumption — that a user who never connects Calendar experiences the rest of the app identically to one who does, on both clients.

## Day 3 — Cross-Client Integration Testing

1. Run full end-to-end scenarios spanning both clients together: an admin books a venue on web → conflict routes to a faculty admin → approved on web → a student sees the updated schedule on mobile → push notification received → class rep reports on mobile after the session → lecturer disputes on mobile → admin reviews the dispute and sees updated analytics on web.
2. Fix any seam issues found — these are the bugs most likely to surface only when both clients and the full backend are exercised together, not caught by any single week's isolated testing.

## Day 4 — Polish & Accessibility Pass

1. Web: keyboard navigation, focus states, and reasonable color contrast across admin screens built since Week 2.
2. Mobile: confirm reasonable touch target sizing, safe-area handling on notched devices, and that loading/error states are handled everywhere, not just the happy path.
3. Review app icons, splash screens, and general first-impression polish on mobile ahead of internal distribution.

## Day 5 — Deployment

1. Deploy the web app to its hosting provider.
2. Build the mobile app and submit it to internal testing distribution (TestFlight / Android internal testing track) — public store release intentionally follows later, outside this window, since app store review timelines aren't something this plan controls.
3. Write a short internal note on what's genuinely finished vs. what's a reasonable next iteration (e.g. broader accessibility work, additional analytics views) — distinguishing "not built" from "deliberately deferred," so nothing here is mistaken for an oversight.

**End of Week 6 checkpoint — and end of the frontend phase:** both the web portal and mobile app are fully functional against the complete backend API, covering every feature planned across the whole project — hierarchy and venue/course management, scheduling with conflict/routing feedback, the discrepancy workflow, mandatory class rep reporting, cross-channel notifications, analytics, and optional Calendar sync — deployed and ready for real use by the school.

---

## Why This Sequencing, Summarized

| Week | Focus | Depends On |
|---|---|---|
| 1 | Scaffolding, auth, shell | The completed backend auth endpoints |
| 2 | Web admin core (hierarchy, venues, courses) | Week 1's shell and auth |
| 3 | Web scheduling & discrepancy workflow | Week 2's venue/course screens to select from |
| 4 | Mobile core (schedules, reporting) | Backend's materialized sessions and reporting endpoints |
| 5 | Notifications, remaining read views | Weeks 3–4's trigger-worthy events actually existing in the UI |
| 6 | Analytics, Calendar sync, integration, deployment | Everything — final assembly and delivery |

Because the entire backend was finished and documented before this phase began, no week here involves discovering that a needed endpoint doesn't exist — every screen built is wiring against a contract that was already proven correct in the backend phase.
