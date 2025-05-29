// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();
// const port = 4000;
const port = process.env.PORT

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI client with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for custom knowledge content
let customKnowledge = "The name of AI assistant is Ronald. You have to inform your name only when the uesr asks about your name. In other cases, you don't have to tell your name in every time.";

// Endpoint to update custom knowledge content
app.post("/api/knowledge", (req, res) => {
  const { content } = req.body;
  if (typeof content !== "string") {
    return res.status(400).json({ error: "Content must be a string." });
  }
  customKnowledge = content.trim();
  res.json({ message: "Custom knowledge updated successfully." });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    // Prepare system prompt with custom knowledge if available
    const systemPrompt = customKnowledge
      ? `You are Pack 3000 assistant. Use the following knowledge to answer user queries:\n${customKnowledge}`
      : "You are Pack 3000 assistant.";

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or "gpt-3.5-turbo"
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content.trim();
    res.json({ reply });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "Failed to get AI response." });
  }
});

app.listen(port, () => {
  console.log(`Pack3000 backend listening at http://localhost:${port}`);
});
