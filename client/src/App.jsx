import React, { useState } from "react";
import "./App.css";

import Login from "./components/login";
import Programs from "./Programs";
import Participants from "./Participants";
import Analytics from "./Analytics";
import Reports from "./Reports";
import UploadData from "./upload";
import HelpCenter from "./HelpCenter";

function App() {
  // =========================================================
  // AUTHENTICATION
  // =========================================================

  // IMPORTANT:
  // Login is now based on JWT token, not only username.
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  // =========================================================
  // APP STATE
  // =========================================================

  const [activePage, setActivePage] = useState("Dashboard");
  const [showHelp, setShowHelp] = useState(false);

  // =========================================================
  // LOGIN SUCCESS
  // =========================================================

  const handleLogin = () => {
    setIsLoggedIn(true);
    setActivePage("Dashboard");
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    // Remove all authentication information
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user");

    // Return to login page
    setIsLoggedIn(false);
    setActivePage("Dashboard");
  };

  // =========================================================
  // LOGIN PAGE
  // =========================================================

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const loggedInUsername =
    localStorage.getItem("username") || "Admin";

  // =========================================================
  // DASHBOARD DATA
  // =========================================================

  const programs = [
    {
      name: "Youth Coding Club",
      category: "Education",
      participants: 124,
      score: 88,
      status: "Active",
    },
    {
      name: "Digital Literacy",
      category: "Technology",
      participants: 86,
      score: 92,
      status: "Active",
    },
    {
      name: "Community Garden",
      category: "Environment",
      participants: 45,
      score: 95,
      status: "Active",
    },
    {
      name: "Sports & Wellness",
      category: "Sports",
      participants: 210,
      score: 82,
      status: "Completed",
    },
  ];

  const activities = [
    {
      icon: "👥",
      title: "New participants joined",
      text: "Youth Coding Club received 18 new participants",
      time: "12 min ago",
    },
    {
      icon: "📊",
      title: "Engagement report updated",
      text: "Monthly engagement data has been processed",
      time: "1 hour ago",
    },
    {
      icon: "🎯",
      title: "Program target achieved",
      text: "Community Garden crossed its participation target",
      time: "3 hours ago",
    },
    {
      icon: "⭐",
      title: "High satisfaction score",
      text: "Digital Literacy received 96% satisfaction",
      time: "Yesterday",
    },
  ];

  // =========================================================
  // MAIN APPLICATION
  // =========================================================

  return (
    <div className="app">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        {/* BRAND */}

        <div className="brand">

          <div className="brand-logo">
            CC
          </div>

          <div>
            <h2>Community</h2>
            <span>Connect</span>
          </div>

        </div>

        {/* WORKSPACE */}

        <div className="workspace">
          <span className="workspace-dot"></span>
          Community Analytics
        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="navigation">

          {/* DASHBOARD */}

          <button
            className={
              activePage === "Dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("Dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          {/* PROGRAMS */}

          <button
            className={
              activePage === "Programs"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("Programs")}
          >
            <span>▣</span>
            Programs
            <small>14</small>
          </button>

          {/* PARTICIPANTS */}

          <button
            className={
              activePage === "Participants"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("Participants")}
          >
            <span>♙</span>
            Participants
          </button>

          {/* ANALYTICS */}

          <button
            className={
              activePage === "Analytics"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("Analytics")}
          >
            <span>◩</span>
            Analytics
          </button>

          {/* REPORTS */}

          <button
            className={
              activePage === "Reports"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("Reports")}
          >
            <span>▤</span>
            Reports
          </button>

          {/* UPLOAD DATA */}

          <button
            className={
              activePage === "Upload Data"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage("Upload Data")}
          >
            <span>↑</span>
            Upload Data
          </button>

        </nav>

        {/* ===================================================
            SIDEBAR BOTTOM
        =================================================== */}

        <div className="sidebar-bottom">

          {/* HELP */}

          <div
            className="help-box"
            onClick={() => setShowHelp(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setShowHelp(true);
              }
            }}
          >

            <div className="help-icon">
              ?
            </div>

            <div>
              <strong>Need help?</strong>
              <p>View analytics guide</p>
            </div>

          </div>

          {/* SETTINGS */}

          <button className="nav-item">
            <span>⚙</span>
            Settings
          </button>

          {/* PROFILE */}

          <div className="profile">

            <div className="avatar">
              MA
            </div>

            <div className="profile-info">

              <strong>
                {loggedInUsername}
              </strong>

              <span>
                Community Manager
              </span>

            </div>

            {/* LOGOUT */}

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main">

        {/* ===================================================
            PROGRAMS
        =================================================== */}

        {activePage === "Programs" ? (

          <Programs />

        ) : activePage === "Participants" ? (

          <Participants />

        ) : activePage === "Analytics" ? (

          <Analytics />

        ) : activePage === "Reports" ? (

          <Reports />

        ) : activePage === "Upload Data" ? (

          <UploadData />

        ) : (

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
                  {activePage}
                </strong>

              </div>

              <div className="top-actions">

                <button className="icon-button">
                  🔔
                  <i></i>
                </button>

                <button className="date-button">

                  <span>▣</span>

                  Sep 2026

                  <b>⌄</b>

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
                  Good morning, {loggedInUsername} 👋
                </h1>

                <p className="subtitle">
                  Here's what's happening across your community programs.
                </p>

              </div>

              <div className="header-buttons">

                <button className="secondary-btn">
                  ↓ Export Report
                </button>

                <button className="primary-btn">
                  + Add Program
                </button>

              </div>

            </section>

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

                  <span className="trend positive">
                    +12.5%
                  </span>

                </div>

                <p>
                  Total Participants
                </p>

                <h2>
                  1,245
                </h2>

                <span className="stat-footer">
                  Compared with last quarter
                </span>

                <div className="mini-chart">

                  <span style={{ height: "35%" }}></span>
                  <span style={{ height: "50%" }}></span>
                  <span style={{ height: "42%" }}></span>
                  <span style={{ height: "65%" }}></span>
                  <span style={{ height: "58%" }}></span>
                  <span style={{ height: "78%" }}></span>
                  <span style={{ height: "92%" }}></span>

                </div>

              </div>

              {/* AVERAGE ENGAGEMENT */}

              <div className="stat-card">

                <div className="stat-top">

                  <div className="stat-icon blue">
                    ◈
                  </div>

                  <span className="trend positive">
                    +8.4%
                  </span>

                </div>

                <p>
                  Average Engagement
                </p>

                <h2>
                  78
                  <span className="out-of">
                    /100
                  </span>
                </h2>

                <span className="stat-footer">
                  Based on activity index
                </span>

                <div className="progress">

                  <div
                    style={{
                      width: "78%",
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

                  <span className="trend positive">
                    +3 new
                  </span>

                </div>

                <p>
                  Active Programs
                </p>

                <h2>
                  14
                </h2>

                <span className="stat-footer">
                  4 running · 10 planned
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

                  <span className="trend positive">
                    +2.1%
                  </span>

                </div>

                <p>
                  Participant Satisfaction
                </p>

                <h2>
                  92%
                </h2>

                <span className="stat-footer">
                  From latest survey feedback
                </span>

                <div className="satisfaction">

                  <div className="satisfaction-circle">

                    <span>
                      92
                    </span>

                  </div>

                  <div>

                    <strong>
                      Excellent
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
                      Participant engagement over the last 6 months
                    </p>

                  </div>

                  <select>

                    <option>
                      Last 6 months
                    </option>

                    <option>
                      This year
                    </option>

                    <option>
                      Last year
                    </option>

                  </select>

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
                      viewBox="0 0 600 220"
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

                      <path
                        className="chart-area-fill"
                        d="
                          M0 170
                          C60 160 80 125 120 135
                          C160 145 180 90 220 105
                          C260 120 285 75 320 82
                          C355 90 375 55 410 65
                          C450 78 470 35 505 48
                          C540 62 560 28 600 35
                          L600 220
                          L0 220
                          Z
                        "
                      />

                      <path
                        className="chart-line"
                        d="
                          M0 170
                          C60 160 80 125 120 135
                          C160 145 180 90 220 105
                          C260 120 285 75 320 82
                          C355 90 375 55 410 65
                          C450 78 470 35 505 48
                          C540 62 560 28 600 35
                        "
                      />

                      <circle
                        cx="600"
                        cy="35"
                        r="5"
                      />

                    </svg>

                    <div className="chart-months">

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

              {/* PROGRAM CATEGORIES */}

              <div className="panel category-panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Program Categories
                    </h3>

                    <p>
                      Distribution by participation
                    </p>

                  </div>

                  <button className="more-btn">
                    •••
                  </button>

                </div>

                <div className="donut-container">

                  <div className="donut">

                    <div className="donut-center">

                      <strong>
                        14
                      </strong>

                      <span>
                        Programs
                      </span>

                    </div>

                  </div>

                  <div className="category-list">

                    <div>

                      <span className="category-dot one"></span>

                      <p>
                        Education
                      </p>

                      <strong>
                        38%
                      </strong>

                    </div>

                    <div>

                      <span className="category-dot two"></span>

                      <p>
                        Technology
                      </p>

                      <strong>
                        27%
                      </strong>

                    </div>

                    <div>

                      <span className="category-dot three"></span>

                      <p>
                        Sports
                      </p>

                      <strong>
                        20%
                      </strong>

                    </div>

                    <div>

                      <span className="category-dot four"></span>

                      <p>
                        Other
                      </p>

                      <strong>
                        15%
                      </strong>

                    </div>

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
                    onClick={() => setActivePage("Programs")}
                  >
                    View all →
                  </button>

                </div>

                <div className="program-list">

                  {programs.map((program, index) => (

                    <div
                      className="program-row"
                      key={index}
                    >

                      <div className="program-number">
                        0{index + 1}
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
                            {program.score}
                          </strong>

                          <span>
                            /100
                          </span>

                        </div>

                        <div className="score-bar">

                          <div
                            style={{
                              width: `${program.score}%`,
                            }}
                          ></div>

                        </div>

                      </div>

                      <span
                        className={`status ${program.status.toLowerCase()}`}
                      >
                        {program.status}
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
                      Latest updates
                    </p>

                  </div>

                  <button className="more-btn">
                    •••
                  </button>

                </div>

                <div className="activity-list">

                  {activities.map((activity, index) => (

                    <div
                      className="activity"
                      key={index}
                    >

                      <div className="activity-icon">
                        {activity.icon}
                      </div>

                      <div className="activity-content">

                        <strong>
                          {activity.title}
                        </strong>

                        <p>
                          {activity.text}
                        </p>

                        <span>
                          {activity.time}
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

        )}

      </main>

      {/* =====================================================
          HELP CENTER
      ===================================================== */}

      {showHelp && (
        <HelpCenter
          onClose={() => setShowHelp(false)}
        />
      )}

    </div>
  );
}

export default App;