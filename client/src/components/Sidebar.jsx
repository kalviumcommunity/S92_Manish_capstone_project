function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">

      {/* LOGO */}
      <div className="sidebar-brand">
        <div className="brand-icon">
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


      {/* NAVIGATION */}
      <nav className="sidebar-nav">

        <button
          className={currentPage === "dashboard" ? "active" : ""}
          onClick={() => onNavigate("dashboard")}
        >
          <span className="nav-icon">⌂</span>
          <span>Dashboard</span>
        </button>


        <button
          className={currentPage === "programs" ? "active" : ""}
          onClick={() => onNavigate("programs")}
        >
          <span className="nav-icon">▣</span>
          <span>Programs</span>
          <small>14</small>
        </button>


        <button
          className={currentPage === "participants" ? "active" : ""}
          onClick={() => onNavigate("participants")}
        >
          <span className="nav-icon">♙</span>
          <span>Participants</span>
        </button>


        <button
          className={currentPage === "reports" ? "active" : ""}
          onClick={() => onNavigate("reports")}
        >
          <span className="nav-icon">▤</span>
          <span>Reports</span>
        </button>


        <button
          className={currentPage === "upload" ? "active" : ""}
          onClick={() => onNavigate("upload")}
        >
          <span className="nav-icon">↑</span>
          <span>Upload Data</span>
        </button>


        <button
          className={currentPage === "settings" ? "active" : ""}
          onClick={() => onNavigate("settings")}
        >
          <span className="nav-icon">⚙</span>
          <span>Settings</span>
        </button>

      </nav>


      {/* BOTTOM */}
      <div className="sidebar-bottom">

        <div className="help-card">
          <div className="help-icon">?</div>

          <div>
            <strong>Need help?</strong>
            <p>View analytics guide</p>
          </div>
        </div>


        <div className="sidebar-note">
          <strong>COMMUNITY ENGAGEMENT</strong>

          <p>
            Track and improve your community impact.
          </p>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;