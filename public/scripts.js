const BACKEND_URL = "https://flask-api-hec2.onrender.com";

async function askQuestion(prompt) {
  const loader = document.getElementById("loader");
  const replyBox = document.getElementById("reply");

  try {
    loader.style.display = "inline-block";  // Show loader
    replyBox.innerText = "";                // Clear previous reply

    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    replyBox.innerText = data.reply;
  } catch (error) {
    console.error(error);
    replyBox.innerText = "Error: Failed to fetch";
  } finally {
    loader.style.display = "none";  // Hide loader
  }
}
