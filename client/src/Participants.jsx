import { useEffect, useState } from "react";
import { apiFetch } from "./api";
import { summarizeParticipants } from "./reportData";

const EMPTY_FORM = {
  name: "",
  email: "",
  program: "",
  sessionsAttended: "",
  totalSessions: "",
  engagementScore: "",
  satisfactionScore: "",
};

// Empty input -> undefined, otherwise a number
const toNumber = (value) => (value === "" ? undefined : Number(value));

const isThisMonth = (date) => {
  const value = new Date(date);
  const now = new Date();

  return (
    value.getFullYear() === now.getFullYear() &&
    value.getMonth() === now.getMonth()
  );
};

function Participants() {
  const [engagements, setEngagements] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    let ignore = false;

    Promise.all([
      apiFetch("/api/engagements"),
      apiFetch("/api/programs"),
      apiFetch("/api/users"),
    ])
      .then(([engagementData, programData, userData]) => {
        if (!ignore) {
          setEngagements(engagementData);
          setPrograms(programData);
          setUsers(userData);
        }
      })
      .catch((fetchError) => {
        console.error("Error fetching participants:", fetchError);

        if (!ignore) {
          setError(fetchError.message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // =========================
  // ADD PARTICIPANT
  // =========================
  const openForm = () => {
    setForm({ ...EMPTY_FORM, program: programs[0]?._id || "" });
    setFormError("");
  };

  const updateField = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const email = form.email.trim().toLowerCase();
    const sessionsAttended = toNumber(form.sessionsAttended);
    const totalSessions = toNumber(form.totalSessions);

    if (!form.name.trim() || !email || !form.program) {
      setFormError("Name, email and program are required");
      return;
    }

    if (
      sessionsAttended !== undefined &&
      totalSessions !== undefined &&
      sessionsAttended > totalSessions
    ) {
      setFormError("Sessions attended cannot exceed total sessions");
      return;
    }

    let user = users.find((item) => item.email === email);

    if (
      user &&
      engagements.some(
        (engagement) =>
          engagement.user?._id === user._id &&
          engagement.program?._id === form.program
      )
    ) {
      setFormError("This participant is already in that program");
      return;
    }

    setSaving(true);

    try {
      // Reuse an existing account with this email, otherwise create one
      if (!user) {
        user = await apiFetch("/api/users", {
          method: "POST",
          body: JSON.stringify({
            name: form.name.trim(),
            email,
            role: "participant",
          }),
        });

        setUsers((previousUsers) => [...previousUsers, user]);
      }

      const engagement = await apiFetch("/api/engagements", {
        method: "POST",
        body: JSON.stringify({
          user: user._id,
          program: form.program,
          sessionsAttended,
          totalSessions,
          engagementScore: toNumber(form.engagementScore),
          satisfactionScore: toNumber(form.satisfactionScore),
          lastAttended: new Date().toISOString(),
        }),
      });

      setEngagements((previousEngagements) => [
        ...previousEngagements,
        engagement,
      ]);
      setForm(null);
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // STATS + FILTERS
  // =========================
  const participants = summarizeParticipants(engagements);

  const totalAttended = participants.reduce((sum, item) => sum + item.attended, 0);
  const totalSessions = participants.reduce((sum, item) => sum + item.total, 0);
  const averageAttendance =
    totalSessions > 0 ? `${Math.round((totalAttended / totalSessions) * 100)}%` : "—";

  const filteredParticipants = participants.filter((participant) => {
    const text = search.trim().toLowerCase();
    const matchesSearch =
      !text ||
      participant.name.toLowerCase().includes(text) ||
      participant.email.toLowerCase().includes(text) ||
      participant.programs.some((program) =>
        program.toLowerCase().includes(text)
      );

    const isActive = participant.activePrograms > 0;
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" ? isActive : !isActive);

    return matchesSearch && matchesStatus;
  });

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

        <button
          className="primary-btn"
          onClick={openForm}
          disabled={programs.length === 0}
          title={programs.length === 0 ? "Create a program first" : undefined}
        >
          + Add Participant
        </button>
      </section>

      {error && (
        <div className="login-message" role="alert">
          Could not load participants: {error}
        </div>
      )}

      {/* STAT CARDS */}
      <section className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon purple">
            ♙
          </div>

          <p>Total Participants</p>

          <h2>{participants.length}</h2>

          <span className="stat-footer">
            Enrolled in at least one program
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            ✓
          </div>

          <p>Active Participants</p>

          <h2>
            {participants.filter((item) => item.activePrograms > 0).length}
          </h2>

          <span className="stat-footer">
            In a currently active program
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            ◈
          </div>

          <p>Average Attendance</p>

          <h2>{averageAttendance}</h2>

          <span className="stat-footer">
            Across all programs
          </span>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            ★
          </div>

          <p>New This Month</p>

          <h2>
            {participants.filter((item) => item.joined && isThisMonth(item.joined)).length}
          </h2>

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="secondary-btn"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

          </div>

        </div>

        <div className="participant-table">

          <table>

            <thead>
              <tr>
                <th>Participant</th>
                <th>Programs</th>
                <th>Status</th>
                <th>Attendance</th>
                <th>Engagement</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan={5}>Loading participants...</td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    {participants.length === 0
                      ? "No participants yet. Add one or upload a CSV file."
                      : "No participants match your search."}
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => {
                  const isActive = participant.activePrograms > 0;

                  return (
                    <tr key={participant.id}>

                      <td>
                        <div className="participant-info">

                          <div className="participant-avatar">
                            {participant.name
                              .split(" ")
                              .filter(Boolean)
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
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
                        {participant.programs.join(", ") || "—"}
                      </td>

                      <td>
                        <span
                          className={`status ${isActive ? "active" : "inactive"}`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div className="attendance">

                          <strong>
                            {participant.attendance === null
                              ? "—"
                              : `${participant.attendance}%`}
                          </strong>

                          <div className="attendance-bar">
                            <div
                              style={{
                                width: `${participant.attendance || 0}%`,
                              }}
                            ></div>
                          </div>

                        </div>
                      </td>

                      <td>
                        <strong>{participant.averageEngagement}</strong>/100
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* Add Participant Form */}
      {form && (
        <div className="help-overlay" onClick={() => setForm(null)}>
          <form
            className="help-modal program-form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <div className="help-header">
              <div className="help-title">
                <div>
                  <h2>Add Participant</h2>
                  <p>Enrol a participant in a program</p>
                </div>
              </div>

              <button
                type="button"
                className="help-close"
                onClick={() => setForm(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="program-form-body">
              <div className="program-form-row">
                <label>
                  Name *
                  <input
                    type="text"
                    value={form.name}
                    onChange={updateField("name")}
                    required
                  />
                </label>

                <label>
                  Email *
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    required
                  />
                </label>
              </div>

              <label>
                Program *
                <select
                  value={form.program}
                  onChange={updateField("program")}
                >
                  {programs.map((program) => (
                    <option key={program._id} value={program._id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="program-form-row">
                <label>
                  Sessions attended
                  <input
                    type="number"
                    min={0}
                    value={form.sessionsAttended}
                    onChange={updateField("sessionsAttended")}
                  />
                </label>

                <label>
                  Total sessions
                  <input
                    type="number"
                    min={0}
                    value={form.totalSessions}
                    onChange={updateField("totalSessions")}
                  />
                </label>
              </div>

              <div className="program-form-row">
                <label>
                  Engagement score (0-100)
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.engagementScore}
                    onChange={updateField("engagementScore")}
                  />
                </label>

                <label>
                  Satisfaction (1-5)
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.satisfactionScore}
                    onChange={updateField("satisfactionScore")}
                  />
                </label>
              </div>

              {formError && (
                <div className="login-message" role="alert">
                  {formError}
                </div>
              )}

              <div className="program-form-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setForm(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Add Participant"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default Participants;
