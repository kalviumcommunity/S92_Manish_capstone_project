function ProgramCard({
  name,
  category,
  score,
  participants,
  onView
}) {
  return (
    <div className="program-card">

      <div className="program-card-top">

        <span className="program-category">
          {category}
        </span>

        <span className="program-status">
          Active
        </span>

      </div>


      <div className="program-card-icon">
        {category === "Education" && "💻"}
        {category === "Technology" && "📱"}
        {category === "Sports" && "⚽"}
        {category === "Environment" && "🌱"}
        {!["Education", "Technology", "Sports", "Environment"].includes(category) && "📊"}
      </div>


      <h3>
        {name}
      </h3>


      <div className="program-info">

        <div>
          <span>Engagement Score</span>

          <strong>
            {score}/100
          </strong>
        </div>


        <div>
          <span>Participants</span>

          <strong>
            {participants}
          </strong>
        </div>

      </div>


      <div className="score-bar">
        <div
          style={{
            width: `${score}%`
          }}
        ></div>
      </div>


      <button
        className="view-program-btn"
        onClick={onView}
      >
        View Program
        <span>→</span>
      </button>

    </div>
  );
}

export default ProgramCard;