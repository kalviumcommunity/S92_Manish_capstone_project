function ProgramTable() {
  const programs = [
    {
      name: 'Youth Coding Club',
      participants: 124,
      attendance: '88%',
      satisfaction: '94%',
    },
    {
      name: 'Senior Digital Literacy',
      participants: 86,
      attendance: '92%',
      satisfaction: '96%',
    },
    {
      name: 'After-school Soccer League',
      participants: 210,
      attendance: '82%',
      satisfaction: '89%',
    },
    {
      name: 'Community Garden Workshop',
      participants: 45,
      attendance: '95%',
      satisfaction: '91%',
    },
  ]

  return (
    <div className="program-table">
      <h2>Top Programs</h2>

      <table>
        <thead>
          <tr>
            <th>Program Name</th>
            <th>Participants</th>
            <th>Avg Attendance</th>
            <th>Satisfaction</th>
          </tr>
        </thead>

        <tbody>
          {programs.map((program) => (
            <tr key={program.name}>
              <td>{program.name}</td>
              <td>{program.participants}</td>
              <td>{program.attendance}</td>
              <td>{program.satisfaction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProgramTable