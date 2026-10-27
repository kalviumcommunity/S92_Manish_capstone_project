import { useEffect, useState } from "react";
import "./App.css";

import { clearLogin } from "./api";

import Login from "./components/login";
import Dashboard from "./Dashboard";
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

  // Return to the login page when the token is removed
  // (logout button, or the API reported an expired token).
  useEffect(() => {
    const handleSignedOut = () => {
      setIsLoggedIn(false);
      setActivePage("Dashboard");
    };

    window.addEventListener("auth:logout", handleSignedOut);

    return () => {
      window.removeEventListener("auth:logout", handleSignedOut);
    };
  }, []);

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
    // Remove all authentication information.
    // App returns to the login page through the "auth:logout" event.
    clearLogin();
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

  const userInitials = loggedInUsername.slice(0, 2).toUpperCase();

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
              {userInitials}
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

          <Dashboard
            username={loggedInUsername}
            onNavigate={setActivePage}
          />

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