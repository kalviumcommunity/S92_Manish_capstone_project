import React from "react";

function Analytics() {
  const programs = [
    {
      name: "Community Garden",
      participants: 45,
      engagement: 95,
    },
    {
      name: "Digital Literacy",
      participants: 86,
      engagement: 92,
    },
    {
      name: "Youth Coding Club",
      participants: 124,
      engagement: 88,
    },
    {
      name: "Sports & Wellness",
      participants: 210,
      engagement: 82,
    },
  ];

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

          <button className="date-button">
            ▣ Sep 2026
            <b>⌄</b>
          </button>
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

        <button className="secondary-btn">
          ↓ Export Analytics
        </button>
      </section>

      {/* KPI CARDS */}
      <section className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon purple">◈</div>

          <p>Overall Engagement</p>

          <h2>
            78<span className="out-of">/100</span>
          </h2>

          <span className="stat-footer">
            +8.4% from last quarter
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">♙</div>

          <p>Total Participants</p>

          <h2>1,245</h2>

          <span className="stat-footer">
            Across all programs
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">★</div>

          <p>Average Satisfaction</p>

          <h2>92%</h2>

          <span className="stat-footer">
            Based on participant feedback
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">▣</div>

          <p>Programs Analyzed</p>

          <h2>14</h2>

          <span className="stat-footer">
            Active and completed
          </span>
        </div>

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

            <select>
              <option>Last 6 months</option>
              <option>This year</option>
            </select>
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
                viewBox="0 0 600 220"
                preserveAspectRatio="none"
                className="analytics-line-chart"
              >
                <path
                  className="analytics-line"
                  d="
                    M0 165
                    C60 155 90 145 120 150
                    C170 158 190 115 230 120
                    C270 125 290 95 330 100
                    C370 105 395 70 430 78
                    C470 85 510 55 540 62
                    C565 68 580 45 600 40
                  "
                />

                <circle
                  cx="600"
                  cy="40"
                  r="5"
                />
              </svg>

              <div className="analytics-months">
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
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

            <div className="analytics-category">
              <div>
                <span>Education</span>
                <strong>94</strong>
              </div>

              <div className="analytics-bar">
                <div style={{ width: "94%" }}></div>
              </div>
            </div>

            <div className="analytics-category">
              <div>
                <span>Technology</span>
                <strong>92</strong>
              </div>

              <div className="analytics-bar">
                <div style={{ width: "92%" }}></div>
              </div>
            </div>

            <div className="analytics-category">
              <div>
                <span>Environment</span>
                <strong>95</strong>
              </div>

              <div className="analytics-bar">
                <div style={{ width: "95%" }}></div>
              </div>
            </div>

            <div className="analytics-category">
              <div>
                <span>Sports</span>
                <strong>82</strong>
              </div>

              <div className="analytics-bar">
                <div style={{ width: "82%" }}></div>
              </div>
            </div>

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

          <button className="view-all">
            View all →
          </button>

        </div>

        <div className="analytics-program-list">

          {programs.map((program, index) => (

            <div
              className="analytics-program"
              key={index}
            >

              <div className="analytics-program-number">
                0{index + 1}
              </div>

              <div className="analytics-program-info">
                <strong>{program.name}</strong>
                <span>
                  {program.participants} participants
                </span>
              </div>

              <div className="analytics-score">

                <strong>{program.engagement}</strong>

                <span>/100</span>

                <div className="score-bar">
                  <div
                    style={{
                      width: `${program.engagement}%`,
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