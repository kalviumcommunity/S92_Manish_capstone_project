function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">📊</div>

      <h2>No engagement data yet</h2>

      <p>
        Get started by uploading participation data or creating your first
        program.
      </p>

      <div>
        <button>Upload Data</button>
        <button>Create Program</button>
      </div>
    </div>
  )
}

export default EmptyState