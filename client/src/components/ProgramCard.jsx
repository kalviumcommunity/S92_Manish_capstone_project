function ProgramCard({ name, category, score, participants }) {
  return (
    <div className="program-card">
      <span>{category}</span>

      <h3>{name}</h3>

      <p>Engagement Score: {score} / 100</p>

      <p>Enrolled: {participants} participants</p>

      <button>View Program</button>
    </div>
  )
}

export default ProgramCard