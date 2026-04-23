const config = window.APP_CONFIG || {};

const GEMINI_API_KEY = config.geminiApiKey || "";
const API_BASE_URL = config.apiBaseUrl || "/api";
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const CHAT_SESSION_ID = window.localStorage?.getItem("ruralChatSessionId") ||
  `rural-chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;

window.localStorage?.setItem("ruralChatSessionId", CHAT_SESSION_ID);

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
  isListening: false,
  sosActive: false,
  sosAudioContext: null,
  sosBuzzerTimer: null,
  lastSosSentAt: 0
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
    chatStatusReady: "Chatbot uses the Firebase AI backend and the map uses your saved support locations.",
    mic: "Mic",
    speakReply: "Speak reply",
    send: "Send",
    quickActions: "Quick actions",
    womenSos: "Women SOS",
    sosActiveLabel: "Emergency",
    sharingLiveLocation: "Sharing live location",
    stopSos: "Stop SOS",
    navigatePolice: "Navigate police",
    call: "Call",
    navigate: "Navigate",
    you: "You",
    assistant: "Assistant",
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
    cropComparison: "Crop profit comparison",
    weatherMonth: "30-day weather preparation",
    spend: "Spend",
    revenue: "Revenue",
    profit: "Profit",
    growTime: "Grow time",
    waterNeed: "Water",
    risk: "Risk",
    bestReturn: "Best estimated return",
    perAcreNote: "Planning estimates per acre. Actual prices and yields change by season, market, water, seed quality, and pests.",
    loadingWeather: "Loading weather estimate...",
    weatherNoGps: "Using Tumakuru-area weather estimate until live GPS is available.",
    weatherSummary: "Weather estimate",
    rain: "Rain",
    hotDays: "Hot days",
    avgTemp: "Avg temp",
    prepAdvice: "Preparation advice",
    days: "days",
    mm: "mm",
    rupeePrefix: "₹",
    longTerm: "Long-term",
    later: "Later",
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
    chatStatusReady: "ಚಾಟ್‌ಬಾಟ್ Firebase AI backend ಬಳಸುತ್ತದೆ ಮತ್ತು ನಕ್ಷೆ ನಿಮ್ಮ ಉಳಿಸಿದ ಸಹಾಯ ಸ್ಥಳಗಳನ್ನು ಬಳಸುತ್ತದೆ.",
    mic: "ಮೈಕ್",
    speakReply: "ಉತ್ತರವನ್ನು ಕೇಳಿ",
    send: "ಕಳುಹಿಸಿ",
    quickActions: "ತ್ವರಿತ ಕ್ರಮಗಳು",
    womenSos: "ಮಹಿಳಾ SOS",
    sosActiveLabel: "ತುರ್ತು",
    sharingLiveLocation: "ಲೈವ್ ಸ್ಥಳ ಹಂಚಲಾಗುತ್ತಿದೆ",
    stopSos: "SOS ನಿಲ್ಲಿಸಿ",
    navigatePolice: "ಪೊಲೀಸ್ ಕಡೆಗೆ ಹೋಗಿ",
    call: "ಕರೆ",
    navigate: "ದಾರಿ",
    you: "ನೀವು",
    assistant: "ಸಹಾಯಕ",
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
    cropComparison: "ಬೆಳೆ ಲಾಭ ಹೋಲಿಕೆ",
    weatherMonth: "30 ದಿನಗಳ ಹವಾಮಾನ ಸಿದ್ಧತೆ",
    spend: "ಖರ್ಚು",
    revenue: "ಆದಾಯ",
    profit: "ಲಾಭ",
    growTime: "ಬೆಳೆಯುವ ಕಾಲ",
    waterNeed: "ನೀರು",
    risk: "ಅಪಾಯ",
    bestReturn: "ಅಂದಾಜು ಉತ್ತಮ ಲಾಭ",
    perAcreNote: "ಪ್ರತಿ ಏಕರೆಗೆ planning ಅಂದಾಜು. ನಿಜವಾದ ಬೆಲೆ ಮತ್ತು ಉತ್ಪಾದನೆ ಋತು, ಮಾರುಕಟ್ಟೆ, ನೀರು, ಬೀಜ ಗುಣಮಟ್ಟ ಮತ್ತು ಕೀಟಗಳಿಂದ ಬದಲಾಗುತ್ತದೆ.",
    loadingWeather: "ಹವಾಮಾನ ಅಂದಾಜು ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    weatherNoGps: "ಲೈವ್ GPS ಲಭ್ಯವಿಲ್ಲದಿದ್ದರೆ ತುಮಕೂರು ಪ್ರದೇಶದ ಹವಾಮಾನ ಅಂದಾಜು ಬಳಸಲಾಗುತ್ತದೆ.",
    weatherSummary: "ಹವಾಮಾನ ಅಂದಾಜು",
    rain: "ಮಳೆ",
    hotDays: "ಬಿಸಿ ದಿನಗಳು",
    avgTemp: "ಸರಾಸರಿ ತಾಪಮಾನ",
    prepAdvice: "ಸಿದ್ಧತಾ ಸಲಹೆ",
    days: "ದಿನಗಳು",
    mm: "ಮಿಮೀ",
    rupeePrefix: "ರೂ.",
    longTerm: "ದೀರ್ಘಾವಧಿ",
    later: "ನಂತರ",
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

const soilAdviceText = {
  Red: {
    fertilizer: "Urea + Potash with farmyard manure",
    fertilizerKn: "ಯೂರಿಯಾ + ಪೊಟ್ಯಾಶ್ ಜೊತೆಗೆ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ",
    water: "Use short, frequent irrigation bursts to avoid runoff.",
    waterKn: "ನೀರು ಹರಿದು ಹೋಗದಂತೆ ಕಡಿಮೆ ಅವಧಿಯ, ಮರುಮರು ನೀರಾವರಿ ಬಳಸಿ."
  },
  Black: {
    fertilizer: "DAP + Zinc with deep organic compost",
    fertilizerKn: "ಡಿಎಪಿ + ಜಿಂಕ್ ಜೊತೆಗೆ ಸಾವಯವ ಗೊಬ್ಬರ",
    water: "Deep irrigation in wider intervals works well because black soil holds moisture.",
    waterKn: "ಕಪ್ಪು ಮಣ್ಣು ತೇವಾಂಶ ಹಿಡಿಯುವುದರಿಂದ ದೊಡ್ಡ ಅಂತರದಲ್ಲಿ ಆಳವಾದ ನೀರಾವರಿ ಚೆನ್ನಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ."
  },
  Loamy: {
    fertilizer: "NPK 19-19-19 with compost support",
    fertilizerKn: "ಎನ್‌ಪಿಕೆ 19-19-19 ಜೊತೆಗೆ ಸಾವಯವ ಗೊಬ್ಬರ",
    water: "Balanced drip or furrow irrigation usually performs best.",
    waterKn: "ಸಮತೋಲನ drip ಅಥವಾ furrow irrigation ಸಾಮಾನ್ಯವಾಗಿ ಉತ್ತಮ."
  },
  Sandy: {
    fertilizer: "Compost + NPK support",
    fertilizerKn: "ಸಾವಯವ ಗೊಬ್ಬರ + ಎನ್‌ಪಿಕೆ ಸಹಾಯ",
    water: "Use mulching and frequent light irrigation because sandy soil drains fast.",
    waterKn: "ಮರಳು ಮಣ್ಣು ನೀರನ್ನು ಬೇಗ ಬಿಡುವುದರಿಂದ mulching ಮತ್ತು ಕಡಿಮೆ ಪ್ರಮಾಣದ ಮರುಮರು ನೀರಾವರಿ ಬಳಸಿ."
  }
};

const cropPlans = {
  Red: [
    { crop: "Ragi", cropKn: "ರಾಗಿ", spend: 14500, revenue: 42000, days: 110, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Low", riskKn: "ಕಡಿಮೆ" },
    { crop: "Groundnut", cropKn: "ಕಡಲೆಕಾಯಿ", spend: 24500, revenue: 62000, days: 105, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Red gram", cropKn: "ತೊಗರಿ", spend: 18500, revenue: 52000, days: 165, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Horse gram", cropKn: "ಹುರಳಿ", spend: 9500, revenue: 28500, days: 90, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Low", riskKn: "ಕಡಿಮೆ" },
    { crop: "Sesame", cropKn: "ಎಳ್ಳು", spend: 12500, revenue: 36000, days: 95, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Castor", cropKn: "ಹರಳು", spend: 16000, revenue: 45000, days: 150, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Foxtail millet", cropKn: "ನವಣೆ", spend: 10500, revenue: 33000, days: 85, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Low", riskKn: "ಕಡಿಮೆ" }
  ],
  Black: [
    { crop: "Cotton", cropKn: "ಹತ್ತಿ", spend: 42000, revenue: 98000, days: 175, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "High", riskKn: "ಹೆಚ್ಚು" },
    { crop: "Soybean", cropKn: "ಸೊಯಾಬೀನ್", spend: 23500, revenue: 56000, days: 100, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Sunflower", cropKn: "ಸೂರ್ಯಕಾಂತಿ", spend: 21000, revenue: 54000, days: 95, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Maize", cropKn: "ಮೆಕ್ಕೆಜೋಳ", spend: 28000, revenue: 68000, days: 115, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Bengal gram", cropKn: "ಕಡಲೆ", spend: 18500, revenue: 50000, days: 115, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Low", riskKn: "ಕಡಿಮೆ" },
    { crop: "Sorghum", cropKn: "ಜೋಳ", spend: 16000, revenue: 39000, days: 110, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Low", riskKn: "ಕಡಿಮೆ" },
    { crop: "Onion", cropKn: "ಈರುಳ್ಳಿ", spend: 52000, revenue: 125000, days: 125, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "High", riskKn: "ಹೆಚ್ಚು" }
  ],
  Loamy: [
    { crop: "Tomato", cropKn: "ಟೊಮೇಟೊ", spend: 65000, revenue: 155000, days: 100, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "High", riskKn: "ಹೆಚ್ಚು" },
    { crop: "Chilli", cropKn: "ಮೆಣಸಿನಕಾಯಿ", spend: 72000, revenue: 170000, days: 150, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "High", riskKn: "ಹೆಚ್ಚು" },
    { crop: "Beans", cropKn: "ಹುರಳಿಕಾಯಿ", spend: 36000, revenue: 88000, days: 65, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Cabbage", cropKn: "ಎಲೆಕೋಸು", spend: 42000, revenue: 94000, days: 85, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Banana", cropKn: "ಬಾಳೆ", spend: 105000, revenue: 245000, days: 365, water: "High", waterKn: "ಹೆಚ್ಚು", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Paddy", cropKn: "ಭತ್ತ", spend: 38000, revenue: 76000, days: 130, water: "High", waterKn: "ಹೆಚ್ಚು", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Cucumber", cropKn: "ಸೌತೆಕಾಯಿ", spend: 32000, revenue: 78000, days: 60, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" }
  ],
  Sandy: [
    { crop: "Watermelon", cropKn: "ಕಲ್ಲಂಗಡಿ", spend: 47000, revenue: 115000, days: 85, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "High", riskKn: "ಹೆಚ್ಚು" },
    { crop: "Muskmelon", cropKn: "ಕರಬೂಜ", spend: 44000, revenue: 108000, days: 80, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "High", riskKn: "ಹೆಚ್ಚು" },
    { crop: "Pearl millet", cropKn: "ಸಜ್ಜೆ", spend: 12000, revenue: 31000, days: 85, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Low", riskKn: "ಕಡಿಮೆ" },
    { crop: "Cowpea", cropKn: "ಅಲಸಂದೆ", spend: 15500, revenue: 41000, days: 75, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Low", riskKn: "ಕಡಿಮೆ" },
    { crop: "Sweet potato", cropKn: "ಗೆಣಸು", spend: 30000, revenue: 74000, days: 115, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Cluster bean", cropKn: "ಗೋರಿಕಾಯಿ", spend: 18000, revenue: 46000, days: 80, water: "Low", waterKn: "ಕಡಿಮೆ", risk: "Medium", riskKn: "ಮಧ್ಯಮ" },
    { crop: "Coconut saplings", cropKn: "ತೆಂಗಿನ ಸಸಿಗಳು", spend: 85000, revenue: 0, days: 1095, water: "Medium", waterKn: "ಮಧ್ಯಮ", risk: "Long-term", riskKn: "ದೀರ್ಘಾವಧಿ" }
  ]
};

const issueOptions = [
  { value: "Broken road", en: "Broken road", kn: "ಹಾಳಾದ ರಸ್ತೆ" },
  { value: "Water supply", en: "Water supply", kn: "ನೀರು ಪೂರೈಕೆ" },
  { value: "Street light", en: "Street light", kn: "ರಸ್ತೆ ದೀಪ" },
  { value: "Drainage", en: "Drainage", kn: "ಚರಂಡಿ" },
  { value: "Public building", en: "Public building", kn: "ಸಾರ್ವಜನಿಕ ಕಟ್ಟಡ" },
  { value: "Medical help access", en: "Medical help access", kn: "ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪ್ರವೇಶ" },
  { value: "Women SOS emergency", en: "Women SOS emergency", kn: "ಮಹಿಳಾ SOS ತುರ್ತು ಪರಿಸ್ಥಿತಿ" }
];

const soilOptions = [
  { value: "", en: "Select soil type", kn: "ಮಣ್ಣಿನ ವಿಧ ಆಯ್ಕೆ ಮಾಡಿ" },
  { value: "Red", en: "Red", kn: "ಕೆಂಪು ಮಣ್ಣು" },
  { value: "Black", en: "Black", kn: "ಕಪ್ಪು ಮಣ್ಣು" },
  { value: "Loamy", en: "Loamy", kn: "ಲೋಮಿ ಮಣ್ಣು" },
  { value: "Sandy", en: "Sandy", kn: "ಮರಳು ಮಣ್ಣು" }
];

const localEmergencyContacts = {
  features: [
    { category: "Police Station", name: "Police Outpost, Sadashivnagar, Tumkur", phone: "100", distanceText: "Saved location", location: { lat: 13.3277513, lng: 77.0891051 } },
    { category: "District Court", name: "Free Legal Advice", phone: "15100", distanceText: "Saved location", location: { lat: 13.0024486, lng: 77.5302011 } },
    { category: "Government Hospital", name: "District Hospital, Tumakuru", phone: "108", distanceText: "Saved location", location: { lat: 13.3399985, lng: 77.1000114 } },
    { category: "Medical Diagnostic Center", name: "Krsnaa Diagnostics Ltd. (District Hospital Tumakuru)", phone: "104", distanceText: "Saved location", location: { lat: 13.3407875, lng: 77.099508 } }
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
  const isEmergency = mode === t("sosActiveLabel");
  indicator.textContent = mode;
  indicator.style.color = mode === t("offlineMode") || isEmergency ? "#ffb4b4" : "#b4ffd2";
  indicator.style.borderColor = mode === t("offlineMode") || isEmergency ? "rgba(255, 107, 107, 0.3)" : "rgba(125, 252, 192, 0.3)";
  document.getElementById("locationText").textContent = message;
}

function setTrackingMode(text) {
  document.getElementById("trackingMode").textContent = text;
}

function addChatMessage(role, text) {
  const stream = document.getElementById("chatMessages");
  const bubble = document.createElement("article");
  bubble.className = `chat-bubble ${role === "user" ? "chat-bubble-user" : ""}`;
  bubble.innerHTML = `<strong>${role === "user" ? t("you") : t("assistant")}</strong><div>${escapeHtml(text).replaceAll("\n", "<br>")}</div>`;
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

function renderSelectOptions(selectId, options) {
  const select = document.getElementById(selectId);
  const selected = select.value;
  select.innerHTML = options.map((option) =>
    `<option value="${escapeHtml(option.value)}">${escapeHtml(state.language === "kn" ? option.kn : option.en)}</option>`
  ).join("");
  select.value = selected;
}

function setSosStatus(message, isError = false) {
  const node = document.getElementById("sosStatus");
  if (node) {
    node.textContent = message;
    node.style.color = isError ? "#ffb4b4" : "#ffd6d6";
  }
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

function savedSupportPlaces() {
  return localEmergencyContacts.features.map((place) => ({
    ...place,
    distanceText: state.userLocation
      ? formatDistance(distanceKm(state.userLocation, place.location))
      : place.distanceText
  }));
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
        <a class="pill-action" href="${tel}">${t("call")}</a>
        <a class="pill-action pill-action-accent" href="${navUrl}" target="_blank" rel="noopener">${t("navigate")}</a>
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
  renderServiceCards(savedSupportPlaces());
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
  setIndicator(t("online"), `${state.language === "kn" ? "ಲೈವ್ ಜಿಪಿಎಸ್" : "Live GPS"}: ${nextLocation.lat.toFixed(5)}, ${nextLocation.lng.toFixed(5)}`);

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

  if (state.sosActive) {
    updateSosLocationSharing();
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

  setTrackingMode(t("liveGpsMode"));
  renderServiceCards(savedSupportPlaces());
}

function formatRupees(value) {
  return `${t("rupeePrefix")}${Number(value).toLocaleString("en-IN")}`;
}

function cropLabel(crop) {
  return state.language === "kn" ? crop.cropKn : crop.crop;
}

function renderSoilAdvice(soil) {
  state.activeSoil = soil;
  const node = document.getElementById("soilAdvice");
  const advice = soilAdviceText[soil];
  const crops = cropPlans[soil] || [];

  if (!advice) {
    node.textContent = t("soilDefault");
    document.getElementById("cropEconomics").innerHTML = "";
    document.getElementById("weatherPlanning").innerHTML = "";
    document.getElementById("videoGrid").innerHTML = "";
    return;
  }

  node.innerHTML = `
    <p><strong>${state.language === "kn" ? "ಶಿಫಾರಸಾದ ಗೊಬ್ಬರ" : "Recommended fertilizer"}:</strong> ${escapeHtml(state.language === "kn" ? advice.fertilizerKn : advice.fertilizer)}</p>
    <p><strong>${state.language === "kn" ? "ನೀರಿನ ಸಲಹೆ" : "Water note"}:</strong> ${escapeHtml(state.language === "kn" ? advice.waterKn : advice.water)}</p>
    <p class="panel-meta">${t("perAcreNote")}</p>
  `;

  renderCropEconomics(crops);
  loadWeatherEstimate();
  loadIrrigationVideos(soil);
}

function renderCropEconomics(crops) {
  const node = document.getElementById("cropEconomics");
  if (!crops.length) {
    node.innerHTML = "";
    return;
  }

  const ranked = crops.map((crop) => ({
    ...crop,
    profitValue: crop.revenue - crop.spend
  })).sort((a, b) => b.profitValue - a.profitValue);
  const best = ranked[0];

  node.innerHTML = `
    <div class="crop-summary">
      <div>
        <p class="panel-kicker">${t("cropComparison")}</p>
        <h3>${t("bestReturn")}: ${escapeHtml(cropLabel(best))} (${formatRupees(best.profitValue)})</h3>
      </div>
      <p class="panel-meta">${t("perAcreNote")}</p>
    </div>
    <div class="crop-table-wrap">
      <table class="crop-table">
        <thead>
          <tr>
            <th>${state.language === "kn" ? "ಬೆಳೆ" : "Crop"}</th>
            <th>${t("spend")}</th>
            <th>${t("revenue")}</th>
            <th>${t("profit")}</th>
            <th>${t("growTime")}</th>
            <th>${t("waterNeed")}</th>
            <th>${t("risk")}</th>
          </tr>
        </thead>
        <tbody>
          ${ranked.map((crop) => `
            <tr>
              <td><strong>${escapeHtml(cropLabel(crop))}</strong></td>
              <td>${formatRupees(crop.spend)}</td>
              <td>${crop.revenue ? formatRupees(crop.revenue) : t("longTerm")}</td>
              <td class="${crop.profitValue > 0 ? "profit-positive" : "profit-wait"}">${crop.profitValue > 0 ? formatRupees(crop.profitValue) : t("later")}</td>
              <td>${crop.days} ${t("days")}</td>
              <td>${escapeHtml(state.language === "kn" ? crop.waterKn : crop.water)}</td>
              <td>${escapeHtml(state.language === "kn" ? crop.riskKn : crop.risk)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

async function loadWeatherEstimate() {
  const node = document.getElementById("weatherPlanning");
  const point = state.userLocation || { lat: 13.34, lng: 77.1 };
  node.innerHTML = `<div class="weather-card"><p class="panel-kicker">${t("weatherMonth")}</p><p class="panel-meta">${t("loadingWeather")} ${state.userLocation ? "" : t("weatherNoGps")}</p></div>`;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=16&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Weather unavailable");
    }
    const data = await response.json();
    const rainTotal = (data.daily?.precipitation_sum || []).reduce((sum, value) => sum + Number(value || 0), 0);
    const maxTemps = data.daily?.temperature_2m_max || [];
    const minTemps = data.daily?.temperature_2m_min || [];
    const avgTemp = maxTemps.length
      ? maxTemps.reduce((sum, value, index) => sum + ((Number(value) + Number(minTemps[index] || value)) / 2), 0) / maxTemps.length
      : 0;
    const hotDays = maxTemps.filter((value) => Number(value) >= 34).length;
    const estimatedMonthRain = rainTotal * (30 / Math.max(maxTemps.length, 1));
    const advice = weatherPreparationAdvice(estimatedMonthRain, hotDays, avgTemp);

    node.innerHTML = `
      <div class="weather-card">
        <div class="crop-summary">
          <div>
            <p class="panel-kicker">${t("weatherMonth")}</p>
            <h3>${t("weatherSummary")}</h3>
          </div>
        <p class="panel-meta">${state.userLocation ? "" : t("weatherNoGps")} ${state.language === "kn" ? "16 ದಿನಗಳ ಹವಾಮಾನ ಮಾಹಿತಿಯ ಆಧಾರದ ಮೇಲೆ 30 ದಿನಗಳ ಅಂದಾಜು." : "30-day estimate based on the 16-day forecast."}</p>
      </div>
      <div class="weather-grid">
          <div><span>${t("rain")}</span><strong>${estimatedMonthRain.toFixed(0)} ${t("mm")}</strong></div>
          <div><span>${t("avgTemp")}</span><strong>${avgTemp.toFixed(1)}°C</strong></div>
          <div><span>${t("hotDays")}</span><strong>${hotDays}</strong></div>
        </div>
        <p><strong>${t("prepAdvice")}:</strong> ${escapeHtml(advice)}</p>
      </div>
    `;
  } catch {
    node.innerHTML = `
      <div class="weather-card">
        <p class="panel-kicker">${t("weatherMonth")}</p>
        <p>${state.language === "kn"
          ? "ಹವಾಮಾನ ಅಂದಾಜು ಈಗ ಲಭ್ಯವಿಲ್ಲ. ನೀರು ಕಡಿಮೆ ಇರಬಹುದು ಎಂದು drip irrigation, mulching, ಮತ್ತು ಬೀಜ/ಗೊಬ್ಬರವನ್ನು ಮುಂಚಿತವಾಗಿ ಸಿದ್ಧಪಡಿಸಿ."
          : "Weather estimate is unavailable right now. Prepare with drip irrigation, mulching, and seed/fertilizer planning in case water is limited."
        }</p>
      </div>
    `;
  }
}

function weatherPreparationAdvice(rainMm, hotDays, avgTemp) {
  if (state.language === "kn") {
    if (rainMm < 30) {
      return "ಮಳೆ ಕಡಿಮೆ ಕಾಣುತ್ತಿದೆ. ಕಡಿಮೆ ನೀರಿನ ಬೆಳೆ ಆರಿಸಿ, mulching ಮಾಡಿ, drip irrigation ಇಟ್ಟುಕೊಳ್ಳಿ.";
    }
    if (rainMm > 120) {
      return "ಮಳೆ ಹೆಚ್ಚು ಇರಬಹುದು. ನೀರು ನಿಲ್ಲದಂತೆ drainage ಮಾಡಿ, fungal disease ಗಮನಿಸಿ.";
    }
    if (hotDays >= 5 || avgTemp >= 30) {
      return "ಬಿಸಿ ದಿನಗಳು ಹೆಚ್ಚು. ಬೆಳಗ್ಗೆ/ಸಂಜೆ ನೀರಾವರಿ ಮಾಡಿ, ಗಿಡಗಳಿಗೆ moisture stress ಬರದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.";
    }
    return "ಹವಾಮಾನ ಮಧ್ಯಮವಾಗಿದೆ. ಬೀಜ, ಗೊಬ್ಬರ, ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ ಮುಂಚಿತವಾಗಿ ಸಿದ್ಧಪಡಿಸಿ.";
  }

  if (rainMm < 30) {
    return "Rain looks low. Prefer low-water crops, mulch early, and keep drip irrigation ready.";
  }
  if (rainMm > 120) {
    return "Rain may be high. Prepare drainage and watch for fungal disease.";
  }
  if (hotDays >= 5 || avgTemp >= 30) {
    return "Hot days are likely. Irrigate early morning/evening and avoid moisture stress.";
  }
  return "Weather looks moderate. Prepare seeds, fertilizer, and irrigation schedule in advance.";
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

  try {
    const result = await sendReportPayload(payload);
    event.target.reset();
    setReportStatus(result.local
      ? state.language === "kn" ? "ದೂರು ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ. ಫೈರ್‌ಬೇಸ್ ಸೇರಿಸುವುದು ಬಾಕಿ ಇದೆ." : "Report saved locally. Firebase sync is pending."
      : t("reportSaved"), result.local);
  } catch (error) {
    setReportStatus(error.message || t("reportFailed"), true);
  }
}

function saveLocalComplaint(payload) {
  const queue = JSON.parse(window.localStorage?.getItem("ruralComplaintQueue") || "[]");
  const localId = `local-${Date.now()}`;
  queue.push({
    ...payload,
    localId,
    savedAt: new Date().toISOString(),
    syncStatus: "pending"
  });
  window.localStorage?.setItem("ruralComplaintQueue", JSON.stringify(queue.slice(-50)));
  return { ok: true, local: true, complaintId: localId };
}

async function sendReportPayload(payload) {
  setReportStatus(t("reportSubmitting"));

  try {
    const response = await fetch(`${API_BASE_URL}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return saveLocalComplaint(payload);
    }
    return result;
  } catch {
    return saveLocalComplaint(payload);
  }
}

