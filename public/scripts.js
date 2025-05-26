async function sendMessage() {
  const input = document.getElementById("user-input").value;
  if (!input) return;

  document.getElementById("chat-box").innerHTML += `<div><b>You:</b> ${input}</div>`;

  const response = await fetch("https://your-backend.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: input }),
  });

  const data = await response.json();
  const reply = data?.reply || "No response";

  document.getElementById("chat-box").innerHTML += `<div><b>Bot:</b> ${reply}</div>`;
}
