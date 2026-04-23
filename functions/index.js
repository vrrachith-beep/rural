const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-2.5-flash";

exports.api = onRequest({ cors: true, region: "asia-south1" }, async (req, res) => {
  try {
    const route = normalizeRoute(req.path || req.url || "/");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (route === "/report" && req.method === "POST") {
      await handleReport(req, res);
      return;
    }

    if (route === "/chat" && req.method === "POST") {
      await handleChat(req, res);
      return;
    }

    if (route === "/tts" && req.method === "POST") {
      await handleTts(req, res);
      return;
    }

    res.status(404).json({ error: "Route not found." });
  } catch (error) {
    logger.error("API error", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

async function handleReport(req, res) {
  const body = req.body || {};
  const type = cleanText(body.type, 80);
  const locationLabel = cleanText(body.locationLabel, 140);
  const details = cleanText(body.details, 2000);
  const gps = sanitizeGps(body.gps);

  if (!type || !locationLabel || !details) {
    res.status(400).json({ error: "Type, location, and details are required." });
    return;
  }

  const docRef = await db.collection("complaints").add({
    type,
    locationLabel,
    details,
    gps,
    status: "submitted",
    source: "web-app",
    createdAt: FieldValue.serverTimestamp()
  });

  res.status(200).json({ ok: true, complaintId: docRef.id });
}

async function handleChat(req, res) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_GEMINI_API_KEY_HERE") {
    res.status(503).json({ error: "Gemini backend key is not configured on the server." });
    return;
  }

  const body = req.body || {};
  const message = cleanText(body.message, 4000);
  const sessionId = cleanText(body.sessionId, 120) || "anonymous-session";
  const context = body.context || {};
  const language = cleanText(context.language, 12) || "en";

  if (!message) {
    res.status(400).json({ error: "Message is required." });
    return;
  }

  const contextParts = [];
  if (context.soil) {
    contextParts.push(`Active soil type: ${cleanText(context.soil, 40)}.`);
  }
  const gps = sanitizeGps(context.gps);
  if (gps) {
    contextParts.push(`User GPS coordinates: ${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}.`);
  }

  const sessionRef = db.collection("chatSessions").doc(sessionId);
  const history = await loadRecentChatHistory(sessionId);
  const prompt = buildGeminiPrompt({ history, contextParts, message, language });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 700
        }
      })
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    logger.error("Gemini API error", payload);
    res.status(502).json({ error: payload?.error?.message || "Gemini request failed." });
    return;
  }

  const reply =
    payload?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim() || "I could not generate a response right now.";

  await sessionRef.set({
    updatedAt: FieldValue.serverTimestamp(),
    model: MODEL
  }, { merge: true });

  await sessionRef.collection("messages").add({
    role: "user",
    text: message,
    createdAt: FieldValue.serverTimestamp()
  });

  await sessionRef.collection("messages").add({
    role: "assistant",
    text: reply,
    model: MODEL,
    createdAt: FieldValue.serverTimestamp()
  });

  res.status(200).json({
    ok: true,
    reply,
    responseId: null
  });
}

async function handleTts(req, res) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_GEMINI_API_KEY_HERE") {
    res.status(503).json({ error: "Gemini backend key is not configured on the server." });
    return;
  }

  const body = req.body || {};
  const text = cleanText(body.text, 3000);
  const language = cleanText(body.language, 12) || "en";

  if (!text) {
    res.status(400).json({ error: "Text is required for voice synthesis." });
    return;
  }

  const voicePrompt = language === "kn"
    ? `Read this naturally in Kannada: ${text}`
    : `Read this naturally in English: ${text}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: voicePrompt
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: language === "kn" ? "Kore" : "Aoede"
              }
            }
          }
        }
      })
    }
  );

  const payload = await response.json();
  if (!response.ok) {
    logger.error("Gemini TTS error", payload);
    res.status(502).json({ error: payload?.error?.message || "Gemini TTS request failed." });
    return;
  }

  const audioPart = payload?.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data);
  if (!audioPart?.inlineData?.data) {
    res.status(502).json({ error: "Gemini TTS returned no audio data." });
    return;
  }

  res.status(200).json({
    ok: true,
    mimeType: audioPart.inlineData.mimeType || "audio/wav",
    audioBase64: audioPart.inlineData.data
  });
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function sanitizeGps(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const lat = Number(value.lat);
  const lng = Number(value.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    lat,
    lng
  };
}

function normalizeRoute(pathname) {
  const cleanPath = pathname.split("?")[0];
  return cleanPath.startsWith("/api/") ? cleanPath.slice(4) : cleanPath;
}

async function loadRecentChatHistory(sessionId) {
  const snapshot = await db
    .collection("chatSessions")
    .doc(sessionId)
    .collection("messages")
    .orderBy("createdAt", "desc")
    .limit(6)
    .get();

  return snapshot.docs
    .map((doc) => doc.data())
    .reverse()
    .map((item) => ({
      role: item.role || "user",
      text: cleanText(item.text || "", 1200)
    }))
    .filter((item) => item.text);
}

function buildGeminiPrompt({ history, contextParts, message, language }) {
  const intro = [
    "You are the Rural Resilience Hub assistant.",
    "Give practical, concise answers for rural users on farming, basic emergency response, locating services, women and child safety, and reporting civic issues.",
    "Do not pretend to contact emergency services or government offices.",
    "If the user mentions immediate danger, clearly tell them to call local emergency services right away.",
    language === "kn"
      ? "Reply in Kannada unless the user explicitly asks for another language."
      : "Reply in English unless the user explicitly asks for another language."
  ].join(" ");

  const historyText = history.length
    ? history.map((item) => `${item.role === "assistant" ? "Assistant" : "User"}: ${item.text}`).join("\n")
    : "No prior chat history.";

  const contextText = contextParts.length ? contextParts.join(" ") : "No special app context.";

  return [
    intro,
    `App context: ${contextText}`,
    `Recent conversation:\n${historyText}`,
    `User message: ${message}`
  ].join("\n\n");
}