function nearestPolicePlace() {
  return savedSupportPlaces().find((place) => place.category.includes("Police")) || localEmergencyContacts.features[0];
}

function renderSosPoliceCard() {
  const police = nearestPolicePlace();
  const box = document.getElementById("nearestPoliceBox");
  const nav = document.getElementById("nearestPoliceNavigate");
  if (!police || !box || !nav) {
    return;
  }

  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${police.location.lat},${police.location.lng}`;
  box.innerHTML = `
    <p><strong>${escapeHtml(police.name)}</strong></p>
    <p class="panel-meta">${escapeHtml(police.distanceText || "Saved police location")}</p>
    <p class="panel-meta">${state.language === "kn" ? "ತುರ್ತು ಪೊಲೀಸ್ ಸಹಾಯಕ್ಕೆ 100 ಕರೆ ಮಾಡಿ." : "Call 100 for urgent police help."}</p>
  `;
  nav.href = navUrl;
}

function playSosBuzzer() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) {
    return;
  }

  if (!state.sosAudioContext) {
    state.sosAudioContext = new AudioContext();
  }

  const beep = () => {
    const now = state.sosAudioContext.currentTime;
    const oscillator = state.sosAudioContext.createOscillator();
    const gain = state.sosAudioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(980, now);
    oscillator.frequency.setValueAtTime(1320, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.45, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);
    oscillator.connect(gain).connect(state.sosAudioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  };

  beep();
  state.sosBuzzerTimer = window.setInterval(beep, 850);
}

function stopSosBuzzer() {
  if (state.sosBuzzerTimer) {
    window.clearInterval(state.sosBuzzerTimer);
    state.sosBuzzerTimer = null;
  }
}

function fillSosComplaintForm() {
  const locationText = state.userLocation
    ? state.language === "kn" ? `ಲೈವ್ ಜಿಪಿಎಸ್ ${state.userLocation.lat.toFixed(6)}, ${state.userLocation.lng.toFixed(6)}` : `Live GPS ${state.userLocation.lat.toFixed(6)}, ${state.userLocation.lng.toFixed(6)}`
    : state.language === "kn" ? "ಲೈವ್ ಜಿಪಿಎಸ್ ಬಾಕಿ ಇದೆ" : "Live GPS pending";
  const police = nearestPolicePlace();

  document.getElementById("issueType").value = "Women SOS emergency";
  document.getElementById("issueLocation").value = locationText;
  document.getElementById("issueDetails").value = [
    state.language === "kn" ? "ಮಹಿಳಾ SOS ತುರ್ತು ಪರಿಸ್ಥಿತಿ." : "WOMEN SOS EMERGENCY.",
    state.language === "kn" ? "Rural Resilience Hub ಆ್ಯಪ್‌ನಿಂದ ಜೋರಾದ buzzer ಸಕ್ರಿಯವಾಗಿದೆ." : "Loud buzzer activated from the Rural Resilience Hub app.",
    state.language === "kn" ? `ಹತ್ತಿರದ ಉಳಿಸಿದ ಪೊಲೀಸ್ ಸಹಾಯ: ${police?.name || "Police support"}.` : `Nearest saved police support: ${police?.name || "Police support"}.`,
    state.userLocation
      ? state.language === "kn"
        ? `ಲೈವ್ ಸ್ಥಳ: ${state.userLocation.lat.toFixed(6)}, ${state.userLocation.lng.toFixed(6)}.`
        : `Live location: ${state.userLocation.lat.toFixed(6)}, ${state.userLocation.lng.toFixed(6)}.`
      : state.language === "kn"
        ? "ಲೈವ್ ಸ್ಥಳ ಸೇರಿಸಲು GPS ಅನುಮತಿಗಾಗಿ ಕಾಯುತ್ತಿದೆ."
        : "Waiting for GPS permission to attach live location."
  ].join(" ");
}

async function updateSosLocationSharing(force = false) {
  if (!state.sosActive) {
    return;
  }

  fillSosComplaintForm();
  renderSosPoliceCard();

  if (!state.userLocation) {
    setSosStatus(state.language === "kn" ? "ತುರ್ತು ಸಕ್ರಿಯವಾಗಿದೆ. ಲೈವ್ ಸ್ಥಳ ಹಂಚಲು GPS ಅನುಮತಿಗಾಗಿ ಕಾಯುತ್ತಿದೆ." : "Emergency active. Waiting for GPS permission to share live location.", true);
    return;
  }

  const now = Date.now();
  if (!force && now - state.lastSosSentAt < 30000) {
    setSosStatus(`${t("sosActiveLabel")}, ${t("sharingLiveLocation")}: ${state.userLocation.lat.toFixed(5)}, ${state.userLocation.lng.toFixed(5)}`);
    return;
  }

  state.lastSosSentAt = now;
  setSosStatus(`${t("sosActiveLabel")}, ${t("sharingLiveLocation")}: ${state.userLocation.lat.toFixed(5)}, ${state.userLocation.lng.toFixed(5)}`);

  try {
    const result = await sendReportPayload({
      type: "Women SOS emergency",
      locationLabel: `${state.language === "kn" ? "ಲೈವ್ ಜಿಪಿಎಸ್" : "Live GPS"} ${state.userLocation.lat.toFixed(6)}, ${state.userLocation.lng.toFixed(6)}`,
      details: document.getElementById("issueDetails").value,
      gps: state.userLocation
    });
    if (result.local) {
    setReportStatus(state.language === "kn" ? "ಮಹಿಳಾ SOS ದೂರು ಸ್ಥಳೀಯವಾಗಿ ಉಳಿಸಲಾಗಿದೆ. ಫೈರ್‌ಬೇಸ್ ಸೇರಿಸುವುದು ಬಾಕಿ ಇದೆ." : "Women SOS complaint saved locally. Firebase sync is pending.", true);
      setSosStatus(state.language === "kn"
        ? `ತುರ್ತು ಸಕ್ರಿಯವಾಗಿದೆ. ಸ್ಥಳ ದೂರು ನಮೂನೆಯಲ್ಲಿ ಉಳಿದಿದೆ: ${state.userLocation.lat.toFixed(5)}, ${state.userLocation.lng.toFixed(5)}`
        : `Emergency active. Location is saved in the complaint form: ${state.userLocation.lat.toFixed(5)}, ${state.userLocation.lng.toFixed(5)}`, true);
      return;
    }
    setReportStatus(state.language === "kn" ? "ಮಹಿಳಾ SOS ದೂರು ಲೈವ್ GPS ಜೊತೆಗೆ ಕಳುಹಿಸಲಾಗಿದೆ." : "Women SOS complaint sent with live GPS.");
    setSosStatus(state.language === "kn"
      ? `ತುರ್ತು ದೂರು ಕಳುಹಿಸಲಾಗಿದೆ. ಲೈವ್ ಸ್ಥಳ ಹಂಚಲಾಗುತ್ತಿದೆ: ${state.userLocation.lat.toFixed(5)}, ${state.userLocation.lng.toFixed(5)}`
      : `Emergency report sent. Sharing live location: ${state.userLocation.lat.toFixed(5)}, ${state.userLocation.lng.toFixed(5)}`);
  } catch (error) {
    setSosStatus(state.language === "kn" ? "ತುರ್ತು ಸಕ್ರಿಯವಾಗಿದೆ. ದೂರು ನಮೂನೆ ತುಂಬಲಾಗಿದೆ; ಫೈರ್‌ಬೇಸ್‌ಗೆ ಕಳುಹಿಸುವುದು ಬಾಕಿ ಇದೆ." : "Emergency active. Complaint form is filled; Firebase report send is pending.", true);
    setReportStatus(error.message || t("reportFailed"), true);
  }
}

function startWomenSos() {
  state.sosActive = true;
  state.lastSosSentAt = 0;
  document.getElementById("sosPanel").hidden = false;
  setIndicator(t("sosActiveLabel"), t("sharingLiveLocation"));
  setTrackingMode(t("sharingLiveLocation"));
  renderSosPoliceCard();
  fillSosComplaintForm();
  playSosBuzzer();
  startLocationTracking();
  updateSosLocationSharing(true);
  document.getElementById("accountability").scrollIntoView({ behavior: "smooth", block: "start" });
}

function stopWomenSos() {
  state.sosActive = false;
  stopSosBuzzer();
  setSosStatus(state.language === "kn" ? "SOS ನಿಲ್ಲಿಸಲಾಗಿದೆ. ದೂರು ವಿವರಗಳು ನಮೂನೆಯಲ್ಲಿ ಉಳಿದಿವೆ." : "SOS stopped. Complaint details remain in the form.");
  setIndicator(t("online"), state.userLocation ? `${state.language === "kn" ? "ಲೈವ್ ಜಿಪಿಎಸ್" : "Live GPS"}: ${state.userLocation.lat.toFixed(5)}, ${state.userLocation.lng.toFixed(5)}` : t("waitingGps"));
}

async function fetchBackendChat(message) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      sessionId: CHAT_SESSION_ID,
      context: {
        language: state.language,
        soil: state.activeSoil,
        gps: state.userLocation
      }
    })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error?.message || "Chat request failed");
  }

  return (result?.reply || "").trim();
}

async function fetchDirectGeminiChat(message) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing and the Firebase AI backend is unavailable.");
  }

  const models = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemma-3-4b-it"];
  const languageInstruction = state.language === "kn"
    ? "Reply in Kannada unless the user asks for another language."
    : "Reply in English unless the user asks for another language.";
  const body = {
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
  };

  let lastError = null;
  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || "Chat request failed");
      }
      const reply = (result?.candidates?.[0]?.content?.parts || []).map((part) => part.text || "").join("").trim();
      if (reply) {
        return reply;
      }
      lastError = new Error("Gemini returned an empty response.");
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Chat request failed");
}

function localAssistantReply(message) {
  const lowerMessage = message.toLowerCase();
  const hasAny = (words) => words.some((word) => lowerMessage.includes(word));
  const isKannada = state.language === "kn" || /[\u0C80-\u0CFF]/.test(message);
  const locationLines = savedSupportPlaces().map((place) =>
    isKannada
      ? `${place.category}: ${place.name} (${place.distanceText}). ದಾರಿಗೆ ಅದರ card ನಲ್ಲಿ ${t("navigate")} ಒತ್ತಿ.`
      : `${place.category}: ${place.name} (${place.distanceText}). Tap Navigate on its card for directions.`
  );

  if (hasAny(["police", "legal", "hospital", "diagnostic", "nearby", "ಪೊಲೀಸ್", "ಕಾನೂನು", "ಆಸ್ಪತ್ರೆ", "ಡಯಾಗ್ನೋಸ್ಟಿಕ್", "ಹತ್ತಿರ"])) {
    if (isKannada) {
      return [
        "ಉಳಿಸಿದ ಸ್ಥಳೀಯ ಸಹಾಯ ಕೇಂದ್ರಗಳು:",
        ...locationLines,
        "ತುರ್ತು ಅಪಾಯಕ್ಕೆ 100 ಕರೆ ಮಾಡಿ. ವೈದ್ಯಕೀಯ ತುರ್ತು ಪರಿಸ್ಥಿತಿಗೆ 108 ಕರೆ ಮಾಡಿ."
      ].join("\n");
    }
    return [
      "Here are the saved local support points:",
      ...locationLines,
      "For urgent danger call 100. For a medical emergency call 108."
    ].join("\n");
  }

  if (hasAny(["emergency", "urgent", "accident", "help", "ತುರ್ತು", "ಅಪಘಾತ", "ಸಹಾಯ", "ಅಪಾಯ"])) {
    if (isKannada) {
      return [
        "ತುರ್ತು ಪರಿಶೀಲನಾ ಪಟ್ಟಿ:",
        "1. ಸುರಕ್ಷಿತವಾಗಿದ್ದರೆ ಜನರನ್ನು ಅಪಾಯದಿಂದ ದೂರ ಸರಿಸಿ.",
        "2. ವೈದ್ಯಕೀಯ ಸಹಾಯಕ್ಕೆ 108 ಅಥವಾ ಪೊಲೀಸ್ ಸಹಾಯಕ್ಕೆ 100 ಕರೆ ಮಾಡಿ.",
        "3. ನಿಮ್ಮ ಗ್ರಾಮ, ಗುರುತು ಸ್ಥಳ, ಮತ್ತು ಆ್ಯಪ್‌ನಲ್ಲಿ ಕಾಣುವ GPS ಮಾಹಿತಿ ಹಂಚಿ.",
        "4. ತುರ್ತು ಕರೆ ಮಾಡಿದ ನಂತರ ದೂರು ನಮೂನೆ ಬಳಸಿ ಸಮಸ್ಯೆ ದಾಖಲಿಸಿ."
      ].join("\n");
    }
    return [
      "Quick emergency checklist:",
      "1. Move people away from immediate danger if it is safe.",
      "2. Call 108 for medical help or 100 for police support.",
      "3. Share your village name, landmark, and any live GPS shown in the app.",
      "4. Use the report form to record the issue after the urgent call is made."
    ].join("\n");
  }

  if (hasAny(["report", "complaint", "issue", "ದೂರು", "ಸಮಸ್ಯೆ", "ರಿಪೋರ್ಟ್"])) {
    if (isKannada) {
      return "File report ವಿಭಾಗದಲ್ಲಿ ಗ್ರಾಮ ಅಥವಾ ಗುರುತು ಸ್ಥಳವನ್ನು ಬರೆಯಿರಿ, ಸಮಸ್ಯೆಯ ತುರ್ತುತನ ಮತ್ತು ಯಾರಿಗೆ ಪರಿಣಾಮ ಆಗಿದೆ ಎಂದು ವಿವರಿಸಿ, ನಂತರ submit ಮಾಡಿ. GPS ಲಭ್ಯವಿದ್ದರೆ ಆ್ಯಪ್ ಅದನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೇರಿಸುತ್ತದೆ.";
    }
    return "Use the File report section, enter the village or landmark, describe who is affected and how urgent it is, then submit. If GPS is available, the app attaches it automatically.";
  }

  if (hasAny(["soil", "crop", "farm", "water", "irrigation", "ಮಣ್ಣು", "ಬೆಳೆ", "ಕೃಷಿ", "ನೀರು", "ನೀರಾವರಿ"])) {
    const soil = state.activeSoil;
    const advice = soilAdviceText[soil];
    const crops = cropPlans[soil] || [];
    if (advice && crops.length) {
      const topCrops = crops
        .map((crop) => ({ ...crop, profitValue: crop.revenue - crop.spend }))
        .sort((a, b) => b.profitValue - a.profitValue)
        .slice(0, 3);
      if (isKannada) {
        return `${soil} ಮಣ್ಣಿಗೆ ಉತ್ತಮ ಅಂದಾಜು ಬೆಳೆಗಳು: ${topCrops.map((crop) => `${crop.cropKn} (${formatRupees(crop.profitValue)} ಲಾಭ, ${crop.days} ದಿನಗಳು)`).join(", ")}. ಗೊಬ್ಬರ: ${advice.fertilizerKn}. ನೀರಿನ ಸಲಹೆ: ${advice.waterKn}`;
      }
      return `For ${soil} soil, good estimated options are: ${topCrops.map((crop) => `${crop.crop} (${formatRupees(crop.profitValue)} profit, ${crop.days} days)`).join(", ")}. Fertilizer: ${advice.fertilizer}. Water guidance: ${advice.water}`;
    }
    if (isKannada) {
      return "ಮೊದಲು soil type ಆಯ್ಕೆ ಮಾಡಿ. ನೀರು ಕಡಿಮೆ ಇದ್ದರೆ drip irrigation, mulching, ಬೆಳಗಿನ ನೀರಾವರಿ, ಮತ್ತು ನಿಮ್ಮ ಮಣ್ಣಿಗೆ ಸರಿಯಾದ ಕಡಿಮೆ ಅವಧಿಯ ಬೆಳೆಗಳನ್ನು ಆರಿಸಿ.";
    }
    return "Choose your soil type first. For low water, prefer drip irrigation, mulching, early morning watering, and short-cycle crops suited to your soil.";
  }

  if (isKannada) {
    return "ನಾನು ಈಗ offline ಸಹಾಯಕವಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿದ್ದೇನೆ. ಪೊಲೀಸ್, ಕಾನೂನು ಸಹಾಯ, ಆಸ್ಪತ್ರೆ, ಬೆಳೆ, ಮಣ್ಣು, ತುರ್ತು ಪರಿಸ್ಥಿತಿ ಅಥವಾ ದೂರು ಬಗ್ಗೆ ಕೇಳಿ.";
  }

  return "I am running in offline helper mode right now. Ask me about police/legal/hospital locations, emergencies, filing a report, soil, crops, or irrigation.";
}

async function fetchBackendSpeech(text) {
  const response = await fetch(`${API_BASE_URL}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      language: state.language
    })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error?.message || t("voiceError"));
  }

  if (!result?.audioBase64) {
    throw new Error(t("voiceError"));
  }

  return {
    mimeType: result.mimeType || "audio/wav",
    audioBase64: result.audioBase64
  };
}

