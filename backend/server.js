require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   🧾 MEMORY FILE SETUP
=============================== */

const MEMORY_FILE = "./memory.json";

function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) return [];
  return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
}

function saveMemory(memories) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memories, null, 2));
}

/* ===============================
   💬 CHAT ROUTE
=============================== */

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";
    const text = userMessage.toLowerCase();

    let memories = loadMemory();

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

    if (
      text.includes("anxious") ||
      text.includes("nervous") ||
      text.includes("scared") ||
      text.includes("afraid") ||
      text.includes("worried")
    ) emotion = "anxiety";

    else if (
      text.includes("sad") ||
      text.includes("depressed") ||
      text.includes("lonely") ||
      text.includes("down")
    ) emotion = "sadness";

    else if (
      text.includes("angry") ||
      text.includes("frustrated") ||
      text.includes("irritated")
    ) emotion = "anger";

    else if (
      text.includes("happy") ||
      text.includes("excited") ||
      text.includes("great") ||
      text.includes("good")
    ) emotion = "positive";

    /* ===============================
       🧠 OVERTHINKING DETECTION
    =============================== */

    let overthinking = false;
    const whatIfCount = (text.match(/what if/g) || []).length;

    if (
      whatIfCount >= 2 ||
      text.includes("overthinking") ||
      text.includes("again and again") ||
      text.includes("can't stop thinking") ||
      text.includes("i keep thinking")
    ) {
      overthinking = true;
    }

    /* ===============================
       🎭 SYSTEM PROMPT
    =============================== */

    let systemPrompt =
      "You are NEXA, a calm, friendly, and helpful AI assistant.";

    if (memories.length > 0) {
      systemPrompt +=
        "\n\nThings you remember about the user:\n- " +
        memories.join("\n- ");
    }

    if (emotion === "anxiety") {
      systemPrompt =
        "You are NEXA, a very calm, grounding, emotionally supportive assistant. Speak gently. Avoid overwhelming advice.";
    }

    if (emotion === "sadness") {
      systemPrompt =
        "You are NEXA, a compassionate assistant. Validate feelings first, then gently support.";
    }

    if (emotion === "anger") {
      systemPrompt =
        "You are NEXA, a calm stabilizer. Slow things down. Help regain balance.";
    }

    if (emotion === "positive") {
      systemPrompt =
        "You are NEXA, uplifting and encouraging, but still professional.";
    }

    if (overthinking) {
      systemPrompt =
        "You are NEXA, a calm cognitive guide. The user is overthinking. Interrupt the spiral. Use short steps. Ask ONE grounding question at the end.";
    }

    /* ===============================
       🔊 VOICE MODE DECISION
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
      overthinking,
      voiceMode,
      memoryCount: memories.length
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
