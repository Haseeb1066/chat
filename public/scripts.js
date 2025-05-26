const BACKEND_URL = "https://flask-api-hec2.onrender.com";

async function getDashboardInfo() {
    await tableau.extensions.initializeAsync();
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    // Get Dashboard Name
    const dashboardName = dashboard.name;

    // Get Views (worksheets) list
    const views = dashboard.worksheets.map(ws => ws.name);

    return { dashboardName, views };
}

// Call this function on page load or first user interaction
async function showDashboardAndViews() {
    try {
        const { dashboardName, views } = await getDashboardInfo();
        const replyBox = document.getElementById("reply");
        replyBox.innerText = `Dashboard: ${dashboardName}\nAvailable Views:\n- ${views.join("\n- ")}`;
        
        // Optionally, you can ask user to type a view name now to get data from that view
    } catch (error) {
        console.error("Error getting dashboard info:", error);
    }
}

async function askQuestion(prompt, selectedView) {
    const loader = document.getElementById("loader");
    const replyBox = document.getElementById("reply");

    try {
        loader.style.display = "inline-block";
        replyBox.innerText = "";

        await tableau.extensions.initializeAsync();
        const dashboard = tableau.extensions.dashboardContent.dashboard;

        // Get Dashboard Name and Views again if needed
        const dashboardName = dashboard.name;
        const views = dashboard.worksheets.map(ws => ws.name);

        // If user hasn't selected view yet, tell them views available
        if (!selectedView) {
            replyBox.innerText = `Please choose a view from the following:\n- ${views.join("\n- ")}`;
            return;
        }

        // Find the worksheet (view) user selected
        const worksheet = dashboard.worksheets.find(ws => ws.name === selectedView);
        if (!worksheet) {
            replyBox.innerText = `View "${selectedView}" not found. Please choose a valid view.`;
            return;
        }

        // Fetch summary data from the selected view
        const summaryData = await worksheet.getSummaryDataAsync();
        const dataRows = summaryData.data.map(row => row.map(cell => cell.value));

        // Send all info + prompt + data to backend
        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt,
                dashboardName,
                views,
                selectedView,
                dataRows
            }),
        });

        const data = await response.json();
        replyBox.innerText = data.reply;

    } catch (error) {
        console.error("Error in askQuestion:", error);
        replyBox.innerText = `Error: ${error.message || "Failed to fetch or initialize Tableau extension."}`;
    } finally {
        loader.style.display = "none";
    }
}

// Example: On page load, show dashboard name and views
showDashboardAndViews();
