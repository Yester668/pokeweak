import { TYPES, calcEffectiveness } from '../../data/types'

export const SURVIVAL_HP      = 450
export const WAVES            = 5
export const ATTACKS_PER_WAVE = 3
export const HAND_SIZE        = 6
export const MAX_TYPING       = 2  // tipos defensivos que puedes elegir
export const BASE_ATTACK      = 45
export const MAX_AMULETS      = 5
export const TIMER_SECS       = 18

// ── Amulets defensivos ────────────────────────────────────────────────────────
export const SURVIVAL_AMULETS = [
  {
    id: 'manto_acero',
    name: 'Manto de Acero',
    emoji: '🛡️',
    rarity: 'rare',
    description: 'Cualquier ataque que haría ×2 queda reducido a ×1.5',
    hint: 'Enseña: el tipo Acero tiene las mejores resistencias del juego',
    applyToHit: ({ effectiveness }) =>
      effectiveness === 2 ? { effectiveness: 1.5, explain: '🛡️ Manto de Acero: ×2 → ×1.5' } : null,
  },
  {
    id: 'terreno_electrico',
    name: 'Terreno Eléctrico',
    emoji: '⚡',
    rarity: 'common',
    description: 'Si eliges Tierra, los ataques Eléctrico hacen ×0',
    hint: 'Enseña: Tierra es inmune a Eléctrico',
    applyToHit: ({ atkType, yourTypes }) =>
      atkType === 'electric' && yourTypes.includes('ground')
        ? { effectiveness: 0, explain: '⚡ Terreno Eléctrico: inmunidad activa' }
        : null,
  },
  {
    id: 'velo_hada',
    name: 'Velo de Hada',
    emoji: '✨',
    rarity: 'common',
    description: 'Si eliges Hada, los ataques Dragón hacen ×0',
    hint: 'Enseña: Hada es completamente inmune al tipo Dragón',
    applyToHit: ({ atkType, yourTypes }) =>
      atkType === 'dragon' && yourTypes.includes('fairy')
        ? { effectiveness: 0, explain: '✨ Velo de Hada: inmunidad a Dragón' }
        : null,
  },
  {
    id: 'regeneracion',
    name: 'Regeneración',
    emoji: '💚',
    rarity: 'common',
    description: 'Recuperas 50 HP entre oleadas',
    hint: 'Gestión de recursos — clave en competitivo defensivo',
    onWaveEnd: ({ hp, maxHp }) => ({
      hpDelta: Math.min(50, maxHp - hp),
      explain: '💚 Regeneración: +50 HP',
    }),
  },
  {
    id: 'reflejo_fantasma',
    name: 'Reflejo Fantasma',
    emoji: '👻',
    rarity: 'rare',
    description: 'Si eliges Fantasma, los ataques Normal y Lucha hacen ×0',
    hint: 'Enseña: Fantasma es inmune a Normal y Lucha',
    applyToHit: ({ atkType, yourTypes }) =>
      ['normal', 'fighting'].includes(atkType) && yourTypes.includes('ghost')
        ? { effectiveness: 0, explain: '👻 Reflejo Fantasma: inmunidad activa' }
        : null,
  },
  {
    id: 'piel_acero',
    name: 'Piel de Acero',
    emoji: '🔩',
    rarity: 'rare',
    description: 'El primer ataque de cada oleada tiene daño limitado a ×1 como máximo',
    hint: 'Enseña: anticipar el primer golpe es clave para sobrevivir',
    applyFirstHit: true, // flag especial, manejado en engine
  },
  {
    id: 'instinto',
    name: 'Instinto de Combate',
    emoji: '👁️',
    rarity: 'common',
    description: 'Siempre ves los tipos de los ataques, incluso en oleadas boss',
    hint: 'Información = ventaja — aprende a leer los movimientos rivales',
    revealsAttacks: true,
  },
  {
    id: 'cobertura_amplia',
    name: 'Cobertura Amplia',
    emoji: '🌐',
    rarity: 'common',
    description: 'Si eliges 2 tipos, recibes un 15% menos de daño total',
    hint: 'Enseña: el doble tipo aumenta las resistencias potenciales',
    onTotalDamage: ({ damage, yourTypes }) =>
      yourTypes.length === 2
        ? { damage: Math.round(damage * 0.85), explain: '🌐 Cobertura Amplia: −15% daño' }
        : null,
  },
]

