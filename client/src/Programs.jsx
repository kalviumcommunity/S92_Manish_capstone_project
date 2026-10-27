import { useEffect, useState } from "react";
import { apiFetch } from "./api";

const CATEGORIES = [
  "Education",
  "Technology",
  "Health",
  "Environment",
  "Community",
  "Sports",
];

const EMPTY_FORM = {
  name: "",
  category: CATEGORIES[0],
  description: "",
  startDate: "",
  endDate: "",
  capacity: 0,
  status: "upcoming",
};

// Convert a date from the API into the yyyy-mm-dd format used by <input type="date">
const toDateInput = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

// Today's date in the user's own time zone, as yyyy-mm-dd
const todayInput = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
};

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Program form (create + edit)
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // FETCH PROGRAMS
  // =========================
  useEffect(() => {
    let ignore = false;

    apiFetch("/api/programs")
      .then((data) => {
        if (!ignore) {
          setPrograms(Array.isArray(data) ? data : []);
        }
      })
      .catch((fetchError) => {
        console.error("Error fetching programs:", fetchError);

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
  // OPEN FORM
  // =========================
  const openCreateForm = () => {
    setForm({
      ...EMPTY_FORM,
      startDate: todayInput(),
    });
    setEditingId(null);
    setFormError("");
  };

  const openEditForm = (program) => {
    setForm({
      name: program.name || "",
      category: program.category || CATEGORIES[0],
      description: program.description || "",
      startDate: toDateInput(program.startDate),
      endDate: toDateInput(program.endDate),
      capacity: program.capacity || 0,
      status: program.status || "upcoming",
    });
    setEditingId(program._id);
    setFormError("");
  };

  const closeForm = () => {
    setForm(null);
    setEditingId(null);
  };

  const updateField = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  // =========================
  // CREATE / UPDATE PROGRAM
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.category || !form.startDate) {
      setFormError("Name, category and start date are required");
      return;
    }

    if (form.endDate && form.endDate < form.startDate) {
      setFormError("End date cannot be before the start date");
      return;
    }

    const programData = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      startDate: form.startDate,
      // null clears an existing end date
      endDate: form.endDate || null,
      capacity: Math.max(0, Number(form.capacity) || 0),
      status: form.status,
    };

    setSaving(true);

    try {
      if (editingId) {
        const updatedProgram = await apiFetch(
          `/api/programs/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(programData),
          }
        );

        setPrograms((previousPrograms) =>
          previousPrograms.map((program) =>
            program._id === editingId ? updatedProgram : program
          )
        );
      } else {
        const newProgram = await apiFetch("/api/programs", {
          method: "POST",
          body: JSON.stringify(programData),
        });

        setPrograms((previousPrograms) => [
          ...previousPrograms,
          newProgram,
        ]);
      }

      closeForm();
    } catch (saveError) {
      console.error("Error saving program:", saveError);
      setFormError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE PROGRAM
  // =========================
  const handleDelete = async (programId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this program?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await apiFetch(`/api/programs/${programId}`, {
        method: "DELETE",
      });

      // Remove deleted program from UI
      setPrograms((previousPrograms) =>
        previousPrograms.filter(
          (program) => program._id !== programId
        )
      );
    } catch (deleteError) {
      console.error("Error deleting program:", deleteError);
      alert(`Delete failed: ${deleteError.message}`);
    }
  };

  // =========================
  // FILTER PROGRAMS
  // =========================
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = (program.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All Categories" ||
      program.category === category;

    const matchesStatus =
      status === "All Status" ||
      program.status?.toLowerCase() === status.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // =========================
  // UI
  // =========================
  return (
    <div className="programs-page">

      {/* Page Header */}
      <div className="programs-header">
        <div>
          <h1>Programs</h1>
          <p>Manage and monitor your community programs.</p>
        </div>

        <button
          className="create-program-btn"
          onClick={openCreateForm}
        >
          + Create Program
        </button>
      </div>

      {/* Filters */}
      <div className="program-filters">

        {/* Search */}
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All Categories</option>
          {CATEGORIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Upcoming</option>
          <option>Completed</option>
        </select>

      </div>

      {/* Program Count */}
      <div className="program-count">
        {filteredPrograms.length} programs
      </div>

      {/* Program Grid */}
      <div className="program-grid">

        {/* Loading */}
        {loading ? (
          <div className="no-programs">
            <h2>Loading programs...</h2>
          </div>
        ) : error ? (
          <div className="no-programs">
            <div className="no-programs-icon">⚠️</div>

            <h2>Could not load programs</h2>

            <p>{error}</p>
          </div>
        ) : filteredPrograms.length > 0 ? (

          filteredPrograms.map((program) => (

            <div
              className="program-card"
              key={program._id}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >

              {/* Program Name */}
              <h2>{program.name}</h2>

              {/* Category */}
              <p>
                <strong>Category:</strong>{" "}
                {program.category || "Not specified"}
              </p>

              {/* Status */}
              <p>
                <strong>Status:</strong>{" "}
                {program.status || "upcoming"}
              </p>

              {/* Capacity */}
              <p>
                <strong>Capacity:</strong>{" "}
                {program.capacity || 0}
              </p>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >

                {/* Edit */}
                <button
                  onClick={() => openEditForm(program)}
                  style={{
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  ✏️ Edit
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(program._id)}
                  style={{
                    background: "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  🗑️ Delete
                </button>

              </div>

            </div>

          ))

        ) : (

          /* No Programs */
          <div className="no-programs">
            <div className="no-programs-icon">📋</div>

            <h2>No programs found</h2>

            <p>
              Try changing your search or filter, or create a new program.
            </p>
          </div>

        )}

      </div>

      {/* Create / Edit Program Form */}
      {form && (
        <div className="help-overlay" onClick={closeForm}>
          <form
            className="help-modal program-form"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
          >
            <div className="help-header">
              <div className="help-title">
                <div>
                  <h2>
                    {editingId ? "Edit Program" : "Create Program"}
                  </h2>
                  <p>Fields marked * are required</p>
                </div>
              </div>

              <button
                type="button"
                className="help-close"
                onClick={closeForm}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="program-form-body">
              <label>
                Name *
                <input
                  type="text"
                  value={form.name}
                  onChange={updateField("name")}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Category *
                <select
                  value={form.category}
                  onChange={updateField("category")}
                >
                  {CATEGORIES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={updateField("description")}
                />
              </label>

              <div className="program-form-row">
                <label>
                  Start date *
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={updateField("startDate")}
                    required
                  />
                </label>

                <label>
                  End date
                  <input
                    type="date"
                    value={form.endDate}
                    min={form.startDate}
                    onChange={updateField("endDate")}
                  />
                </label>
              </div>

              <div className="program-form-row">
                <label>
                  Capacity
                  <input
                    type="number"
                    min={0}
                    value={form.capacity}
                    onChange={updateField("capacity")}
                  />
                </label>

                <label>
                  Status
                  <select
                    value={form.status}
                    onChange={updateField("status")}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
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
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Program"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

export default Programs;
