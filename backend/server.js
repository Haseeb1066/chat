// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const prompt = req.body.prompt;
  const sheetData = req.body.sheetData || [];

  // Step 1: Flatten sheet data into a text block
  const context = sheetData.map((row, index) => {
    const rowText = Object.entries(row)
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ");
    return `Row ${index + 1}: ${rowText}`;
  }).join("\n");

  // Step 2: Provide both context and question to OpenAI
  const systemPrompt = `
You are a Tableau dashboard assistant. Only answer questions using the provided data.

Here is the data:
${context}

Only answer from the above data. If the answer is not in the data, say "I could not find the answer in the dashboard data."
`;

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
  res.json({ reply });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