// ── Rivales / oleadas por ante ────────────────────────────────────────────────
// Los ataques vienen de Pokémon rivales — enseña qué tipos usan
export const WAVE_SETS = [
  // Ante 1 — ataques de tipos simples
  {
    ante: 1, waves: [
      { name: 'Rhydon',     attacks: ['rock', 'ground', 'normal'],        boss: false },
      { name: 'Vaporeon',   attacks: ['water', 'ice', 'normal'],          boss: false },
      { name: 'Jolteon',    attacks: ['electric', 'normal', 'electric'],  boss: false },
      { name: 'Arcanine',   attacks: ['fire', 'normal', 'fire'],          boss: false },
      { name: 'Alakazam',   attacks: ['psychic', 'psychic', 'normal'],    boss: true, hidden: true,
        bossDesc: 'Ataques OCULTOS — no ves los tipos hasta después de elegir' },
    ],
  },
  // Ante 2 — ataques de doble tipo, más variedad
  {
    ante: 2, waves: [
      { name: 'Scizor',     attacks: ['bug', 'steel', 'normal'],          boss: false },
      { name: 'Dragonite',  attacks: ['dragon', 'flying', 'fire'],        boss: false },
      { name: 'Gengar',     attacks: ['ghost', 'poison', 'dark'],         boss: false },
      { name: 'Tyranitar',  attacks: ['rock', 'dark', 'normal'],          boss: false },
      { name: 'Metagross',  attacks: ['steel', 'psychic', 'steel'],       boss: true, stab: true,
        bossDesc: 'STAB Boss: todos los ataques llevan ×1.5 adicional' },
    ],
  },
  // Ante 3 — inmunidades y combos, máxima dificultad
  {
    ante: 3, waves: [
      { name: 'Garchomp',   attacks: ['dragon', 'ground', 'dragon'],      boss: false },
      { name: 'Togekiss',   attacks: ['fairy', 'flying', 'normal'],       boss: false },
      { name: 'Spiritomb',  attacks: ['ghost', 'dark', 'dark'],           boss: false },
      { name: 'Magnezone',  attacks: ['electric', 'steel', 'electric'],   boss: false },
      { name: 'Mewtwo',     attacks: ['psychic', 'ice', 'fighting'],      boss: true, hidden: true, stab: true,
        bossDesc: 'STAB + Oculto: máxima dificultad' },
    ],
  },
]

// ── Cálculo de daño recibido por oleada ───────────────────────────────────────
export function calcWaveDamage({ attacks, yourTypes, amulets, isStab, isFirstHit }) {
  let totalDamage  = 0
  const breakdown  = []
  const amuletLogs = []
  let firstHitDone = false

  for (const atkType of attacks) {
    let effectiveness = calcEffectiveness(atkType, yourTypes)
    let hitExplain    = null

    // Amulets que modifican hit a hit
    for (const am of amulets) {
      if (am.applyToHit) {
        const res = am.applyToHit({ atkType, yourTypes, effectiveness })
        if (res) { effectiveness = res.effectiveness; hitExplain = res.explain; break }
      }
    }

    // Piel de Acero: primer golpe capped a ×1
    if (!firstHitDone) {
      const hasPiel = amulets.some(a => a.applyFirstHit)
      if (hasPiel && effectiveness > 1) {
        effectiveness = 1
        hitExplain = '🔩 Piel de Acero: primer golpe limitado a ×1'
      }
      firstHitDone = true
    }

    const stabMult = isStab ? 1.5 : 1
    const damage   = Math.round(BASE_ATTACK * effectiveness * stabMult)
    totalDamage   += damage
    breakdown.push({ atkType, effectiveness, stabMult, damage, explain: hitExplain })
  }

  // Cobertura Amplia (sobre daño total)
  let totalExplain = null
  for (const am of amulets) {
    if (am.onTotalDamage) {
      const res = am.onTotalDamage({ damage: totalDamage, yourTypes })
      if (res) { totalDamage = res.damage; totalExplain = res.explain; break }
    }
  }

  return { totalDamage, breakdown, totalExplain, amuletLogs }
}

// ── Fin de oleada: regeneración ───────────────────────────────────────────────
export function applyWaveEndAmulets({ hp, maxHp, amulets }) {
  let delta = 0
  const logs = []
  for (const am of amulets) {
    if (am.onWaveEnd) {
      const res = am.onWaveEnd({ hp, maxHp })
      if (res) { delta += res.hpDelta; logs.push(res.explain) }
    }
  }
  return { newHp: Math.min(maxHp, hp + delta), logs }
}

export function buildSurvivalShopOffers(ownedIds, count = 3) {
  const available = SURVIVAL_AMULETS.filter(a => !ownedIds.includes(a.id))
  return shuffle(available).slice(0, count)
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildHand() {
  return Array.from({ length: HAND_SIZE }, () => TYPES[Math.floor(Math.random() * TYPES.length)])
}
