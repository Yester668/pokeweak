import { useState, useRef } from 'react'
import { fetchPokemonFull, fetchPokemonSpecies, fetchPokemonByType } from '../data/pokeapi'
import { TYPES, TYPE_COLORS, TYPE_NAMES_ES, calcEffectiveness } from '../data/types'
import TypeBadge from '../components/TypeBadge'
import { getSpriteUrl } from '../data/pokemon'

// ── Constantes ────────────────────────────────────────────────────────────────
const STAT_MAX   = 255
const STAT_COLOR = v => v >= 120 ? '#22c55e' : v >= 80 ? '#f59e0b' : '#ef4444'

const SUGGESTIONS = [
  { id: 25,  name: 'Pikachu'   },
  { id: 6,   name: 'Charizard' },
  { id: 150, name: 'Mewtwo'    },
  { id: 448, name: 'Lucario'   },
  { id: 249, name: 'Lugia'     },
  { id: 445, name: 'Garchomp'  },
]

// ── Sub-componentes ───────────────────────────────────────────────────────────

function StatBar({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
      <span style={{ fontSize: 11, color: '#555', width: 72, textAlign: 'right', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: STAT_COLOR(value), width: 34, textAlign: 'right', flexShrink: 0 }}>
        {value}
      </span>
      <div style={{ flex: 1, height: 7, background: '#1a1a2e', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${(value / STAT_MAX) * 100}%`,
          background: STAT_COLOR(value), borderRadius: 4, transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}

function EffectivenessSection({ types, onTypeClick }) {
  const groups = {}
  for (const atk of TYPES) {
    const eff = calcEffectiveness(atk, types)
    if (eff === 1) continue
    if (!groups[eff]) groups[eff] = []
    groups[eff].push(atk)
  }

  const ORDER  = [4, 2, 0.5, 0.25, 0]
  const LABELS = { 4: '×4', 2: '×2', 0.5: '×½', 0.25: '×¼', 0: '×0' }
  const COLORS = { 4: '#ef4444', 2: '#f59e0b', 0.5: '#6890F0', 0.25: '#7038F8', 0: '#555' }

  return (
    <div>
      <p style={{ margin: '0 0 12px', fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Efectividad de ataques recibidos
      </p>
      {ORDER.filter(k => groups[k]?.length).map(k => (
        <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: COLORS[k], width: 28, flexShrink: 0, paddingTop: 4 }}>
            {LABELS[k]}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {groups[k].map(t => (
              <TypeBadge key={t} type={t} size="sm" onClick={() => onTypeClick(t)} />
            ))}
          </div>
        </div>
      ))}
      {ORDER.every(k => !groups[k]?.length) && (
        <p style={{ color: '#444', fontSize: 13 }}>Sin vulnerabilidades ni resistencias especiales</p>
      )}
    </div>
  )
}

function PokemonCard({ pokemon, flavor, onTypeClick }) {
  const total = pokemon.stats.reduce((s, st) => s + st.value, 0)
  const num   = String(pokemon.id).padStart(3, '0')

  return (
    <div className="fade-in" style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>

      {/* Columna izquierda */}
      <div style={{
        background: '#13132a', border: '1px solid #1e1e38', borderRadius: 16,
        padding: 28, flex: '0 0 260px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <p style={{ margin: 0, fontSize: 11, color: '#444', letterSpacing: '0.15em' }}>#{num}</p>
        <img src={pokemon.artworkUrl} alt={pokemon.name} width={200} height={200}
          style={{ imageRendering: 'auto', objectFit: 'contain' }} />
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, textTransform: 'capitalize', color: '#fff' }}>
          {pokemon.name}
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {pokemon.types.map(t => (
            <TypeBadge key={t} type={t} size="md" onClick={() => onTypeClick(t)} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ddd' }}>{(pokemon.height / 10).toFixed(1)} m</div>
            <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Altura</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#ddd' }}>{(pokemon.weight / 10).toFixed(1)} kg</div>
            <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Peso</div>
          </div>
        </div>
        {flavor && (
          <p style={{
            margin: 0, fontSize: 12, color: '#666', lineHeight: 1.6,
            textAlign: 'center', fontStyle: 'italic',
            borderTop: '1px solid #1e1e38', paddingTop: 14, width: '100%',
          }}>
            "{flavor}"
          </p>
        )}
      </div>

      {/* Columna derecha */}
      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#13132a', border: '1px solid #1e1e38', borderRadius: 16, padding: '22px 28px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Estadísticas base
          </p>
          {pokemon.stats.map(s => <StatBar key={s.key} label={s.label} value={s.value} />)}
          <div style={{ borderTop: '1px solid #1e1e38', paddingTop: 10, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: total >= 600 ? '#f59e0b' : total >= 500 ? '#22c55e' : '#888' }}>{total}</span>
          </div>
        </div>
        <div style={{ background: '#13132a', border: '1px solid #1e1e38', borderRadius: 16, padding: '22px 28px' }}>
          <EffectivenessSection types={pokemon.types} onTypeClick={onTypeClick} />
        </div>
      </div>
    </div>
  )
}

// ── Grid de Pokémon por tipo ──────────────────────────────────────────────────
function TypeGrid({ type, list, loading, onSelect, onClose }) {
  const color = TYPE_COLORS[type]
  return (
    <div className="fade-in" style={{
      background: '#13132a', border: `1px solid ${color}44`,
      borderRadius: 16, padding: '20px 24px', marginTop: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TypeBadge type={type} size="md" />
          <span style={{ fontSize: 13, color: '#555' }}>
            {loading ? 'Cargando…' : `${list.length} Pokémon`}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: '1px solid #2a2a4a', color: '#555',
            padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
            fontSize: 12, fontFamily: 'inherit',
          }}
        >
          ✕ Cerrar
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#555' }}>
          <div style={{
            width: 28, height: 28, border: '3px solid #1e1e38', borderTopColor: color,
            borderRadius: '50%', margin: '0 auto', animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
          {list.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{
                background: '#0f0f1f', border: `1px solid ${color}33`,
                borderRadius: 10, padding: '10px 6px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'border-color 0.15s, background 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}11` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}33`; e.currentTarget.style.background = '#0f0f1f' }}
            >
              <img
                src={getSpriteUrl(p.id)}
                alt={p.name}
                width={56} height={56}
                style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                loading="lazy"
              />
              <span style={{ fontSize: 10, color: '#888', textTransform: 'capitalize', textAlign: 'center', lineHeight: 1.2 }}>
                {p.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PokedexPage() {
  const [query,    setQuery]    = useState('')
  const [pokemon,  setPokemon]  = useState(null)
  const [flavor,   setFlavor]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [typeView, setTypeView] = useState(null)  // { type, list, loading }
  const inputRef = useRef(null)

  async function search(term) {
    const q = String(term).trim().toLowerCase()
    if (!q) return
    setLoading(true)
    setError(null)
    setPokemon(null)
    setFlavor(null)
    setTypeView(null)
    try {
      const data = await fetchPokemonFull(q)
      setPokemon(data)
      fetchPokemonSpecies(data.id).then(setFlavor).catch(() => {})
    } catch {
      setError(`No se encontró "${term}" — prueba con el nombre en inglés o el número`)
    } finally {
      setLoading(false)
    }
  }

  async function searchByType(type) {
    setTypeView({ type, list: [], loading: true })
    try {
      const list = await fetchPokemonByType(type, 24)
      setTypeView({ type, list, loading: false })
    } catch {
      setTypeView(null)
    }
  }

  function onSubmit(e) {
    e.preventDefault()
    search(query)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Título */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800 }}>📖 Pokédex</h1>
        <p style={{ margin: 0, color: '#555', fontSize: 14 }}>
          Busca por nombre (en inglés) o número — haz clic en cualquier tipo para ver sus Pokémon
        </p>
      </div>

      {/* Buscador */}
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="pikachu, charizard, 150…"
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1, background: '#13132a', border: '1px solid #2a2a4a',
            borderRadius: 10, padding: '12px 18px', color: '#fff',
            fontSize: 15, fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = '#7038F8' }}
          onBlur={e  => { e.target.style.borderColor = '#2a2a4a' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#7038F8', color: '#fff', border: 'none',
            padding: '12px 24px', borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'inherit', flexShrink: 0,
          }}
        >
          {loading ? '…' : 'Buscar'}
        </button>
      </form>

      {/* Sugerencias */}
      {!pokemon && !loading && !error && !typeView && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Sugerencias
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => { setQuery(s.name.toLowerCase()); search(s.id) }}
                style={{
                  background: '#13132a', border: '1px solid #2a2a4a', color: '#888',
                  padding: '7px 14px', borderRadius: 8, fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7038F8'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.color = '#888' }}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Explorar por tipo */}
          <p style={{ margin: '24px 0 10px', fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Explorar por tipo
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <TypeBadge key={t} type={t} size="sm" onClick={() => searchByType(t)} />
            ))}
          </div>
        </div>
      )}

      {/* Estados de carga y error */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
          <div style={{
            width: 36, height: 36, border: '3px solid #1e1e38', borderTopColor: '#7038F8',
            borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.7s linear infinite',
          }} />
          Buscando…
        </div>
      )}

      {error && (
        <div style={{
          background: '#ef444411', border: '1px solid #ef444444',
          borderRadius: 12, padding: '16px 20px', color: '#ef4444', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Resultado del Pokémon */}
      {pokemon && (
        <PokemonCard
          pokemon={pokemon}
          flavor={flavor}
          onTypeClick={searchByType}
        />
      )}

      {/* Grid por tipo */}
      {typeView && (
        <TypeGrid
          type={typeView.type}
          list={typeView.list}
          loading={typeView.loading}
          onSelect={id => { setQuery(String(id)); search(id) }}
          onClose={() => setTypeView(null)}
        />
      )}

    </div>
  )
}
