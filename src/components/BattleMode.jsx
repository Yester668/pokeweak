import { useState, useEffect, useRef } from 'react'
import { BATTLE_SCENARIOS } from '../data/battles'
import { getScenarios } from '../data/battleGenerator'
import { TYPE_COLORS, TYPE_NAMES_ES } from '../data/types'
import { getSpriteUrl } from '../data/pokemon'
import TypeBadge from './TypeBadge'

// ── Sub-components ────────────────────────────────────────────────────────────

function PokemonCard({ pokemon, side }) {
  const sprite = pokemon.spriteUrl ?? getSpriteUrl(pokemon.id)
  return (
    <div style={{
      flex: 1, background: '#0f0f1f', borderRadius: 12, padding: '16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 8, minWidth: 130,
    }}>
      <p style={{ margin: 0, fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {side}
      </p>
      <img
        src={sprite}
        alt={pokemon.name}
        width={80} height={80}
        style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
        loading="lazy"
        decoding="async"
      />
      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#eee' }}>{pokemon.name}</p>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {pokemon.types.map(t => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{
        background: '#13132a', border: '1px solid #1e1e38', borderRadius: 16,
        padding: 24, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Pokémon row */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              flex: 1, background: '#0f0f1f', borderRadius: 12, padding: 16,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 80, height: 80, borderRadius: 8, background: '#1e1e38', animation: 'pulse 1.4s ease infinite alternate' }} />
              <div style={{ width: 70, height: 14, borderRadius: 4, background: '#1e1e38', animation: 'pulse 1.4s ease infinite alternate' }} />
            </div>
          ))}
        </div>
        {/* Move buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              height: 52, borderRadius: 10, background: '#1e1e38',
              animation: `pulse 1.4s ease ${i * 0.1}s infinite alternate`,
            }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { from { opacity: 0.4 } to { opacity: 0.7 } }`}</style>
      <p style={{ textAlign: 'center', color: '#555', fontSize: 13 }}>
        Cargando escenarios desde PokéAPI…
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BattleMode() {
  const [scenarios, setScenarios]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [apiOk, setApiOk]           = useState(true)
  const [index, setIndex]           = useState(0)
  const [chosen, setChosen]         = useState(null)
  const [stats, setStats]           = useState({ correct: 0, wrong: 0 })
  const loadingMore  = useRef(false)
  const hasChosen    = useRef(false)  // cerrojo síncrono contra clicks rápidos

  // Carga inicial
  useEffect(() => {
    getScenarios(12)
      .then(s => {
        setScenarios(s.length > 0 ? s : BATTLE_SCENARIOS)
        setApiOk(s.length > 0)
        setLoading(false)
      })
      .catch(() => {
        setScenarios(BATTLE_SCENARIOS)
        setApiOk(false)
        setLoading(false)
      })
  }, [])

  // Auto-carga cuando quedan ≤ 3 escenarios
  useEffect(() => {
    if (loading) return
    if (loadingMore.current) return
    if (index < scenarios.length - 3) return

    loadingMore.current = true
    getScenarios(10)
      .then(s => {
        if (s.length > 0) setScenarios(prev => [...prev, ...s])
      })
      .catch(() => {})
      .finally(() => { loadingMore.current = false })
  }, [index, scenarios.length, loading])

  if (loading) return <LoadingSkeleton />

  const scenario  = scenarios[index % scenarios.length]
  const revealed  = chosen !== null
  const isCorrect = chosen === scenario.correct

  function choose(moveName) {
    if (hasChosen.current) return   // bloqueo síncrono
    hasChosen.current = true
    setChosen(moveName)
    setStats(s => ({
      correct: moveName === scenario.correct ? s.correct + 1 : s.correct,
      wrong:   moveName !== scenario.correct ? s.wrong   + 1 : s.wrong,
    }))
  }

  function next() {
    hasChosen.current = false
    setIndex(i => i + 1)
    setChosen(null)
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ margin: 0, color: '#555', fontSize: 13 }}>
            Escenario #{index + 1}
          </p>
          {!apiOk && (
            <span style={{
              fontSize: 10, fontWeight: 700, background: '#f59e0b22',
              border: '1px solid #f59e0b44', color: '#f59e0b',
              padding: '2px 6px', borderRadius: 3, letterSpacing: '0.05em',
            }}>
              OFFLINE · estáticos
            </span>
          )}
          {apiOk && (
            <span style={{
              fontSize: 10, fontWeight: 700, background: '#22c55e18',
              border: '1px solid #22c55e44', color: '#22c55e',
              padding: '2px 6px', borderRadius: 3, letterSpacing: '0.05em',
            }}>
              PokéAPI
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ color: '#22c55e', fontSize: 13 }}>✓ {stats.correct}</span>
          <span style={{ color: '#ef4444', fontSize: 13 }}>✗ {stats.wrong}</span>
        </div>
      </div>

      {/* Arena */}
      <div style={{
        background: '#13132a', border: '1px solid #1e1e38',
        borderRadius: 16, padding: 24, marginBottom: 20,
      }}>
        {/* Pokémon */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'stretch' }}>
          <PokemonCard pokemon={scenario.your}  side="Tu Pokémon" />
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontSize: 20, color: '#444' }}>VS</span>
          </div>
          <PokemonCard pokemon={scenario.rival} side="Rival" />
        </div>

        {/* Pregunta */}
        <p style={{ margin: '0 0 16px', textAlign: 'center', color: '#aaa', fontSize: 14 }}>
          ¿Qué movimiento usas?
        </p>

        {/* Movimientos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {scenario.moves.map(move => {
            const moveColor = TYPE_COLORS[move.type]
            let borderColor = `${moveColor}66`
            let bg          = `${moveColor}11`
            let textColor   = moveColor
            let icon        = null

            if (revealed) {
              if (move.name === scenario.correct) {
                borderColor = '#22c55e'; bg = '#22c55e22'; textColor = '#22c55e'; icon = '✓'
              } else if (move.name === chosen) {
                borderColor = '#ef4444'; bg = '#ef444422'; textColor = '#ef4444'; icon = '✗'
              }
            }

            return (
              <button
                key={move.name}
                onClick={() => choose(move.name)}
                style={{
                  background: bg, border: `2px solid ${borderColor}`, color: textColor,
                  borderRadius: 10, padding: '12px 16px',
                  cursor: revealed ? 'default' : 'pointer',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
                  textAlign: 'left', transition: 'background 0.12s, border-color 0.12s, color 0.12s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TypeBadge type={move.type} size="sm" />
                  {move.name}
                </span>
                {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Explicación */}
      {revealed && (
        <div style={{
          background: isCorrect ? '#22c55e11' : '#ef444411',
          border: `1px solid ${isCorrect ? '#22c55e44' : '#ef444444'}`,
          borderRadius: 12, padding: '16px 20px', marginBottom: 20,
        }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 14, color: isCorrect ? '#22c55e' : '#ef4444' }}>
            {isCorrect ? '¡Correcto!' : `Incorrecto — la mejor opción era ${scenario.correct}`}
          </p>
          <p style={{ margin: 0, color: '#aaa', fontSize: 13, lineHeight: 1.6 }}>
            {scenario.explanation}
          </p>
        </div>
      )}

      {revealed && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={next}
            style={{
              background: '#7038F8', color: '#fff', border: 'none',
              padding: '12px 32px', borderRadius: 8,
              fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Siguiente escenario →
          </button>
        </div>
      )}
    </div>
  )
}
