# TimeMapper Mobile App — Frontend Architecture & Technical Roadmap

## Executive Overview
The **TimeMapper Mobile Application** (`TimeMap_mobile`) is built using **Expo**, **React Native**, **Expo Router (File-based Routing)**, **NativeWind (Tailwind CSS for React Native)**, and **TanStack Query (React Query)**. It targets three primary end-user roles:
1. **Students**: Daily lecture timetable viewing, venue room numbers, status updates (shifted/cancelled/postponed), and push notifications.
2. **Class Representatives**: Mandatory lecture-hold reporting within server-enforced time windows (`now <= window_expires_at`).
3. **Lecturers**: Assigned teaching schedule viewing, Class Rep lecture-hold report monitoring, and dispute response submission.

---

## 1. Core Architecture & Stack Specification

| Layer | Technology / Library | Purpose |
|---|---|---|
| **Framework** | Expo (React Native SDK 51+) | Cross-platform iOS & Android mobile runtime |
| **Routing** | Expo Router (v3+) | Typed file-based routing with tab bar & stack navigators |
| **Styling** | NativeWind (v4) | Utility-first styling consistent with web design tokens |
| **Server State** | TanStack React Query (v5) | Caching, background polling, and optimistic UI mutations |
| **Client Storage** | `expo-secure-store` | Encrypted storage for JWT access/refresh tokens |
| **Push Delivery** | `expo-notifications` + FCM | Native Firebase Cloud Messaging push token registration |

---

## 2. Directory & Route File Structure

```
TimeMap_mobile/
├── app/
│   ├── _layout.tsx                     # Global Root Layout (QueryClientProvider, AuthProvider)
│   ├── (auth)/
│   │   ├── _layout.tsx                 # Auth Stack Navigator
│   │   ├── login.tsx                   # User Login Screen
│   │   └── reset-password.tsx          # Forced Password Reset Screen
│   ├── (tabs)/
│   │   ├── _layout.tsx                 # Bottom Tab Navigator
│   │   ├── index.tsx                   # Today's Schedule Screen
│   │   ├── calendar.tsx                # Term Schedule Grid Screen
│   │   ├── reports.tsx                 # Reporting Inbox (Class Reps & Lecturers)
│   │   ├── notifications.tsx          # In-App Notification Inbox
│   │   └── profile.tsx                 # Profile & Push Notification Settings
│   └── sessions/
│       └── [id].tsx                    # Session Detail & Report Submission Screen
├── src/
│   ├── api/
│   │   ├── apiClient.ts                # Axios instance with SecureStore token interceptor
│   │   ├── authAPI.ts                  # Auth & Profile API calls
│   │   ├── schedulesAPI.ts             # Session & Entry API calls
│   │   ├── reportingAPI.ts             # Class Rep Report & Dispute API calls
│   │   └── notificationsAPI.ts         # FCM Push Token & Inbox API calls
│   ├── components/
│   │   ├── cards/
│   │   │   ├── SessionCard.tsx         # Today's Session Card Component
│   │   │   └── ReportCard.tsx          # Class Rep Report Item Component
│   │   ├── modals/
│   │   │   ├── SubmitReportModal.tsx   # Class Rep Report Submission Modal
│   │   │   └── DisputeModal.tsx        # Lecturer Dispute Response Drawer
│   │   └── ui/
│   │       ├── Badge.tsx               # Native Status Badge Component
│   │       └── Button.tsx              # Styled Button Component
│   ├── context/
│   │   └── AuthContext.tsx             # Auth State Context & SecureStore Token Storage
│   └── types/
│       └── index.ts                    # Shared TypeScript interfaces
```

---

## 3. Role-Based Capabilities & User Flows

```mermaid
flowchart TD
    A[Launch Mobile App] --> B{Authenticated?}
    B -- No --> C[app/(auth)/login.tsx]
    C --> D{Requires Password Reset?}
    D -- Yes --> E[app/(auth)/reset-password.tsx]
    D -- No --> F[app/(tabs)/index.tsx]
    B -- Yes --> F
    
    F --> G{User Role?}
    G -- Student --> H[View Today's & Term Schedules]
    G -- Class Rep --> I[View Schedule + Submit Session Hold Report]
    G -- Lecturer --> J[View Teaching Schedule + Dispute Class Rep Reports]
```

### 3.1 Student User Flow
- **Authentication**: Logs in with Matric Number / Identifier.
- **Home (`(tabs)/index.tsx`)**: Views today's dated sessions with real-time status badges (`SCHEDULED`, `SHIFTED`, `POSTPONED`, `CANCELLED`).
- **Calendar (`(tabs)/calendar.tsx`)**: Searches or filters full-term timetables by course code.
- **Push Alerts**: Receives instant push notifications when a lecture venue or start time is shifted by an admin officer.

