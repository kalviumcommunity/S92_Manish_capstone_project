import { useEffect, useState } from "react";
import { apiFetch } from "./api";

// Colours match .category-dot.one / .two / .three / .four in App.css
const CATEGORY_COLORS = ["#4f75ed", "#7c5cdb", "#38b982", "#dfe5ed"];
const CATEGORY_CLASSES = ["one", "two", "three", "four"];

// Chart area is drawn in a 600 x 220 SVG viewBox (score 0-100)
const CHART_WIDTH = 600;
const CHART_HEIGHT = 220;

const toY = (score) => CHART_HEIGHT - (score / 100) * CHART_HEIGHT;

const formatValue = (value, suffix = "") =>
  value === null || value === undefined ? "—" : `${value}${suffix}`;

const greeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  return hour < 17 ? "Good afternoon" : "Good evening";
};

const timeAgo = (date) => {
  const minutes = Math.round((Date.now() - new Date(date)) / 60000);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  return new Date(date).toLocaleDateString();
};

// Top 3 categories by number of programs, the rest grouped as "Other"
const categoryShares = (categories, totalPrograms) => {
  if (totalPrograms === 0) {
    return [];
  }

  const sorted = [...categories].sort((a, b) => b.programs - a.programs);
  const top = sorted.slice(0, 3);
  const otherPrograms = sorted
    .slice(3)
    .reduce((sum, category) => sum + category.programs, 0);

  const shares = top.map((category) => ({
    name: category.category,
    percent: Math.round((category.programs / totalPrograms) * 100),
  }));

  if (otherPrograms > 0) {
    shares.push({
      name: "Other",
      percent: Math.round((otherPrograms / totalPrograms) * 100),
    });
  }

  return shares;
};

// conic-gradient for the donut chart
const donutBackground = (shares) => {
  if (shares.length === 0) {
    return CATEGORY_COLORS[3];
  }

  let start = 0;

  const stops = shares.map((share, index) => {
    // The last slice always closes the circle (avoids rounding gaps)
    const end = index === shares.length - 1 ? 100 : start + share.percent;
    const stop = `${CATEGORY_COLORS[index]} ${start}% ${end}%`;
    start = end;
    return stop;
  });

  return `conic-gradient(${stops.join(", ")})`;
};

