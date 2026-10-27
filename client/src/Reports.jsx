import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import { downloadCsv } from "./download";
import {
  engagementRows,
  participantRows,
  programPerformanceRows,
  summarizeParticipants,
} from "./reportData";

const HISTORY_KEY = "reportHistory";
const MAX_HISTORY = 10;

const REPORT_TYPES = {
  engagement: {
    name: "Engagement Report",
    type: "Engagement",
    icon: "📊",
    description: "Every engagement record with attendance and scores.",
  },
  participants: {
    name: "Participant Report",
    type: "Participants",
    icon: "👥",
    description: "Each participant's programs, attendance and engagement.",
  },
  programs: {
    name: "Program Performance",
    type: "Performance",
    icon: "🎯",
    description: "Compare engagement, satisfaction and attendance per program.",
  },
};

// Report history is a per-browser convenience; storage may be unavailable
const loadHistory = () => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY));
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
};

const saveHistory = (history) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // Ignore: history is optional
  }
};

function Reports() {
  const [summary, setSummary] = useState(null);
  const [engagements, setEngagements] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(loadHistory);

  // =========================
  // LOAD REPORT DATA
  // =========================
  useEffect(() => {
    let ignore = false;

    Promise.all([
      apiFetch("/api/analytics/summary"),
      apiFetch("/api/engagements"),
    ])
      .then(([summaryData, engagementData]) => {
        if (!ignore) {
          setSummary(summaryData);
          setEngagements(engagementData);
        }
      })
      .catch((fetchError) => {
        console.error("Error fetching report data:", fetchError);

        if (!ignore) {
          setError(fetchError.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const ready = Boolean(summary && engagements);

  // =========================
  // GENERATE A REPORT
  // =========================
  const generateReport = (key) => {
    if (!ready) {
      return;
    }

    const rows =
      key === "engagement"
        ? engagementRows(engagements)
        : key === "participants"
          ? participantRows(engagements)
          : programPerformanceRows(summary.programs);

    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`community-connect-${key}-${date}.csv`, rows);

    const entry = {
      id: `${Date.now()}`,
      key,
      generatedAt: new Date().toISOString(),
      rows: rows.length - 1,
    };

    const updatedHistory = [entry, ...history].slice(0, MAX_HISTORY);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  return (
    <div className="reports-page">

      {/* TOP BAR */}
      <header className="topbar">

        <div className="breadcrumb">
          <span>Community Connect</span>
          <b>/</b>
          <strong>Reports</strong>
        </div>

        <div className="top-actions">

          <button className="icon-button">
            🔔
          </button>

        </div>

      </header>


      {/* PAGE HEADER */}
      <section className="page-header">

        <div>

          <p className="eyebrow">
            REPORTING
          </p>

          <h1>
            Reports
          </h1>

          <p className="subtitle">
            Generate and download reports for your community programs.
          </p>

        </div>

        <button
          className="primary-btn"
          onClick={() => generateReport("engagement")}
          disabled={!ready}
        >
          + Generate Report
        </button>

      </section>

      {error && (
        <div className="login-message" role="alert">
          Could not load report data: {error}
        </div>
      )}


      {/* REPORT SUMMARY */}
      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon purple">
            ▤
          </div>

          <p>Reports Generated</p>

          <h2>{history.length}</h2>

          <span className="stat-footer">
            Recent reports in this browser
          </span>

        </div>

        <div className="stat-card">

          <div className="stat-icon blue">
            ◈
          </div>

          <p>Engagement Records</p>

          <h2>{engagements ? engagements.length : "—"}</h2>

          <span className="stat-footer">
            Included in the engagement report
          </span>

        </div>

        <div className="stat-card">

          <div className="stat-icon green">
            ♙
          </div>

          <p>Participants</p>

          <h2>
            {engagements ? summarizeParticipants(engagements).length : "—"}
          </h2>

          <span className="stat-footer">
            Included in the participant report
          </span>

        </div>

        <div className="stat-card">

          <div className="stat-icon orange">
            🎯
          </div>

          <p>Programs</p>

          <h2>{summary ? summary.totals.programs : "—"}</h2>

          <span className="stat-footer">
            Included in the performance report
          </span>

        </div>

      </section>


      {/* QUICK REPORTS */}
      <section className="quick-reports">

        {Object.entries(REPORT_TYPES).map(([key, report]) => (
          <div className="panel quick-report-card" key={key}>

            <div className="report-icon">
              {report.icon}
            </div>

            <div>
              <h3>{report.name}</h3>

              <p>
                {report.description}
              </p>
            </div>

            <button
              className="secondary-btn"
              onClick={() => generateReport(key)}
              disabled={!ready}
            >
              Generate
            </button>

          </div>
        ))}

      </section>


      {/* REPORT TABLE */}
      <section className="panel reports-panel">

        <div className="panel-header">

          <div>
            <h3>
              Recent Reports
            </h3>

            <p>
              Reports downloaded from this browser. Download again for the latest data.
            </p>
          </div>

          <button
            className="secondary-btn"
            onClick={clearHistory}
            disabled={history.length === 0}
          >
            Clear
          </button>

        </div>

        <div className="reports-table">

          <table>

            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Generated On</th>
                <th>Rows</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {history.length === 0 ? (
                <tr>
                  <td colSpan={5}>No reports generated yet.</td>
                </tr>
              ) : (
                history
                  .filter((entry) => REPORT_TYPES[entry.key])
                  .map((entry) => (

                    <tr key={entry.id}>

                      <td>
                        <div className="report-name">

                          <div className="report-file-icon">
                            ▤
                          </div>

                          <strong>
                            {REPORT_TYPES[entry.key].name}
                          </strong>

                        </div>
                      </td>

                      <td>
                        {REPORT_TYPES[entry.key].type}
                      </td>

                      <td>
                        {new Date(entry.generatedAt).toLocaleString()}
                      </td>

                      <td>
                        {entry.rows}
                      </td>

                      <td>
                        <div className="report-actions">

                          <button
                            className="table-action"
                            onClick={() => generateReport(entry.key)}
                            disabled={!ready}
                            aria-label="Download again"
                          >
                            ↓
                          </button>

                        </div>
                      </td>

                    </tr>

                  ))
              )}

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

export default Reports;