### 3.2 Class Representative Flow
- **Reporting Privileges**: Identifiable by `user.profile.is_class_rep === true`.
- **Session Detail (`app/sessions/[id].tsx`)**: Displays an active **"Submit Class Rep Report"** banner if `now <= window_expires_at`.
- **Submission Form**:
  - Toggle: `Held` (`true`) or `Not Held` (`false`).
  - Text Input: `reason` (Required explanation for hold status).
- **Expiration Handling**: If `now > window_expires_at`, the button is disabled with an explanatory banner: *"Reporting window for this session expired at [Time]"*.

### 3.3 Lecturer Flow
- **Teaching Schedule**: Displays all sessions where the lecturer is assigned (`lecture_session__timetable_entry__course__lecturers`).
- **Report Inbox (`(tabs)/reports.tsx`)**: Lists all `ClassRepReport` submissions filed against the lecturer's course sessions.
- **Dispute Action**: Lecturer taps a report to open `DisputeModal.tsx` and submits `response_text` to dispute or clarify the rep's report.

---

## 4. Detailed Screen Specifications & API Mapping

### 4.1 Login Screen (`app/(auth)/login.tsx`)
- **UI Elements**: Identifier input, Password input, Sign In button, Error Toast.
- **API Call**: `POST /api/auth/login/`
  ```json
  // Request
  { "identifier": "NSUK/CSC/2021/001", "password": "12345678" }
  
  // Response (200 OK)
  {
    "user": { "id": 1, "identifier": "NSUK/CSC/2021/001", "role": "student", "requires_password_reset": false },
    "tokens": { "access": "eyJhbG...", "refresh": "eyJhbG..." },
    "profile": { "id": 1, "full_name": "Alice Smith", "is_class_rep": true }
  }
  ```
- **State Action**: Store tokens in `expo-secure-store`. If `requires_password_reset === true`, redirect to `app/(auth)/reset-password.tsx`.

### 4.2 Today's Schedule Screen (`app/(tabs)/index.tsx`)
- **UI Elements**: Date selector pill, Refresh Control, Session Cards list, Status Filter Pills.
- **API Call**: `GET /api/scheduling/sessions/?date=YYYY-MM-DD`
- **Component**: `SessionCard.tsx`
  - Displays: Course Code, Course Title, Venue Name, Start & End Time, Status Badge.

### 4.3 Session Detail & Report Submission (`app/sessions/[id].tsx`)
- **UI Elements**: Session Info Card, Venue Details, Class Rep Action Container, Past Reports Timeline.
- **API Calls**:
  - Fetch Detail: `GET /api/scheduling/sessions/{id}/`
  - Submit Report (Class Rep Only): `POST /api/reporting/reports/`
    ```json
    {
      "lecture_session": 5,
      "held": true,
      "reason": "Lecture conducted smoothly in LT1 from 10:00 AM."
    }
    ```

### 4.4 Reporting & Dispute Inbox (`app/(tabs)/reports.tsx`)
- **UI Elements**: Sub-tab Switcher (`Class Rep Reports` | `Lecturer Disputes`), Report Cards, Dispute Response Form.
- **API Calls**:
  - Fetch Reports: `GET /api/reporting/reports/`
  - Submit Dispute: `POST /api/reporting/reports/{id}/respond/`
    ```json
    {
      "response_text": "Class started at 10:15 AM due to previous class extension."
    }
    ```

### 4.5 In-App Notification Inbox (`app/(tabs)/notifications.tsx`)
- **UI Elements**: Unread Count Badge, Notification Cards, Mark All Read Button.
- **API Calls**:
  - List Inbox: `GET /api/notifications/inbox/`
  - Unread Count: `GET /api/notifications/inbox/unread-count/` (Polled every 10 seconds)
  - Mark Read: `POST /api/notifications/inbox/{id}/read/`
  - Mark All Read: `POST /api/notifications/inbox/mark-all-read/`

### 4.6 Profile & Push Settings (`app/(tabs)/profile.tsx`)
- **UI Elements**: User Avatar, Full Name, Matric / Staff Number, FCM Push Switch, Sign Out Button.
- **API Calls**:
  - Register FCM Device: `POST /api/notifications/devices/`
    ```json
    { "fcm_token": "fcm_token_string", "platform": "android" }
    ```
  - Deactivate FCM Device: `POST /api/notifications/devices/deactivate/`

---

## 5. Security & Token Lifecycle Protocol

1. **Storage**: Access token and Refresh token stored encrypted via `SecureStore.setItemAsync('access_token', val)`.
2. **Request Interceptor**: Automatically attaches `Authorization: Bearer <access_token>` to all HTTP requests.
3. **Response Interceptor (401 Handling)**:
   - On `401 Unauthorized`: Triggers a silent refresh call to `POST /api/auth/token/refresh/` with stored `refresh` token.
   - On successful refresh: Updates stored `access` token and retries original request transparently.
   - On refresh failure (expired 7-day token): Clears `SecureStore` and redirects user to `app/(auth)/login.tsx`.
