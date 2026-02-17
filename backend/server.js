require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   🧾 MEMORY & EMOTION LOG FILES
=============================== */

const MEMORY_FILE = "./memory.json";
const EMOTION_LOG_FILE = "./emotion_log.json";

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return [];
  return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
}

function saveMemory(memories) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memories, null, 2));
}

function loadEmotionLog() {
  if (!fs.existsSync(EMOTION_LOG_FILE)) return [];
  return JSON.parse(fs.readFileSync(EMOTION_LOG_FILE, "utf8"));
}

function saveEmotionLog(log) {
  fs.writeFileSync(EMOTION_LOG_FILE, JSON.stringify(log, null, 2));
}

function logEmotion(emotion) {
  const log = loadEmotionLog();
  log.push({ emotion, timestamp: new Date().toISOString() });
  // Keep only last 30 entries (7 days * 4+ entries)
  if (log.length > 30) log.shift();
  saveEmotionLog(log);
}

/* ===============================
   🧠 SAFE WORD & SILENT MODE CONFIG
=============================== */

const SAFE_WORD_FILE = "./safe_word.json";
const SILENT_MODE_FILE = "./silent_mode.json";

function loadSafeWord() {
  if (!fs.existsSync(SAFE_WORD_FILE)) return null;
  const data = JSON.parse(fs.readFileSync(SAFE_WORD_FILE, "utf8"));
  return data.safeWord || null;
}

function saveSafeWord(word) {
  fs.writeFileSync(SAFE_WORD_FILE, JSON.stringify({ safeWord: word }, null, 2));
}

function loadSilentMode() {
  if (!fs.existsSync(SILENT_MODE_FILE)) return false;
  const data = JSON.parse(fs.readFileSync(SILENT_MODE_FILE, "utf8"));
  return data.enabled || false;
}

function saveSilentMode(enabled) {
  fs.writeFileSync(SILENT_MODE_FILE, JSON.stringify({ enabled }, null, 2));
}

/* ===============================
   🧠 THOUGHT DISTORTION DETECTOR
=============================== */

function detectThoughtDistortion(text) {
  const lowerText = text.toLowerCase();
  let distortionType = null;
  let distortionLabel = null;

  // Catastrophizing patterns
  const catastrophizingKeywords = [
    "everything will fail",
    "i'll fail",
    "it's all ruined",
    "worst case",
    "always goes wrong",
    "nothing will work",
    "it's hopeless",
    "i'm doomed",
    "this is a disaster",
    "i'll never",
    "always happens"
  ];

  if (catastrophizingKeywords.some(keyword => lowerText.includes(keyword))) {
    distortionType = "catastrophizing";
    distortionLabel = "catastrophizing";
  }

  // Mind reading patterns
  const mindReadingKeywords = [
    "they think i'm",
    "they probably think",
    "everyone thinks",
    "they know i'm",
    "i know they",
    "they're judging me",
    "they don't like me",
    "they think i'm useless",
    "they're laughing at me",
    "people don't want"
  ];

  if (mindReadingKeywords.some(keyword => lowerText.includes(keyword))) {
    distortionType = "mind_reading";
    distortionLabel = "mind reading";
  }

  // All-or-nothing thinking
  const allOrNothingKeywords = [
    "perfect or",
    "all or nothing",
    "either i",
    "if i'm not perfect",
    "if i can't",
    "either way",
    "one mistake means",
    "it's either",
    "all or",
    "completely failed",
    "total failure"
  ];

  if (allOrNothingKeywords.some(keyword => lowerText.includes(keyword))) {
    distortionType = "all_or_nothing";
    distortionLabel = "all-or-nothing thinking";
  }

  return { distortionDetected: !!distortionType, distortionType, distortionLabel };
}

/* ===============================
   💬 CHAT ROUTE
=============================== */

/* ===============================
   🎭 PERSONALITY DEFINITIONS
=============================== */

