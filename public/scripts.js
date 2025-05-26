const BACKEND_URL = "https://flask-api-hec2.onrender.com";

async function askQuestion(prompt) {
    const loader = document.getElementById("loader");
    const replyBox = document.getElementById("reply");

    try {
        loader.style.display = "inline-block";
        replyBox.innerText = "";

        // Initialize Tableau extension
        console.log("Initializing Tableau Extension...");
        await tableau.extensions.initializeAsync();
        console.log("Tableau Extension Initialized.");

        const dashboard = tableau.extensions.dashboardContent.dashboard;
        console.log("Dashboard object:", dashboard);

        // --- NEW DATA COLLECTION START ---

        // 1. Get Dashboard Name
        const dashboardName = dashboard.name;
        console.log("Dashboard Name:", dashboardName);

        // 2. Get all Worksheet Names (Views) in the current workbook
        const workbookViews = dashboard.worksheets.map(ws => ws.name);
        console.log("All Worksheets (Views) in Workbook:", workbookViews);

        // 3. Get Data Sources and their associated Worksheets
        const dataSources = await dashboard.getDataSourcesAsync(); // Get all data sources used by the dashboard
        const dataSourcesInfo = [];

        for (const dataSource of dataSources) {
            const dsWorksheets = await dataSource.getWorksheets(); // Get worksheets connected to this data source
            dataSourcesInfo.push({
                name: dataSource.name,
                connectionName: dataSource.connectionName, // Often useful to know
                isPrimary: dataSource.isPrimary, // Is it the primary data source?
                worksheets: dsWorksheets.map(ws => ws.name) // List names of connected worksheets
            });
        }
        console.log("Data Sources Information:", dataSourcesInfo);

        // --- NEW DATA COLLECTION END ---

        // Target the "Drivers" worksheet for summary data (existing logic)
        const targetWorksheetName = "Drivers";
        const driversWorksheet = dashboard.worksheets.find(ws => ws.name === targetWorksheetName);

        if (!driversWorksheet) {
            const errorMessage = `Worksheet named "${targetWorksheetName}" not found on the dashboard. Please ensure it exists and is visible.`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
        console.log(`Found worksheet: ${driversWorksheet.name}`);

        const summaryData = await driversWorksheet.getSummaryDataAsync();
        console.log(`Successfully retrieved SummaryDataReader from '${targetWorksheetName}' worksheet.`);

        const dataRows = [];
        const columns = summaryData.getColumns();
        console.log("Columns found in summary data:", columns.map(col => col.fieldName));

        while (summaryData.nextRow()) {
            const rowData = {};
            columns.forEach((column, index) => {
                rowData[column.fieldName] = summaryData.getValue(index);
            });
            dataRows.push(rowData);
        }
        console.log(`Finished processing summary data. Total rows found: ${dataRows.length}`);
        console.log("Processed Summary Data from 'Drivers' worksheet:", dataRows);

        // Collect parameters from the dashboard (existing logic)
        const parameters = await dashboard.getParametersAsync();
        const parametersData = {};
        parameters.forEach(param => {
            parametersData[param.name] = param.currentValue.value;
        });
        console.log("Parameters collected:", parametersData);

        // Log the complete data being sent to backend
        console.log("Data sent to backend:", {
            prompt,
            parameters: parametersData,
            summaryData: dataRows,
            dashboardName: dashboardName,         // NEW: Dashboard name
            workbookViews: workbookViews,         // NEW: All worksheet names
            dataSourcesInfo: dataSourcesInfo      // NEW: Data source details
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
                summaryData: dataRows,
                dashboardName: dashboardName,
                workbookViews: workbookViews,
                dataSourcesInfo: dataSourcesInfo
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