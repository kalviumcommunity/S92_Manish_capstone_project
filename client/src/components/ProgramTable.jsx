import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function ProgramTable() {
  const [programs, setPrograms] = useState([]);
  const [editingProgram, setEditingProgram] = useState(null);

  useEffect(() => {
    let ignore = false;

    apiFetch("/api/programs")
      .then((data) => {
        if (!ignore) {
          setPrograms(Array.isArray(data) ? data : []);
        }
      })
      .catch((error) => {
        console.error("Error fetching programs:", error);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await apiFetch(`/api/programs/${id}`, {
        method: "DELETE",
      });

      setPrograms((previousPrograms) =>
        previousPrograms.filter((program) => program._id !== id)
      );
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    try {
      const updatedProgram = await apiFetch(
        `/api/programs/${editingProgram._id}`,
        {
          method: "PUT",
          body: JSON.stringify(editingProgram),
        }
      );

      setPrograms((previousPrograms) =>
        previousPrograms.map((program) =>
          program._id === updatedProgram._id
            ? updatedProgram
            : program
        )
      );

      setEditingProgram(null);
    } catch (error) {
      console.error("Error updating program:", error);
    }
  };

  return (
    <div className="program-table">
      <h2>Programs</h2>

      <table>
        <thead>
          <tr>
            <th>Program Name</th>
            <th>Category</th>
            <th>Capacity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {programs.map((program) => (
            <tr key={program._id}>
              <td>{program.name}</td>

              <td>{program.category}</td>

              <td>{program.capacity}</td>

              <td>{program.status}</td>

              <td>
                <button
                  onClick={() =>
                    setEditingProgram({ ...program })
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(program._id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingProgram && (
        <form onSubmit={handleUpdate}>
          <h3>Update Program</h3>

          <input
            type="text"
            value={editingProgram.name}
            onChange={(e) =>
              setEditingProgram({
                ...editingProgram,
                name: e.target.value,
              })
            }
            placeholder="Program name"
          />

          <input
            type="text"
            value={editingProgram.category}
            onChange={(e) =>
              setEditingProgram({
                ...editingProgram,
                category: e.target.value,
              })
            }
            placeholder="Category"
          />

          <input
            type="number"
            value={editingProgram.capacity}
            onChange={(e) =>
              setEditingProgram({
                ...editingProgram,
                capacity: Number(e.target.value),
              })
            }
            placeholder="Capacity"
          />

          <select
            value={editingProgram.status}
            onChange={(e) =>
              setEditingProgram({
                ...editingProgram,
                status: e.target.value,
              })
            }
          >
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <button type="submit">
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => setEditingProgram(null)}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}

export default ProgramTable;