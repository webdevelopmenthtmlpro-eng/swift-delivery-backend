const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Initialize OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/chat", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const userMessage = req.body.message;

    // Ask OpenAI for a reply
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // lightweight, fast model
      messages: [
        { role: "system", content: "You are a helpful delivery assistant chatbot." },
        { role: "user", content: userMessage },
      ],
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized or AI error" });
  }
});

app.listen(5000, () => console.log("✅ Backend running with AI replies on http://localhost:5000"));
