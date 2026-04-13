import { TYPES } from '../../data/types'
import { calcEffectiveness } from '../../data/types'
import { RIVALS, AMULETS } from '../../data/typerun'

const HAND_SIZE   = 6
const MAX_PLAY    = 3
const TURNS       = 3
const BASE_DAMAGE = 30
const MAX_AMULETS = 5
const TIMER_SECS  = 15

export { MAX_PLAY, TURNS, TIMER_SECS, MAX_AMULETS }

// ── Mano aleatoria ────────────────────────────────────────────────────────────
export function buildHand() {
  const hand = []
  while (hand.length < HAND_SIZE) {
    hand.push(TYPES[Math.floor(Math.random() * TYPES.length)])
  }
  return hand
}

// ── Estructura de run ─────────────────────────────────────────────────────────
export function buildRun() {
  const run = []
  for (let ante = 1; ante <= 3; ante++) {
    const pool    = RIVALS.filter(r => r.ante === ante && !r.boss)
    const boss    = RIVALS.find(r => r.ante === ante && r.boss)
    const normals = shuffle(pool).slice(0, 2)
    run.push(...normals, boss)
  }
  return run  // 9 rivales: 3 antes × (2 normales + 1 boss)
}

// ── Cálculo de turno ──────────────────────────────────────────────────────────
// Devuelve { damage, perType, amuletResults, totalMultiplier, cursedType }
export function calculateTurn({ played, rivalTypes, amulets, cursedType }) {
  const perType = played.map(type => {
    if (type === cursedType) return { type, base: BASE_DAMAGE, effectiveness: 0, subtotal: 0, cursed: true }
    const eff       = calcEffectiveness(type, rivalTypes)
    const subtotal  = BASE_DAMAGE * eff
    return { type, base: BASE_DAMAGE, effectiveness: eff, subtotal, cursed: false }
  })

  const rawDamage = perType.reduce((s, p) => s + p.subtotal, 0)

  // Evalúa amuletos
  const context = { played, rivalTypes, cursedType }
  const amuletResults = amulets.map(a => a.evaluate(context))

  const flatBonus  = amuletResults.reduce((s, r) => s + (r.flatBonus || 0), 0)
  const multiplier = amuletResults.reduce((prod, r) => prod * (r.multiplier || 1), 1)

  const damage = Math.max(0, Math.round((rawDamage + flatBonus) * multiplier))

  return { damage, perType, amuletResults, totalMultiplier: multiplier, flatBonus }
}

// ── Tienda ────────────────────────────────────────────────────────────────────
export function buildShopOffers(ownedIds, count = 3) {
  const available = AMULETS.filter(a => !ownedIds.includes(a.id))
  return shuffle(available).slice(0, count)
}

// ── Curse type para boss "maldicion" ─────────────────────────────────────────
export function pickCursedType(hand) {
  return hand[Math.floor(Math.random() * hand.length)]
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
