import { Link } from 'react-router-dom'
import TypeRunGame from '../components/TypeRun/TypeRunGame'

export default function TypeRunPage() {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link to="/typerun" style={{ color: '#555', fontSize: 12, textDecoration: 'none' }}>
          ← TypeRun
        </Link>
        <span style={{ color: '#2a2a3f' }}>|</span>
        <h1 style={{ margin: 0, fontSize: 18 }}>🎰 TypeRun Clásico</h1>
        <span style={{
          fontSize: 10, fontWeight: 700, background: '#7038F820',
          border: '1px solid #7038F844', color: '#7038F8',
          padding: '2px 7px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>Ofensivo</span>
      </div>
      <TypeRunGame />
    </>
  )
}
