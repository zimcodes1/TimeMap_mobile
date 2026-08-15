# TimeMapper Mobile App - Screens, Bottom Sheets & API Endpoint Mapping

This reference document outlines the target mobile UI surface for the **TimeMapper Mobile App** (`TimeMap_mobile/app`). It is the mobile equivalent of the web admin page/modal mapping, but it is intentionally not an admin-dashboard clone.

The mobile app is for:
- **Students**: view personal and department-relevant timetable information, receive schedule updates, and manage push preferences.
- **Class Representatives**: do everything a student can do, plus submit lecture-hold reports during the active reporting window.
- **Lecturers**: view assigned teaching sessions, monitor class-rep reports for their courses, and submit dispute/clarification responses.

The current mobile codebase has auth screens and shared UI primitives scaffolded. The tab, session, reporting, notification, and profile screens below are the intended build target.

---

## 1. Global Navigation Model

### 1.1 Expo Router Groups

| Route Group | Purpose | Auth State |
|---|---|---|
| `app/(auth)` | Login, forgot password, forced password reset | Public or password-reset gate |
| `app/(tabs)` | Main mobile experience after auth | Protected |
| `app/sessions/[id]` | Deep session detail and report actions | Protected |
| `app/reports/[id]` | Optional deep report thread detail | Protected |
| `app/notifications/[id]` | Optional notification deep-link resolver | Protected |

### 1.2 Bottom Tab Screens

| Tab | File | Primary Users |
|---|---|---|
| Today | `src/app/(tabs)/index.tsx` | Student, class rep, lecturer |
| Calendar | `src/app/(tabs)/calendar.tsx` | Student, class rep, lecturer |
| Reports | `src/app/(tabs)/reports.tsx` | Class rep, lecturer |
| Notifications | `src/app/(tabs)/notifications.tsx` | Student, class rep, lecturer |
| Profile | `src/app/(tabs)/profile.tsx` | Student, class rep, lecturer |

### 1.3 Access Rules

- Unauthenticated users should only reach `/`, `/login`, `/forgot-password`, and the reset screen when the flow allows it.
- After successful login, store tokens with `expo-secure-store`.
- If `requires_password_reset = true`, redirect to `/reset-password` before allowing protected tabs.
- Student users should not see admin CRUD screens.
- Class reps are students with `profile.is_class_rep = true`; only they get the report submission action.
- Lecturers should see assigned sessions and report/dispute tools, but not class-rep-only submission controls.
- Admin users should generally use the web portal. If an admin logs into mobile, either route them to an informational "Use web dashboard" state or provide read-only profile/notifications only, depending on product decision.

---

## 2. Auth & Gate Screens

### 2.1 Welcome / Launch Screen (`/`)

**Purpose**: Initial brand screen and routing gateway. In the current scaffold, it displays the TimeMap logo and a login button.

**Route File**: `src/app/index.tsx`

**Key UI Components**:
- Logo image.
- App title and subtitle.
- Short informational card.
- Login button.

**Bottom Sheets & Forms**:
- None.

**API Endpoints & Methods**:
- No direct API requirement if it is only a launch screen.
- Optional auth bootstrap may call `GET /api/auth/profile/` if valid tokens exist.

**Expected Navigation**:
- If no stored token exists, `Login` navigates to `/(auth)/login`.
- If a valid token exists and profile fetch succeeds, route to `/(tabs)`.
- If token refresh fails, clear SecureStore and stay in auth flow.

---

### 2.2 Login Screen (`/(auth)/login`)

**Purpose**: Authenticate students, class reps, lecturers, and optionally admins using the shared backend login endpoint.

**Route File**: `src/app/(auth)/login.tsx`
**Screen Component**: `src/screens/auth/LoginScreen.tsx`

**Key UI Components**:
- Identifier input (`Staff ID` or `Matric Number`).
- Password input.
- Show/hide password icon button.
- Sign in button.
- Forgot password link.
- Toast feedback.

