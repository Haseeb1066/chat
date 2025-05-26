// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // for node-fetch in ES module

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const prompt = req.body.prompt;
  const sheetData = req.body.sheetData || [];

  // Debug: log the incoming prompt and data
  console.log("Received Prompt:", prompt);
  console.log("Received Sheet Data:", JSON.stringify(sheetData, null, 2));

  // Step 1: Flatten sheet data into a context block
  let context = "The sheet is empty.";
  if (sheetData.length > 0) {
    context = sheetData.map((row, index) => {
      const rowText = Object.entries(row)
        .map(([key, val]) => `${key}: ${val}`)
        .join(", ");
      return `Row ${index + 1}: ${rowText}`;
    }).join("\n");
  }

  // Step 2: Create the system message
  const systemPrompt = `
You are a Tableau dashboard assistant. Use the provided table data to answer the user's question.
If you find relevant rows or values in the table, summarize them clearly.
If you cannot find the answer, respond with: "I could not find the answer in the dashboard data."

Here is the data:
${context}
`;

  try {
    // Step 3: Query OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "No response from OpenAI.";
    console.log("Assistant Reply:", reply);
    res.json({ reply });

  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ reply: "An error occurred while contacting the assistant." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
