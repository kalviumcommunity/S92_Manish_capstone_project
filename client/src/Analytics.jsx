import { useEffect, useState } from "react";
import { apiFetch } from "./api";

// Chart area is drawn in a 600 x 220 SVG viewBox (score 0-100)
const CHART_WIDTH = 600;
const CHART_HEIGHT = 220;

const toY = (score) => CHART_HEIGHT - (score / 100) * CHART_HEIGHT;

// Line path through the months that have data (gaps where there is none)
const buildTrendPath = (trend) => {
  const step = trend.length > 1 ? CHART_WIDTH / (trend.length - 1) : 0;
  let path = "";
  let drawing = false;

  trend.forEach((month, index) => {
    if (month.averageEngagement === null) {
      drawing = false;
      return;
    }

    const command = drawing ? "L" : "M";
    path += `${command}${index * step} ${toY(month.averageEngagement)} `;
    drawing = true;
  });

  return path.trim();
};

const formatValue = (value, suffix = "") =>
  value === null || value === undefined ? "—" : `${value}${suffix}`;

// Let the browser save the program statistics as a CSV file
const exportCsv = (programs) => {
  const header = [
    "Program",
    "Category",
    "Status",
    "Participants",
    "Average Engagement",
    "Average Satisfaction",
    "Attendance Rate (%)",
  ];

  const rows = programs.map((program) => [
    program.name,
    program.category,
    program.status,
    program.participants,
    program.averageEngagement ?? "",
    program.averageSatisfaction ?? "",
    program.attendanceRate ?? "",
  ]);

  const csv = [header, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");

  link.href = url;
  link.download = "community-connect-analytics.csv";
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

function Analytics() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  const [insights, setInsights] = useState(null);
  const [insightsError, setInsightsError] = useState("");
  const [generating, setGenerating] = useState(false);

  // =========================
  // LOAD ANALYTICS
  // =========================
  useEffect(() => {
    let ignore = false;

    apiFetch("/api/analytics/summary")
      .then((data) => {
        if (!ignore) {
          setSummary(data);
        }
      })
      .catch((fetchError) => {
        console.error("Error fetching analytics:", fetchError);

        if (!ignore) {
          setError(fetchError.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // =========================
  // GENERATE AI INSIGHTS
  // =========================
  const handleGenerateInsights = async () => {
    setGenerating(true);
    setInsightsError("");

    try {
      const data = await apiFetch("/api/ai/insights", { method: "POST" });
      setInsights(data);
    } catch (generateError) {
      setInsightsError(generateError.message);
    } finally {
      setGenerating(false);
    }
  };

  const totals = summary?.totals;
  const trend = summary?.trend || [];
  const lastPoint = [...trend]
    .map((month, index) => ({ ...month, index }))
    .reverse()
    .find((month) => month.averageEngagement !== null);
  const trendStep = trend.length > 1 ? CHART_WIDTH / (trend.length - 1) : 0;

  return (
    <div className="analytics-page">

      {/* TOP BAR */}
      <header className="topbar">
        <div className="breadcrumb">
          <span>Community Connect</span>
          <b>/</b>
          <strong>Analytics</strong>
        </div>

        <div className="top-actions">
          <button className="icon-button">🔔</button>
        </div>
      </header>

      {/* PAGE HEADER */}
      <section className="page-header">
        <div>
          <p className="eyebrow">INSIGHTS</p>

          <h1>Analytics</h1>

          <p className="subtitle">
            Understand program performance and participant engagement.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={() => exportCsv(summary.programs)}
          disabled={!summary || summary.programs.length === 0}
        >
          ↓ Export Analytics
        </button>
      </section>

      {error && (
        <div className="login-message" role="alert">
          Could not load analytics: {error}
        </div>
      )}

      {/* KPI CARDS */}
      <section className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon purple">◈</div>

          <p>Overall Engagement</p>

          <h2>
            {formatValue(totals?.averageEngagement)}
            <span className="out-of">/100</span>
          </h2>

          <span className="stat-footer">
            Average engagement score
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">♙</div>

          <p>Total Participants</p>

          <h2>{formatValue(totals?.participants)}</h2>

          <span className="stat-footer">
            Across all programs
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">★</div>

          <p>Average Satisfaction</p>

          <h2>
            {formatValue(totals?.averageSatisfaction)}
            <span className="out-of">/5</span>
          </h2>

          <span className="stat-footer">
            Attendance rate {formatValue(totals?.attendanceRate, "%")}
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">▣</div>

          <p>Programs Analyzed</p>

          <h2>{formatValue(totals?.programs)}</h2>

          <span className="stat-footer">
            {formatValue(totals?.activePrograms)} active
          </span>
        </div>

      </section>

      {/* AI INSIGHTS */}
      <section className="panel ai-panel">

        <div className="panel-header">
          <div>
            <h3>✨ AI Insights</h3>

            <p>
              Summary and suggestions generated from your engagement data
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={handleGenerateInsights}
            disabled={generating || !totals || totals.programs === 0}
          >
            {generating
              ? "Generating..."
              : insights
                ? "Regenerate"
                : "Generate Insights"}
          </button>
        </div>

        {insightsError && (
          <div className="login-message" role="alert">
            {insightsError}
          </div>
        )}

        {!insights && !insightsError && (
          <p className="ai-placeholder">
            {totals && totals.programs === 0
              ? "Add programs and engagement data to generate insights."
              : "Click Generate Insights to analyse your programs."}
          </p>
        )}

        {insights && (
          <div className="ai-result">
            <p className="ai-summary">{insights.summary}</p>

            <div className="ai-columns">
              {[
                ["Highlights", insights.highlights, "positive"],
                ["Concerns", insights.concerns, "warning"],
                ["Recommendations", insights.recommendations, "info"],
              ].map(([title, items, tone]) => (
                <div className={`ai-column ${tone}`} key={title}>
                  <h4>{title}</h4>

                  {items.length > 0 ? (
                    <ul>
                      {items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Nothing to report.</p>
                  )}
                </div>
              ))}
            </div>

            <small className="ai-footnote">
              Generated by {insights.model} on{" "}
              {new Date(insights.generatedAt).toLocaleString()}. AI can
              make mistakes; check important figures.
            </small>
          </div>
        )}

      </section>

      {/* ENGAGEMENT TREND */}
      <section className="analytics-grid">

        <div className="panel engagement-panel">

          <div className="panel-header">
            <div>
              <h3>Engagement Trend</h3>

              <p>
                Average engagement score over the last 6 months
              </p>
            </div>
          </div>

          <div className="analytics-chart">

            <div className="chart-values">
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>

            <div className="chart-body">

              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>

              <svg
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                preserveAspectRatio="none"
                className="analytics-line-chart"
              >
                <path
                  className="analytics-line"
                  d={buildTrendPath(trend)}
                />

                {lastPoint && (
                  <circle
                    cx={lastPoint.index * trendStep}
                    cy={toY(lastPoint.averageEngagement)}
                    r="5"
                  />
                )}
              </svg>

              <div className="analytics-months">
                {trend.map((month) => (
                  <span key={month.month}>{month.label}</span>
                ))}
              </div>

            </div>

          </div>

        </div>

        {/* ENGAGEMENT BY CATEGORY */}
        <div className="panel">

          <div className="panel-header">
            <div>
              <h3>Engagement by Category</h3>

              <p>
                Average score
              </p>
            </div>
          </div>

          <div className="category-bars">

            {summary && summary.categories.length === 0 && (
              <p className="ai-placeholder">No categories yet.</p>
            )}

            {summary?.categories.map((category) => (
              <div className="analytics-category" key={category.category}>
                <div>
                  <span>{category.category}</span>
                  <strong>{formatValue(category.averageEngagement)}</strong>
                </div>

                <div className="analytics-bar">
                  <div
                    style={{ width: `${category.averageEngagement || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* PROGRAM PERFORMANCE */}
      <section className="panel analytics-program-panel">

        <div className="panel-header">

          <div>
            <h3>Program Performance</h3>

            <p>
              Compare engagement across your programs
            </p>
          </div>

        </div>

        <div className="analytics-program-list">

          {summary && summary.programs.length === 0 && (
            <p className="ai-placeholder">No programs yet.</p>
          )}

          {summary?.programs.map((program, index) => (

            <div
              className="analytics-program"
              key={program.id}
            >

              <div className="analytics-program-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="analytics-program-info">
                <strong>{program.name}</strong>
                <span>
                  {program.participants} participants · {program.category}
                </span>
              </div>

              <div className="analytics-score">

                <strong>{formatValue(program.averageEngagement)}</strong>

                <span>/100</span>

                <div className="score-bar">
                  <div
                    style={{
                      width: `${program.averageEngagement || 0}%`,
                    }}
                  ></div>
                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}

export default Analytics;
