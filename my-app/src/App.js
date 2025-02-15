import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <h2>Upload Sales Report</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>UPLOAD</button>

      {results && (
        <div>
          <h3>Results</h3>
          <p><strong>Target Date:</strong> {results.targetDate}</p>

          {Object.entries(results.timeRanges).map(([range, totals]) => (
            <div key={range}>
              <h4>{range}</h4>
              <p>Gross Sales: {totals.grossSales.toFixed(2)}</p>
              <p>Net Quantity: {totals.netQuantity.toFixed(2)}</p>
            </div>
          ))}

          <button onClick={() => window.open("https://docs.google.com/spreadsheets/", "_blank")}>
            View in Google Sheets
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
