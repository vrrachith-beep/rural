const config = window.APP_CONFIG || {};

const GEMINI_API_KEY = config.geminiApiKey || "";
const API_BASE_URL = config.apiBaseUrl || "/api";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
  map: null,
  markers: [],
  userMarker: null,
  watchId: null,
  userLocation: null,
  lastPlacesLookupLocation: null,
  activeSoil: "",
  language: "en",
  lastAssistantReply: "",
  recognition: null,
  isListening: false
};

const translations = {
  en: {
    eyebrow: "Rural support system",
    brandTitle: "Rural Resilience Hub",
    heroCopy: "Real-time GPS support, community reporting, soil guidance, and a built-in AI helper for day-to-day questions.",
    refreshGps: "Refresh GPS",
    liveSupportMap: "Live support map",
    nearbyLawHealth: "Nearby law and health access",
    waitingGps: "Waiting for live GPS permission...",
    mapFallback: "Map uses GPS with OpenStreetMap. Allow location access to see nearby help.",
    mode: "Mode",
    smartTracking: "Smart tracking",
    movementRefresh: "Movement refresh",
    movementThreshold: "250m threshold",
    fallback: "Fallback",
    localEmergencyCards: "Local emergency cards",
    aiAssistant: "AI assistant",
    fieldCompanion: "Field companion",
    chatSubtitle: "Ask about crops, emergencies, reports, or what help is nearby.",
    askAssistant: "Ask the assistant",
    chatPlaceholder: "Example: I am on black soil and nearby water is low, what should I plant?",
    chatStatusReady: "Chatbot uses Gemini directly and the map uses GPS with OpenStreetMap.",
    mic: "Mic",
    speakReply: "Speak reply",
    send: "Send",
    quickActions: "Quick actions",
    fileReport: "File report",
    openFarmGuide: "Open farm guide",
    askAboutArea: "Ask about my area",
    emergencyChecklist: "Emergency checklist",
    safety: "Safety",
    lawRescue: "Law & rescue access",
    care: "Care",
    healthFacilities: "Health facilities",
    communityAccountability: "Community accountability",
    submitRealReport: "Submit a real report",
    reportsToFirestore: "Reports go to Firestore through a Firebase backend function.",
    issueType: "Issue type",
    villageLandmark: "Village / landmark",
    details: "Details",
    issuePlaceholder: "Main road near bus stand",
    detailsPlaceholder: "Describe the issue, urgency, and who is affected.",
    liveGpsAttached: "Live GPS is attached when available.",
    submitReport: "Submit report",
    farmingIntelligence: "Farming intelligence",
    soilBasedGuidance: "Soil-based guidance",
    soilType: "Soil type",
    soilRecommendations: "Soil recommendations will appear here.",
    learningLayer: "Learning layer",
    recommendedVideos: "Recommended irrigation videos",
    youtubeHint: "Uses keyless embedded recommendations and search shortcuts.",
    online: "Online",
    offlineMode: "Offline mode",
    fallbackContacts: "Fallback contacts",
    liveGpsMode: "Live GPS",
    assistantGreeting: "I can help with farming decisions, emergency preparedness, local support guidance, and using the reporting tool.",
    thinking: "Thinking...",
    assistantReady: "Assistant is ready.",
    assistantError: "Assistant hit an error.",
    listening: "Listening...",
    speechUnavailable: "Voice input is not supported in this browser.",
    noReplyToSpeak: "No assistant reply is available to speak yet.",
    speaking: "Speaking reply...",
    voiceReady: "Voice reply finished.",
    voiceError: "Voice playback failed.",
    reportSubmitting: "Submitting report...",
    reportSaved: "Report saved to Firebase successfully.",
    reportValidation: "Please add both a location and issue details.",
    reportFailed: "Report submission failed.",
    loadingVideos: "Loading irrigation tutorials...",
    videoUnavailable: "Video preview unavailable.",
    openYoutube: "Open YouTube",
    soilDefault: "Soil recommendations will appear here.",
    locationPromptWithGps: "Based on my live location ({lat}, {lng}), what help should I check first nearby?",
    locationPromptNoGps: "How should I use this app to find nearby police, legal aid, and health support?",
    emergencyPrompt: "Give me a short emergency checklist for a rural family facing a sudden medical or safety issue."
  },
  kn: {
    eyebrow: "ಗ್ರಾಮೀಣ ಸಹಾಯ ವ್ಯವಸ್ಥೆ",
    brandTitle: "ರೂರಲ್ ರೆಸಿಲಿಯನ್ಸ್ ಹಬ್",
    heroCopy: "ರಿಯಲ್-ಟೈಮ್ ಜಿಪಿಎಸ್ ಸಹಾಯ, ಸಮುದಾಯ ದೂರುಗಳು, ಮಣ್ಣಿನ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ದಿನನಿತ್ಯದ ಪ್ರಶ್ನೆಗಳಿಗೆ AI ಸಹಾಯಕ.",
    refreshGps: "GPS ನವೀಕರಿಸಿ",
    liveSupportMap: "ಲೈವ್ ಸಹಾಯ ನಕ್ಷೆ",
    nearbyLawHealth: "ಹತ್ತಿರದ ಕಾನೂನು ಮತ್ತು ಆರೋಗ್ಯ ಸಹಾಯ",
    waitingGps: "ಲೈವ್ GPS ಅನುಮತಿಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...",
    mapFallback: "ನಕ್ಷೆ GPS ಮತ್ತು OpenStreetMap ಬಳಸುತ್ತದೆ. ಹತ್ತಿರದ ಸಹಾಯ ನೋಡಲು ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ.",
    mode: "ಮೋಡ್",
    smartTracking: "ಸ್ಮಾರ್ಟ್ ಟ್ರ್ಯಾಕಿಂಗ್",
    movementRefresh: "ಚಲನೆಯ ನವೀಕರಣ",
    movementThreshold: "250 ಮೀ ಮಿತಿ",
    fallback: "ಪರ್ಯಾಯ",
    localEmergencyCards: "ಸ್ಥಳೀಯ ತುರ್ತು ಕಾರ್ಡ್‌ಗಳು",
    aiAssistant: "AI ಸಹಾಯಕ",
    fieldCompanion: "ಕ್ಷೇತ್ರ ಸಹಾಯಕ",
    chatSubtitle: "ಬೆಳೆಗಳು, ತುರ್ತು ಪರಿಸ್ಥಿತಿ, ದೂರುಗಳು ಅಥವಾ ಹತ್ತಿರದ ಸಹಾಯ ಬಗ್ಗೆ ಕೇಳಿ.",
    askAssistant: "ಸಹಾಯಕನನ್ನು ಕೇಳಿ",
    chatPlaceholder: "ಉದಾಹರಣೆ: ನಾನು ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಇದ್ದೇನೆ ಮತ್ತು ನೀರು ಕಡಿಮೆ ಇದೆ, ಯಾವ ಬೆಳೆ ಬೆಳೆಸಲಿ?",
    chatStatusReady: "ಚಾಟ್‌ಬಾಟ್ Gemini ನ್ನೇ ನೇರವಾಗಿ ಬಳಸುತ್ತದೆ ಮತ್ತು ನಕ್ಷೆ GPS ಜೊತೆಗೆ OpenStreetMap ಬಳಸುತ್ತದೆ.",
    mic: "ಮೈಕ್",
    speakReply: "ಉತ್ತರವನ್ನು ಕೇಳಿ",
    send: "ಕಳುಹಿಸಿ",
    quickActions: "ತ್ವರಿತ ಕ್ರಮಗಳು",
    fileReport: "ದೂರು ಸಲ್ಲಿಸಿ",
    openFarmGuide: "ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ ತೆರೆಯಿರಿ",
    askAboutArea: "ನನ್ನ ಪ್ರದೇಶದ ಬಗ್ಗೆ ಕೇಳಿ",
    emergencyChecklist: "ತುರ್ತು ಪರಿಶೀಲನಾ ಪಟ್ಟಿ",
    safety: "ಭದ್ರತೆ",
    lawRescue: "ಕಾನೂನು ಮತ್ತು ರಕ್ಷಣಾ ಸಹಾಯ",
    care: "ಆರೈಕೆ",
    healthFacilities: "ಆರೋಗ್ಯ ಕೇಂದ್ರಗಳು",
    communityAccountability: "ಸಮುದಾಯ ಜವಾಬ್ದಾರಿ",
    submitRealReport: "ನಿಜವಾದ ದೂರು ಸಲ್ಲಿಸಿ",
    reportsToFirestore: "ದೂರುಗಳು Firebase ಬ್ಯಾಕೆಂಡ್ ಮೂಲಕ Firestore ಗೆ ಹೋಗುತ್ತವೆ.",
    issueType: "ಸಮಸ್ಯೆಯ ವಿಧ",
    villageLandmark: "ಗ್ರಾಮ / ಗುರುತು ಸ್ಥಳ",
    details: "ವಿವರಗಳು",
    issuePlaceholder: "ಬಸ್ ನಿಲ್ದಾಣದ ಹತ್ತಿರ ಮುಖ್ಯ ರಸ್ತೆ",
    detailsPlaceholder: "ಸಮಸ್ಯೆ, ತುರ್ತುಸ್ಥಿತಿ ಮತ್ತು ಯಾರು ಪ್ರಭಾವಿತರಾಗಿದ್ದಾರೆ ಎಂಬುದನ್ನು ವಿವರಿಸಿ.",
    liveGpsAttached: "ಲಭ್ಯವಿದ್ದರೆ ಲೈವ್ GPS ಸೇರಿಸಲಾಗುತ್ತದೆ.",
    submitReport: "ದೂರು ಸಲ್ಲಿಸಿ",
    farmingIntelligence: "ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ",
    soilBasedGuidance: "ಮಣ್ಣಿನ ಆಧಾರಿತ ಸಲಹೆ",
    soilType: "ಮಣ್ಣಿನ ವಿಧ",
    soilRecommendations: "ಮಣ್ಣಿನ ಶಿಫಾರಸುಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    learningLayer: "ಅಭ್ಯಾಸ ವಿಭಾಗ",
    recommendedVideos: "ಶಿಫಾರಸಾದ ನೀರಾವರಿ ವಿಡಿಯೋಗಳು",
    youtubeHint: "ಕೀ ಇಲ್ಲದೆ ಆಯ್ದ ವಿಡಿಯೋ ಶಿಫಾರಸುಗಳು ಮತ್ತು ಹುಡುಕಾಟ ಲಿಂಕ್‌ಗಳನ್ನು ಬಳಸುತ್ತದೆ.",
    online: "ಆನ್‌ಲೈನ್",
    offlineMode: "ಆಫ್‌ಲೈನ್ ಮೋಡ್",
    fallbackContacts: "ಪರ್ಯಾಯ ಸಂಪರ್ಕಗಳು",
    liveGpsMode: "ಲೈವ್ GPS",
    assistantGreeting: "ನಾನು ಕೃಷಿ ನಿರ್ಧಾರಗಳು, ತುರ್ತು ಸಿದ್ಧತೆ, ಸ್ಥಳೀಯ ಸಹಾಯ ಮತ್ತು ದೂರು ಸಲ್ಲಿಸುವ ವಿಧಾನದಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಹುದು.",
    thinking: "ಯೋಚಿಸುತ್ತಿದೆ...",
    assistantReady: "ಸಹಾಯಕ ಸಿದ್ಧವಾಗಿದೆ.",
    assistantError: "ಸಹಾಯಕನಲ್ಲಿ ದೋಷ ಉಂಟಾಗಿದೆ.",
    listening: "ಕೇಳುತ್ತಿದೆ...",
    speechUnavailable: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಬೆಂಬಲಿತವಿಲ್ಲ.",
    noReplyToSpeak: "ಈಗ ಕೇಳಿಸಲು ಸಹಾಯಕ ಉತ್ತರ ಲಭ್ಯವಿಲ್ಲ.",
    speaking: "ಉತ್ತರವನ್ನು ಓದುತ್ತಿದೆ...",
    voiceReady: "ಧ್ವನಿ ಉತ್ತರ ಮುಗಿದಿದೆ.",
    voiceError: "ಧ್ವನಿ ಪ್ಲೇಬ್ಯಾಕ್ ವಿಫಲವಾಗಿದೆ.",
    reportSubmitting: "ದೂರು ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...",
    reportSaved: "ದೂರು Firebase ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    reportValidation: "ದಯವಿಟ್ಟು ಸ್ಥಳ ಮತ್ತು ಸಮಸ್ಯೆಯ ವಿವರ ಎರಡನ್ನೂ ಸೇರಿಸಿ.",
    reportFailed: "ದೂರು ಸಲ್ಲಿಕೆ ವಿಫಲವಾಗಿದೆ.",
    loadingVideos: "ನೀರಾವರಿ ವಿಡಿಯೋಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    videoUnavailable: "ವಿಡಿಯೋ ಪೂರ್ವದೃಶ್ಯ ಲಭ್ಯವಿಲ್ಲ.",
    openYoutube: "YouTube ತೆರೆಯಿರಿ",
    soilDefault: "ಮಣ್ಣಿನ ಶಿಫಾರಸುಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    locationPromptWithGps: "ನನ್ನ ಲೈವ್ ಸ್ಥಳ ({lat}, {lng}) ಆಧರಿಸಿ, ಹತ್ತಿರದಲ್ಲಿ ನಾನು ಮೊದಲು ಯಾವ ಸಹಾಯವನ್ನು ನೋಡಬೇಕು?",
    locationPromptNoGps: "ಹತ್ತಿರದ ಪೊಲೀಸ್, ಕಾನೂನು ಸಹಾಯ ಮತ್ತು ಆರೋಗ್ಯ ಸಹಾಯ ಹುಡುಕಲು ಈ ಅಪ್ ಅನ್ನು ಹೇಗೆ ಬಳಸಬೇಕು?",
    emergencyPrompt: "ಹಠಾತ್ ವೈದ್ಯಕೀಯ ಅಥವಾ ಭದ್ರತಾ ಸಮಸ್ಯೆ ಎದುರಿಸುತ್ತಿರುವ ಗ್ರಾಮೀಣ ಕುಟುಂಬಕ್ಕೆ ಚಿಕ್ಕ ತುರ್ತು ಪರಿಶೀಲನಾ ಪಟ್ಟಿಯನ್ನು ಕೊಡಿ."
  }
};