const PERSONALITIES = {
  calm: {
    name: "Calm",
    base: "You are NEXA, a calm, gentle, and reassuring AI assistant. Speak with warmth and patience."
  },
  professional: {
    name: "Professional",
    base: "You are NEXA, a concise, professional, and structured AI assistant. Be formal, efficient, and to the point."
  },
  supportive: {
    name: "Supportive",
    base: "You are NEXA, an emotionally empathetic and deeply supportive AI assistant. Validate feelings and show genuine care."
  },
  focus: {
    name: "Focus Coach",
    base: "You are NEXA, a strict productivity coach. Be direct, action-oriented, and help eliminate distractions."
  }
};

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";
    const text = userMessage.toLowerCase();
    const selectedPersonality = req.body.personality || "calm";

    let memories = loadMemory();
    const safeWord = loadSafeWord();
    const silentModeEnabled = loadSilentMode();
    
    /* ===============================
       🔐 EMOTIONAL SAFE WORD SETUP
    =============================== */
    
    if (text.includes("my safe word is ") || text.includes("set safe word to ")) {
      const match = userMessage.match(/(?:my safe word is|set safe word to)\s+([\w]+)/i);
      if (match) {
        const newSafeWord = match[1].toLowerCase();
        saveSafeWord(newSafeWord);
        return res.json({
          reply: `🔐 Got it. Your safe word is "${newSafeWord}". Whenever you type it, I'll switch to grounding mode and stop all other responses.`,
          safeWordSet: newSafeWord
        });
      }
    }
    
    /* ===============================
       🔐 SAFE WORD TRIGGERED
    =============================== */
    
    if (safeWord && text === safeWord) {
      return res.json({
        reply: "I'm here with you. Let's just breathe. You're safe. What do you need right now?",
        safeWordTriggered: true,
        voiceMode: "whisper",
        silentMode: true,
        emotion: "anxiety"
      });
    }
    
    /* ===============================
       🤍 SILENT COMPANION MODE SETUP
    =============================== */
    
    if (text === "silent mode on" || text === "turn on silent companion mode") {
      saveSilentMode(true);
      return res.json({
        reply: "🤍 I'm here. Quiet now.",
        silentModeEnabled: true,
        silentMode: true
      });
    }
    
    if (text === "silent mode off" || text === "turn off silent companion mode") {
      saveSilentMode(false);
      return res.json({
        reply: "🤍 I'm back. What's on your mind?",
        silentModeDisabled: true
      });
    }

    /* ===============================
       ⭐ SELECTIVE MEMORY
    =============================== */

    if (
      text.startsWith("remember ") ||
      text.startsWith("don't forget ") ||
      text.startsWith("save this ")
    ) {
      const memory = userMessage.replace(
        /^(remember|don't forget|save this)\s*/i,
        ""
      );

      memories.push(memory);
      saveMemory(memories);

      return res.json({
        reply: "Okay 🤍 I’ll remember that.",
        memoryAdded: memory
      });
    }

    if (text.startsWith("forget ")) {
      const forgetText = userMessage.replace(/^forget\s*/i, "");

      memories = memories.filter(
        m => !m.toLowerCase().includes(forgetText.toLowerCase())
      );

      saveMemory(memories);

      return res.json({
        reply: "Alright. I’ve forgotten that.",
        memoryRemoved: forgetText
      });
    }

    /* ===============================
       🧘‍♀️ FOCUS MODE
    =============================== */

    if (
      text.includes("focus") ||
      text.includes("concentrate") ||
      text.includes("pomodoro")
    ) {
      let minutes = 25;
      const match = text.match(/(\d+)\s*(minute|min)/);
      if (match) minutes = parseInt(match[1]);

      return res.json({
        reply: `Alright 🌱 Let’s focus for ${minutes} minutes. I’ll stay quiet.`,
        focusMode: true,
        duration: minutes,
        voiceMode: "whisper"
      });
    }

    /* ===============================
       🧠 EMOTION DETECTION
    =============================== */

    let emotion = "neutral";

    // Helper: Check if positive words are negated
    const hasNearbyNegation = (word) => {
      const index = text.indexOf(word);
      if (index === -1) return false;
      const before = text.substring(Math.max(0, index - 20), index);
      return /not |don't |doesn't |didn't |never |can't |cannot |isn't /.test(before);
    };

    // Check for anxiety emotions
    if (
      text.includes("anxious") ||
      text.includes("nervous") ||
      text.includes("scared") ||
      text.includes("afraid") ||
      text.includes("worried") ||
      text.includes("stressed") ||
      text.includes("stress") ||
      text.includes("panic") ||
      text.includes("overwhelm") ||
      (text.includes("can't") && text.includes("fail")) ||
      text.includes("never get placed") ||
      text.includes("again and again")
    ) emotion = "anxiety";

    // Check for negated positive emotions before other checks
    else if (
      text.includes("not good") ||
      text.includes("not feeling good") ||
      text.includes("don't feel good") ||
      text.includes("not okay") ||
      (text.includes("not") && (text.includes("happy") || text.includes("excited") || text.includes("great"))) ||
      (text.includes("don't") && (text.includes("feel good") || text.includes("feel great"))) ||
      (text.includes("never") && (text.includes("happy") || text.includes("good")))
    ) emotion = "sadness";

    // Check for sadness emotions
    else if (
      text.includes("sad") ||
      text.includes("depressed") ||
      text.includes("lonely") ||
      text.includes("down") ||
      text.includes("upset") ||
      text.includes("miserable") ||
      text.includes("terrible")
    ) emotion = "sadness";

    // Check for anger emotions
    else if (
      text.includes("angry") ||
      text.includes("frustrated") ||
      text.includes("irritated") ||
      text.includes("furious") ||
      text.includes("rage")
    ) emotion = "anger";

    // Check for positive emotions (only if not negated)
    else if (
      (text.includes("happy") && !hasNearbyNegation("happy")) ||
      (text.includes("excited") && !hasNearbyNegation("excited")) ||
      (text.includes("great") && !hasNearbyNegation("great")) ||
      (text.includes("good") && !hasNearbyNegation("good")) ||
      (text.includes("amazing") && !hasNearbyNegation("amazing")) ||
      (text.includes("wonderful") && !hasNearbyNegation("wonderful")) ||
      (text.includes("fantastic") && !hasNearbyNegation("fantastic")) ||
      text.includes("love it") ||
      (text.includes("proud") && !hasNearbyNegation("proud"))
    ) emotion = "positive";

    /* ===============================
       THOUGHT DISTORTION DETECTION
    =============================== */

    const { distortionDetected, distortionType, distortionLabel } = detectThoughtDistortion(userMessage);

    /* ===============================
       ADVANCED OVERTHINKING DETECTION
    =============================== */

    let overthinking = false;
    let overthinkingReason = null;
    const whatIfCount = (text.match(/what if/g) || []).length;
    const repeatedPatterns = (text.match(/but|however|still|yet|though/g) || []).length;
    const anxiousWords = (text.match(/might|could|might not|won't|can't/g) || []).length;

    if (
      whatIfCount >= 2 ||
      (text.includes("overthinking") || 
       text.includes("again and again") || 
       text.includes("can't stop thinking") ||
       text.includes("i keep thinking") ||
       (repeatedPatterns >= 3 && anxiousWords >= 2))
    ) {
      overthinking = true;
      if (whatIfCount >= 2) overthinkingReason = "spiral_what_if";
      else if (repeatedPatterns >= 3 && anxiousWords >= 2) overthinkingReason = "repeated_fear_pattern";
      else overthinkingReason = "general_overthinking";
    }

    /* ===============================
       ONE-SENTENCE RESCUE MODE & PRIORITY SETUP
    =============================== */
    
    const isOverwhelmed = text.includes("too much") || text.includes("overwhelmed") || emotion === "anxiety";

    /* ===============================
       SYSTEM PROMPT - PRIORITY ORDER
    =============================== */

    let systemPrompt = PERSONALITIES[selectedPersonality]?.base || PERSONALITIES.calm.base;

    if (memories.length > 0) {
      systemPrompt +=
        "\n\nThings you remember about the user:\n- " +
        memories.join("\n- ");
    }
    
    // PRIORITY 1: Distortion Detection (most specific)
    if (distortionDetected) {
      if (distortionType === "catastrophizing") {
        systemPrompt = "You are NEXA. The user is catastrophizing (jumping to worst case conclusions). Gently label this without judgment. Say: 'This sounds like catastrophizing — when our mind jumps to the worst case. Let's slow it down.' Then ask ONE grounding question.";
      } else if (distortionType === "mind_reading") {
        systemPrompt = "You are NEXA. The user is mind reading (assuming what others think). Gently label this. Say: 'That sounds like mind reading — guessing what others think without evidence. We rarely know for sure. What would you tell a friend in this situation?' Ask ONE caring question.";
      } else if (distortionType === "all_or_nothing") {
        systemPrompt = "You are NEXA. The user is thinking in black-and-white terms. Gently label this. Say: 'This is all-or-nothing thinking. Life has a lot of gray. You're doing better than you think.' Offer ONE gentle perspective.";
      }
    }
    // PRIORITY 2: Silent Companion Mode
    else if (silentModeEnabled) {
      systemPrompt = "You are NEXA in Silent Companion Mode. No suggestions. No questions. Only short, warm acknowledgements. Be present but quiet. Examples: 'I'm here with you.' 'That sounds heavy.' 'You're not alone.' Keep it to one sentence.";
    }
    // PRIORITY 3: Overwhelmed/One-Sentence Rescue
    else if (isOverwhelmed) {
      systemPrompt = "You are NEXA. The user is overwhelmed. Respond with ONE calm, grounding sentence only. No lists, no questions, no advice. Just presence.";
    }
    // PRIORITY 4: Emotion-based (non-overriding cascade)
    if (!distortionDetected && !silentModeEnabled && !isOverwhelmed) {
      if (emotion === "anxiety") {
        systemPrompt = "You are NEXA, a very calm, grounding, emotionally supportive assistant. Speak gently. Avoid overwhelming advice.";
      } else if (emotion === "sadness") {
        systemPrompt = "You are NEXA, a compassionate assistant. Validate feelings first, then gently support.";
      } else if (emotion === "anger") {
        systemPrompt = "You are NEXA, a calm stabilizer. Slow things down. Help regain balance.";
      } else if (emotion === "positive") {
        systemPrompt = "You are NEXA, uplifting and encouraging, but still professional.";
      }
    }
    
    // PRIORITY 5: Overthinking (only if no higher priority caught it)
    if (overthinking && !distortionDetected && !silentModeEnabled && !isOverwhelmed) {
      if (overthinkingReason === "spiral_what_if") {
        systemPrompt = "You are NEXA, a calm cognitive guide. The user is spiraling with 'what if' fears. Interrupt gently. Provide 3 grounding steps (bullet format, very short). Ask ONE grounding question only. Do NOT explain why you're doing this.";
      } else if (overthinkingReason === "repeated_fear_pattern") {
        systemPrompt = "You are NEXA. The user is repeating the same fear pattern. Name the pattern gently (1 sentence). Break it into 3 simple action steps. Ask ONE question to shift focus.";
      } else {
        systemPrompt = "You are NEXA, a calm cognitive guide. The user is overthinking. Interrupt the spiral. Use short steps. Ask ONE grounding question at the end.";
      }
    }

    /* ===============================
       VOICE MODE DECISION
    =============================== */

    let voiceMode = "normal";

    if (
      overthinking ||
      emotion === "anxiety" ||
      emotion === "sadness"
    ) {
      voiceMode = "whisper";
    }

    /* ===============================
       📊 EMOTION LOG & TIMELINE
    =============================== */

    logEmotion(emotion);
    const emotionLog = loadEmotionLog();
    const recentEmotions = emotionLog.slice(-7).map(e => e.emotion);
    let emotionTrend = "stable";

    if (recentEmotions.filter(e => e === "anxiety").length >= 3) emotionTrend = "anxious_streak";
    else if (recentEmotions.filter(e => e === "sadness").length >= 3) emotionTrend = "low_mood_streak";
    else if (recentEmotions.filter(e => e === "positive").length >= 3) emotionTrend = "improving";
    else if (
      recentEmotions.length >= 2 &&
      (recentEmotions[recentEmotions.length - 2] === "neutral" || recentEmotions[recentEmotions.length - 2] === "sadness") &&
      emotion === "anxiety"
    ) emotionTrend = "emotional_shift";

    if (emotionTrend === "anxious_streak" && !overthinking) {
      systemPrompt += "\n\nNote: User has been stressed repeatedly. Be extra grounding.";
    } else if (emotionTrend === "low_mood_streak") {
      systemPrompt += "\n\nNote: User's mood has been low. Offer gentle validation.";
    } else if (emotionTrend === "emotional_shift") {
      systemPrompt += "\n\nNote: User's emotion shifted. Gently explore the trigger.";
    }

    /* ===============================
       🤖 GROQ API CALL
    =============================== */

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    res.json({
      reply: response.data.choices[0].message.content,
      emotion,
      emotionTrend,
      overthinking,
      overthinkingReason,
      voiceMode,
      memoryCount: memories.length,
      personality: selectedPersonality,
      messageCount: req.body.messageCount || 1,
      distortionDetected,
      distortionType,
      distortionLabel,
      isOverwhelmed,
      silentMode: silentModeEnabled,
      safeWordSet: !!safeWord
    });

  } catch (error) {
    console.error("AI ERROR:", error.code || error.message);

    let reply = "NEXA is thinking 🤍 Please try again.";

    if (error.code === "ECONNRESET") {
      reply = "NEXA is a little busy 😴 Please try again.";
    }

    if (error.response?.status === 429) {
      reply = "Too many requests 🚦 Please slow down.";
    }

    res.status(500).json({ reply });
  }
});

/* ===============================
   🚀 SERVER START
=============================== */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
