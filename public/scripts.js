const BACKEND_URL = "https://flask-api-hec2.onrender.com";

async function askQuestion(prompt) {
    const loader = document.getElementById("loader");
    const replyBox = document.getElementById("reply");

    try {
        loader.style.display = "inline-block";
        replyBox.innerText = "";

        // Initialize Tableau extensionconst BACKEND_URL = "https://flask-api-hec2.onrender.com";

async function askQuestion(prompt) {
    const loader = document.getElementById("loader");
    const replyBox = document.getElementById("reply");

    try {
        loader.style.display = "inline-block";
        replyBox.innerText = "";

        // Initialize Tableau extension
        await tableau.extensions.initializeAsync();
        const dashboard = tableau.extensions.dashboardContent.dashboard;

        // --- GET DASHBOARD NAME AND WORKSHEETS ---
        const dashboardName = dashboard.name;
        console.log("Dashboard Name:", dashboardName);

        const workbookViews = dashboard.worksheets.map(ws => ws.name);
        console.log("All Worksheets (Views) in Workbook:", workbookViews);

        // --- GET DATA SOURCES INFO ---
        const dataSources = await dashboard.getDataSourcesAsync();
        const dataSourcesInfo = [];
        for (const dataSource of dataSources) {
            const dsWorksheets = await dataSource.getWorksheets();
            dataSourcesInfo.push({
                name: dataSource.name,
                connectionName: dataSource.connectionName,
                isPrimary: dataSource.isPrimary,
                worksheets: dsWorksheets.map(ws => ws.name)
            });
        }
        console.log("Data Sources Information:", dataSourcesInfo);

        // --- GET WORKBOOK AND PROJECT NAME FROM PARAMETERS ---
        const parameters = await dashboard.getParametersAsync();

        const workbookNameParam = parameters.find(p => p.name === "WorkbookName");
        const projectNameParam = parameters.find(p => p.name === "ProjectName");

        const workbookName = workbookNameParam ? workbookNameParam.currentValue.value : "Unknown Workbook";
        const projectName = projectNameParam ? projectNameParam.currentValue.value : "Unknown Project";

        console.log("Workbook Name (from parameter):", workbookName);
        console.log("Project Name (from parameter):", projectName);

        // --- SEND DATA TO BACKEND ---
        console.log("Data sent to backend:", {
            prompt,
            parameters: parametersData, // your existing parameters data, ensure defined
            summaryData: dataRows,      // your existing summary data, ensure defined
            dashboardName,
            workbookViews,
            dataSourcesInfo,
            workbookName,
            projectName
        });

        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                parameters: parametersData,
                summaryData: dataRows,
                dashboardName,
                workbookViews,
                dataSourcesInfo,
                workbookName,
                projectName
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

        await tableau.extensions.initializeAsync();
        const dashboard = tableau.extensions.dashboardContent.dashboard;

        // --- CODE FOR GETTING DASHBOARD NAME AND VIEW NAMES ---

        // 1. Get Dashboard Name
        const dashboardName = dashboard.name;
        console.log("Dashboard Name:", dashboardName); // This will log the dashboard name to your browser console

        // 2. Get all Worksheet Names (Views) in the current workbook
        // dashboard.worksheets is an array of Worksheet objects
        // .map(ws => ws.name) extracts just the name from each Worksheet object
        const workbookViews = dashboard.worksheets.map(ws => ws.name);
        console.log("All Worksheets (Views) in Workbook:", workbookViews); // This will log the list of view names

        // 3. Get Data Sources and their associated Worksheets (More advanced, but you asked for data source list)
        const dataSources = await dashboard.getDataSourcesAsync(); // Fetches all data sources used on the dashboard
        const dataSourcesInfo = [];

        for (const dataSource of dataSources) {
            const dsWorksheets = await dataSource.getWorksheets(); // Gets worksheets connected to *this specific* data source
            dataSourcesInfo.push({
                name: dataSource.name,
                connectionName: dataSource.connectionName,
                isPrimary: dataSource.isPrimary,
                worksheets: dsWorksheets.map(ws => ws.name) // Names of views using this data source
            });
        }
        console.log("Data Sources Information:", dataSourcesInfo); // This will log the data source details

        // --- END OF CODE FOR GETTING DASHBOARD NAME AND VIEW NAMES ---

        // ... (rest of your code for 'Drivers' summary data, parameters, etc.) ...

        // This is how you send it to your backend:
        console.log("Data sent to backend:", {
            prompt,
            parameters: parametersData, // Assuming you have parametersData from your previous code
            summaryData: dataRows,       // Assuming you have dataRows from 'Drivers' worksheet
            dashboardName: dashboardName,         // <--- HERE IT IS
            workbookViews: workbookViews,         // <--- HERE IT IS
            dataSourcesInfo: dataSourcesInfo      // <--- AND HERE
        });

        // The 'body' of your fetch request should include these:
        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                parameters: parametersData,
                summaryData: dataRows,
                dashboardName: dashboardName,         // <--- AND HERE
                workbookViews: workbookViews,         // <--- AND HERE
                dataSourcesInfo: dataSourcesInfo      // <--- AND HERE
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