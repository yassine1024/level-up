# Figma screen status — Level-Up

Source of truth: Figma file `Level-Up` (`RCBBarEPLzzrBuDp6PHN6m`), Page 1.

## Converted to exact Figma design (rebuilt to match)

- Welcome page → `frontend/src/app/welcome.tsx`
- Log in → `frontend/src/app/login.tsx`
- Sign up → `frontend/src/app/signup.tsx`
- Choose your role → `frontend/src/app/role.tsx`
- Student - Home → `frontend/src/app/home.tsx`
- Courses (with language selector) → `frontend/src/app/course.tsx`
- 03 · Practice home → `frontend/src/app/practice/index.tsx`
- Placement test - intro → `frontend/src/app/placement.tsx` (intro view)
- Unit completed → `frontend/src/app/lesson/complete.tsx`
- Profile & settings - Student → `frontend/src/app/(tabs)/profile.tsx`
- Teacher - Students list → `frontend/src/app/teacher/students.tsx`

## Implemented (functional, theme aligned; not yet pixel-perfect)

- Splash - session check → `frontend/src/app/splash.tsx` (converted)
- Email verification (+ correct/wrong states) → `frontend/src/app/verify-email.tsx`
- Forgot password → `frontend/src/app/forgot-password.tsx`
- Reset password → `frontend/src/app/reset-password.tsx`
- Session expired → `frontend/src/app/session-expired.tsx`
- Terms of Service → `frontend/src/app/legal/terms.tsx`
- Privacy Policy → `frontend/src/app/legal/privacy.tsx`
- Delete account - confirmation → `frontend/src/app/profile/delete-account.tsx`
- Profile & settings - Teacher → `frontend/src/app/teacher/profile.tsx`
- Teacher - Course resources → `frontend/src/app/teacher/resources.tsx`
- Teacher - Edit resource → `frontend/src/app/teacher/edit-resource.tsx`
- Teacher - Resources list (toggle) → `frontend/src/app/teacher/resources.tsx`
- Teacher - Saved confirmation → `frontend/src/app/teacher/saved.tsx`
- 01 · Choose your character → `frontend/src/app/practice/roleplay.tsx`
- 02 · Character settings → `frontend/src/app/practice/character-settings.tsx`
- 04 · Choose how to practice → `frontend/src/app/practice/games.tsx`
- 05 · Main chat / 06 · Voice / 07 · MC / 08 · Typing / 09 · Correction → `frontend/src/app/practice/character.tsx`
- 10 · Session summary → `frontend/src/app/practice/character.tsx` (summary phase)
- Error - Character chat timeout → `frontend/src/app/practice/character.tsx` (error phase)
- Slide viewer - vocabulary / grammar / vocabulary 2 → `frontend/src/app/lesson/slides.tsx` + `SlideViewer.tsx`
- Loading slides course → `frontend/src/app/lesson/loading.tsx`
- Placement test - loading → `frontend/src/app/placement.tsx`
- Retake placement test → `frontend/src/app/placement.tsx` (mode=retake)
- Your level - result → `frontend/src/app/placement.tsx`
- Empty - Lesson not uploaded → `frontend/src/app/lesson/slides.tsx` (empty param) + `EmptyState`
- Error - Slide generation failed → `frontend/src/app/lesson/loading.tsx`
- Error - No internet → `frontend/components/OfflineBanner.tsx`
- Error - Server error → Expo Router `ErrorBoundary`
- Upload error - Wrong file type / File too large / Text extraction failed → `frontend/components/UploadField.tsx` + `teacher/resources.tsx`
- Game list → `frontend/src/app/practice/games.tsx`
- Practice flow (quiz, fill-blank, result, writing, listening, mistakes) → `frontend/src/app/practice/*`

## Out of scope (per plan)

- Community (proposal) → not implemented

## Shared infra (Phase 0)

- `frontend/components/EmptyState.tsx`
- `frontend/components/ErrorState.tsx`
- `frontend/components/ErrorScreen.tsx`
- `frontend/components/AuthLayout.tsx`
- `frontend/components/LegalScreen.tsx`
- `frontend/components/OfflineBanner.tsx`
- `frontend/components/StudentBottomNav.tsx` (4 tabs)