async function fetchDirectGeminiSpeech(text) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing and the Firebase AI backend is unavailable.");
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
                ? `Read this naturally in Kannada: ${text}`
                : `Read this naturally in English: ${text}`
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

  return {
    mimeType: audioPart.inlineData.mimeType || "audio/wav",
    audioBase64: audioPart.inlineData.data
  };
}

function speakWithBrowserVoice(text) {
  if (!window.speechSynthesis) {
    throw new Error(t("voiceError"));
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.language === "kn" ? "kn-IN" : "en-IN";
  utterance.onend = () => setChatStatus(t("voiceReady"));
  window.speechSynthesis.speak(utterance);
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
    let reply = "";
    try {
      reply = await fetchBackendChat(message);
    } catch {
      try {
        reply = await fetchDirectGeminiChat(message);
      } catch {
        reply = localAssistantReply(message);
      }
    }

    if (!reply) {
      throw new Error("Assistant returned an empty response.");
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
    let speech = null;
    try {
      speech = await fetchBackendSpeech(state.lastAssistantReply);
    } catch {
      try {
        speech = await fetchDirectGeminiSpeech(state.lastAssistantReply);
      } catch {
        speakWithBrowserVoice(state.lastAssistantReply);
        return;
      }
    }

    const audio = new Audio(`data:${speech.mimeType};base64,${speech.audioBase64}`);
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
  renderSelectOptions("issueType", issueOptions);
  renderSelectOptions("soilSelect", soilOptions);
  setMicButtonState();
  if (state.sosActive) {
    renderSosPoliceCard();
    fillSosComplaintForm();
    setSosStatus(`${t("sosActiveLabel")}, ${t("sharingLiveLocation")}`);
  }
  if (state.activeSoil) {
    renderSoilAdvice(state.activeSoil);
  }
}

function bindEvents() {
  document.getElementById("languageSelect").addEventListener("change", (event) => {
    state.language = event.target.value;
    applyTranslations();
  });
  document.getElementById("micBtn").addEventListener("click", startVoiceInput);
  document.getElementById("speakBtn").addEventListener("click", speakAssistantReply);
  document.getElementById("locateBtn").addEventListener("click", startLocationTracking);
  document.getElementById("womenSosBtn").addEventListener("click", startWomenSos);
  document.getElementById("stopSosBtn").addEventListener("click", stopWomenSos);
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