const soilRules = {
  Red: {
    fertilizer: "Urea + Potash",
    crops: "Ragi / Groundnut",
    water: "Use short, frequent irrigation bursts to avoid runoff."
  },
  Black: {
    fertilizer: "DAP + Zinc",
    crops: "Cotton / Soybean",
    water: "Deep irrigation in wider intervals works well because black soil holds moisture."
  },
  Loamy: {
    fertilizer: "NPK 19-19-19",
    crops: "Vegetables / Fruit",
    water: "Balanced drip or furrow irrigation usually performs best."
  },
  Sandy: {
    fertilizer: "Compost + NPK support",
    crops: "Millet / Watermelon",
    water: "Use mulching and frequent light irrigation because sandy soil drains fast."
  }
};

const localEmergencyContacts = {
  features: [
    { category: "Police Station", name: "Demo Rural Police Outpost", phone: "100", distance: "1.2 km", location: { lat: 12.9716, lng: 77.5946 } },
    { category: "District Court", name: "Demo District Legal Aid Desk", phone: "15100", distance: "3.8 km", location: { lat: 12.9816, lng: 77.6046 } },
    { category: "Government Hospital", name: "Demo Government Hospital", phone: "108", distance: "2.4 km", location: { lat: 12.9616, lng: 77.5846 } },
    { category: "Medical Diagnostic Center", name: "Demo Diagnostic Center", phone: "104", distance: "4.1 km", location: { lat: 12.9516, lng: 77.5746 } }
  ]
};

