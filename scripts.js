const OPENAI_API_KEY = "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"; // Store securely in real apps

function appendMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.textContent = `${sender}: ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const userInput = document.getElementById("user-input").value;
  if (!userInput) return;
  
  appendMessage("You", userInput);
  document.getElementById("user-input").value = "";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userInput }]
    })
  });

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  appendMessage("Bot", reply);

  // Optional: You can parse `reply` and apply Tableau filters here
}

tableau.extensions.initializeAsync().then(() => {
  console.log("Extension initialized");
});
let dashboard = tableau.extensions.dashboardContent.dashboard;
let worksheet = dashboard.worksheets.find(w => w.name === "Sales");

worksheet.applyFilterAsync("Region", "West", tableau.FilterUpdateType.REPLACE);