**Bottom Sheets & Forms**:
- **Login Form**:
  - `identifier` mapped from UI field `id`.
  - `password`.
  - Validation belongs in `src/lib/validation/auth.ts`.

**API Endpoints & Methods**:
- `POST /api/auth/login/`
- Optional after token restore: `GET /api/auth/profile/`

**State Actions**:
- Save `tokens.access` and `tokens.refresh` with `expo-secure-store`.
- Save mapped user/profile in auth context.
- If `requires_password_reset = true`, route to `/(auth)/reset-password`.
- Otherwise route to `/(tabs)`.

**Notes**:
- The current route simulates login. Real integration should move request logic into `src/api/authAPI.ts` and auth state into `src/context/AuthContext.tsx`.

---

### 2.3 Forced Password Reset Screen (`/(auth)/reset-password`)

**Purpose**: Mandatory first-login password update before a user can access protected mobile screens.

**Route File**: `src/app/(auth)/reset-password.tsx`
**Screen Component**: `src/screens/auth/ResetPasswordScreen.tsx`

**Key UI Components**:
- Account identifier card.
- New password input.
- Confirm password input.
- Show/hide icons for both password fields.
- Reset password button.
- Back to login link.

**Bottom Sheets & Forms**:
- **Password Reset Form**:
  - `newPassword`.
  - `confirmPassword`.
  - Submit payload maps to backend field `new_password`.

**API Endpoints & Methods**:
- `POST /api/auth/password-reset/`

**State Actions**:
- Requires valid access token.
- On success, clear `requires_password_reset` in auth context.
- Route to `/(tabs)` or back to login based on product flow.

---

### 2.4 Forgot Password Screen (`/(auth)/forgot-password`)

**Purpose**: Collect email or staff/student identifier for a password recovery flow.

**Route File**: `src/app/(auth)/forgot-password.tsx`
**Screen Component**: `src/screens/auth/ForgotPasswordScreen.tsx`

**Key UI Components**:
- Email or Staff ID input.
- Send Code button.
- Back to login link.
- Toast feedback.

**Bottom Sheets & Forms**:
- **Forgot Password Form**:
  - `email` field currently accepts either email or identifier.

**API Endpoints & Methods**:
- No confirmed backend endpoint in the current API documentation.

**Notes**:
- The current implementation simulates sending a reset code. Keep it clearly marked as placeholder until backend recovery endpoints exist.

---

## 3. Main Tab Screens

### 3.1 Today's Schedule Screen (`/(tabs)`)

**Purpose**: Give users the fastest view of today's sessions and schedule changes.

**Route File**: `src/app/(tabs)/index.tsx`

**Primary Users**:
- Students and class reps: sessions for registered/visible courses.
- Lecturers: assigned teaching sessions.

**Key UI Components**:
- Header with greeting and current date.
- Date pill carousel or compact date picker.
- Pull-to-refresh list.
- Status filter chips: `All`, `Scheduled`, `Shifted`, `Postponed`, `Cancelled`, `Held`, `Not Held`.
- `SessionCard` list.
- Empty state for no sessions today.
- Offline/loading/error states.

**Bottom Sheets & Forms**:
- **Date Picker Bottom Sheet**:
  - Local UI state only unless the selected date changes the query.
- **Status Filter Bottom Sheet**:
  - Local UI state only.
- **Session Quick Actions Bottom Sheet**:
  - Opened from a session card overflow or press.
  - Actions: View Details, Submit Report if class rep and window is open, Add/Sync to calendar if later implemented.

**API Endpoints & Methods**:
- `GET /api/scheduling/sessions/?date=YYYY-MM-DD`
- Optional: `GET /api/notifications/inbox/unread-count/` for tab badge.

**Expected Query Behavior**:
- Changing the date refetches sessions for that date.
- Pull-to-refresh refetches the current date's sessions.
- Status filters should be local unless backend filtering is added.

---

### 3.2 Calendar / Term Schedule Screen (`/(tabs)/calendar`)

