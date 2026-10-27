import { useEffect, useState } from "react";
import { API_URL, apiFetch, authHeaders } from "./api";
import { downloadBlob, downloadCsv } from "./download";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // must match the server limit

const TEMPLATE_ROWS = [
  [
    "Participant Name",
    "Email",
    "Program",
    "Sessions Attended",
    "Total Sessions",
    "Engagement Score",
    "Satisfaction Score",
    "Feedback",
  ],
  [
    "Arun Kumar",
    "arun@example.com",
    "Youth Coding Club",
    "11",
    "12",
    "88",
    "5",
    "Loved the projects",
  ],
  [
    "Priya Sharma",
    "priya@example.com",
    "Digital Literacy",
    "9",
    "10",
    "92",
    "4",
    "",
  ],
];

const formatSize = (bytes) =>
  bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;

function UploadData() {
  const [file, setFile] = useState(null);
  const [inputKey, setInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [uploads, setUploads] = useState([]);

  // =========================
  // LOAD UPLOAD HISTORY
  // =========================
  useEffect(() => {
    let ignore = false;

    apiFetch("/api/uploads")
      .then((data) => {
        if (!ignore) {
          setUploads(Array.isArray(data) ? data : []);
        }
      })
      .catch((fetchError) => {
        console.error("Error fetching uploads:", fetchError);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!/\.csv$/i.test(selectedFile.name)) {
      setFile(null);
      setError("Only .csv files are allowed");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("File must be 2 MB or smaller");
      return;
    }

    setFile(selectedFile);
  };

  // =========================
  // UPLOAD FILE
  // =========================
  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a CSV file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const data = await apiFetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      setResult(data);
      setUploads((previousUploads) => [
        data.upload,
        ...previousUploads,
      ]);

      // Clear the file input
      setFile(null);
      setInputKey((key) => key + 1);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // DOWNLOAD / DELETE UPLOAD
  // =========================
  const handleDownload = async (upload) => {
    try {
      const response = await fetch(
        `${API_URL}/api/uploads/${upload.id}/download`,
        { headers: authHeaders() }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      downloadBlob(await response.blob(), upload.originalName);
    } catch (downloadError) {
      alert(downloadError.message);
    }
  };

  const handleDelete = async (upload) => {
    const confirmDelete = window.confirm(
      `Delete "${upload.originalName}"? Imported records are kept.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiFetch(`/api/uploads/${upload.id}`, {
        method: "DELETE",
      });

      setUploads((previousUploads) =>
        previousUploads.filter((item) => item.id !== upload.id)
      );
    } catch (deleteError) {
      alert(`Delete failed: ${deleteError.message}`);
    }
  };

  const handleDownloadTemplate = () => {
    downloadCsv("community-connect-template.csv", TEMPLATE_ROWS);
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
            Upload a CSV file (up to 2 MB) containing engagement data.
          </p>

          <label className="upload-box">

            <input
              key={inputKey}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
            />

            <div className="upload-cloud">
              ☁
            </div>

            <strong>
              {file
                ? file.name
                : "Click to choose a file"}
            </strong>

            <span>
              CSV files only
            </span>

          </label>

          {file && (
            <div className="selected-file">
              <span>✓</span>

              <div>
                <strong>{file.name}</strong>
                <small>{formatSize(file.size)} · ready to upload</small>
              </div>
            </div>
          )}

          {error && (
            <div className="login-message" role="alert">
              {error}
            </div>
          )}

          {result && (
            <div className="upload-result" role="status">
              <strong>{result.message}</strong>

              {result.errors.length > 0 && (
                <ul>
                  {result.errors.map((rowError) => (
                    <li key={rowError.row}>
                      Row {rowError.row}: {rowError.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            className="primary-btn upload-button"
            onClick={handleUpload}
            disabled={uploading || !file}
          >
            {uploading ? "Uploading..." : "↑ Upload Data"}
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
              <strong>Create the programs first</strong>

              <span>
                The Program column must match an existing program name.
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
                Participant name, email and program are required on every row.
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
                New participants are created; existing records are updated.
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* UPLOAD HISTORY */}
      <section className="panel data-format-panel">

        <div className="panel-header">

          <div>
            <h3>
              Upload History
            </h3>

            <p>
              Files that have been uploaded to Community Connect.
            </p>
          </div>

        </div>

        <div className="format-table">

          <table>

            <thead>
              <tr>
                <th>File</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Rows</th>
                <th>Imported</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {uploads.length === 0 ? (
                <tr>
                  <td colSpan={6}>No files uploaded yet.</td>
                </tr>
              ) : (
                uploads.map((upload) => (
                  <tr key={upload.id}>
                    <td>
                      {upload.originalName}
                      <small className="upload-size">
                        {formatSize(upload.size)}
                      </small>
                    </td>
                    <td>
                      {upload.uploadedBy?.name ||
                        upload.uploadedBy?.username ||
                        "Unknown"}
                    </td>
                    <td>
                      {new Date(upload.createdAt).toLocaleDateString()}
                    </td>
                    <td>{upload.rowCount}</td>
                    <td>{upload.importedCount}</td>
                    <td className="upload-actions">
                      <button
                        className="secondary-btn"
                        onClick={() => handleDownload(upload)}
                      >
                        ↓ Download
                      </button>

                      <button
                        className="secondary-btn"
                        onClick={() => handleDelete(upload)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}

            </tbody>

          </table>

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
              Columns read from your CSV file. Name, Email and Program are required.
            </p>
          </div>

          <button
            className="secondary-btn"
            onClick={handleDownloadTemplate}
          >
            ↓ Download Template
          </button>

        </div>

        <div className="format-table">

          <table>

            <thead>
              <tr>
                {TEMPLATE_ROWS[0].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>

              {TEMPLATE_ROWS.slice(1).map((row) => (
                <tr key={row[1]}>
                  {row.map((cell, index) => (
                    <td key={index}>{cell}</td>
                  ))}
                </tr>
              ))}

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
