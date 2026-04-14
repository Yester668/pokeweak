import { useState, useRef } from 'react'
import { fetchPokemonFull, fetchPokemonSpecies, fetchPokemonByType, fetchEvolutionChain } from '../data/pokeapi'
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ') : '' }

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
            {groups[k].map(t => <TypeBadge key={t} type={t} size="sm" onClick={() => onTypeClick(t)} />)}
          </div>
        </div>
      ))}
      {ORDER.every(k => !groups[k]?.length) && (
        <p style={{ color: '#444', fontSize: 13 }}>Sin vulnerabilidades ni resistencias especiales</p>
      )}
    </div>
  )
}

// Ancho fijo de cada celda para que la cadena sea uniforme
const EVO_CELL_W = 72

function EvoCell({ pokemon: p, onSelect }) {
  return (
    <button
      onClick={() => onSelect(p.id)}
      style={{
        width: EVO_CELL_W, minWidth: EVO_CELL_W,
        background: '#0f0f1f', border: '1px solid #2a2a4a', borderRadius: 8,
        padding: '6px 4px', cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#7038F8' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a' }}
    >
      <img src={getSpriteUrl(p.id)} alt={p.name} width={52} height={52}
        style={{ imageRendering: 'pixelated', objectFit: 'contain' }} loading="lazy" />
      <span style={{ fontSize: 9, color: '#666', textTransform: 'capitalize', textAlign: 'center', lineHeight: 1.2 }}>
        {p.name}
      </span>
    </button>
  )
}

function EvolutionChain({ stages, onSelect }) {
  if (!stages || stages.length <= 1) return (
    <p style={{ color: '#444', fontSize: 13, margin: 0 }}>No evoluciona</p>
  )
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      {stages.map((stage, si) => (
        <div key={si} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {/* Conector vertical entre stages */}
          {si > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 0', gap: 1 }}>
              <span style={{ color: '#333', fontSize: 16, lineHeight: 1 }}>↓</span>
              {stage[0]?.method && (
                <span style={{ fontSize: 10, color: '#555', textAlign: 'center' }}>
                  {stage[0].method}
                </span>
              )}
            </div>
          )}
          {/* Pokémon de este stage — fila centrada (varios si hay ramificación) */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
            {stage.map(p => <EvoCell key={p.id} pokemon={p} onSelect={onSelect} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

function AbilitiesList({ abilities = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {abilities.map(a => (
        <div key={a.name} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#0f0f1f', borderRadius: 6, padding: '7px 12px',
        }}>
          <span style={{ fontSize: 13, color: a.hidden ? '#7038F8' : '#ddd', fontWeight: 600, textTransform: 'capitalize' }}>
            {capitalize(a.name)}
          </span>
          {a.hidden && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#7038F8',
              border: '1px solid #7038F844', borderRadius: 3, padding: '1px 5px',
              letterSpacing: '0.06em',
            }}>
              OCULTA
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function PokemonCard({ pokemon, flavor, evoChain, onTypeClick, onSelectPokemon }) {
  const total = pokemon.stats.reduce((s, st) => s + st.value, 0)
  const num   = String(pokemon.id).padStart(3, '0')

  return (
    <div className="fade-in" style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>

      {/* ── Col izquierda: identidad ── */}
      <div style={{
        background: '#13132a', border: '1px solid #1e1e38', borderRadius: 16,
        padding: 24, flex: '0 0 240px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <p style={{ margin: 0, fontSize: 11, color: '#444', letterSpacing: '0.15em' }}>#{num}</p>
        <img src={pokemon.artworkUrl} alt={pokemon.name} width={190} height={190}
          style={{ imageRendering: 'auto', objectFit: 'contain' }} />
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, textTransform: 'capitalize', color: '#fff' }}>
          {pokemon.name}
        </h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {pokemon.types.map(t => <TypeBadge key={t} type={t} size="md" onClick={() => onTypeClick(t)} />)}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 2 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ddd' }}>{(pokemon.height / 10).toFixed(1)} m</div>
            <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Altura</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ddd' }}>{(pokemon.weight / 10).toFixed(1)} kg</div>
            <div style={{ fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Peso</div>
          </div>
        </div>
        {flavor && (
          <p style={{
            margin: 0, fontSize: 11, color: '#555', lineHeight: 1.6, textAlign: 'center',
            fontStyle: 'italic', borderTop: '1px solid #1e1e38', paddingTop: 12, width: '100%',
          }}>
            "{flavor}"
          </p>
        )}
      </div>

      {/* ── Col central: stats + efectividad ── */}
      <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#13132a', border: '1px solid #1e1e38', borderRadius: 16, padding: '20px 24px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Estadísticas base
          </p>
          {pokemon.stats.map(s => <StatBar key={s.key} label={s.label} value={s.value} />)}
          <div style={{ borderTop: '1px solid #1e1e38', paddingTop: 10, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: total >= 600 ? '#f59e0b' : total >= 500 ? '#22c55e' : '#888' }}>{total}</span>
          </div>
        </div>
        <div style={{ background: '#13132a', border: '1px solid #1e1e38', borderRadius: 16, padding: '20px 24px' }}>
          <EffectivenessSection types={pokemon.types} onTypeClick={onTypeClick} />
        </div>
      </div>

      {/* ── Col derecha: evoluciones + habilidades ── */}
      <div style={{ flex: '0 1 240px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: '#13132a', border: '1px solid #1e1e38', borderRadius: 16, padding: '20px 24px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Evoluciones
          </p>
          {evoChain
            ? <EvolutionChain stages={evoChain} onSelect={onSelectPokemon} />
            : <p style={{ color: '#333', fontSize: 12, margin: 0, fontStyle: 'italic' }}>Cargando…</p>
          }
        </div>
        <div style={{ background: '#13132a', border: '1px solid #1e1e38', borderRadius: 16, padding: '20px 24px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Habilidades
          </p>
          <AbilitiesList abilities={pokemon.abilities} />
        </div>
      </div>

    </div>
  )
}

// ── Grid de Pokémon por tipo ──────────────────────────────────────────────────
function TypeGrid({ type, list, loading, onSelect }) {
  const color = TYPE_COLORS[type]
  return (
    <div className="fade-in">
      <p style={{ margin: '0 0 14px', fontSize: 12, color: '#555' }}>
        {loading ? 'Cargando…' : `${list.length} Pokémon de tipo ${TYPE_NAMES_ES[type]}`}
      </p>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: 28, height: 28, border: '3px solid #1e1e38', borderTopColor: color,
            borderRadius: '50%', margin: '0 auto', animation: 'spin 0.7s linear infinite',
          }} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 8 }}>
          {list.map(p => (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{
                background: '#13132a', border: `1px solid ${color}33`,
                borderRadius: 10, padding: '10px 6px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'border-color 0.15s, background 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = `${color}11` }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}33`; e.currentTarget.style.background = '#13132a' }}
            >
              <img src={getSpriteUrl(p.id)} alt={p.name} width={56} height={56}
                style={{ imageRendering: 'pixelated', objectFit: 'contain' }} loading="lazy" />
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
  const [evoChain, setEvoChain] = useState(null)
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
    setEvoChain(null)
    setTypeView(null)
    try {
      const data = await fetchPokemonFull(q)
      setPokemon(data)
      // Carga secundaria en paralelo — no bloquea
      fetchPokemonSpecies(data.id).then(setFlavor).catch(() => {})
      fetchEvolutionChain(data.id).then(setEvoChain).catch(() => setEvoChain([]))
    } catch {
      setError(`No se encontró "${term}" — prueba con el nombre en inglés o el número`)
    } finally {
      setLoading(false)
    }
  }

  async function searchByType(type) {
    setPokemon(null)
    setFlavor(null)
    setEvoChain(null)
    setError(null)
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

  const activeType = typeView?.type ?? null

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>

      {/* Título */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800 }}>📖 Pokédex</h1>
        <p style={{ margin: 0, color: '#555', fontSize: 14 }}>
          Busca por nombre (en inglés) o número — haz clic en un tipo para explorar
        </p>
      </div>

      {/* Buscador */}
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="pikachu, charizard, 150…"
          autoComplete="off" spellCheck={false}
          style={{
            flex: 1, background: '#13132a', border: '1px solid #2a2a4a',
            borderRadius: 10, padding: '12px 18px', color: '#fff',
            fontSize: 15, fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = '#7038F8' }}
          onBlur={e  => { e.target.style.borderColor = '#2a2a4a' }}
        />
        <button
          type="submit" disabled={loading}
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

      {/* ── Barra de tipos — SIEMPRE VISIBLE ── */}
      <div style={{
        background: '#0d0d1f', border: '1px solid #1e1e38', borderRadius: 12,
        padding: '12px 16px', marginBottom: 24,
      }}>
        <p style={{ margin: '0 0 10px', fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Filtrar por tipo
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TYPES.map(t => (
            <TypeBadge key={t} type={t} size="sm"
              selected={activeType === t}
              onClick={() => activeType === t ? setTypeView(null) : searchByType(t)}
            />
          ))}
        </div>
      </div>

      {/* Sugerencias — solo en estado vacío */}
      {!pokemon && !loading && !error && !typeView && (
        <div style={{ marginBottom: 24 }}>
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
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#7038F8'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a4a'; e.currentTarget.style.color = '#888' }}
              >
                {s.name}
              </button>
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
          evoChain={evoChain}
          onTypeClick={searchByType}
          onSelectPokemon={id => { setQuery(String(id)); search(id) }}
        />
      )}

      {/* Grid por tipo */}
      {typeView && (
        <TypeGrid
          type={typeView.type}
          list={typeView.list}
          loading={typeView.loading}
          onSelect={id => { setQuery(String(id)); search(id) }}
        />
      )}

    </div>
  )
}
