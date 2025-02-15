const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const cors = require('cors');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Process Excel file and extract sales data
const processExcel = (filePath) => {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const dateRangeCell = worksheet['B3'] ? worksheet['B3'].v : null;
    let targetDate = dateRangeCell || "Date not found";

    const timeRanges = {
        "08:00 - 13:59": { grossSales: 0, netQuantity: 0 },
        "14:00 - 16:59": { grossSales: 0, netQuantity: 0 },
        "17:00 - 20:59": { grossSales: 0, netQuantity: 0 },
        "21:00 - 00:59": { grossSales: 0, netQuantity: 0 },
    };

    let totalGrossSales = 0;
    let totalNetQuantity = 0;

    const getCellValue = (col, row) => {
        const cell = worksheet[`${col}${row}`];
        return cell !== undefined ? parseFloat(cell.v) || 0 : null;
    };

    for (let row = 9; ; row++) {
        const hour = getCellValue('C', row);
        const grossSales = getCellValue('D', row);
        const netQuantity = getCellValue('L', row);

        if (grossSales === null && netQuantity === null) break;

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

    // Calculate total gross sales and net quantity
    for (const range in timeRanges) {
        totalGrossSales += timeRanges[range].grossSales;
        totalNetQuantity += timeRanges[range].netQuantity;
    }

    return { targetDate, timeRanges, totalGrossSales, totalNetQuantity };
};

// Upload route
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const result = processExcel(req.file.path);

    // Delete file after processing
    fs.unlinkSync(req.file.path);

    res.json(result);
});


const PORT = process.env.PORT || 3000; // Use Vercel's default port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 
