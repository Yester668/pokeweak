import { useState } from 'react'
import { BATTLE_SCENARIOS } from '../data/battles'
import { TYPE_COLORS, TYPE_NAMES_ES } from '../data/types'
import { getSpriteUrl } from '../data/pokemon'
import TypeBadge from './TypeBadge'

function PokemonCard({ pokemon, side }) {
  return (
    <div style={{
      flex: 1,
      background: '#0f0f1f',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      minWidth: 130,
    }}>
      <p style={{ margin: 0, fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {side}
      </p>
      <img
        src={getSpriteUrl(pokemon.id)}
        alt={pokemon.name}
        width={80}
        height={80}
        style={{ imageRendering: 'pixelated' }}
      />
      <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#eee' }}>{pokemon.name}</p>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {pokemon.types.map(t => <TypeBadge key={t} type={t} size="sm" />)}
      </div>
    </div>
  )
}

export default function BattleMode() {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [stats, setStats] = useState({ correct: 0, wrong: 0 })

  const scenario = BATTLE_SCENARIOS[index % BATTLE_SCENARIOS.length]
  const revealed = chosen !== null
  const isCorrect = chosen === scenario.correct

  function choose(moveName) {
    if (revealed) return
    setChosen(moveName)
    setStats(s => ({
      correct: moveName === scenario.correct ? s.correct + 1 : s.correct,
      wrong: moveName !== scenario.correct ? s.wrong + 1 : s.wrong,
    }))
  }

  function next() {
    setIndex(i => i + 1)
    setChosen(null)
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, color: '#555', fontSize: '13px' }}>
          Escenario {(index % BATTLE_SCENARIOS.length) + 1} / {BATTLE_SCENARIOS.length}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ color: '#22c55e', fontSize: '13px' }}>✓ {stats.correct}</span>
          <span style={{ color: '#ef4444', fontSize: '13px' }}>✗ {stats.wrong}</span>
        </div>
      </div>

      {/* Arena */}
      <div style={{
        background: '#13132a',
        border: '1px solid #1e1e38',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
      }}>
        {/* Pokémon */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'stretch' }}>
          <PokemonCard pokemon={scenario.your} side="Tu Pokémon" />
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
            <span style={{ fontSize: '20px', color: '#444' }}>VS</span>
          </div>
          <PokemonCard pokemon={scenario.rival} side="Rival" />
        </div>

        {/* Pregunta */}
        <p style={{
          margin: '0 0 16px',
          textAlign: 'center',
          color: '#aaa',
          fontSize: '14px',
        }}>
          ¿Qué movimiento usas?
        </p>

        {/* Movimientos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {scenario.moves.map(move => {
            const moveColor = TYPE_COLORS[move.type]
            let borderColor = `${moveColor}66`
            let bg = `${moveColor}11`
            let textColor = moveColor
            let icon = null

            if (revealed) {
              if (move.name === scenario.correct) {
                borderColor = '#22c55e'
                bg = '#22c55e22'
                textColor = '#22c55e'
                icon = '✓'
              } else if (move.name === chosen) {
                borderColor = '#ef4444'
                bg = '#ef444422'
                textColor = '#ef4444'
                icon = '✗'
              }
            } else if (chosen === move.name) {
              borderColor = moveColor
              bg = `${moveColor}33`
            }

            return (
              <button
                key={move.name}
                onClick={() => choose(move.name)}
                style={{
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  color: textColor,
                  borderRadius: '10px',
                  padding: '12px 16px',
                  cursor: revealed ? 'default' : 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'all 0.12s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TypeBadge type={move.type} size="sm" />
                  {move.name}
                </span>
                {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
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
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
        }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: isCorrect ? '#22c55e' : '#ef4444', fontSize: '14px' }}>
            {isCorrect ? '¡Correcto!' : `Incorrecto — la mejor opción era ${scenario.correct}`}
          </p>
          <p style={{ margin: 0, color: '#aaa', fontSize: '13px', lineHeight: 1.6 }}>
            {scenario.explanation}
          </p>
        </div>
      )}

      {revealed && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={next}
            style={{
              background: '#7038F8',
              color: '#fff',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Siguiente escenario →
          </button>
        </div>
      )}
    </div>
  )
}