**Purpose**: Let users browse the wider timetable beyond today.

**Route File**: `src/app/(tabs)/calendar.tsx`

**Primary Users**:
- Students, class reps, lecturers.

**Key UI Components**:
- Week/day selector or agenda calendar.
- Search input for course code/title/venue.
- Course filter chips.
- Compact session cards grouped by date.
- View toggle: agenda/list and week grid.

**Bottom Sheets & Forms**:
- **Calendar Filter Bottom Sheet**:
  - Course selector.
  - Date range selector.
  - Status selector.
  - Local state that updates query params where supported.
- **Session Preview Bottom Sheet**:
  - Shows course, venue, status, time, lecturer, and View Details button.

**API Endpoints & Methods**:
- `GET /api/scheduling/sessions/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`
- Fallback if backend only supports broad list: `GET /api/scheduling/sessions/`
- Optional course context: `GET /api/courses/courses/visible-to-me/`

**Notes**:
- Do not create or edit schedules from mobile. Creation and conflict routing are web admin responsibilities.

---

### 3.3 Reports Screen (`/(tabs)/reports`)

**Purpose**: Central reporting workspace. It behaves differently depending on user role.

**Route File**: `src/app/(tabs)/reports.tsx`

**Primary Users**:
- Class reps: view submitted reports and pending reportable sessions.
- Lecturers: view reports filed against assigned courses and respond/dispute.
- Students who are not reps: show read-only/informational state or hide the tab if product decides.

**Key UI Components**:
- Role-aware segmented control:
  - Class rep: `To Report`, `Submitted`.
  - Lecturer: `Needs Response`, `All Reports`.
- Report cards showing course code, session date, held status, reason, and response state.
- Report window countdown or expired badge.
- Pull-to-refresh.

**Bottom Sheets & Forms**:
- **Submit Report Bottom Sheet**:
  - Opened from a reportable session or session detail.
  - Fields: `held` toggle, `reason` multiline input.
  - Submit payload: `{ lecture_session, held, reason }`.
- **Report Detail Bottom Sheet**:
  - Read-only details: session, class rep, held status, reason, reported time, lecturer response.
- **Lecturer Dispute Bottom Sheet**:
  - Field: `response_text`.
  - Submit sends response for a report.
- **Role Help Bottom Sheet**:
  - Informational only. Explains why a student may not see reporting actions.

**API Endpoints & Methods**:
- `GET /api/reporting/reports/`
- `POST /api/reporting/reports/`
- `POST /api/reporting/reports/{id}/respond/`
- Optional source for reportable sessions: `GET /api/scheduling/sessions/`

**Expected Role Behavior**:
- Class rep can submit only while backend reporting window is open.
- Lecturer can respond only to reports tied to their assigned courses.
- The server must enforce reporting windows and role permissions; mobile hiding is not security.

---

### 3.4 Notifications Screen (`/(tabs)/notifications`)

**Purpose**: Persistent in-app inbox for schedule changes, discrepancy approvals/rejections, reporting-window reminders, and session-unreported alerts.

**Route File**: `src/app/(tabs)/notifications.tsx`

**Primary Users**:
- Students, class reps, lecturers. Admin visibility can be supported, but admin workflows remain web-first.

**Key UI Components**:
- Unread count badge.
- Tabs or filter chips: `All`, `Unread`.
- Notification cards with type badge, title, body, timestamp, read state.
- Mark All Read button.
- Pull-to-refresh.

**Bottom Sheets & Forms**:
- **Notification Detail Bottom Sheet**:
  - Shows full title/body/type/time.
  - Primary action resolves deep link to related session, report, or request where mobile supports it.
- **Notification Filter Bottom Sheet**:
  - Local filters by type and read status.

**API Endpoints & Methods**:
- `GET /api/notifications/inbox/`
- `GET /api/notifications/inbox/unread-count/`
- `POST /api/notifications/inbox/{id}/read/`
- `POST /api/notifications/inbox/mark-all-read/`

