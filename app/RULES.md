# REACT NATIVE CODING AGENT RULES

These rules apply to AI agents working inside `TimeMap_mobile/app`. Follow them before creating screens, components, API files, or styling.

## 1. Read Before You Build

- Always inspect the existing directory structure before editing. This project uses Expo Router under `src/app`, screen components under `src/screens`, shared UI under `src/components`, validation under `src/lib/validation`, and theme tokens under `src/theme`.
- Always read `package.json` before choosing libraries. Do not assume a dependency exists.
- Always read the relevant docs before implementing mobile features:
  - `../docs/Frontend-Roadmap.md`
  - `../docs/Implementation-Roadmap.md`
  - `../docs/mobile_app_screens_and_bottomsheets.md`
  - Backend API docs at `../../TimeMap_backend/docs/API-Documentation.md`
- Always inspect existing components before creating new ones. Reuse `Button`, `Input`, `FormField`, `Card`, `Badge`, `BottomSheet`, `Toggle`, `ToastConfig`, and shared `Text` first.

## 2. File And Folder Standards

- Route files belong in `src/app`. Keep route files thin.
- Actual screen UI belongs in `src/screens/<domain>`.
- Shared reusable components belong in `src/components/<domain>` or `src/components/ui`.
- Bottom sheets belong in `src/components/bottom-sheets` unless the project later establishes another folder.
- Feature cards belong in `src/components/cards` or the relevant feature folder.
- API integration belongs in `src/api`.
- Auth state belongs in `src/context/AuthContext.tsx` or `src/contexts` if the project standard changes.
- Hooks belong in `src/hooks`.
- Validation schemas belong in `src/lib/validation`.
- Types belong in `src/types`.
- Constants and dummy data belong in `src/constants` or a clearly named `dummy.ts`/`mockData.ts` file. Do not hide dummy data inside screens.
- Theme values belong in `src/theme`; do not hardcode brand colors repeatedly when `colors.ts` already provides tokens.

## 3. Route Files Stay Thin

- Expo Router files in `src/app` should handle navigation, route params, screen-level providers, form setup, and data wiring.
- Do not build large visual layouts directly inside route files.
- Import and render a screen component from `src/screens`.
- Keep API calls in `src/api` and call them through hooks or React Query inside the route/container layer.

Preferred shape:

```tsx
// src/app/(tabs)/profile.tsx
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

export default function ProfileRoute() {
  // query/mutation/navigation wiring here
  return <ProfileScreen user={user} onLogout={handleLogout} />;
}
```

## 4. Screen And Component Size

- Do not write very large screens as one file. Break long screens into sections and reusable components.
- If a screen has cards, filters, headers, lists, and actions, split them into components.
- If a bottom sheet or form is used by a screen, create it as a separate file and import it.
- A file should serve one clear purpose. When a reviewer opens it, the intent should be obvious.

## 5. Bottom Sheets, Not Web Modals

- On mobile, use bottom sheets for contextual actions, forms, confirmations, and detail previews.
- Reuse `src/components/ui/BottomSheet.tsx` unless there is a strong reason to extend it.
- Do not create web-style centered modals for normal mobile flows.
- Confirmation actions such as logout, submit report, disable push, or destructive actions should use a bottom sheet or native alert only when a native alert is clearly simpler.

## 6. API Integration Rules

- Create `src/api/apiClient.ts` before integrating feature APIs.
- The API client must centralize:
  - base URL resolution,
  - JSON headers,
  - `Authorization: Bearer <access_token>`,
  - token refresh through `POST /api/auth/token/refresh/`,
  - one-time retry after refresh,
  - logout/token clearing after refresh failure.
- Store JWTs with `expo-secure-store`, not AsyncStorage.
- Keep endpoints grouped by domain:
  - `authAPI.ts`
  - `schedulesAPI.ts`
  - `reportingAPI.ts`
  - `notificationsAPI.ts`
  - `coursesAPI.ts`
  - `venuesAPI.ts`
- Never make raw fetch/axios calls directly from UI components.
- Use TanStack Query for server state: list/detail fetches with `useQuery`, create/update/read-state actions with `useMutation`, and cache invalidation after successful mutations.

## 7. Auth And Role Rules

