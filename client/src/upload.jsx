import React, { useState } from "react";

function UploadData() {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="upload-page">

      {/* TOP BAR */}
      <header className="topbar">

        <div className="breadcrumb">
          <span>Community Connect</span>
          <b>/</b>
          <strong>Upload Data</strong>
        </div>

        <div className="top-actions">

          <button className="icon-button">
            🔔
          </button>

          <button className="date-button">
            ▣ Sep 2026
            <b>⌄</b>
          </button>

        </div>

      </header>


      {/* PAGE HEADER */}
      <section className="page-header">

        <div>

          <p className="eyebrow">
            DATA MANAGEMENT
          </p>

          <h1>
            Upload Data
          </h1>

          <p className="subtitle">
            Import participant and program data into Community Connect.
          </p>

        </div>

      </section>


      {/* UPLOAD SECTION */}
      <section className="upload-layout">

        {/* UPLOAD CARD */}
        <div className="panel upload-card">

          <div className="upload-icon">
            ↑
          </div>

          <h2>
            Upload your data
          </h2>

          <p>
            Upload a CSV or Excel file containing your community data.
          </p>

          <label className="upload-box">

            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />

            <div className="upload-cloud">
              ☁
            </div>

            <strong>
              {fileName
                ? fileName
                : "Click to choose a file"}
            </strong>

            <span>
              CSV, XLS or XLSX files
            </span>

          </label>

          {fileName && (
            <div className="selected-file">
              <span>✓</span>

              <div>
                <strong>{fileName}</strong>
                <small>File selected successfully</small>
              </div>
            </div>
          )}

          <button className="primary-btn upload-button">
            ↑ Upload Data
          </button>

        </div>


        {/* INFORMATION CARD */}
        <div className="panel upload-info">

          <h3>
            Data Upload Guide
          </h3>

          <p>
            Follow these guidelines when preparing your data.
          </p>

          <div className="guide-item">

            <div className="guide-number">
              1
            </div>

            <div>
              <strong>Prepare your file</strong>

              <span>
                Make sure your data is organized in rows and columns.
              </span>
            </div>

          </div>

          <div className="guide-item">

            <div className="guide-number">
              2
            </div>

            <div>
              <strong>Check required fields</strong>

              <span>
                Include participant name, program and attendance details.
              </span>
            </div>

          </div>

          <div className="guide-item">

            <div className="guide-number">
              3
            </div>

            <div>
              <strong>Upload the file</strong>

              <span>
                Select your prepared CSV or Excel file and upload it.
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* DATA FORMAT */}
      <section className="panel data-format-panel">

        <div className="panel-header">

          <div>
            <h3>
              Supported Data Format
            </h3>

            <p>
              Example fields that can be included in your dataset.
            </p>
          </div>

          <button className="secondary-btn">
            ↓ Download Template
          </button>

        </div>

        <div className="format-table">

          <table>

            <thead>
              <tr>
                <th>Participant Name</th>
                <th>Email</th>
                <th>Program</th>
                <th>Attendance</th>
                <th>Engagement Score</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>Arun Kumar</td>
                <td>arun@example.com</td>
                <td>Youth Coding Club</td>
                <td>92%</td>
                <td>88</td>
              </tr>

              <tr>
                <td>Priya Sharma</td>
                <td>priya@example.com</td>
                <td>Digital Literacy</td>
                <td>88%</td>
                <td>92</td>
              </tr>

            </tbody>

          </table>

        </div>

      </section>


      {/* FOOTER */}
      <footer>

        <span>
          © 2026 Community Connect
        </span>

        <span>
          Community Engagement Analytics System
        </span>

      </footer>

    </div>
  );
}

export default UploadData;