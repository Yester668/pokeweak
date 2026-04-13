import { useState, useEffect, useRef, useCallback } from 'react'
import { TYPE_COLORS, TYPE_NAMES_ES } from '../../data/types'
import { getSpriteUrl } from '../../data/pokemon'
import TypeIcon from '../TypeIcon'
import {
  SURVIVAL_HP, WAVES, ATTACKS_PER_WAVE, MAX_TYPING, MAX_AMULETS,
  TIMER_SECS, WAVE_SETS, SURVIVAL_AMULETS,
  calcWaveDamage, applyWaveEndAmulets, buildSurvivalShopOffers, buildHand,
} from './engine'

// ─── Timer (reutilizable) ────────────────────────────────────────────────────
function Timer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds)
  const cbRef = useRef(onExpire)
  cbRef.current = onExpire
  useEffect(() => {
    setLeft(seconds)
    const id = setInterval(() => {
      setLeft(l => { if (l <= 1) { clearInterval(id); cbRef.current(); return 0 } return l - 1 })
    }, 1000)
    return () => clearInterval(id)
  }, [seconds])
  const urgent = left <= 5
  return (
    <div className={`tr-timer ${urgent ? 'tr-timer--urgent' : ''}`}>
      <div className="tr-timer__bar">
        <div className="tr-timer__fill" style={{ transform: `scaleX(${left / seconds})`, background: urgent ? '#ef4444' : '#22c55e' }} />
      </div>
      <span className="tr-timer__label" style={{ color: urgent ? '#ef4444' : '#555' }}>{left}s</span>
    </div>
  )
}

