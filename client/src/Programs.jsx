import { useEffect, useState } from "react";

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api/programs";

  // =========================
  // FETCH PROGRAMS
  // =========================
  const fetchPrograms = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch programs");
      }

      setPrograms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // =========================
  // UPDATE PROGRAM
  // =========================
  const handleUpdate = async (program) => {
    const updatedName = window.prompt(
      "Enter new program name:",
      program.name || ""
    );

    if (updatedName === null || updatedName.trim() === "") {
      return;
    }

    const updatedCategory = window.prompt(
      "Enter new category:",
      program.category || ""
    );

    if (updatedCategory === null || updatedCategory.trim() === "") {
      return;
    }

    const updatedProgram = {
      name: updatedName.trim(),
      category: updatedCategory.trim(),
      status: program.status,
      capacity: program.capacity,
    };

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/${program._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
        body: JSON.stringify(updatedProgram),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      alert("Program updated successfully!");

      // Refresh programs
      await fetchPrograms();
    } catch (error) {
      console.error("Error updating program:", error);
      alert(`Update failed: ${error.message}`);
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
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/${programId}`, {
        method: "DELETE",
        headers: {
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      alert("Program deleted successfully!");

      // Remove deleted program from UI
      setPrograms((previousPrograms) =>
        previousPrograms.filter(
          (program) => program._id !== programId
        )
      );
    } catch (error) {
      console.error("Error deleting program:", error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  // =========================
  // FILTER PROGRAMS
  // =========================
  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name
      ?.toLowerCase()
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

        <button className="create-program-btn">
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
          <option>Education</option>
          <option>Health</option>
          <option>Environment</option>
          <option>Community</option>
          <option>Sports</option>
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
                {program.status || "Upcoming"}
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
                  onClick={() => handleUpdate(program)}
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
              Try changing your search or filter.
            </p>
          </div>

        )}

      </div>

    </div>
  );
}

export default Programs;