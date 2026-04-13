import { TYPES, TYPE_NAMES_ES, OFFENSIVE_PROFILES, DEFENSIVE_PROFILES } from './types'

export const FULL_DECK_SIZE = 72

// Genera el pool completo de cartas — 4 tipos de pregunta × 18 tipos = 72 cartas
export function buildFullDeck() {
  const cards = []

  for (const type of TYPES) {
    const off = OFFENSIVE_PROFILES[type]
    const def = DEFENSIVE_PROFILES[type]

    // 1. Ofensiva ×2: ¿qué atacas con ventaja?
    cards.push({
      id: `off-2x-${type}`,
      type,
      question: `¿Contra qué tipos hace ×2 un ataque ${TYPE_NAMES_ES[type]}?`,
      hint: 'Súper efectivo',
      answer: off.double,
      mode: 'offensive',
      difficulty: off.double.length === 0 ? 'easy' : 'medium',
    })

    // 2. Ofensiva ×0: ¿a qué eres inmune ofensivamente?
    if (off.immune.length > 0) {
      cards.push({
        id: `off-0x-${type}`,
        type,
        question: `¿Qué tipos son INMUNES a ataques ${TYPE_NAMES_ES[type]}?`,
        hint: 'Sin efecto (×0)',
        answer: off.immune,
        mode: 'offensive',
        difficulty: 'hard',
      })
    }

    // 3. Defensiva ×2: ¿qué te hace daño doble?
    cards.push({
      id: `def-2x-${type}`,
      type,
      question: `Si tu Pokémon es tipo ${TYPE_NAMES_ES[type]}, ¿qué tipos le hacen ×2?`,
      hint: 'Debilidades',
      answer: def.double,
      mode: 'defensive',
      difficulty: def.double.length <= 2 ? 'easy' : 'medium',
    })

    // 4. Defensiva resistencias: ¿qué resistes?
    cards.push({
      id: `def-half-${type}`,
      type,
      question: `Tipo ${TYPE_NAMES_ES[type]}: ¿qué tipos resiste (×0.5)?`,
      hint: 'Resistencias',
      answer: def.half,
      mode: 'defensive',
      difficulty: 'hard',
    })
  }

  return cards
}

// ---- localStorage de pesos ----
const STORAGE_KEY = 'pokeweak_weights'

export function loadWeights() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveWeights(weights) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weights))
}

// Actualiza el peso de una carta según si se acertó o no
// Peso inicial: 1. Fallo: +2 (max 10). Acierto: -1 (min 1).
export function updateWeight(cardId, correct) {
  const weights = loadWeights()
  const current = weights[cardId] ?? 1
  weights[cardId] = correct
    ? Math.max(1, current - 1)
    : Math.min(10, current + 2)
  saveWeights(weights)
}

// Resetea todos los pesos
export function resetWeights() {
  localStorage.removeItem(STORAGE_KEY)
}

// Selecciona N cartas ponderadas por peso (las que más fallas aparecen más)
export function pickWeightedCards(deck, n = 10) {
  const weights = loadWeights()

  // Asigna peso a cada carta
  const weighted = deck.map(card => ({
    card,
    weight: weights[card.id] ?? 1,
  }))

  const selected = []
  const pool = [...weighted]

  for (let i = 0; i < Math.min(n, pool.length); i++) {
    const totalWeight = pool.reduce((sum, e) => sum + e.weight, 0)
    let rand = Math.random() * totalWeight
    let chosen = 0
    for (let j = 0; j < pool.length; j++) {
      rand -= pool[j].weight
      if (rand <= 0) { chosen = j; break }
    }
    selected.push(pool[chosen].card)
    pool.splice(chosen, 1)
  }

  return selected
}
