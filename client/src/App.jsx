import Sidebar from './components/Sidebar'
import Header from './components/Header'
import MetricCard from './components/MetricCard'
import ProgramTable from './components/ProgramTable'
import './App.css'

function App() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-content">
        <Header title="Dashboard Overview" />

        <section className="metrics">
          <MetricCard
            title="Total Active Participants"
            value="1,245"
            description="vs last quarter"
          />

          <MetricCard
            title="Average Engagement Score"
            value="78 / 100"
            description="Based on activity index"
          />

          <MetricCard
            title="Programs This Quarter"
            value="14"
            description="4 running, 10 planned"
          />

          <MetricCard
            title="Participant Satisfaction"
            value="92%"
            description="From survey feedback"
          />
        </section>

        <ProgramTable />
      </div>
    </div>
  )
}

export default App