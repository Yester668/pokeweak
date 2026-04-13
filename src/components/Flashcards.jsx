import { useState, useCallback } from 'react'
import { TYPES, TYPE_NAMES_ES, TYPE_COLORS } from '../data/types'
import { buildFullDeck, pickWeightedCards, updateWeight, resetWeights, loadWeights } from '../data/flashcardDeck'
import TypeIcon from './TypeIcon'

const ANSWER_COLORS = { correct: '#22c55e', wrong: '#ef4444', missed: '#f59e0b' }
const SESSION_SIZE = 10
const FULL_DECK = buildFullDeck()

function newSession() {
  return pickWeightedCards(FULL_DECK, SESSION_SIZE)
}

export default function Flashcards() {
  const [session, setSession] = useState(() => newSession())
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState([])
  const [revealed, setRevealed] = useState(false)
  const [counts, setCounts] = useState({ correct: 0, wrong: 0 })
  const [finished, setFinished] = useState(false)

  const card = session[index]
  const color = TYPE_COLORS[card?.type]

  const toggleSelect = useCallback((type) => {
    if (revealed) return
    setSelected(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }, [revealed])

  function reveal() {
    if (selected.length === 0) return
    const answer = card.answer
    const correct = answer.length === selected.length &&
      answer.every(t => selected.includes(t))
    updateWeight(card.id, correct)
    setCounts(c => correct ? { ...c, correct: c.correct + 1 } : { ...c, wrong: c.wrong + 1 })
    setRevealed(true)
  }

  function next() {
    if (index + 1 >= SESSION_SIZE) {
      setFinished(true)
      return
    }
    setIndex(i => i + 1)
    setSelected([])
    setRevealed(false)
  }

  function startNewSession() {
    setSession(newSession())
    setIndex(0)
    setSelected([])
    setRevealed(false)
    setCounts({ correct: 0, wrong: 0 })
    setFinished(false)
  }

  function handleReset() {
    resetWeights()
    startNewSession()
  }

  // Pantalla de resultados
  if (finished) {
    const correctCount = counts.correct
    const pct = Math.round((correctCount / SESSION_SIZE) * 100)
    const weights = loadWeights()
    const hardCards = FULL_DECK
      .filter(c => (weights[c.id] ?? 1) >= 4)
      .slice(0, 6)

    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          background: '#13132a',
          border: '1px solid #1e1e38',
          borderRadius: '16px',
          padding: '40px 32px',
          marginBottom: '20px',
        }}>
          <p style={{ fontSize: '48px', margin: '0 0 12px' }}>
            {pct >= 80 ? '🏆' : pct >= 50 ? '📈' : '💪'}
          </p>
          <h2 style={{ margin: '0 0 8px', fontSize: '28px' }}>
            {correctCount}/{SESSION_SIZE} correctas
          </h2>
          <p style={{ margin: '0 0 24px', color: '#555', fontSize: '14px' }}>
            {pct >= 80 ? '¡Excelente sesión!' : pct >= 50 ? 'Buen trabajo, sigue practicando' : 'Hay tipos que repasar — aparecerán más en próximas sesiones'}
          </p>

          {hardCards.length > 0 && (
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <p style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>
                🔴 Para repasar
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {hardCards.map(c => (
                  <span key={c.id} style={{
                    background: `${TYPE_COLORS[c.type]}22`,
                    border: `1px solid ${TYPE_COLORS[c.type]}44`,
                    color: TYPE_COLORS[c.type],
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}>
                    {TYPE_NAMES_ES[c.type]} ({c.hint})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={startNewSession} style={btnStyle('#7038F8')}>
              Nueva sesión →
            </button>
            <button onClick={handleReset} style={btnStyle('#333', '#888')}>
              Reiniciar progreso
            </button>
          </div>
        </div>
      </div>
    )
  }

  function getTypeState(type) {
    if (!revealed) return selected.includes(type) ? 'selected' : 'idle'
    const isAnswer = card.answer.includes(type)
    const isSelected = selected.includes(type)
    if (isAnswer && isSelected) return 'hit'
    if (isAnswer && !isSelected) return 'missed'
    if (!isAnswer && isSelected) return 'wrong'
    return 'idle'
  }

  const progress = index / SESSION_SIZE

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>

      {/* Barra de progreso — transform:scaleX evita reflow vs width */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
        <div className="fc-progress-bar">
          <div
            className="fc-progress-bar__fill"
            style={{
              background: `linear-gradient(90deg, #7038F8, ${color})`,
              transform: `scaleX(${progress})`,
            }}
          />
        </div>
        <span style={{ color: '#444', fontSize: '12px', whiteSpace: 'nowrap' }}>
          {index + 1} / {SESSION_SIZE}
        </span>
        {(counts.correct > 0 || counts.wrong > 0) && (
          <>
            <span style={{ color: ANSWER_COLORS.correct, fontSize: '12px' }}>✓ {counts.correct}</span>
            <span style={{ color: ANSWER_COLORS.wrong,   fontSize: '12px' }}>✗ {counts.wrong}</span>
          </>
        )}
      </div>

      {/* Carta */}
      <div style={{
        background: '#13132a',
        border: `2px solid ${color}44`,
        borderRadius: '16px',
        padding: '28px 24px',
        textAlign: 'center',
        marginBottom: '20px',
        boxShadow: `0 0 40px ${color}0d`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: `${color}22`, border: `2px solid ${color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TypeIcon type={card.type} size={30} />
          </div>
        </div>
        <p style={{ margin: '0 0 4px', color, fontWeight: 700, fontSize: '18px' }}>
          {TYPE_NAMES_ES[card.type]}
        </p>
        <p style={{ margin: '0 0 4px', color: '#555', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {card.mode === 'offensive' ? '⚔️ Ofensiva' : '🛡️ Defensiva'} · {card.hint}
        </p>
        <p style={{ margin: 0, color: '#bbb', fontSize: '14px', marginTop: '8px' }}>
          {card.question}
        </p>
        {card.answer.length === 0 && !revealed && (
          <p style={{ margin: '8px 0 0', color: '#444', fontSize: '12px' }}>
            Pulsa "Revelar" si crees que la respuesta es ninguno
          </p>
        )}
      </div>

      {/* Grid tipos */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', justifyContent: 'center', marginBottom: '20px' }}>
        {TYPES.map(type => {
          const state = getTypeState(type)
          const c = TYPE_COLORS[type]
          let bg = '#0f0f1f', border = '#1e1e38', textColor = '#444'

          if (state === 'selected') { bg = `${c}33`; border = c; textColor = c }
          if (state === 'hit')     { bg = `${ANSWER_COLORS.correct}1a`; border = ANSWER_COLORS.correct; textColor = ANSWER_COLORS.correct }
          if (state === 'missed')  { bg = `${ANSWER_COLORS.missed}1a`; border = ANSWER_COLORS.missed; textColor = ANSWER_COLORS.missed }
          if (state === 'wrong')   { bg = `${ANSWER_COLORS.wrong}1a`; border = ANSWER_COLORS.wrong; textColor = ANSWER_COLORS.wrong }

          return (
            <button key={type} onClick={() => toggleSelect(type)} style={{
              background: bg, color: textColor, border: `2px solid ${border}`,
              padding: '6px 11px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              cursor: revealed ? 'default' : 'pointer', transition: 'all 0.1s',
              display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'inherit',
            }}>
              <TypeIcon type={type} size={13} />
              {TYPE_NAMES_ES[type]}
            </button>
          )
        })}
      </div>

      {/* Respuesta revelada */}
      {revealed && (
        <div style={{
          background: '#0f0f1f', borderRadius: '10px', padding: '12px 16px',
          marginBottom: '16px', fontSize: '13px', color: '#666', lineHeight: 1.6,
        }}>
          {card.answer.length === 0
            ? <span style={{ color: '#555' }}>Correcto — no hay ningún tipo en esta categoría.</span>
            : <>
                <span>Respuesta: </span>
                {card.answer.map(t => (
                  <span key={t} style={{ color: TYPE_COLORS[t], fontWeight: 700 }}>
                    {TYPE_NAMES_ES[t]}{' '}
                  </span>
                ))}
              </>
          }
        </div>
      )}

      {/* Botones */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        {!revealed
          ? <button onClick={reveal} style={btnStyle(selected.length > 0 ? color : '#1a1a2e', selected.length > 0 ? '#fff' : '#333')}>
              {card.answer.length === 0 && selected.length === 0 ? 'Revelar (ninguno)' : 'Revelar respuesta'}
            </button>
          : <button onClick={next} style={btnStyle('#7038F8')}>
              {index + 1 >= SESSION_SIZE ? 'Ver resultados →' : 'Siguiente →'}
            </button>
        }
      </div>
    </div>
  )
}

function btnStyle(bg, color = '#fff') {
  return {
    background: bg, color, border: 'none',
    padding: '12px 28px', borderRadius: '8px',
    fontSize: '14px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s',
  }
}
