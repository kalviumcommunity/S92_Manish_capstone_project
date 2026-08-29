function MetricCard({ title, value, description }) {
  return (
    <div className="metric-card">
      <h3>{title}</h3>
      <strong>{value}</strong>
      <p>{description}</p>
    </div>
  )
}

export default MetricCard