function Header({ title }) {
  return (
    <header className="header">
      <h1>{title}</h1>

      <div className="filters">
        <button>This Quarter</button>
        <button>All Programs</button>
        <button>All Regions</button>
      </div>
    </header>
  )
}

export default Header