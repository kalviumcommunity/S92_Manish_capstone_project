import { useEffect, useState } from "react";
import ProgramCard from "./components/ProgramCard";

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  useEffect(() => {
    fetch("http://localhost:5000/api/programs")
      .then((response) => response.json())
      .then((data) => setPrograms(data))
      .catch((error) =>
        console.error("Error fetching programs:", error)
      );
  }, []);

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = program.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All Categories" ||
      program.category === category;

    return matchesSearch && matchesCategory;
  });

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

        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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

        <select>
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

      {/* Program Cards */}
      <div className="program-grid">

        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <ProgramCard
              key={program._id}
              name={program.name}
              category={program.category}
              score={program.score || 78}
              participants={program.participants || 0}
            />
          ))
        ) : (
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