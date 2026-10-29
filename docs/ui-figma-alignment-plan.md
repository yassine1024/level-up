# UI Alignment Plan — Level-Up vs Figma (`Level-Up` file)

**Source of truth (Figma):** https://www.figma.com/design/RCBBarEPLzzrBuDp6PHN6m/Level-Up?node-id=0-1&t=e7PqKKlE7nV0D0Fo-0
**Figma file key:** `RCBBarEPLzzrBuDp6PHN6m` (node `0:1`, Page 1)
**Codebase:** `frontend/` (Expo Router, `src/app/`).
**Scope:** Modify existing screens to match Figma exactly + add all missing screens. No implementation in this document — planning only.

## 1. Summary of gaps

- Figma screens: ~60 (top-level frames).
- Already implemented (≈30): onboarding, teacher course resources/saved, placement (intro/question/loading/result), student home/course, lesson slides/grammar/complete, practice home/games/quiz/fill-blank/result, character chat (intro/chat/voice/MC/typing/correction), roleplay character picker, basic profile.
- **Missing (26)** + **partial (2)** + **duplicates (5, ignore)**.

## 2. Guiding principles

1. One route file per Figma screen where the flow is distinct; merge only when Figma shows a single screen with internal states (already done for `placement`, `character`).
2. Reuse existing components (`Button`, `Input`, `Chip`, `StudentBottomNav`, `BackButton`, etc.) and theme tokens (`Colors`, `Fonts`, `Radii` from `constants/theme.ts`).
3. Every new screen must be wired to existing backend endpoints where available (`studentApi`, `teacherApi`); otherwise mark as "needs backend" and stub with mock data.
4. Match Figma pixel layout: 375×812 canvas, status bar (44), home indicator (20), bottom nav (76) where present.
5. Run `npx tsc --noEmit` and `npx expo lint` after each batch; keep changes focused per PR.

## 3. Phase 0 — Baseline & infra (no UI)

- [x] Confirm Expo SDK version and router setup (`frontend/package.json`). (Expo SDK ~58.0.0, Expo Router ~58.0.26)
- [x] Add a shared `ErrorState` / `EmptyState` component pair (used by many missing screens) in `components/`. (`frontend/components/EmptyState.tsx`, `frontend/components/ErrorState.tsx`)
- [x] Add shared `AuthLayout` for forgot/reset/session-expired (reuse onboarding styling). (`frontend/components/AuthLayout.tsx`)
- [x] Add `LegalScreen` template (ToS, Privacy) driven by props. (`frontend/components/LegalScreen.tsx`)
- [x] Register new routes in `app/_layout.tsx` Stack (gestureEnabled flags where needed).

## 4. Phase 1 — Auth & account (highest user-facing gap)

| # | Figma screen | New route | Notes |
|---|---|---|---|
| 1 | Splash - session check | `app/splash.tsx` (or keep redirect but add splash UI) | Replace `index.tsx` redirect with a real splash that checks session then routes. |
| 2 | Email verification | `app/verify-email.tsx` | OTP/code entry; resend link; success/failure. |
| 3 | Email verification correct | (state inside `verify-email.tsx`) | Success view. |
| 4 | Email verification wrong | (state inside `verify-email.tsx`) | Error view with retry. |
| 5 | Forgot password | `app/forgot-password.tsx` | Email input → request reset. |
| 6 | Reset password | `app/reset-password.tsx` | New password + confirm; token from deep link. |
| 7 | Session expired | `app/session-expired.tsx` | Modal-style; re-login CTA. |
| 8 | Terms of Service | `app/legal/terms.tsx` | Use `LegalScreen` template. |
| 9 | Privacy Policy | `app/legal/privacy.tsx` | Use `LegalScreen` template. |
| 10 | Delete account - confirmation | `app/profile/delete-account.tsx` | Confirmation dialog + type-to-confirm. |
| 11 | Profile & settings - Student | extend `(tabs)/profile.tsx` | Add settings rows (notifications, sound, speed, etc.) per Figma. |
| 12 | Profile & settings - Teacher | `app/teacher/profile.tsx` | Teacher-specific settings. |

**Backend needs:** password reset endpoints, email verification endpoints, delete account endpoint (check `docs/api-contract.md`).

## 5. Phase 2 — Teacher management

| # | Figma screen | New route | Notes |
|---|---|---|---|
| 13 | Teacher - Students list | `app/teacher/students.tsx` | List of students per course; tap → detail (maybe inline). |
| 14 | Teacher - Edit resource | `app/teacher/edit-resource.tsx` | Edit an uploaded resource (title, file). Params: `resourceId`. |
| 15 | Teacher - Resources list | (merge into `teacher/resources.tsx`) | Add list view toggle if Figma shows separate list. |