**Expected Query Behavior**:
- Poll unread count every 10 seconds or refetch on app focus.
- Opening a notification detail should mark it read if it was unread.
- Mark All Read should invalidate inbox and unread-count queries.

---

### 3.5 Profile & Settings Screen (`/(tabs)/profile`)

**Purpose**: Show user identity, department/scope context, push notification controls, app metadata, and logout.

**Route File**: `src/app/(tabs)/profile.tsx`

**Primary Users**:
- Students, class reps, lecturers.

**Key UI Components**:
- Avatar/initials.
- Full name.
- Matric number or staff ID.
- Role badge: Student, Class Rep, Lecturer.
- Department and level, where applicable.
- Push notification toggle.
- App version/build info.
- Logout button.

**Bottom Sheets & Forms**:
- **Push Permission Bottom Sheet**:
  - Explains why notifications are used.
  - Requests OS notification permission via Expo/Firebase flow.
- **Logout Confirmation Bottom Sheet**:
  - Confirms clearing SecureStore tokens and auth context.
- **Account Details Bottom Sheet**:
  - Informational only. Shows profile fields returned by backend.

**API Endpoints & Methods**:
- `GET /api/auth/profile/`
- `POST /api/notifications/devices/`
- `POST /api/notifications/devices/deactivate/`
- `POST /api/auth/token/refresh/` indirectly via API client.

**State Actions**:
- Enabling push registers the current device token with platform `ios` or `android`.
- Disabling push deactivates the current token.
- Logout clears access token, refresh token, user profile, push token state if locally cached, and navigates to `/(auth)/login`.

---

## 4. Deep Screens

### 4.1 Session Detail Screen (`/sessions/[id]`)

**Purpose**: Detailed view of a materialized `LectureSession`, with role-aware report actions.

**Route File**: `src/app/sessions/[id].tsx`

**Primary Users**:
- Students, class reps, lecturers.

**Key UI Components**:
- Session header card.
- Course code/title.
- Date, start time, end time.
- Venue name and facility hints if available.
- Session status badge.
- Lecturer names if included by API.
- Reporting window banner:
  - Open.
  - Already reported.
  - Expired.
  - Not available to this user.
- Past report thread if report exists.

**Bottom Sheets & Forms**:
- **Submit Class Rep Report Bottom Sheet**:
  - Fields: `held`, `reason`.
  - Calls report creation endpoint.
- **Report Detail Bottom Sheet**:
  - Informational unless lecturer can respond.
- **Lecturer Response Bottom Sheet**:
  - Field: `response_text`.
- **Venue Info Bottom Sheet**:
  - Informational. Uses session payload if available; can optionally fetch venue detail.

**API Endpoints & Methods**:
- `GET /api/scheduling/sessions/{id}/`
- `POST /api/reporting/reports/`
- `GET /api/reporting/reports/?lecture_session={id}` if supported, otherwise filter from `GET /api/reporting/reports/`.
- `POST /api/reporting/reports/{id}/respond/`
- Optional: `GET /api/venues/venues/{id}/`

**Important Behavior**:
- Reporting attaches to `LectureSession`, never to the parent recurring `TimetableEntry`.
- If `now > window_expires_at`, disable report submission and show expired state.
- Even if the UI thinks the window is open, backend rejection must be shown clearly.

---

### 4.2 Report Detail Screen (`/reports/[id]`)

**Purpose**: Optional deep view for a single class-rep report, useful from notification links and lecturer workflows.

**Route File**: `src/app/reports/[id].tsx`

**Key UI Components**:
- Course/session summary.
- Reported by.
- Held/not-held badge.
- Reason.
- Reported timestamp.
- Lecturer response and timestamp.
- Respond button for eligible lecturer.

**Bottom Sheets & Forms**:
- **Lecturer Response Bottom Sheet**:
  - Field: `response_text`.

**API Endpoints & Methods**:
- `GET /api/reporting/reports/{id}/` if detail endpoint is enabled by DRF router.
- Fallback: `GET /api/reporting/reports/` and select locally.
- `POST /api/reporting/reports/{id}/respond/`