const nearbySearches = [
  { category: "Police Station", query: "[amenity=police]" },
  { category: "District Court", query: "[amenity=courthouse]" },
  { category: "Government Hospital", query: "[amenity=hospital]" },
  { category: "Medical Diagnostic Center", query: "[amenity=clinic]" }
];

const sharedVideo = {
  title: "Irrigation support video",
  id: "dzQF9gfFBQI",
  url: "https://youtu.be/dzQF9gfFBQI?si=mziueBrHtdHXKu6k"
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function t(key) {
  return translations[state.language]?.[key] || translations.en[key] || key;
}

function setIndicator(mode, message) {
  const indicator = document.getElementById("offlineIndicator");
  indicator.textContent = mode;
  indicator.style.color = mode === t("offlineMode") ? "#ffb4b4" : "#b4ffd2";
  indicator.style.borderColor = mode === t("offlineMode") ? "rgba(255, 107, 107, 0.3)" : "rgba(125, 252, 192, 0.3)";
  document.getElementById("locationText").textContent = message;
}

function setTrackingMode(text) {
  document.getElementById("trackingMode").textContent = text;
}

function addChatMessage(role, text) {
  const stream = document.getElementById("chatMessages");
  const bubble = document.createElement("article");
  bubble.className = `chat-bubble ${role === "user" ? "chat-bubble-user" : ""}`;
  bubble.innerHTML = `<strong>${role === "user" ? "You" : "Assistant"}</strong><div>${escapeHtml(text).replaceAll("\n", "<br>")}</div>`;
  stream.appendChild(bubble);
  stream.scrollTop = stream.scrollHeight;
}

function setMicButtonState() {
  const micBtn = document.getElementById("micBtn");
  if (micBtn) {
    micBtn.textContent = state.isListening ? `${t("mic")}...` : t("mic");
  }
}

function setChatStatus(message) {
  document.getElementById("chatStatus").textContent = message;
}

function setReportStatus(message, isError = false) {
  const node = document.getElementById("reportStatus");
  node.textContent = message;
  node.style.color = isError ? "#ffb4b4" : "#b4ffd2";
}

function distanceKm(from, to) {
  const earthKm = 6371;
  const dLat = degreesToRadians(to.lat - from.lat);
  const dLng = degreesToRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(from.lat)) * Math.cos(degreesToRadians(to.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function degreesToRadians(value) {
  return value * Math.PI / 180;
}

function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function cardTemplate(place) {
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
  const tel = place.phone ? `tel:${place.phone}` : "tel:108";
  return `
    <article class="service-card">
      <p class="panel-kicker">${escapeHtml(place.category)}</p>
      <h3>${escapeHtml(place.name)}</h3>
      <p class="service-meta">${escapeHtml(place.distanceText)}</p>
      <div class="service-actions">
        <a class="pill-action" href="${tel}">Call</a>
        <a class="pill-action pill-action-accent" href="${navUrl}" target="_blank" rel="noopener">Navigate</a>
      </div>
    </article>
  `;
}

function renderServiceCards(places) {
  const law = places.filter((place) => place.category.includes("Police") || place.category.includes("Court"));
  const health = places.filter((place) => place.category.includes("Hospital") || place.category.includes("Diagnostic"));
  document.getElementById("lawCards").innerHTML = law.map(cardTemplate).join("");
  document.getElementById("healthCards").innerHTML = health.map(cardTemplate).join("");

  if (state.map && window.L) {
    state.markers.forEach((marker) => marker.remove());
    state.markers = places.map((place) =>
      window.L.marker([place.location.lat, place.location.lng]).addTo(state.map).bindPopup(escapeHtml(place.name))
    );
  }
}

function manualOverride(reason) {
  setIndicator(t("offlineMode"), reason || "Using local emergency contacts.");
  setTrackingMode(t("fallbackContacts"));
  renderServiceCards(localEmergencyContacts.features);
}

function initMap() {
  if (!window.L) {
    manualOverride("Map library unavailable. Showing local emergency cards.");
    return;
  }

  const defaultCenter = [20.5937, 78.9629];
  state.map = window.L.map("map", { zoomControl: true }).setView(defaultCenter, 5);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(state.map);

  setTrackingMode(t("liveGpsMode"));
  startLocationTracking();
}

function startLocationTracking() {
  if (!navigator.geolocation) {
    manualOverride("Geolocation unsupported. Showing local emergency cards.");
    return;
  }

  if (state.watchId !== null) {
    navigator.geolocation.clearWatch(state.watchId);
  }

  state.watchId = navigator.geolocation.watchPosition(
    (position) => updateUserLocation(position),
    (error) => {
      const reason = error?.code === 1
        ? "Location permission blocked. Showing local emergency cards."
        : "Location unavailable. Showing local emergency cards.";
      manualOverride(reason);
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
  );
}

function updateUserLocation(position) {
  const nextLocation = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };

  const shouldRefreshPlaces =
    !state.lastPlacesLookupLocation ||
    distanceKm(state.lastPlacesLookupLocation, nextLocation) >= 0.25;

  state.userLocation = nextLocation;
  setIndicator(t("online"), `Live GPS: ${nextLocation.lat.toFixed(5)}, ${nextLocation.lng.toFixed(5)}`);

  if (state.map) {
    state.map.setView([nextLocation.lat, nextLocation.lng], 14);
    if (!state.userMarker) {
      state.userMarker = window.L.marker([nextLocation.lat, nextLocation.lng]).addTo(state.map).bindPopup("You are here");
    } else {
      state.userMarker.setLatLng([nextLocation.lat, nextLocation.lng]);
    }
  }

  if (shouldRefreshPlaces) {
    state.lastPlacesLookupLocation = nextLocation;
    findNearbyServices();
  }
}

async function searchPlaces(search) {
  const { lat, lng } = state.userLocation;
  const query = `
    [out:json][timeout:15];
    (
      node${search.query}(around:25000,${lat},${lng});
      way${search.query}(around:25000,${lat},${lng});
      relation${search.query}(around:25000,${lat},${lng});
    );
    out center 3;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: query
  });

  if (!response.ok) {
    throw new Error("Overpass request failed");
  }

  const data = await response.json();
  return (data.elements || []).slice(0, 3).map((element) => {
    const point = {
      lat: element.lat ?? element.center?.lat,
      lng: element.lon ?? element.center?.lon
    };
    return {
      category: search.category,
      name: element.tags?.name || search.category,
      phone: element.tags?.phone || "",
      distanceText: formatDistance(distanceKm(state.userLocation, point)),
      location: point
    };
  }).filter((place) => Number.isFinite(place.location.lat) && Number.isFinite(place.location.lng));
}

function findNearbyServices() {
  if (!state.userLocation) {
    manualOverride("Location unavailable. Showing local emergency cards.");
    return;
  }

  Promise.all(nearbySearches.map(searchPlaces))
    .then((groups) => {
      const places = groups.flat();
      renderServiceCards(places.length ? places : localEmergencyContacts.features);
    })
    .catch(() => manualOverride("Nearby search failed. Showing local emergency cards."));
}

function renderSoilAdvice(soil) {
  state.activeSoil = soil;
  const node = document.getElementById("soilAdvice");
  const advice = soilRules[soil];

  if (!advice) {
    node.textContent = t("soilDefault");
    document.getElementById("videoGrid").innerHTML = "";
    return;
  }

  node.innerHTML = `
    <p><strong>Recommended fertilizer:</strong> ${escapeHtml(advice.fertilizer)}</p>
    <p><strong>Suggested crops:</strong> ${escapeHtml(advice.crops)}</p>
    <p><strong>Water note:</strong> ${escapeHtml(advice.water)}</p>
  `;

  loadIrrigationVideos(soil);
}

function loadIrrigationVideos(soil) {
  const title = `${sharedVideo.title} for ${soil} soil`;
  renderVideos([
    { title, id: sharedVideo.id, url: sharedVideo.url },
    { title: `Search more irrigation methods for ${soil} soil`, searchQuery: `Irrigation techniques for ${soil} soil` }
  ]);
}

function renderVideos(videos) {
  document.getElementById("videoGrid").innerHTML = videos.map((video) => `
    <article class="video-card">
      ${video.id
        ? `<iframe class="video-frame" src="https://www.youtube.com/embed/${escapeHtml(video.id)}" title="${escapeHtml(video.title)}" loading="lazy" allowfullscreen></iframe>`
        : `<div class="video-placeholder">${t("videoUnavailable")}</div>`
      }
      <h3>${escapeHtml(video.title)}</h3>
      ${video.url
        ? `<a class="link-button" href="${video.url}" target="_blank" rel="noopener">${t("openYoutube")}</a>`
        : ""
      }
      ${video.searchQuery
        ? `<a class="link-button" href="https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}" target="_blank" rel="noopener">${t("openYoutube")}</a>`
        : ""
      }
    </article>
  `).join("");
}

async function submitReport(event) {
  event.preventDefault();

  const payload = {
    type: document.getElementById("issueType").value.trim(),
    locationLabel: document.getElementById("issueLocation").value.trim(),
    details: document.getElementById("issueDetails").value.trim(),
    gps: state.userLocation
  };

  if (!payload.locationLabel || !payload.details) {
    setReportStatus(t("reportValidation"), true);
    return;
  }

  setReportStatus(t("reportSubmitting"));

  try {
    const response = await fetch(`${API_BASE_URL}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || t("reportFailed"));
    }
    event.target.reset();
    setReportStatus(t("reportSaved"));
  } catch (error) {
    setReportStatus(error.message || t("reportFailed"), true);
  }
}