// ─── Barra de HP del jugador ─────────────────────────────────────────────────
function PlayerHpBar({ hp, maxHp }) {
  const pct   = Math.max(0, hp / maxHp)
  const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ background: '#13132a', border: '1px solid #1e1e38', borderRadius: 12, padding: '14px 18px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#aaa' }}>Tu Pokémon</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{hp} / {maxHp} HP</span>
      </div>
      <div style={{ height: 8, background: '#1a1a2e', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 4, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

// ─── Ataques entrantes ───────────────────────────────────────────────────────
function IncomingAttacks({ attacks, hidden }) {
  return (
    <div style={{ background: '#13132a', border: '1px solid #1e1e38', borderRadius: 12, padding: '14px 18px' }}>
      <p style={{ margin: '0 0 10px', fontSize: 11, color: '#555', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Ataques entrantes
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {attacks.map((type, i) => (
          <div key={i} style={{
            flex: 1, padding: '10px 8px', borderRadius: 8, textAlign: 'center',
            background: hidden ? '#0f0f1f' : `${TYPE_COLORS[type]}18`,
            border: `1px solid ${hidden ? '#1e1e38' : TYPE_COLORS[type] + '55'}`,
          }}>
            {hidden
              ? <span style={{ fontSize: 20, filter: 'blur(4px)', userSelect: 'none' }}>?</span>
              : <>
                  <TypeIcon type={type} size={20} />
                  <div style={{ fontSize: 11, color: TYPE_COLORS[type], fontWeight: 700, marginTop: 4 }}>
                    {TYPE_NAMES_ES[type]}
                  </div>
                </>
            }
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Resultado de la oleada ──────────────────────────────────────────────────
function WaveResult({ result, yourTypes, onNext, isLast }) {
  const { totalDamage, breakdown, totalExplain } = result
  return (
    <div className="tr-breakdown fade-in">
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Daño recibido
      </p>
      <div style={{ marginBottom: 12 }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, color: '#555' }}>Tu typing activo:</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {yourTypes.map(t => (
            <span key={t} style={{ background: `${TYPE_COLORS[t]}22`, border: `1px solid ${TYPE_COLORS[t]}`, color: TYPE_COLORS[t], padding: '3px 10px', borderRadius: 5, fontSize: 12, fontWeight: 700 }}>
              {TYPE_NAMES_ES[t]}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {breakdown.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <TypeIcon type={b.atkType} size={14} />
            <span style={{ color: TYPE_COLORS[b.atkType], fontWeight: 600 }}>{TYPE_NAMES_ES[b.atkType]}</span>
            <span style={{ color: effectColor(b.effectiveness) }}>×{b.effectiveness}</span>
            {b.stabMult > 1 && <span style={{ color: '#f59e0b' }}>STAB ×{b.stabMult}</span>}
            <span style={{ color: '#888' }}>= −{b.damage} HP</span>
            {b.explain && <span style={{ color: '#7038F8', marginLeft: 4 }}>{b.explain}</span>}
          </div>
        ))}
      </div>
      {totalExplain && <div style={{ fontSize: 12, color: '#22c55e', marginBottom: 10 }}>{totalExplain}</div>}
      <div style={{ borderTop: '1px solid #1e1e38', paddingTop: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: totalDamage === 0 ? '#22c55e' : '#ef4444' }}>
          {totalDamage === 0 ? '¡Sin daño!' : `−${totalDamage} HP`}
        </div>
      </div>
      <button onClick={onNext} className="tr-btn" style={{ background: '#22c55e' }}>
        {isLast ? 'Siguiente ante →' : 'Siguiente oleada →'}
      </button>
    </div>
  )
}

function effectColor(e) {
  if (e === 0) return '#22c55e'
  if (e < 1)   return '#22c55e'
  if (e === 1) return '#888'
  return '#ef4444'
}

// ─── Tienda ──────────────────────────────────────────────────────────────────
function Shop({ offers, amulets, onPick, onSkip }) {
  const full = amulets.length >= MAX_AMULETS
  return (
    <div className="tr-shop fade-in">
      <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>🛒 Tienda Defensiva</h2>
      <p style={{ margin: '0 0 24px', color: '#555', fontSize: 13 }}>
        Elige un amuleto para sobrevivir mejor — cada uno refleja una relación de tipos real
        {full && <span style={{ color: '#ef4444' }}> · amuletos llenos</span>}
      </p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
        {offers.map(a => (
          <button key={a.id} onClick={() => !full && onPick(a)}
            className={`tr-shop-card ${a.rarity === 'rare' ? 'tr-shop-card--rare' : ''} ${full ? 'tr-shop-card--disabled' : ''}`}>
            <span style={{ fontSize: 32 }}>{a.emoji}</span>
            <strong style={{ fontSize: 14, color: '#fff' }}>{a.name}</strong>
            <span style={{ fontSize: 11, color: '#888', textAlign: 'center', lineHeight: 1.4 }}>{a.description}</span>
            <span style={{ fontSize: 10, color: '#444', fontStyle: 'italic', textAlign: 'center' }}>{a.hint}</span>
            <span className={`tr-rarity tr-rarity--${a.rarity}`}>{a.rarity}</span>
          </button>
        ))}
      </div>
      <button onClick={onSkip} className="tr-btn" style={{ background: '#1a1a2e', color: '#555', border: '1px solid #2a2a3f' }}>
        Saltar tienda →
      </button>
    </div>
  )
}

// ─── Fin de run ──────────────────────────────────────────────────────────────
function EndScreen({ survived, stats, onRestart }) {
  return (
    <div className="tr-gameover fade-in">
      <div className="tr-gameover__inner">
        <p style={{ fontSize: 56, margin: '0 0 8px' }}>{survived ? '🏆' : '💀'}</p>
        <h2 style={{ margin: '0 0 6px', fontSize: 28, color: survived ? '#f59e0b' : '#ef4444' }}>
          {survived ? '¡Run completada!' : 'Run terminada'}
        </h2>
        <p style={{ margin: '0 0 24px', color: '#555', fontSize: 14 }}>
          {survived ? `Sobreviviste los 3 antes — dominas la defensa de tipos` : `Llegaste al Ante ${stats.ante}, Oleada ${stats.wave}`}
        </p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{stats.hpLeft}</div>
            <div style={{ fontSize: 11, color: '#555' }}>HP FINAL</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{stats.totalDmgReceived}</div>
            <div style={{ fontSize: 11, color: '#555' }}>DAÑO RECIBIDO</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#7038F8' }}>{stats.wavesSurvived}</div>
            <div style={{ fontSize: 11, color: '#555' }}>OLEADAS</div>
          </div>
        </div>
        <button onClick={onRestart} className="tr-btn" style={{ background: survived ? '#f59e0b' : '#ef4444', color: survived ? '#000' : '#fff', fontSize: 16 }}>
          Nueva partida
        </button>
      </div>
    </div>
  )
}

// ─── Estado inicial ──────────────────────────────────────────────────────────
function initState() {
  const waveSet = WAVE_SETS[0]
  return {
    phase: 'selecting',  // 'selecting' | 'result' | 'shop' | 'end'
    ante: 0,
    waveIndex: 0,
    hp: SURVIVAL_HP,
    maxHp: SURVIVAL_HP,
    hand: buildHand(),
    selectedTypes: [],   // 1-2 tipos elegidos como tu typing
    amulets: [],
    lastResult: null,
    timerKey: 0,
    currentWaveSet: waveSet,
    stats: { totalDmgReceived: 0, wavesSurvived: 0, ante: 1, wave: 1, hpLeft: SURVIVAL_HP },
  }
}

// ─── Juego principal ─────────────────────────────────────────────────────────
export default function TypeRunSurvival() {
  const [state, setState] = useState(initState)
  const { phase, ante, waveIndex, hp, maxHp, hand, selectedTypes, amulets, lastResult, timerKey, currentWaveSet, stats } = state

  const wave = currentWaveSet.waves[waveIndex]
  const hidden = wave?.hidden && !amulets.some(a => a.revealsAttacks)

  const toggleType = useCallback((type) => {
    setState(s => {
      if (s.selectedTypes.includes(type))
        return { ...s, selectedTypes: s.selectedTypes.filter(t => t !== type) }
      if (s.selectedTypes.length >= MAX_TYPING) return s
      return { ...s, selectedTypes: [...s.selectedTypes, type] }
    })
  }, [])

  const endure = useCallback(() => {
    setState(s => {
      if (s.selectedTypes.length === 0 || s.phase !== 'selecting') return s
      const w = s.currentWaveSet.waves[s.waveIndex]
      const result = calcWaveDamage({
        attacks: w.attacks,
        yourTypes: s.selectedTypes,
        amulets: s.amulets,
        isStab: !!w.stab,
        isFirstHit: true,
      })
      const newHp = Math.max(0, s.hp - result.totalDamage)
      return {
        ...s,
        phase: 'result',
        hp: newHp,
        lastResult: result,
        stats: {
          ...s.stats,
          totalDmgReceived: s.stats.totalDmgReceived + result.totalDamage,
          hpLeft: newHp,
        },
      }
    })
  }, [])

  const onTimerExpire = useCallback(() => {
    setState(s => {
      if (s.phase !== 'selecting') return s
      // Auto-elige el primer tipo disponible
      const autoType = [s.hand[0]]
      const w = s.currentWaveSet.waves[s.waveIndex]
      const result = calcWaveDamage({ attacks: w.attacks, yourTypes: autoType, amulets: s.amulets, isStab: !!w.stab })
      const newHp = Math.max(0, s.hp - result.totalDamage)
      return {
        ...s,
        phase: 'result',
        selectedTypes: autoType,
        hp: newHp,
        lastResult: result,
        stats: { ...s.stats, totalDmgReceived: s.stats.totalDmgReceived + result.totalDamage, hpLeft: newHp },
      }
    })
  }, [])

  const afterResult = useCallback(() => {
    setState(s => {
      // Muerto
      if (s.hp <= 0) return { ...s, phase: 'end' }

      // ¿Fin de ante?
      const isLastWave = s.waveIndex >= WAVES - 1
      if (isLastWave) {
        // Regen amulets
        const { newHp, logs } = applyWaveEndAmulets({ hp: s.hp, maxHp: s.maxHp, amulets: s.amulets })
        const newAnte = s.ante + 1
        if (newAnte >= WAVE_SETS.length) {
          // Victoria
          return { ...s, hp: newHp, phase: 'end', stats: { ...s.stats, wavesSurvived: s.stats.wavesSurvived + 1, hpLeft: newHp } }
        }
        return {
          ...s, hp: newHp,
          phase: 'shop',
          ante: newAnte,
          stats: { ...s.stats, wavesSurvived: s.stats.wavesSurvived + 1, ante: newAnte + 1, wave: 1, hpLeft: newHp },
        }
      }

      // Siguiente oleada — regen al final de oleada
      const { newHp } = applyWaveEndAmulets({ hp: s.hp, maxHp: s.maxHp, amulets: s.amulets })
      const nextWave = s.waveIndex + 1
      return {
        ...s,
        phase: 'selecting',
        hp: newHp,
        waveIndex: nextWave,
        hand: buildHand(),
        selectedTypes: [],
        lastResult: null,
        timerKey: s.timerKey + 1,
        stats: { ...s.stats, wavesSurvived: s.stats.wavesSurvived + 1, wave: nextWave + 1, hpLeft: newHp },
      }
    })
  }, [])

  const pickAmulet = useCallback((amulet) => {
    setState(s => {
      if (s.amulets.length >= MAX_AMULETS) return s
      return {
        ...s,
        phase: 'selecting',
        amulets: [...s.amulets, amulet],
        waveIndex: 0,
        currentWaveSet: WAVE_SETS[s.ante],
        hand: buildHand(),
        selectedTypes: [],
        timerKey: s.timerKey + 1,
      }
    })
  }, [])

  const skipShop = useCallback(() => {
    setState(s => ({
      ...s,
      phase: 'selecting',
      waveIndex: 0,
      currentWaveSet: WAVE_SETS[s.ante],
      hand: buildHand(),
      selectedTypes: [],
      timerKey: s.timerKey + 1,
    }))
  }, [])

  const restart = useCallback(() => setState(initState), [])

  // ── Renders por fase ──────────────────────────────────────────────────────
  if (phase === 'end') {
    const survived = hp > 0 && ante >= WAVE_SETS.length - 1 && waveIndex >= WAVES - 1
    return <EndScreen survived={survived} stats={stats} onRestart={restart} />
  }

  if (phase === 'shop') {
    const offers = buildSurvivalShopOffers(amulets.map(a => a.id))
    return <Shop offers={offers} amulets={amulets} onPick={pickAmulet} onSkip={skipShop} />
  }

  const isResult = phase === 'result'

  return (
    <div className="tr-root">
      {/* Header */}
      <div className="tr-run-header">
        <span style={{ color: '#555', fontSize: 12 }}>
          ANTE {ante + 1} — OLEADA {waveIndex + 1}/{WAVES}
          {wave?.boss && <span style={{ color: '#ef4444' }}> ⚠️ BOSS</span>}
        </span>
        <span style={{ color: '#555', fontSize: 12 }}>Amuletos: {amulets.length}/{MAX_AMULETS}</span>
      </div>

      {/* Boss warning */}
      {wave?.boss && (
        <div className="tr-boss-badge">{wave.bossDesc}</div>
      )}

      {/* HP bar */}
      <PlayerHpBar hp={hp} maxHp={maxHp} />

      {/* Ataques entrantes */}
      <IncomingAttacks attacks={wave.attacks} hidden={hidden && phase === 'selecting'} />

      {/* Amuletos */}
      {amulets.length > 0 && (
        <div className="tr-amulet-section">
          <p className="tr-section-label">Amuletos defensivos activos</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {amulets.map(a => (
              <div key={a.id} className="tr-amulet" title={a.description}>
                <span>{a.emoji}</span>
                <span style={{ fontSize: 11, color: '#aaa' }}>{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultado o selección */}
      {isResult
        ? <WaveResult
            result={lastResult}
            yourTypes={selectedTypes}
            onNext={afterResult}
            isLast={waveIndex >= WAVES - 1}
          />
        : (
          <div className="tr-battle-area">
            <Timer key={timerKey} seconds={TIMER_SECS} onExpire={onTimerExpire} />
            <p className="tr-section-label" style={{ marginTop: 14 }}>
              Elige tu typing defensivo — hasta {MAX_TYPING} tipos
            </p>
            <div className="tr-hand">
              {hand.map((type, i) => {
                const isSel   = selectedTypes.includes(type)
                const isMaxed = !isSel && selectedTypes.length >= MAX_TYPING
                const color   = TYPE_COLORS[type]
                return (
                  <button
                    key={i}
                    onClick={() => !isMaxed ? toggleType(type) : null}
                    className={`tr-type-card ${isSel ? 'tr-type-card--selected' : ''} ${isMaxed ? 'tr-type-card--dim' : ''}`}
                    style={{ '--tc': color }}
                  >
                    <TypeIcon type={type} size={22} invert={isSel} />
                    <span>{TYPE_NAMES_ES[type]}</span>
                  </button>
                )
              })}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button
                onClick={endure}
                disabled={selectedTypes.length === 0}
                className="tr-btn tr-btn--play"
                style={{ background: selectedTypes.length > 0 ? '#22c55e' : '#1a1a2e', color: selectedTypes.length > 0 ? '#fff' : '#333' }}
              >
                🛡️ Aguantar con {selectedTypes.length || 0} tipo{selectedTypes.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )
      }
    </div>
  )
}
