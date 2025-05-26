const BACKEND_URL = "https://flask-api-hec2.onrender.com";

async function askQuestion(prompt) {
  const loader = document.getElementById("loader");
  const replyBox = document.getElementById("reply");

  try {
    loader.style.display = "inline-block";
    replyBox.innerText = "";

    // Initialize Tableau extension
    await tableau.extensions.initializeAsync();
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    // Collect parameters only
    const parameters = await dashboard.getParametersAsync();
    const parametersData = {};
    parameters.forEach(param => {
      parametersData[param.name] = param.currentValue.value;
    });
    const firstWorksheet = dashboard.worksheets[0];
    const summaryData = await firstWorksheet.getSummaryDataAsync();
    // Log the data being sent to backend
    console.log("Data sent to backend:", {
      prompt,
      parameters: parametersData,
    });

    // Send data to backend
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        parameters: parametersData,
      }),
    });

    const data = await response.json();
    replyBox.innerText = data.reply;

  } catch (error) {
    console.error("Error:", error);
    replyBox.innerText = "Error: Failed to fetch or initialize Tableau extension.";
  } finally {
    loader.style.display = "none";
  }
}
