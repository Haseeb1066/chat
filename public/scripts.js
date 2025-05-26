// const BACKEND_URL = "https://flask-api-hec2.onrender.com";

// async function askQuestion(prompt) {
//   const loader = document.getElementById("loader");
//   const replyBox = document.getElementById("reply");

//   try {
//     loader.style.display = "inline-block";  // Show loader
//     replyBox.innerText = "";                // Clear previous reply

//     const response = await fetch(`${BACKEND_URL}/chat`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ prompt }),
//     });

//     const data = await response.json();
//     replyBox.innerText = data.reply;
//   } catch (error) {
//     console.error(error);
//     replyBox.innerText = "Error: Failed to fetch";
//   } finally {
//     loader.style.display = "none";  // Hide loader
//   }
// }




const BACKEND_URL = "https://flask-api-hec2.onrender.com";

async function askQuestion(prompt) {
  const loader = document.getElementById("loader");
  const replyBox = document.getElementById("reply");

  try {
    loader.style.display = "inline-block";
    replyBox.innerText = "";

    // Step 1: Initialize Tableau extension
    await tableau.extensions.initializeAsync();
    const dashboard = tableau.extensions.dashboardContent.dashboard;

    // Step 2: Collect filters
    const filtersData = {};
    for (const worksheet of dashboard.worksheets) {
      const filters = await worksheet.getFiltersAsync();
      filters.forEach(filter => {
        filtersData[`${worksheet.name} - ${filter.fieldName}`] = filter.appliedValues.map(v => v.value);
      });
    }

    // Step 3: Collect parameters
    const parameters = await dashboard.getParametersAsync();
    const parametersData = {};
    parameters.forEach(param => {
      parametersData[param.name] = param.currentValue.value;
    });

    // Step 4: Get summary data from a specific worksheet
    const targetWorksheetName = "Drivers (Viz)"; // ✅ CHANGE this if needed
    const worksheet = dashboard.worksheets.find(ws => ws.name === targetWorksheetName);
    const summaryData = await worksheet.getSummaryDataAsync();

    // Convert summary data to JSON
    const sheetData = [];
    summaryData.data.forEach(row => {
      const rowObj = {};
      row.forEach((cell, i) => {
        const colName = summaryData.columns[i].fieldName;
        rowObj[colName] = cell.formattedValue;
      });
      sheetData.push(rowObj);
    });

    // Step 5: Send all data to backend
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        filters: filtersData,
        parameters: parametersData,
        sheetData: sheetData,  // ✅ Now sending worksheet data
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
