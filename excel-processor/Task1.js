const XLSX = require('xlsx');

// Load the Excel file
const workbook = XLSX.readFile('./Sales by Product Report (1).xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Extract the target date from cell B3
const dateRangeCell = worksheet['B3'] ? worksheet['B3'].v : null;
let targetDate = dateRangeCell || "Date not found"; // Keep date as string

// Initialize totals for each time range
const timeRanges = {
    "08:00 - 13:59": { grossSales: 0, netQuantity: 0 },
    "14:00 - 16:59": { grossSales: 0, netQuantity: 0 },
    "17:00 - 20:59": { grossSales: 0, netQuantity: 0 },
    "21:00 - 00:59": { grossSales: 0, netQuantity: 0 },
};

// Function to get cell value
const getCellValue = (col, row) => {
    const cell = worksheet[`${col}${row}`];
    return cell !== undefined ? parseFloat(cell.v) || 0 : null;
};

// Iterate over rows starting from row 9
for (let row = 9; ; row++) {
    const hour = getCellValue('C', row); // Hour of the day
    const grossSales = getCellValue('D', row);
    const netQuantity = getCellValue('L', row);

    // Stop when both sales and quantity columns are empty (null)
    if (grossSales === null && netQuantity === null) break;

    // Ensure hour is valid
    if (hour !== null) {
        if (hour >= 8 && hour < 14) {
            timeRanges["08:00 - 13:59"].grossSales += grossSales;
            timeRanges["08:00 - 13:59"].netQuantity += netQuantity;
        } else if (hour >= 14 && hour < 17) {
            timeRanges["14:00 - 16:59"].grossSales += grossSales;
            timeRanges["14:00 - 16:59"].netQuantity += netQuantity;
        } else if (hour >= 17 && hour < 21) {
            timeRanges["17:00 - 20:59"].grossSales += grossSales;
            timeRanges["17:00 - 20:59"].netQuantity += netQuantity;
        } else if ((hour >= 21 && hour <= 23) || hour === 0) {
            timeRanges["21:00 - 00:59"].grossSales += grossSales;
            timeRanges["21:00 - 00:59"].netQuantity += netQuantity;
        }
    }
}

// Output the results
console.log(`\nFinal Results:`);
console.log(`Target Date: ${targetDate}`);

for (const [timeRange, totals] of Object.entries(timeRanges)) {
    console.log(`\nTime Range: ${timeRange}`);
    console.log(`  - Gross Sales: ${totals.grossSales.toFixed(2)}`);
    console.log(`  - Net Quantity: ${totals.netQuantity.toFixed(2)}`);
}
