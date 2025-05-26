// Replace with your actual Render backend URL
const BACKEND_URL = "https://flask-api-hec2.onrender.com";

async function askQuestion(prompt) {
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    document.getElementById("reply").innerText = data.reply;
  } catch (error) {
    console.error(error);
    document.getElementById("reply").innerText = "Error: Failed to fetch";
  }
}
