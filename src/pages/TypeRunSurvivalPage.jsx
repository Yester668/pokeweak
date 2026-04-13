import { Link } from 'react-router-dom'
import TypeRunSurvival from '../components/TypeRunSurvival/TypeRunSurvival'

export default function TypeRunSurvivalPage() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link to="/typerun" style={{ color: '#555', fontSize: 12, textDecoration: 'none' }}>
          ← TypeRun
        </Link>
        <span style={{ color: '#2a2a3f' }}>|</span>
        <h1 style={{ margin: 0, fontSize: 18 }}>🛡️ TypeRun Supervivencia</h1>
        <span style={{
          fontSize: 10, fontWeight: 700, background: '#22c55e18',
          border: '1px solid #22c55e44', color: '#22c55e',
          padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>Defensivo</span>
      </div>
      <TypeRunSurvival />
    </>
  )
}
