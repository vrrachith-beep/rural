# Rural Resilience Hub

A hackathon-ready rural support dashboard with a dark UI, live GPS tracking, emergency discovery, farming guidance, Firebase-backed report submission, and a Gemini chatbot.

## What is included

- Live GPS tracking with browser geolocation
- Google Maps + Places lookup for law and health support
- Firebase Functions backend for `/api/report` and `/api/chat`
- Firestore storage for submitted community complaints and chat session logs
- Soil-specific farming advice and irrigation video suggestions
- Dark, more polished mobile-friendly UI

## Fast prototype setup

1. Put your browser-safe keys in [config.js](/abs/c:/Users/rachith.LAPTOP-LO30R5P3/Desktop/rural/config.js:1)

```js
window.APP_CONFIG = {
  googleMapsApiKey: "YOUR_GOOGLE_MAPS_KEY",
  youtubeApiKey: "YOUR_YOUTUBE_KEY",
  apiBaseUrl: "/api"
};
```

2. Put your Gemini API key directly in [functions/index.js](/abs/c:/Users/rachith.LAPTOP-LO30R5P3/Desktop/rural/functions/index.js:8)

```js
const GEMINI_API_KEY = "PASTE_GEMINI_API_KEY_HERE";
```

3. Install backend dependencies

```powershell
cd functions
npm install
```

4. From the project root, connect Firebase and deploy

```powershell
firebase login
firebase use --add
firebase deploy
```

## GitHub frontend hosting

- The frontend is ready for GitHub Pages via [.github/workflows/pages.yml](/abs/c:/Users/rachith.LAPTOP-LO30R5P3/Desktop/rural/.github/workflows/pages.yml:1)
- Push this repo to a GitHub repository named `rural`
- In GitHub repo settings, enable Pages with `GitHub Actions` as the source
- Keep Firebase for the backend API and Firestore

If you host the frontend on GitHub Pages, set `apiBaseUrl` in [config.js](/abs/c:/Users/rachith.LAPTOP-LO30R5P3/Desktop/rural/config.js:1) to your deployed Firebase function URL instead of `/api`

## Firebase pieces

- [firebase.json](/abs/c:/Users/rachith.LAPTOP-LO30R5P3/Desktop/rural/firebase.json:1) configures Hosting and rewrites `/api/**` to the Firebase Function
- [functions/index.js](/abs/c:/Users/rachith.LAPTOP-LO30R5P3/Desktop/rural/functions/index.js:1) handles chat and report endpoints
- [firestore.rules](/abs/c:/Users/rachith.LAPTOP-LO30R5P3/Desktop/rural/firestore.rules:1) locks Firestore down so only backend code writes data

## Notes

- For hackathon speed, this prototype uses hardcoded placeholders in code.
- For geolocation testing, use Firebase Hosting or another HTTPS origin rather than opening the file directly from disk.
- If Google APIs are missing, the UI falls back to local emergency demo cards.
