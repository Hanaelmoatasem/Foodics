import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setError(null); // Clear previous errors
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload file.");

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setError("Error uploading file. Please try again.");
      console.error(error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Upload Sales Report</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} style={{ marginLeft: "10px", padding: "5px 10px" }}>
        UPLOAD
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {results && (
        <div style={{ marginTop: "20px" }}>
          <h3>Results</h3>
          <p><strong>Target Date:</strong> {results.targetDate}</p>

          {Object.entries(results.timeRanges).map(([range, totals]) => (
            <div key={range} style={{ borderBottom: "1px solid #ddd", padding: "10px" }}>
              <h4>{range}</h4>
              <p>Gross Sales: ${totals.grossSales.toFixed(2)}</p>
              <p>Net Quantity: {totals.netQuantity}</p>
            </div>
          ))}

          <h3>Total Sales</h3>
          <p><strong>Total Gross Sales:</strong> ${results.totalGrossSales.toFixed(2)}</p>
          <p><strong>Total Net Quantity:</strong> {results.totalNetQuantity}</p>

        </div>
      )}
    </div>
  );
}

export default App;
