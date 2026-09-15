import React from "react";

function Participants() {
  const participants = [
    {
      id: "P001",
      name: "Arun Kumar",
      email: "arun@example.com",
      program: "Youth Coding Club",
      status: "Active",
      attendance: "92%",
    },
    {
      id: "P002",
      name: "Priya Sharma",
      email: "priya@example.com",
      program: "Digital Literacy",
      status: "Active",
      attendance: "88%",
    },
    {
      id: "P003",
      name: "Rahul Raj",
      email: "rahul@example.com",
      program: "Community Garden",
      status: "Active",
      attendance: "95%",
    },
    {
      id: "P004",
      name: "Divya S",
      email: "divya@example.com",
      program: "Sports & Wellness",
      status: "Inactive",
      attendance: "72%",
    },
    {
      id: "P005",
      name: "Karthik M",
      email: "karthik@example.com",
      program: "Youth Coding Club",
      status: "Active",
      attendance: "90%",
    },
  ];

  return (
    <div className="participants-page">

      {/* TOP BAR */}
      <header className="topbar">
        <div className="breadcrumb">
          <span>Community Connect</span>
          <b>/</b>
          <strong>Participants</strong>
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
          <p className="eyebrow">COMMUNITY</p>

          <h1>Participants</h1>

          <p className="subtitle">
            Manage and monitor participants across community programs.
          </p>
        </div>

        <button className="primary-btn">
          + Add Participant
        </button>
      </section>

      {/* STAT CARDS */}
      <section className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon purple">
            ♙
          </div>

          <p>Total Participants</p>

          <h2>1,245</h2>

          <span className="stat-footer">
            Registered participants
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            ✓
          </div>

          <p>Active Participants</p>

          <h2>1,108</h2>

          <span className="stat-footer">
            Currently participating
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            ◈
          </div>

          <p>Average Attendance</p>

          <h2>89%</h2>

          <span className="stat-footer">
            Across all programs
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            ★
          </div>

          <p>New This Month</p>

          <h2>86</h2>

          <span className="stat-footer">
            New registrations
          </span>
        </div>

      </section>

      {/* PARTICIPANT TABLE */}
      <section className="panel participants-panel">

        <div className="panel-header">

          <div>
            <h3>All Participants</h3>

            <p>
              View participant information and activity
            </p>
          </div>

          <div className="participant-actions">

            <input
              type="text"
              placeholder="Search participants..."
              className="search-input"
            />

            <button className="secondary-btn">
              Filter
            </button>

          </div>

        </div>

        <div className="participant-table">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Participant</th>
                <th>Program</th>
                <th>Status</th>
                <th>Attendance</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {participants.map((participant) => (

                <tr key={participant.id}>

                  <td>
                    <strong>{participant.id}</strong>
                  </td>

                  <td>
                    <div className="participant-info">

                      <div className="participant-avatar">
                        {participant.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .slice(0, 2)}
                      </div>

                      <div>
                        <strong>{participant.name}</strong>

                        <span>
                          {participant.email}
                        </span>
                      </div>

                    </div>
                  </td>

                  <td>
                    {participant.program}
                  </td>

                  <td>
                    <span
                      className={`status ${
                        participant.status.toLowerCase()
                      }`}
                    >
                      {participant.status}
                    </span>
                  </td>

                  <td>
                    <div className="attendance">

                      <strong>
                        {participant.attendance}
                      </strong>

                      <div className="attendance-bar">
                        <div
                          style={{
                            width: participant.attendance,
                          }}
                        ></div>
                      </div>

                    </div>
                  </td>

                  <td>
                    <button className="table-action">
                      View
                    </button>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default Participants;