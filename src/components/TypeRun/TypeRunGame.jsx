import { useState, useEffect, useCallback, useRef } from 'react'
import { TYPE_COLORS, TYPE_NAMES_ES } from '../../data/types'
import { getSpriteUrl } from '../../data/pokemon'
import TypeIcon from '../TypeIcon'
import {
  buildHand, buildRun, buildShopOffers, calculateTurn, pickCursedType,
  MAX_PLAY, TURNS, TIMER_SECS, MAX_AMULETS,
} from './engine'

// ── Sub-componentes ───────────────────────────────────────────────────────────

function HpBar({ hp, maxHp, regen }) {
  const pct = Math.max(0, hp / maxHp)
  const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#666' }}>HP</span>
        <span style={{ fontSize: 11, color: '#888' }}>{hp} / {maxHp}{regen ? <span style={{ color: '#22c55e' }}> +{regen}/turno</span> : ''}</span>
      </div>
      <div style={{ height: 6, background: '#1a1a2e', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function RivalCard({ rival, typesHidden, bossEffect }) {
  return (
    <div className="tr-rival-card">
      {rival.boss && (
        <div className="tr-boss-badge">⚠️ BOSS — {rival.bossDesc}</div>
      )}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <img
          src={getSpriteUrl(rival.sprite)}
          alt={rival.name}
          width={80} height={80}
          style={{ imageRendering: 'pixelated', filter: typesHidden ? 'brightness(0.2)' : 'none', transition: 'filter 0.3s' }}
          decoding="async"
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#fff' }}>{rival.name}</h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {typesHidden
              ? <span style={{ fontSize: 12, color: '#444', fontStyle: 'italic' }}>Tipos ocultos por la Niebla…</span>
              : rival.types.map(t => (
                  <span key={t} style={{
                    background: `${TYPE_COLORS[t]}22`, border: `1px solid ${TYPE_COLORS[t]}`,
                    color: TYPE_COLORS[t], padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600,
                  }}>
                    <TypeIcon type={t} size={11} /> {TYPE_NAMES_ES[t]}
                  </span>
                ))
            }
          </div>
          <HpBar hp={rival.hp} maxHp={rival.maxHp} regen={bossEffect === 'regeneracion' ? 40 : 0} />
        </div>
      </div>
    </div>
  )
}

function Timer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds)
  const cbRef = useRef(onExpire)
  cbRef.current = onExpire

  useEffect(() => {
    setLeft(seconds)
    const id = setInterval(() => {
      setLeft(l => {
        if (l <= 1) { clearInterval(id); cbRef.current(); return 0 }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [seconds]) // re-mount when seconds resets (new turn)

  const pct   = left / seconds
  const urgent = left <= 5

  return (
    <div className={`tr-timer ${urgent ? 'tr-timer--urgent' : ''}`}>
      <div className="tr-timer__bar">
        <div
          className="tr-timer__fill"
          style={{ transform: `scaleX(${pct})`, background: urgent ? '#ef4444' : '#7038F8' }}
        />
      </div>
      <span className="tr-timer__label" style={{ color: urgent ? '#ef4444' : '#555' }}>
        {left}s
      </span>
    </div>
  )
}

function AmuletRack({ amulets }) {
  if (amulets.length === 0) return (
    <div style={{ color: '#333', fontSize: 12, padding: '8px 0', fontStyle: 'italic' }}>
      Sin amuletos — consigue uno en la tienda tras el primer blind
    </div>
  )
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {amulets.map(a => (
        <div key={a.id} className="tr-amulet" title={`${a.description}\n${a.hint}`}>
          <span>{a.emoji}</span>
          <span style={{ fontSize: 11, color: '#aaa' }}>{a.name}</span>
        </div>
      ))}
    </div>
  )
}

function HandDisplay({ hand, selected, onToggle, maxPlay, cursedType, disabled }) {
  return (
    <div className="tr-hand">
      {hand.map((type, i) => {
        const isSel     = selected.includes(i)
        const isCursed  = type === cursedType
        const isMaxed   = !isSel && selected.length >= maxPlay
        const color     = TYPE_COLORS[type]
        return (
          <button
            key={i}
            onClick={() => !disabled && !isMaxed ? onToggle(i) : null}
            className={`tr-type-card ${isSel ? 'tr-type-card--selected' : ''} ${isCursed ? 'tr-type-card--cursed' : ''} ${isMaxed ? 'tr-type-card--dim' : ''}`}
            style={{ '--tc': color }}
            title={isCursed ? '⚠️ Tipo maldito este turno' : ''}
          >
            <TypeIcon type={type} size={22} invert={isSel} />
            <span>{TYPE_NAMES_ES[type]}</span>
            {isCursed && <span style={{ fontSize: 9, color: '#ef4444' }}>⚠️ ×0</span>}
          </button>
        )
      })}
    </div>
  )
}

function DamageBreakdown({ result, onNext, isLast }) {
  const { damage, perType, amuletResults, flatBonus, totalMultiplier } = result
  const triggered = amuletResults.filter(r => r.triggered)

  return (
    <div className="tr-breakdown fade-in">
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Resultado del turno
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {perType.map((p, i) => (
          <div key={i} className="tr-damage-chip" style={{ '--tc': TYPE_COLORS[p.type] }}>
            <TypeIcon type={p.type} size={13} />
            <span>{TYPE_NAMES_ES[p.type]}</span>
            <span style={{ color: effectColor(p.effectiveness) }}>
              {p.cursed ? '×0 💀' : `×${p.effectiveness}`}
            </span>
            <span style={{ color: '#888' }}>={p.subtotal}</span>
          </div>
        ))}
      </div>

      {triggered.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {triggered.map((r, i) => (
            <div key={i} style={{ fontSize: 12, color: '#f59e0b', marginBottom: 3 }}>
              {r.explain}
              {r.flatBonus ? ` (+${r.flatBonus})` : ''}
              {r.multiplier !== 1 ? ` (×${r.multiplier})` : ''}
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px solid #1e1e38', paddingTop: 12, marginBottom: 16 }}>
        {flatBonus !== 0 && <div style={{ fontSize: 12, color: '#aaa' }}>Bonus plano: {flatBonus > 0 ? '+' : ''}{flatBonus}</div>}
        {totalMultiplier !== 1 && <div style={{ fontSize: 12, color: '#aaa' }}>Multiplicador: ×{totalMultiplier.toFixed(2)}</div>}
        <div style={{ fontSize: 24, fontWeight: 800, color: damage > 0 ? '#22c55e' : '#ef4444', marginTop: 4 }}>
          {damage > 0 ? `−${damage} HP` : '¡Sin daño!'}
        </div>
      </div>

      <button onClick={onNext} className="tr-btn" style={{ background: '#7038F8' }}>
        {isLast ? 'Siguiente rival →' : 'Siguiente turno →'}
      </button>
    </div>
  )
}

function effectColor(e) {
  if (e === 0)   return '#ef4444'
  if (e < 1)     return '#f59e0b'
  if (e === 1)   return '#888'
  if (e === 2)   return '#22c55e'
  return '#00e5ff'
}

// ── Tienda ────────────────────────────────────────────────────────────────────
function Shop({ offers, amulets, onPick, onSkip }) {
  const full = amulets.length >= MAX_AMULETS
  return (
    <div className="tr-shop fade-in">
      <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>🛒 Tienda</h2>
      <p style={{ margin: '0 0 24px', color: '#555', fontSize: 13 }}>
        Elige un amuleto — cada uno te enseña una relación de tipos real
        {full && <span style={{ color: '#ef4444' }}> (amuletos llenos)</span>}
      </p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
        {offers.map(a => (
          <button
            key={a.id}
            onClick={() => !full && onPick(a)}
            className={`tr-shop-card ${a.rarity === 'rare' ? 'tr-shop-card--rare' : ''} ${a.rarity === 'cursed' ? 'tr-shop-card--cursed' : ''} ${full ? 'tr-shop-card--disabled' : ''}`}
          >
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

// ── Game Over ─────────────────────────────────────────────────────────────────
function GameOver({ stats, onRestart }) {
  return (
    <div className="tr-gameover fade-in">
      <div className="tr-gameover__inner">
        <p style={{ fontSize: 56, margin: '0 0 8px' }}>💀</p>
        <h2 style={{ margin: '0 0 6px', fontSize: 28, color: '#ef4444' }}>Run terminada</h2>
        <p style={{ margin: '0 0 24px', color: '#555', fontSize: 14 }}>
          Llegaste al Ante {stats.ante}, Blind {stats.blind}
        </p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{stats.totalDamage}</div>
            <div style={{ fontSize: 11, color: '#555' }}>DAÑO TOTAL</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#7038F8' }}>{stats.blindsBeaten}</div>
            <div style={{ fontSize: 11, color: '#555' }}>BLINDS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{stats.amulets}</div>
            <div style={{ fontSize: 11, color: '#555' }}>AMULETOS</div>
          </div>
        </div>
        <button onClick={onRestart} className="tr-btn" style={{ background: '#ef4444', fontSize: 16 }}>
          Nueva partida
        </button>
      </div>
    </div>
  )
}

function Victory({ stats, onRestart }) {
  return (
    <div className="tr-gameover fade-in">
      <div className="tr-gameover__inner">
        <p style={{ fontSize: 56, margin: '0 0 8px' }}>🏆</p>
        <h2 style={{ margin: '0 0 6px', fontSize: 28, color: '#f59e0b' }}>¡Run completada!</h2>
        <p style={{ margin: '0 0 24px', color: '#aaa', fontSize: 14 }}>
          Has derrotado los 3 Antes — dominas los tipos competitivos
        </p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b' }}>{stats.totalDamage}</div>
            <div style={{ fontSize: 11, color: '#555' }}>DAÑO TOTAL</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{stats.amulets}</div>
            <div style={{ fontSize: 11, color: '#555' }}>AMULETOS</div>
          </div>
        </div>
        <button onClick={onRestart} className="tr-btn" style={{ background: '#f59e0b', color: '#000', fontSize: 16 }}>
          Nueva partida
        </button>
      </div>
    </div>
  )
}

// ── Máquina de estados principal ──────────────────────────────────────────────
function initState() {
  const run = buildRun()
  const first = run[0]
  return {
    phase: 'battle',        // 'battle' | 'resolving' | 'shop' | 'gameover' | 'victory'
    run,
    runIndex: 0,
    rival: { ...first, maxHp: first.hp },
    turnsLeft: TURNS,
    hand: buildHand(),
    selected: [],           // índices de la mano seleccionados
    amulets: [],
    lastResult: null,
    timerKey: 0,            // cambiar para resetear el timer
    typesHidden: first.boss && first.bossEffect === 'niebla',
    cursedType: null,
    stats: { totalDamage: 0, blindsBeaten: 0, ante: 1, blind: 1 },
  }
}

export default function TypeRunGame() {
  const [state, setState] = useState(initState)

  const { phase, rival, turnsLeft, hand, selected, amulets, lastResult, timerKey, typesHidden, cursedType, stats } = state

  // ── Seleccionar tipo de la mano ───
  const toggleSelect = useCallback((idx) => {
    setState(s => {
      if (s.selected.includes(idx)) return { ...s, selected: s.selected.filter(i => i !== idx) }
      if (s.selected.length >= MAX_PLAY) return s
      return { ...s, selected: [...s.selected, idx] }
    })
  }, [])

  // ── Jugar turno ───────────────────
  const playTurn = useCallback(() => {
    setState(s => {
      if (s.selected.length === 0 || s.phase !== 'battle') return s

      const played = s.selected.map(i => s.hand[i])
      const result = calculateTurn({
        played,
        rivalTypes: s.rival.types,
        amulets: s.amulets,
        cursedType: s.cursedType,
      })

      const newHp = Math.max(0, s.rival.hp - result.damage)
      return {
        ...s,
        phase: 'resolving',
        rival: { ...s.rival, hp: newHp },
        lastResult: result,
        stats: { ...s.stats, totalDamage: s.stats.totalDamage + result.damage },
      }
    })
  }, [])

  // ── Timer expirado: juega aleatorio ──
  const onTimerExpire = useCallback(() => {
    setState(s => {
      if (s.phase !== 'battle') return s
      const autoIdx = [Math.floor(Math.random() * s.hand.length)]
      const played  = autoIdx.map(i => s.hand[i])
      const result  = calculateTurn({ played, rivalTypes: s.rival.types, amulets: s.amulets, cursedType: s.cursedType })
      const newHp   = Math.max(0, s.rival.hp - result.damage)
      return {
        ...s,
        phase: 'resolving',
        selected: autoIdx,
        rival: { ...s.rival, hp: newHp },
        lastResult: result,
        stats: { ...s.stats, totalDamage: s.stats.totalDamage + result.damage },
      }
    })
  }, [])

  // ── Después de ver el resultado ───
  const afterResult = useCallback(() => {
    setState(s => {
      const rivalDefeated = s.rival.hp <= 0
      const turnsExhausted = s.turnsLeft <= 1

      // Rival derrotado → tienda o siguiente rival
      if (rivalDefeated) {
        const nextRunIndex = s.runIndex + 1
        if (nextRunIndex >= s.run.length) {
          return { ...s, phase: 'victory' }
        }
        return {
          ...s,
          phase: 'shop',
          stats: {
            ...s.stats,
            blindsBeaten: s.stats.blindsBeaten + 1,
            ante: Math.floor(nextRunIndex / 3) + 1,
            blind: (nextRunIndex % 3) + 1,
          },
        }
      }

      // Sin turnos → game over
      if (turnsExhausted) {
        return { ...s, phase: 'gameover' }
      }

      // Siguiente turno — si boss con regeneración, sumar HP
      const regenHp = (s.rival.boss && s.rival.bossEffect === 'regeneracion')
        ? Math.min(s.rival.maxHp, s.rival.hp + 40)
        : s.rival.hp

      // Si boss con maldición, nuevo tipo maldito
      const newCursed = (s.rival.boss && s.rival.bossEffect === 'maldicion')
        ? pickCursedType(s.hand)
        : null

      return {
        ...s,
        phase: 'battle',
        turnsLeft: s.turnsLeft - 1,
        hand: buildHand(),
        selected: [],
        lastResult: null,
        timerKey: s.timerKey + 1,
        rival: { ...s.rival, hp: regenHp },
        cursedType: newCursed,
        typesHidden: false, // se revela tras primer ataque en modo niebla
      }
    })
  }, [])

  // ── Elegir amuleto en tienda ──────
  const pickAmulet = useCallback((amulet) => {
    setState(s => {
      if (s.amulets.length >= MAX_AMULETS) return s
      const nextRunIndex = s.runIndex + 1
      const nextRival = s.run[nextRunIndex]
      const newCursed = (nextRival?.boss && nextRival.bossEffect === 'maldicion')
        ? pickCursedType(buildHand())
        : null
      return {
        ...s,
        phase: 'battle',
        runIndex: nextRunIndex,
        rival: { ...nextRival, maxHp: nextRival.hp },
        turnsLeft: TURNS,
        hand: buildHand(),
        selected: [],
        lastResult: null,
        timerKey: s.timerKey + 1,
        amulets: [...s.amulets, amulet],
        typesHidden: nextRival.boss && nextRival.bossEffect === 'niebla',
        cursedType: newCursed,
      }
    })
  }, [])

  const skipShop = useCallback(() => {
    setState(s => {
      const nextRunIndex = s.runIndex + 1
      const nextRival = s.run[nextRunIndex]
      return {
        ...s,
        phase: 'battle',
        runIndex: nextRunIndex,
        rival: { ...nextRival, maxHp: nextRival.hp },
        turnsLeft: TURNS,
        hand: buildHand(),
        selected: [],
        lastResult: null,
        timerKey: s.timerKey + 1,
        typesHidden: nextRival.boss && nextRival.bossEffect === 'niebla',
        cursedType: null,
      }
    })
  }, [])

  const restart = useCallback(() => setState(initState), [])

  // ── Render ────────────────────────────────────────────────────────────────
  if (phase === 'gameover') return <GameOver stats={stats} onRestart={restart} />
  if (phase === 'victory')  return <Victory  stats={stats} onRestart={restart} />

  if (phase === 'shop') {
    const offers = buildShopOffers(amulets.map(a => a.id))
    return <Shop offers={offers} amulets={amulets} onPick={pickAmulet} onSkip={skipShop} />
  }

  const currentAnte   = Math.floor(state.runIndex / 3) + 1
  const currentBlind  = (state.runIndex % 3) + 1
  const isResolving   = phase === 'resolving'

  return (
    <div className="tr-root">
      {/* Header de run */}
      <div className="tr-run-header">
        <span style={{ color: '#555', fontSize: 12 }}>
          ANTE {currentAnte} — BLIND {currentBlind === 3 ? '⚠️ BOSS' : currentBlind}
        </span>
        <span style={{ color: '#555', fontSize: 12 }}>
          Turnos: {turnsLeft} restantes
        </span>
      </div>

      {/* Rival */}
      <RivalCard rival={rival} typesHidden={typesHidden} bossEffect={rival.bossEffect} />

      {/* Amuletos activos */}
      <div className="tr-amulet-section">
        <p className="tr-section-label">Amuletos activos ({amulets.length}/{MAX_AMULETS})</p>
        <AmuletRack amulets={amulets} />
      </div>

      {/* Área de batalla o resultado */}
      {isResolving
        ? <DamageBreakdown
            result={lastResult}
            onNext={afterResult}
            isLast={rival.hp <= 0 || turnsLeft <= 1}
          />
        : <>
            <Timer key={timerKey} seconds={TIMER_SECS} onExpire={onTimerExpire} />

            <div className="tr-battle-area">
              <p className="tr-section-label">
                Tu mano — elige hasta {MAX_PLAY} tipos para atacar
                {cursedType && <span style={{ color: '#ef4444' }}> · Tipo maldito revelado</span>}
              </p>
              <HandDisplay
                hand={hand}
                selected={selected}
                onToggle={toggleSelect}
                maxPlay={MAX_PLAY}
                cursedType={cursedType}
                disabled={isResolving}
              />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button
                  onClick={playTurn}
                  disabled={selected.length === 0}
                  className="tr-btn tr-btn--play"
                  style={{ background: selected.length > 0 ? '#7038F8' : '#1a1a2e', color: selected.length > 0 ? '#fff' : '#333' }}
                >
                  ⚔️ Atacar con {selected.length} tipo{selected.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </>
      }
    </div>
  )
}