---

### 4.3 Notification Resolver Screen (`/notifications/[id]`)

**Purpose**: Optional deep-link resolver when a push notification or inbox item is opened.

**Route File**: `src/app/notifications/[id].tsx`

**Key UI Components**:
- Loading state while marking notification read.
- Fallback notification detail if related mobile screen is unsupported.
- Error state if related record is not accessible.

**Bottom Sheets & Forms**:
- None required. Can use Notification Detail Bottom Sheet if this route is shown inside tabs.

**API Endpoints & Methods**:
- `POST /api/notifications/inbox/{id}/read/`
- Optional: `GET /api/notifications/inbox/` to resolve notification details if not passed through navigation params.

**Deep-Link Rules**:
- `related_model = "LectureSession"` routes to `/sessions/[related_id]`.
- `related_model = "ClassRepReport"` routes to `/reports/[related_id]`.
- `related_model = "DiscrepancyRequest"` can show an informational notification detail unless a mobile request detail screen is later added.

---

## 5. Shared Mobile Components

### 5.1 Current Shared Components

These already exist and should be reused before creating new primitives:
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/FormField.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/BottomSheet.tsx`
- `src/components/ui/Toggle.tsx`
- `src/components/ui/ToastConfig.tsx`
- `src/components/common/Text.tsx`
- `src/components/common/SplashScreenView.tsx`

### 5.2 Target Feature Components

| Component | Suggested Location | Endpoint Mapping |
|---|---|---|
| `SessionCard` | `src/components/cards/SessionCard.tsx` | Displays data from `GET /api/scheduling/sessions/` |
| `ScheduleAgendaList` | `src/components/schedules/ScheduleAgendaList.tsx` | Displays grouped session lists |
| `DateStrip` | `src/components/schedules/DateStrip.tsx` | Local state; can change sessions query |
| `StatusFilterChips` | `src/components/schedules/StatusFilterChips.tsx` | Local filtering |
| `ReportCard` | `src/components/cards/ReportCard.tsx` | Displays data from `GET /api/reporting/reports/` |
| `NotificationCard` | `src/components/cards/NotificationCard.tsx` | Displays data from `GET /api/notifications/inbox/` |
| `ProfileHeader` | `src/components/profile/ProfileHeader.tsx` | Displays data from `GET /api/auth/profile/` |

### 5.3 Target Bottom Sheet Components

| Bottom Sheet | Suggested Location | Endpoint Mapping |
|---|---|---|
| `SubmitReportBottomSheet` | `src/components/bottom-sheets/SubmitReportBottomSheet.tsx` | `POST /api/reporting/reports/` |
| `LecturerResponseBottomSheet` | `src/components/bottom-sheets/LecturerResponseBottomSheet.tsx` | `POST /api/reporting/reports/{id}/respond/` |
| `SessionQuickActionsBottomSheet` | `src/components/bottom-sheets/SessionQuickActionsBottomSheet.tsx` | Mostly navigation/local actions |
| `ScheduleFilterBottomSheet` | `src/components/bottom-sheets/ScheduleFilterBottomSheet.tsx` | Local filters and query params |
| `NotificationDetailBottomSheet` | `src/components/bottom-sheets/NotificationDetailBottomSheet.tsx` | `POST /api/notifications/inbox/{id}/read/` if unread |
| `PushPermissionBottomSheet` | `src/components/bottom-sheets/PushPermissionBottomSheet.tsx` | `POST /api/notifications/devices/` after OS token retrieval |
| `LogoutConfirmBottomSheet` | `src/components/bottom-sheets/LogoutConfirmBottomSheet.tsx` | Local SecureStore/auth cleanup |

---

## 6. API Integration Files To Create

| File | Responsibility |
|---|---|
| `src/api/apiClient.ts` | Axios or fetch wrapper, base URL, SecureStore token injection, 401 refresh/retry |
| `src/api/authAPI.ts` | Login, password reset, token refresh, profile |
| `src/api/schedulesAPI.ts` | Timetable entries and lecture sessions read APIs |
| `src/api/reportingAPI.ts` | Class-rep report list/create and lecturer response |
| `src/api/notificationsAPI.ts` | Inbox, unread count, read actions, push token registration |
| `src/api/coursesAPI.ts` | Visible courses and registrations if mobile course context is needed |
| `src/api/venuesAPI.ts` | Optional venue detail/facility lookups |

### Required Token Behavior

- Store access token under a stable key such as `timemap_access_token`.
- Store refresh token under `timemap_refresh_token`.
- Attach `Authorization: Bearer <access_token>` on protected requests.
- On `401`, call `POST /api/auth/token/refresh/`, update the access token, and retry the original request once.
- If refresh fails, clear SecureStore and route to `/(auth)/login`.
- If a protected endpoint returns `403` with password-reset context, route to `/(auth)/reset-password`.

---

## 7. Quick Reference Matrix

| Mobile Screen / Sheet | Route / Component | Backend API Endpoint | Method |
|---|---|---|---|
| Welcome | `/` | None or `GET /api/auth/profile/` | Local/GET |
| Login | `/(auth)/login` | `/api/auth/login/` | POST |
| Forced Password Reset | `/(auth)/reset-password` | `/api/auth/password-reset/` | POST |
| Forgot Password | `/(auth)/forgot-password` | Not confirmed | Placeholder |
| Today Schedule | `/(tabs)` | `/api/scheduling/sessions/` | GET |
| Calendar Schedule | `/(tabs)/calendar` | `/api/scheduling/sessions/` | GET |
| Session Detail | `/sessions/[id]` | `/api/scheduling/sessions/{id}/` | GET |
| Submit Report Sheet | `SubmitReportBottomSheet` | `/api/reporting/reports/` | POST |
| Reports Inbox | `/(tabs)/reports` | `/api/reporting/reports/` | GET |
| Lecturer Response Sheet | `LecturerResponseBottomSheet` | `/api/reporting/reports/{id}/respond/` | POST |
| Notifications Inbox | `/(tabs)/notifications` | `/api/notifications/inbox/` | GET |
| Notification Read | Notification card/detail | `/api/notifications/inbox/{id}/read/` | POST |
| Mark All Notifications Read | Notifications screen | `/api/notifications/inbox/mark-all-read/` | POST |
| Unread Badge | Tab badge/header | `/api/notifications/inbox/unread-count/` | GET |
| Profile | `/(tabs)/profile` | `/api/auth/profile/` | GET |
| Enable Push | Push sheet/profile toggle | `/api/notifications/devices/` | POST |
| Disable Push | Push sheet/profile toggle | `/api/notifications/devices/deactivate/` | POST |
| Visible Courses | Calendar/report filters | `/api/courses/courses/visible-to-me/` | GET |
| Venue Info | Venue info sheet | `/api/venues/venues/{id}/` | GET |

---

## 8. Out Of Scope For Mobile V1

These are web-admin responsibilities and should not be built into the mobile student/lecturer app unless the product scope changes:
- Creating/editing schools, faculties, departments.
- Creating/editing venues and facilities.
- Creating/editing courses and access grants.
- Creating timetable entries.
- Approving/rejecting discrepancy requests.
- Viewing audit logs.
- Administrative analytics dashboards.

Mobile may show read-only results of those workflows, such as a shifted session or an approved discrepancy notification.

---

## 9. Build Order Recommendation

1. Real auth integration: `apiClient`, `authAPI`, SecureStore, auth context, protected route redirects.
2. Tabs layout and profile screen.
3. Today's schedule list from `GET /api/scheduling/sessions/`.
4. Session detail screen.
5. Class rep submit-report bottom sheet.
6. Reports screen and lecturer response bottom sheet.
7. Notifications inbox, unread badge, and read actions.
8. Push token registration/deactivation.
9. Calendar/term schedule filters and polish.
