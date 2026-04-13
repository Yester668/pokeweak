import { Link } from 'react-router-dom'
import { loadWeights } from '../data/flashcardDeck'
import { FULL_DECK_SIZE } from '../data/flashcardDeck'

const MODES = [
  {
    to: '/explorar',
    icon: '🔍',
    label: 'Explorar Tipos',
    desc: 'Selecciona un tipo y ve al instante sus ventajas, debilidades y ejemplos de Pokémon. Soporta doble tipo.',
    color: '#6890F0',
    tag: 'Referencia',
  },
  {
    to: '/flashcards',
    icon: '🃏',
    label: 'Flashcards',
    desc: 'Sesiones de 10 cartas con preguntas sobre ofensiva, defensiva, resistencias e inmunidades. Se adapta a tus fallos.',
    color: '#F08030',
    tag: 'Memorización',
  },
  {
    to: '/batallas',
    icon: '⚔️',
    label: 'Escenarios de Batalla',
    desc: 'Situaciones reales: elige el movimiento correcto entre 4 opciones. Explicación del cálculo tras cada decisión.',
    color: '#C03028',
    tag: 'Aplicación',
  },
  {
    to: '/typerun',
    icon: '🎰',
    label: 'TypeRun',
    desc: 'Roguelite de tipos al estilo Balatro. Modo Clásico (ofensivo) y Supervivencia (defensivo). Con amuletos y presión de tiempo.',
    color: '#7038F8',
    tag: 'Roguelite · NUEVO',
    highlight: true,
  },
]

function ProgressBar({ value, max, color }) {
  return (
    <div style={{ height: 4, background: '#1e1e38', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 2, transition: 'width 0.4s' }} />
    </div>
  )
}

export default function Home() {
  // Estadísticas rápidas desde localStorage
  const weights = loadWeights()
  const masteredCount = Object.values(weights).filter(w => w <= 1).length
  const totalCards = 72 // buildFullDeck() genera ~72

  return (
    <div style={{ maxWidth: 820, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '32px 0 40px' }}>
        <p style={{ fontSize: 52, margin: '0 0 8px' }}>⚡</p>
        <h1 style={{ margin: '0 0 10px', fontSize: 32, letterSpacing: '-0.02em' }}>PokéWeak</h1>
        <p style={{ margin: 0, color: '#555', fontSize: 15, maxWidth: 480, marginInline: 'auto', lineHeight: 1.6 }}>
          Aprende las relaciones de tipos de Pokémon para jugar competitivo — desde la referencia rápida hasta el entrenamiento bajo presión.
        </p>
      </div>

      {/* Stats rápidas si hay progreso */}
      {Object.keys(weights).length > 0 && (
        <div style={{
          background: '#13132a', border: '1px solid #1e1e38', borderRadius: 12,
          padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Progreso Flashcards
            </p>
            <ProgressBar value={masteredCount} max={totalCards} color="#7038F8" />
          </div>
          <span style={{ color: '#7038F8', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
            {masteredCount} / {totalCards} dominadas
          </span>
          <Link to="/flashcards" style={{ color: '#555', fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Continuar →
          </Link>
        </div>
      )}

      {/* Cards de modos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {MODES.map(m => (
          <Link key={m.to} to={m.to} style={{ textDecoration: 'none' }}>
            <div style={{
              background: m.highlight ? `${m.color}0d` : '#13132a',
              border: `1px solid ${m.highlight ? m.color + '44' : '#1e1e38'}`,
              borderRadius: 14,
              padding: '22px 20px',
              height: '100%',
              transition: 'transform 0.12s, box-shadow 0.12s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${m.color}22` }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>{m.icon}</span>
                <span style={{
                  fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: m.color, background: `${m.color}20`, border: `1px solid ${m.color}44`,
                  padding: '2px 7px', borderRadius: 3,
                }}>{m.tag}</span>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 16, color: '#fff' }}>{m.label}</h2>
              <p style={{ margin: 0, color: '#666', fontSize: 13, lineHeight: 1.5 }}>{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Ruta directa a un tipo */}
      <div style={{ marginTop: 32, padding: '18px 20px', background: '#0d0d1f', border: '1px solid #1e1e38', borderRadius: 10, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#555', fontSize: 13 }}>Ir directo a un tipo:</span>
        {['fire', 'water', 'dragon', 'fairy', 'steel', 'ghost'].map(t => (
          <Link key={t} to={`/explorar/${t}`} style={{
            background: '#1a1a2e', border: '1px solid #2a2a3f', color: '#888',
            padding: '4px 10px', borderRadius: 5, fontSize: 12, textDecoration: 'none',
            transition: 'color 0.12s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#888'}
          >
            {t}
          </Link>
        ))}
        <span style={{ color: '#333', fontSize: 12 }}>o escribe /explorar/[tipo] en la URL</span>
      </div>
    </div>
  )
}
