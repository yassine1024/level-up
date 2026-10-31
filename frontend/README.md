# Frontend

React Native (Expo) mobile application for the project.

## Backend URL for builds
Set `EXPO_PUBLIC_API_URL` (must be https, no trailing slash) and `EXPO_PUBLIC_API_MODE=live` in the EAS build profile or EAS environment variables, because `.env` is gitignored.

## Build commands
- Preview APK: `npx eas-cli build --profile preview --platform android`
- Production AAB: `npx eas-cli build --profile production --platform android`

## Cold start test
Open `https://YOUR-BACKEND.onrender.com/api/health` in the phone browser; first launch after sleep should show "Waking up the server, please wait..." then load.