async function submitChatMessage(event) {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  if (!message) {
    return;
  }

  addChatMessage("user", message);
  input.value = "";
  setChatStatus(t("thinking"));

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is missing.");
    }

    const languageInstruction = state.language === "kn"
      ? "Reply in Kannada unless the user asks for another language."
      : "Reply in English unless the user asks for another language.";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: [
                  "You are the Rural Resilience Hub assistant.",
                  "Give practical, concise answers for rural users on farming, emergencies, nearby support, women and child safety, and civic complaints.",
                  languageInstruction,
                  state.activeSoil ? `Active soil type: ${state.activeSoil}.` : "",
                  state.userLocation ? `User GPS coordinates: ${state.userLocation.lat.toFixed(4)}, ${state.userLocation.lng.toFixed(4)}.` : "",
                  `User message: ${message}`
                ].filter(Boolean).join(" ")
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 700
        }
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.error?.message || "Chat request failed");
    }

    const reply = (result?.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("").trim();
    if (!reply) {
      throw new Error("Gemini returned an empty response.");
    }

    state.lastAssistantReply = reply;
    addChatMessage("assistant", reply);
    setChatStatus(t("assistantReady"));
  } catch (error) {
    addChatMessage("assistant", error.message || "The assistant is unavailable right now.");
    setChatStatus(t("assistantError"));
  }
}

