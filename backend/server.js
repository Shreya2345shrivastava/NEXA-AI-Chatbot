require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are NEXA, a calm, friendly, and helpful AI assistant."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 15000 // ⏱️ prevents ECONNRESET issues
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error("AI ERROR:", error.code || error.message);

    let reply = "NEXA is thinking 🤍 Please try again.";

    if (error.code === "ECONNRESET") {
      reply = "NEXA is a little busy 😴 Please try again in a moment.";
    }

    if (error.response?.status === 429) {
      reply = "Too many requests 🚦 Please slow down a bit.";
    }

    res.status(500).json({ reply });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