## 6. Phase 3 — Character flow completion

| # | Figma screen | Change | Notes |
|---|---|---|---|
| 16 | 02 · Character settings | add phase/section in `practice/character.tsx` OR new `app/practice/character-settings.tsx` | Settings: voice, speed, difficulty, companion name edit. |
| 17 | 10 · Session summary | add phase `"summary"` to `practice/character.tsx` | Recap: expressions learned, mistakes, progress bar, "Continue" CTA. |
| 18 | Error - Character chat timeout | empty/error state in `practice/character.tsx` | Retry CTA. |

## 7. Phase 4 — Course / slides / practice variants

| # | Figma screen | Change | Notes |
|---|---|---|---|
| 19 | Slide viewer - vocabulary 2 | (variant of `lesson/slides.tsx`) | Second layout/state; add `variant` param or separate route. |
| 20 | Retake placement test | (variant of `placement.tsx`) | Add `mode=retake` param; skip intro, show results diff. |
| 21 | Empty - Lesson not uploaded | empty state in `lesson/slides.tsx` / `teacher/resources` | Reuse `EmptyState`. |

## 8. Phase 5 — Error & upload error states

Create a reusable `ErrorScreen` component + routes (or inline states). Figma shows full-screen error states:

| # | Figma screen | Route / location |
|---|---|---|
| 22 | Error - Slide generation failed | `lesson/loading.tsx` error state |
| 23 | Error - No internet | global (maybe `components/OfflineBanner` + screen) |
| 24 | Error - Server error | global error boundary |
| 25 | Upload error - Wrong file type | `teacher/resources.tsx` upload flow |
| 26 | Upload error - File too large | `teacher/resources.tsx` upload flow |
| 27 | Upload error - Text extraction failed | `teacher/resources.tsx` upload flow |

## 9. Phase 6 — Polish existing screens to match Figma exactly

For each existing screen, compare layout to Figma and fix:
- spacing, typography (Fredoka/Nunito weights), colors, radii
- status bar (44) / home indicator (20) insets
- bottom nav (76) presence/absence
- empty/loading states
- iconography (Ionicons vs Figma glyphs)
- animation (button press, transitions)

Checklist by screen:
- [x] `welcome`, `signup`, `login`, `role`
- [x] `home`, `course`
- [x] `lesson/loading`, `lesson/slides`, `lesson/grammar`, `lesson/complete`
- [x] `practice/index`, `practice/games`, `practice/quiz`, `practice/fill-blank`, `practice/result`
- [x] `practice/writing`, `practice/listening`, `practice/mistakes`
- [x] `practice/character`, `practice/roleplay`
- [x] `placement`
- [x] `teacher/index`, `teacher/resources`, `teacher/saved`
- [x] `(tabs)/profile`, `(tabs)/index`

## 10. Phase 7 — Navigation wiring

- [ ] Add all new routes to `app/_layout.tsx` Stack with `headerShown: false` and `gestureEnabled: false` where Figma shows no back swipe.
- [ ] Add deep links for reset password / email verification (Expo Router linking config in `app.json`).
- [ ] Update `StudentBottomNav` if Figma shows different tabs.
- [ ] Add navigation from profile → settings, delete account, legal pages.
- [ ] Add navigation from teacher resources → edit resource, students list.

## 11. Verification

- [ ] `npx tsc --noEmit` passes.
- [ ] `npx expo lint` passes.
- [ ] Manual smoke test on iOS simulator (argent) for each new screen.
- [ ] Side-by-side screenshot comparison against Figma for each modified screen.
- [ ] Update `docs/api-contract.md` if new endpoints are required.

## 12. Suggested PR breakdown (one PR per phase)

1. PR1: Phase 0 (shared components) + Phase 1 (auth/account) — largest, user-facing.
2. PR2: Phase 2 (teacher management).
3. PR3: Phase 3 (character flow completion).
4. PR4: Phase 4 + 5 (course/practice variants + error states).
5. PR5: Phase 6 (polish) — can be split per screen group.
6. PR6: Phase 7 (navigation wiring) + verification.

## 13. Open questions

- Does `02 · Character settings` need a dedicated route or can it be a modal/sheet inside `practice/character`?
- Should `Email verification` screens be part of signup flow or a standalone route?
- Is `Community (proposal)` in scope for MVP?
- Backend availability for password reset / email verification / delete account — confirm with backend team before Phase 1.

---

*Generated from Figma file `Level-Up` (`RCBBarEPLzzrBuDp6PHN6m`). Re-run the Figma diff after any design update to keep this plan current.*