function promptChat(message) {
  const input = document.getElementById("chatInput");
  input.value = message;
  input.focus();
}

function startVoiceInput() {
  if (!SpeechRecognition) {
    setChatStatus(t("speechUnavailable"));
    return;
  }

  if (!state.recognition) {
    state.recognition = new SpeechRecognition();
    state.recognition.interimResults = false;
    state.recognition.maxAlternatives = 1;
    state.recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        document.getElementById("chatInput").value = transcript;
      }
    };
    state.recognition.onend = () => {
      state.isListening = false;
      setMicButtonState();
      setChatStatus(t("chatStatusReady"));
    };
    state.recognition.onerror = () => {
      state.isListening = false;
      setMicButtonState();
      setChatStatus(t("speechUnavailable"));
    };
  }

  state.recognition.lang = state.language === "kn" ? "kn-IN" : "en-IN";
  state.isListening = true;
  setMicButtonState();
  setChatStatus(t("listening"));
  state.recognition.start();
}

async function speakAssistantReply() {
  if (!state.lastAssistantReply) {
    setChatStatus(t("noReplyToSpeak"));
    return;
  }

  setChatStatus(t("speaking"));

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Gemini API key is missing.");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: state.language === "kn"
                  ? `Read this naturally in Kannada: ${state.lastAssistantReply}`
                  : `Read this naturally in English: ${state.lastAssistantReply}`
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: state.language === "kn" ? "Kore" : "Aoede"
              }
            }
          }
        }
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result?.error?.message || t("voiceError"));
    }

    const audioPart = result?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
    if (!audioPart?.inlineData?.data) {
      throw new Error(t("voiceError"));
    }

    const audio = new Audio(`data:${audioPart.inlineData.mimeType || "audio/wav"};base64,${audioPart.inlineData.data}`);
    audio.onended = () => setChatStatus(t("voiceReady"));
    await audio.play();
  } catch (error) {
    setChatStatus(error.message || t("voiceError"));
  }
}

