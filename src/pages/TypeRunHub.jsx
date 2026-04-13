import { Link } from 'react-router-dom'

const MODES = [
  {
    to: '/typerun/clasico',
    icon: '🎰',
    label: 'TypeRun Clásico',
    tag: 'Ofensivo',
    tagColor: '#7038F8',
    desc: 'Ataca rivales con tu mano de tipos. Consigue amuletos que amplifican la efectividad. Aprende qué tipos atacar bajo presión de tiempo.',
    mechanics: ['Mano de 6 tipos', 'Juegas 1-3 por turno', '3 turnos para derrotar al rival', '12 amuletos ofensivos'],
    cta: 'Jugar Clásico →',
    bg: '#7038F815',
    border: '#7038F844',
  },
  {
    to: '/typerun/supervivencia',
    icon: '🛡️',
    label: 'TypeRun Supervivencia',
    tag: 'Defensivo',
    tagColor: '#22c55e',
    desc: 'Elige tu typing para aguantar oleadas de ataques. Aprende qué tipos resisten qué y cómo minimizar el daño recibido.',
    mechanics: ['3 ataques entrantes por oleada', 'Eliges 1-2 tipos defensivos', '5 oleadas por ante', '8 amuletos defensivos'],
    cta: 'Jugar Supervivencia →',
    bg: '#22c55e15',
    border: '#22c55e44',
  },
]

export default function TypeRunHub() {
  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{ marginBottom: 36, textAlign: 'center' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: 26 }}>🎰 TypeRun</h1>
        <p style={{ margin: 0, color: '#555', fontSize: 14 }}>
          Dos modos roguelite para aprender los tipos bajo presión real — como en competitivo
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {MODES.map(m => (
          <Link
            key={m.to}
            to={m.to}
            style={{ textDecoration: 'none', flex: '1 1 320px' }}
          >
            <div style={{
              background: m.bg,
              border: `2px solid ${m.border}`,
              borderRadius: 16,
              padding: '28px 24px',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${m.border}` }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 32 }}>{m.icon}</span>
                <div>
                  <h2 style={{ margin: '0 0 4px', fontSize: 18, color: '#fff' }}>{m.label}</h2>
                  <span style={{
                    fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: m.tagColor, background: `${m.tagColor}22`, border: `1px solid ${m.tagColor}44`,
                    padding: '2px 6px', borderRadius: 3,
                  }}>{m.tag}</span>
                </div>
              </div>

              <p style={{ margin: '0 0 16px', color: '#888', fontSize: 13, lineHeight: 1.6 }}>
                {m.desc}
              </p>

              <ul style={{ margin: '0 0 20px', padding: '0 0 0 16px', color: '#555', fontSize: 12, lineHeight: 1.8 }}>
                {m.mechanics.map((mec, i) => <li key={i}>{mec}</li>)}
              </ul>

              <div style={{
                display: 'inline-block',
                background: m.tagColor, color: '#fff',
                padding: '9px 20px', borderRadius: 8,
                fontSize: 13, fontWeight: 700,
              }}>
                {m.cta}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: '18px 20px', background: '#0d0d1f', border: '1px solid #1e1e38', borderRadius: 10 }}>
        <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Diferencia clave
        </p>
        <p style={{ margin: 0, color: '#666', fontSize: 13, lineHeight: 1.6 }}>
          <strong style={{ color: '#7038F8' }}>Clásico</strong> entrena el pensamiento ofensivo — qué mueves usas para hacer más daño.
          {' '}<strong style={{ color: '#22c55e' }}>Supervivencia</strong> entrena el pensamiento defensivo — qué typing eliges para aguantar.
          En competitivo necesitas ambos: saber atacar <em>y</em> saber a qué switchear.
        </p>
      </div>
    </div>
  )
}