function Dashboard({ username, onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [error, setError] = useState("");

  // =========================
  // LOAD DASHBOARD DATA
  // =========================
  useEffect(() => {
    let ignore = false;

    Promise.all([apiFetch("/api/analytics/summary"), apiFetch("/api/uploads")])
      .then(([summaryData, uploadData]) => {
        if (!ignore) {
          setSummary(summaryData);
          setUploads(uploadData);
        }
      })
      .catch((fetchError) => {
        console.error("Error fetching dashboard:", fetchError);

        if (!ignore) {
          setError(fetchError.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const totals = summary?.totals;
  const trend = summary?.trend || [];
  const topPrograms = (summary?.programs || []).slice(0, 4);
  const shares = categoryShares(summary?.categories || [], totals?.programs || 0);

  // Line through the months that have data
  const step = trend.length > 1 ? CHART_WIDTH / (trend.length - 1) : 0;
  const points = trend
    .map((month, index) => ({ ...month, x: index * step }))
    .filter((month) => month.averageEngagement !== null);
  const linePath = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"}${point.x} ${toY(point.averageEngagement)}`
    )
    .join(" ");
  const areaPath =
    points.length > 1
      ? `${linePath} L${points[points.length - 1].x} ${CHART_HEIGHT} L${points[0].x} ${CHART_HEIGHT} Z`
      : "";
  const lastPoint = points[points.length - 1];

  const satisfactionPercent =
    totals?.averageSatisfaction === null || totals?.averageSatisfaction === undefined
      ? null
      : Math.round((totals.averageSatisfaction / 5) * 100);

  return (
    <>
      {/* =================================================
          TOP BAR
      ================================================= */}

      <header className="topbar">

        <div className="breadcrumb">

          <span>
            Community Connect
          </span>

          <b>/</b>

          <strong>
            Dashboard
          </strong>

        </div>

        <div className="top-actions">

          <button className="icon-button">
            🔔
          </button>

        </div>

      </header>

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="page-header">

        <div>

          <p className="eyebrow">
            OVERVIEW
          </p>

          <h1>
            {greeting()}, {username} 👋
          </h1>

          <p className="subtitle">
            Here's what's happening across your community programs.
          </p>

        </div>

        <div className="header-buttons">

          <button
            className="secondary-btn"
            onClick={() => onNavigate("Reports")}
          >
            ↓ Export Report
          </button>

          <button
            className="primary-btn"
            onClick={() => onNavigate("Programs")}
          >
            + Add Program
          </button>

        </div>

      </section>

      {error && (
        <div className="login-message" role="alert">
          Could not load dashboard: {error}
        </div>
      )}

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="stats-grid">

        {/* TOTAL PARTICIPANTS */}

        <div className="stat-card">

          <div className="stat-top">

            <div className="stat-icon purple">
              ♙
            </div>

          </div>

          <p>
            Total Participants
          </p>

          <h2>
            {formatValue(totals?.participants)}
          </h2>

          <span className="stat-footer">
            {formatValue(totals?.engagements)} engagement records
          </span>

          <div className="mini-chart">

            {trend.map((month) => (
              <span
                key={month.month}
                style={{ height: `${Math.max(month.averageEngagement || 0, 5)}%` }}
                title={`${month.label}: ${formatValue(month.averageEngagement)}`}
              ></span>
            ))}

          </div>

        </div>

        {/* AVERAGE ENGAGEMENT */}

        <div className="stat-card">

          <div className="stat-top">

            <div className="stat-icon blue">
              ◈
            </div>

          </div>

          <p>
            Average Engagement
          </p>

          <h2>
            {formatValue(totals?.averageEngagement)}
            <span className="out-of">
              /100
            </span>
          </h2>

          <span className="stat-footer">
            Attendance rate {formatValue(totals?.attendanceRate, "%")}
          </span>

          <div className="progress">

            <div
              style={{
                width: `${totals?.averageEngagement || 0}%`,
              }}
            ></div>

          </div>

        </div>

        {/* ACTIVE PROGRAMS */}

        <div className="stat-card">

          <div className="stat-top">

            <div className="stat-icon green">
              ▣
            </div>

          </div>

          <p>
            Active Programs
          </p>

          <h2>
            {formatValue(totals?.activePrograms)}
          </h2>

          <span className="stat-footer">
            {formatValue(totals?.programs)} programs in total
          </span>

          <div className="program-dots">

            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>

          </div>

        </div>

        {/* SATISFACTION */}

        <div className="stat-card">

          <div className="stat-top">

            <div className="stat-icon orange">
              ★
            </div>

          </div>

          <p>
            Participant Satisfaction
          </p>

          <h2>
            {formatValue(satisfactionPercent, "%")}
          </h2>

          <span className="stat-footer">
            Average rating {formatValue(totals?.averageSatisfaction)} / 5
          </span>

          <div className="satisfaction">

            <div className="satisfaction-circle">

              <span>
                {formatValue(satisfactionPercent)}
              </span>

            </div>

            <div>

              <strong>
                {satisfactionPercent === null
                  ? "No ratings yet"
                  : satisfactionPercent >= 80
                    ? "Excellent"
                    : satisfactionPercent >= 60
                      ? "Good"
                      : "Needs attention"}
              </strong>

              <small>
                Participant feedback
              </small>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          CHART + CATEGORY
      ================================================= */}

      <section className="analytics-grid">

        {/* ENGAGEMENT CHART */}

        <div className="panel engagement-panel">

          <div className="panel-header">

            <div>

              <h3>
                Engagement Overview
              </h3>

              <p>
                Average engagement score over the last 6 months
              </p>

            </div>

          </div>

          <div className="chart">

            <div className="chart-labels">

              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>

            </div>

            <div className="chart-area">

              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>
              <div className="grid-line"></div>

              <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                preserveAspectRatio="none"
                className="line-chart"
              >

                <defs>

                  <linearGradient
                    id="areaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop offset="0%" />

                    <stop
                      offset="100%"
                      stopOpacity="0"
                    />

                  </linearGradient>

                </defs>

                {areaPath && (
                  <path
                    className="chart-area-fill"
                    d={areaPath}
                  />
                )}

                <path
                  className="chart-line"
                  d={linePath}
                />

                {lastPoint && (
                  <circle
                    cx={lastPoint.x}
                    cy={toY(lastPoint.averageEngagement)}
                    r="5"
                  />
                )}

              </svg>

              <div className="chart-months">

                {trend.map((month) => (
                  <span key={month.month}>{month.label}</span>
                ))}

              </div>

            </div>

          </div>

        </div>

        {/* PROGRAM CATEGORIES */}

        <div className="panel category-panel">

          <div className="panel-header">

            <div>

              <h3>
                Program Categories
              </h3>

              <p>
                Share of programs by category
              </p>

            </div>

          </div>

          <div className="donut-container">

            <div
              className="donut"
              style={{ background: donutBackground(shares) }}
            >

              <div className="donut-center">

                <strong>
                  {formatValue(totals?.programs)}
                </strong>

                <span>
                  Programs
                </span>

              </div>

            </div>

            <div className="category-list">

              {shares.length === 0 && (
                <p>No programs yet</p>
              )}

              {shares.map((share, index) => (
                <div key={share.name}>

                  <span className={`category-dot ${CATEGORY_CLASSES[index]}`}></span>

                  <p>
                    {share.name}
                  </p>

                  <strong>
                    {share.percent}%
                  </strong>

                </div>
              ))}

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          PROGRAMS + ACTIVITY
      ================================================= */}

      <section className="bottom-grid">

        {/* TOP PROGRAMS */}

        <div className="panel programs-panel">

          <div className="panel-header">

            <div>

              <h3>
                Top Performing Programs
              </h3>

              <p>
                Programs with the highest engagement scores
              </p>

            </div>

            <button
              className="view-all"
              onClick={() => onNavigate("Programs")}
            >
              View all →
            </button>

          </div>

          <div className="program-list">

            {summary && topPrograms.length === 0 && (
              <p className="ai-placeholder">
                No programs yet. Create one from the Programs page.
              </p>
            )}

            {topPrograms.map((program, index) => (

              <div
                className="program-row"
                key={program.id}
              >

                <div className="program-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="program-info">

                  <strong>
                    {program.name}
                  </strong>

                  <span>
                    {program.category}
                  </span>

                </div>

                <div className="participants">

                  <strong>
                    {program.participants}
                  </strong>

                  <span>
                    participants
                  </span>

                </div>

                <div className="score">

                  <div className="score-top">

                    <strong>
                      {formatValue(program.averageEngagement)}
                    </strong>

                    <span>
                      /100
                    </span>

                  </div>

                  <div className="score-bar">

                    <div
                      style={{
                        width: `${program.averageEngagement || 0}%`,
                      }}
                    ></div>

                  </div>

                </div>

                <span
                  className={`status ${program.status}`}
                >
                  {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                </span>

              </div>

            ))}

          </div>

        </div>

        {/* RECENT ACTIVITY */}

        <div className="panel activity-panel">

          <div className="panel-header">

            <div>

              <h3>
                Recent Activity
              </h3>

              <p>
                Latest data uploads
              </p>

            </div>

            <button
              className="view-all"
              onClick={() => onNavigate("Upload Data")}
            >
              Upload →
            </button>

          </div>

          <div className="activity-list">

            {uploads.length === 0 && (
              <p className="ai-placeholder">
                No uploads yet.
              </p>
            )}

            {uploads.slice(0, 4).map((upload) => (

              <div
                className="activity"
                key={upload.id}
              >

                <div className="activity-icon">
                  📄
                </div>

                <div className="activity-content">

                  <strong>
                    {upload.originalName}
                  </strong>

                  <p>
                    {upload.importedCount} of {upload.rowCount} rows imported by{" "}
                    {upload.uploadedBy?.name || upload.uploadedBy?.username || "Unknown"}
                  </p>

                  <span>
                    {timeAgo(upload.createdAt)}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer>

        <span>
          © 2026 Community Connect
        </span>

        <span>
          Community Engagement Analytics System
        </span>

      </footer>

    </>
  );
}

export default Dashboard;