- Login must call `POST /api/auth/login/`.
- Password reset must call `POST /api/auth/password-reset/`.
- Profile restore must call `GET /api/auth/profile/`.
- If `requires_password_reset` is true, route the user to `/(auth)/reset-password` before protected tabs.
- Students, class reps, and lecturers share the mobile app. Do not build admin web workflows into the mobile app unless explicitly requested.
- Class rep actions are allowed only when `profile.is_class_rep === true`.
- Lecturer dispute actions are allowed only for reports tied to that lecturer's assigned sessions/courses.
- UI hiding is only UX. Backend permissions are the real source of truth, so always handle `403` responses gracefully.

## 8. Form And Validation Rules

- Use `react-hook-form` with `zod` schemas for forms.
- Put schemas in `src/lib/validation`.
- Use the shared `FormField` component to connect fields to `react-hook-form`.
- Keep backend field mapping explicit:
  - login UI `id` maps to backend `identifier`,
  - reset UI `newPassword` maps to backend `new_password`,
  - report UI `held` and `reason` map directly to reporting payload.
- Show validation errors near the field.
- Disable submit buttons while mutations are pending.

## 9. Styling And Theme Rules

- Use React Native primitives and `StyleSheet` or the established NativeWind setup if/when it is configured in active source.
- Follow `src/theme/colors.ts` and `src/theme/typography.ts`.
- Use `lucide-react-native` for icons.
- Keep the app visually consistent with the existing dark theme: background, surface, raised surface, border, primary, muted text, and semantic colors.
- Do not introduce a second color palette or unrelated design language.
- Ensure screens respect safe areas and keyboard behavior, especially auth and form-heavy screens.
- Use `KeyboardAvoidingView` and `ScrollView` for forms that may be hidden by the keyboard.

## 10. Mobile UX Rules

- Use pull-to-refresh on list screens that fetch data.
- Provide empty, loading, error, and offline-ish states for data screens.
- Touchable targets should be comfortable for mobile. Avoid tiny press areas.
- Use bottom tab badges for unread notification counts when supported.
- Do not overcrowd a card. Put secondary actions in a bottom sheet.
- Keep primary actions close to the thumb area where possible.
- Do not use browser-only APIs such as `localStorage`, `window`, or DOM events.

## 11. Notifications And Push Rules

- Device tokens must be registered through `POST /api/notifications/devices/`.
- Device tokens must be deactivated through `POST /api/notifications/devices/deactivate/`.
- Use `expo-notifications` and/or `@react-native-firebase/messaging` according to the configured build approach.
- Ask OS notification permission before registering a token.
- Keep push registration failure non-blocking. A user should still be able to use schedules and reports if push setup fails.
- In-app notification read state must use:
  - `GET /api/notifications/inbox/`
  - `GET /api/notifications/inbox/unread-count/`
  - `POST /api/notifications/inbox/{id}/read/`
  - `POST /api/notifications/inbox/mark-all-read/`

## 12. Schedule And Reporting Rules

- Mobile schedule screens should read from `GET /api/scheduling/sessions/`.
- Mobile should not create or edit timetable entries in V1. Admin schedule creation belongs to the web dashboard.
- Class rep reports attach to `LectureSession` IDs, not parent `TimetableEntry` IDs.
- Report submission must call `POST /api/reporting/reports/`.
- Lecturer responses must call `POST /api/reporting/reports/{id}/respond/`.
- The reporting window must be enforced by the backend. The app may show countdowns or disabled states, but it must still handle backend rejection.

## 13. Dummy Data Rules

- Dummy data is allowed only for isolated UI scaffolding before API wiring.
- Store dummy data in a clearly named constants/mock file.
- Do not mix dummy data with live API data in the same screen without a visible TODO and a clear removal path.
- Once an API endpoint is wired, remove fallback dummy data unless the developer explicitly asks for demo mode.

## 14. Quality Checks

- Run `yarn lint` from `TimeMap_mobile/app` when code changes are made and dependencies are available.
- For TypeScript-heavy changes, run the project's TypeScript check if a script exists. If no script exists, say so in the final response.
- Manually inspect Android and iOS layout assumptions when touching safe area, keyboard, or bottom sheet behavior.
- Do not leave console logs in production flows except temporary debugging explicitly requested by the developer.

Thanks PAL.
