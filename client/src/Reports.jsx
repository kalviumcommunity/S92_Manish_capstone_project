import React from "react";

function Reports() {
  const reports = [
    {
      name: "Monthly Engagement Report",
      type: "Engagement",
      date: "Sep 01, 2026",
      status: "Ready",
    },
    {
      name: "Program Performance Report",
      type: "Performance",
      date: "Aug 30, 2026",
      status: "Ready",
    },
    {
      name: "Participant Activity Report",
      type: "Participants",
      date: "Aug 28, 2026",
      status: "Ready",
    },
    {
      name: "Community Satisfaction Report",
      type: "Feedback",
      date: "Aug 25, 2026",
      status: "Ready",
    },
  ];

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
            REPORTING
          </p>

          <h1>
            Reports
          </h1>

          <p className="subtitle">
            Generate and manage reports for your community programs.
          </p>

        </div>

        <button className="primary-btn">
          + Generate Report
        </button>

      </section>


      {/* REPORT SUMMARY */}
      <section className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon purple">
            ▤
          </div>

          <p>Total Reports</p>

          <h2>24</h2>

          <span className="stat-footer">
            Generated this year
          </span>

        </div>


        <div className="stat-card">

          <div className="stat-icon blue">
            ◈
          </div>

          <p>Engagement Reports</p>

          <h2>8</h2>

          <span className="stat-footer">
            Program engagement analysis
          </span>

        </div>


        <div className="stat-card">

          <div className="stat-icon green">
            ✓
          </div>

          <p>Completed Reports</p>

          <h2>21</h2>

          <span className="stat-footer">
            Ready to view or download
          </span>

        </div>


        <div className="stat-card">

          <div className="stat-icon orange">
            ⏱
          </div>

          <p>Pending Reports</p>

          <h2>3</h2>

          <span className="stat-footer">
            Currently being generated
          </span>

        </div>

      </section>


      {/* QUICK REPORTS */}
      <section className="quick-reports">

        <div className="panel quick-report-card">

          <div className="report-icon">
            📊
          </div>

          <div>
            <h3>Engagement Report</h3>

            <p>
              Analyze participant engagement across programs.
            </p>
          </div>

          <button className="secondary-btn">
            Generate
          </button>

        </div>


        <div className="panel quick-report-card">

          <div className="report-icon">
            👥
          </div>

          <div>
            <h3>Participant Report</h3>

            <p>
              View participant activity and attendance data.
            </p>
          </div>

          <button className="secondary-btn">
            Generate
          </button>

        </div>


        <div className="panel quick-report-card">

          <div className="report-icon">
            🎯
          </div>

          <div>
            <h3>Program Performance</h3>

            <p>
              Compare the performance of community programs.
            </p>
          </div>

          <button className="secondary-btn">
            Generate
          </button>

        </div>

      </section>


      {/* REPORT TABLE */}
      <section className="panel reports-panel">

        <div className="panel-header">

          <div>

            <h3>
              Recent Reports
            </h3>

            <p>
              Recently generated community reports
            </p>

          </div>

          <button className="secondary-btn">
            Filter
          </button>

        </div>


        <div className="reports-table">

          <table>

            <thead>

              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Generated On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>

              {reports.map((report, index) => (

                <tr key={index}>

                  <td>
                    <div className="report-name">

                      <div className="report-file-icon">
                        ▤
                      </div>

                      <strong>
                        {report.name}
                      </strong>

                    </div>
                  </td>

                  <td>
                    {report.type}
                  </td>

                  <td>
                    {report.date}
                  </td>

                  <td>

                    <span className="report-ready">
                      ● {report.status}
                    </span>

                  </td>

                  <td>

                    <div className="report-actions">

                      <button className="table-action">
                        View
                      </button>

                      <button className="table-action">
                        ↓
                      </button>

                    </div>

                  </td>

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

export default Reports;