function applyTranslations() {
  document.documentElement.lang = state.language === "kn" ? "kn" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.getElementById("chatInput").placeholder = t("chatPlaceholder");
  document.getElementById("issueLocation").placeholder = t("issuePlaceholder");
  document.getElementById("issueDetails").placeholder = t("detailsPlaceholder");
  setMicButtonState();
}

function bindEvents() {
  document.getElementById("languageSelect").addEventListener("change", (event) => {
    state.language = event.target.value;
    applyTranslations();
  });
  document.getElementById("micBtn").addEventListener("click", startVoiceInput);
  document.getElementById("speakBtn").addEventListener("click", speakAssistantReply);
  document.getElementById("locateBtn").addEventListener("click", startLocationTracking);
  document.getElementById("soilSelect").addEventListener("change", (event) => renderSoilAdvice(event.target.value));
  document.getElementById("reportForm").addEventListener("submit", submitReport);
  document.getElementById("chatForm").addEventListener("submit", submitChatMessage);
  document.getElementById("chatPromptLocation").addEventListener("click", () => {
    const prompt = state.userLocation
      ? t("locationPromptWithGps").replace("{lat}", state.userLocation.lat.toFixed(4)).replace("{lng}", state.userLocation.lng.toFixed(4))
      : t("locationPromptNoGps");
    promptChat(prompt);
  });
  document.getElementById("chatPromptEmergency").addEventListener("click", () => promptChat(t("emergencyPrompt")));
  window.addEventListener("offline", () => manualOverride("Device is offline. Showing local emergency cards."));
  window.addEventListener("online", () => setIndicator(t("online"), "Connection restored. Tap refresh GPS if the location looks stale."));
}

function boot() {
  applyTranslations();
  bindEvents();
  addChatMessage("assistant", t("assistantGreeting"));
  initMap();
}

boot();
