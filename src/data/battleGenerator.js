import { calcEffectiveness, TYPE_NAMES_ES } from './types'
import { fetchPokemonData } from './pokeapi'

// ── Tabla move → tipo ─────────────────────────────────────────────────────────
// Solo movimientos con daño (no status). Cubre el meta competitivo Gen 9.
export const MOVE_TYPE = {
  // Normal
  'return': 'normal', 'facade': 'normal', 'body-slam': 'normal',
  'extreme-speed': 'normal', 'quick-attack': 'normal', 'boomburst': 'normal',
  'hyper-voice': 'normal', 'double-edge': 'normal',
  // Fire
  'flamethrower': 'fire', 'fire-blast': 'fire', 'fire-fang': 'fire',
  'flare-blitz': 'fire', 'overheat': 'fire', 'heat-wave': 'fire',
  'pyro-ball': 'fire', 'mystical-fire': 'fire', 'sacred-fire': 'fire',
  'torch-song': 'fire',
  // Water
  'surf': 'water', 'waterfall': 'water', 'hydro-pump': 'water',
  'scald': 'water', 'aqua-jet': 'water', 'water-shuriken': 'water',
  'liquidation': 'water', 'aqua-tail': 'water', 'wave-crash': 'water',
  'jet-punch': 'water', 'sparkling-aria': 'water',
  // Electric
  'thunderbolt': 'electric', 'thunder': 'electric', 'volt-switch': 'electric',
  'thunder-punch': 'electric', 'wild-charge': 'electric', 'overdrive': 'electric',
  'discharge': 'electric', 'thunder-fang': 'electric',
  // Grass
  'energy-ball': 'grass', 'giga-drain': 'grass', 'leaf-blade': 'grass',
  'power-whip': 'grass', 'seed-bomb': 'grass', 'solar-beam': 'grass',
  'wood-hammer': 'grass', 'grass-knot': 'grass', 'petal-blizzard': 'grass',
  'flower-trick': 'grass',
  // Ice
  'ice-beam': 'ice', 'blizzard': 'ice', 'ice-punch': 'ice',
  'ice-fang': 'ice', 'triple-axel': 'ice', 'freeze-dry': 'ice',
  'icicle-crash': 'ice', 'icicle-spear': 'ice',
  // Fighting
  'close-combat': 'fighting', 'drain-punch': 'fighting', 'mach-punch': 'fighting',
  'superpower': 'fighting', 'cross-chop': 'fighting', 'high-jump-kick': 'fighting',
  'low-kick': 'fighting', 'aura-sphere': 'fighting', 'focus-blast': 'fighting',
  'sacred-sword': 'fighting', 'body-press': 'fighting', 'low-sweep': 'fighting',
  'brick-break': 'fighting',
  // Poison
  'sludge-bomb': 'poison', 'sludge-wave': 'poison', 'poison-jab': 'poison',
  'gunk-shot': 'poison', 'venoshock': 'poison', 'cross-poison': 'poison',
  // Ground
  'earthquake': 'ground', 'earth-power': 'ground', 'dig': 'ground',
  'stomping-tantrum': 'ground', 'high-horsepower': 'ground', 'mud-bomb': 'ground',
  // Flying
  'air-slash': 'flying', 'brave-bird': 'flying', 'hurricane': 'flying',
  'aerial-ace': 'flying', 'acrobatics': 'flying', 'bounce': 'flying',
  'dual-wingbeat': 'flying', 'steel-wing': 'flying',
  // Psychic
  'psychic': 'psychic', 'psyshock': 'psychic', 'zen-headbutt': 'psychic',
  'extrasensory': 'psychic', 'psycho-cut': 'psychic', 'expanding-force': 'psychic',
  // Bug
  'bug-buzz': 'bug', 'u-turn': 'bug', 'x-scissor': 'bug',
  'megahorn': 'bug', 'signal-beam': 'bug', 'leech-life': 'bug',
  'bug-bite': 'bug', 'lunge': 'bug',
  // Rock
  'stone-edge': 'rock', 'rock-slide': 'rock', 'rock-blast': 'rock',
  'power-gem': 'rock', 'ancient-power': 'rock', 'head-smash': 'rock',
  'accelerock': 'rock', 'rock-tomb': 'rock',
  // Ghost
  'shadow-ball': 'ghost', 'shadow-claw': 'ghost', 'shadow-sneak': 'ghost',
  'phantom-force': 'ghost', 'hex': 'ghost', 'astral-barrage': 'ghost',
  'poltergeist': 'ghost',
  // Dragon
  'dragon-claw': 'dragon', 'dragon-pulse': 'dragon', 'outrage': 'dragon',
  'dragon-darts': 'dragon', 'draco-meteor': 'dragon', 'spacial-rend': 'dragon',
  'breaking-swipe': 'dragon', 'clanging-scales': 'dragon',
  // Dark
  'crunch': 'dark', 'knock-off': 'dark', 'dark-pulse': 'dark',
  'foul-play': 'dark', 'sucker-punch': 'dark', 'night-slash': 'dark',
  'wicked-blow': 'dark', 'throat-chop': 'dark',
  // Steel
  'iron-head': 'steel', 'flash-cannon': 'steel', 'meteor-mash': 'steel',
  'bullet-punch': 'steel', 'gyro-ball': 'steel', 'iron-tail': 'steel',
  'smart-strike': 'steel', 'steel-beam': 'steel', 'heavy-slam': 'steel',
  // Fairy
  'dazzling-gleam': 'fairy', 'moonblast': 'fairy', 'play-rough': 'fairy',
  'spirit-break': 'fairy', 'moongeist-beam': 'fairy', 'misty-explosion': 'fairy',
}

// ── Pool de Pokémon curados ───────────────────────────────────────────────────
// types: valores de respaldo (se sobreescriben con PokéAPI al cargar)
// moves: subconjunto competitivo — SOLO slugs presentes en MOVE_TYPE
const POKEMON_POOL = [
  { id: 6,   name: 'charizard',   types: ['fire','flying'],    moves: ['flamethrower','air-slash','dragon-pulse','thunder-punch','earthquake','solar-beam','focus-blast'] },
  { id: 445, name: 'garchomp',    types: ['dragon','ground'],  moves: ['earthquake','dragon-claw','stone-edge','fire-fang','iron-head','poison-jab','aqua-tail'] },
  { id: 248, name: 'tyranitar',   types: ['rock','dark'],      moves: ['stone-edge','crunch','earthquake','ice-punch','fire-punch','thunder-punch','superpower'] },
  { id: 376, name: 'metagross',   types: ['steel','psychic'],  moves: ['meteor-mash','zen-headbutt','earthquake','thunder-punch','ice-punch','bullet-punch','shadow-ball'] },
  { id: 448, name: 'lucario',     types: ['fighting','steel'], moves: ['close-combat','flash-cannon','aura-sphere','shadow-ball','bullet-punch','ice-punch','earthquake'] },
  { id: 94,  name: 'gengar',      types: ['ghost','poison'],   moves: ['shadow-ball','sludge-bomb','focus-blast','thunderbolt','dazzling-gleam','energy-ball'] },
  { id: 149, name: 'dragonite',   types: ['dragon','flying'],  moves: ['outrage','hurricane','earthquake','thunder-punch','fire-punch','ice-punch','aqua-tail'] },
  { id: 212, name: 'scizor',      types: ['bug','steel'],      moves: ['bullet-punch','u-turn','superpower','knock-off','iron-head','bug-bite'] },
  { id: 380, name: 'latias',      types: ['dragon','psychic'], moves: ['draco-meteor','psychic','energy-ball','thunderbolt','ice-beam','shadow-ball'] },
  { id: 381, name: 'latios',      types: ['dragon','psychic'], moves: ['draco-meteor','psyshock','thunderbolt','ice-beam','shadow-ball','earthquake'] },
  { id: 196, name: 'espeon',      types: ['psychic'],          moves: ['psychic','shadow-ball','dazzling-gleam','signal-beam','energy-ball','psyshock'] },
  { id: 197, name: 'umbreon',     types: ['dark'],             moves: ['foul-play','dark-pulse','shadow-ball','knock-off'] },
  { id: 260, name: 'swampert',    types: ['water','ground'],   moves: ['earthquake','waterfall','ice-punch','stone-edge','aqua-jet','superpower'] },
  { id: 395, name: 'empoleon',    types: ['water','steel'],    moves: ['surf','flash-cannon','ice-beam','earthquake','grass-knot','shadow-ball'] },
  { id: 91,  name: 'cloyster',    types: ['water','ice'],      moves: ['icicle-spear','rock-blast','surf','hydro-pump','poison-jab','shadow-ball'] },
  { id: 3,   name: 'venusaur',    types: ['grass','poison'],   moves: ['energy-ball','sludge-bomb','earthquake','knock-off','giga-drain'] },
  { id: 9,   name: 'blastoise',   types: ['water'],            moves: ['surf','ice-beam','flash-cannon','earthquake','aura-sphere','dark-pulse'] },
  { id: 254, name: 'sceptile',    types: ['grass'],            moves: ['leaf-blade','earthquake','focus-blast','energy-ball','dragon-claw','x-scissor'] },
  { id: 257, name: 'blaziken',    types: ['fire','fighting'],  moves: ['flare-blitz','close-combat','thunder-punch','stone-edge','earthquake','solar-beam'] },
  { id: 373, name: 'salamence',   types: ['dragon','flying'],  moves: ['outrage','fire-blast','earthquake','aqua-tail','dragon-claw','aerial-ace','hydro-pump'] },
  { id: 392, name: 'infernape',   types: ['fire','fighting'],  moves: ['flare-blitz','close-combat','thunder-punch','stone-edge','grass-knot','earthquake','solar-beam'] },
  { id: 359, name: 'absol',       types: ['dark'],             moves: ['night-slash','iron-head','psycho-cut','stone-edge','play-rough','sucker-punch'] },
  { id: 460, name: 'abomasnow',   types: ['grass','ice'],      moves: ['blizzard','energy-ball','earthquake','shadow-ball','ice-punch','wood-hammer'] },
  { id: 468, name: 'togekiss',    types: ['fairy','flying'],   moves: ['air-slash','dazzling-gleam','aura-sphere','fire-blast','shadow-ball','psychic'] },
  { id: 472, name: 'gliscor',     types: ['ground','flying'],  moves: ['earthquake','stone-edge','knock-off','ice-fang','poison-jab','aerial-ace'] },
  { id: 609, name: 'chandelure',  types: ['ghost','fire'],     moves: ['shadow-ball','flamethrower','energy-ball','thunderbolt','dazzling-gleam','psychic'] },
  { id: 612, name: 'haxorus',     types: ['dragon'],           moves: ['outrage','earthquake','iron-head','poison-jab','aqua-tail','rock-slide','close-combat'] },
  { id: 635, name: 'hydreigon',   types: ['dark','dragon'],    moves: ['dark-pulse','draco-meteor','fire-blast','flash-cannon','earth-power','focus-blast','surf'] },
  { id: 658, name: 'greninja',    types: ['water','dark'],     moves: ['water-shuriken','dark-pulse','ice-beam','grass-knot','extrasensory','u-turn'] },
  { id: 681, name: 'aegislash',   types: ['steel','ghost'],    moves: ['shadow-ball','iron-head','flash-cannon','shadow-sneak','sacred-sword','knock-off'] },
  { id: 700, name: 'sylveon',     types: ['fairy'],            moves: ['moonblast','shadow-ball','psyshock','dazzling-gleam','energy-ball'] },
  { id: 706, name: 'goodra',      types: ['dragon'],           moves: ['draco-meteor','sludge-bomb','ice-beam','thunderbolt','fire-blast','earthquake'] },
  { id: 727, name: 'incineroar',  types: ['fire','dark'],      moves: ['flare-blitz','knock-off','close-combat','earthquake','superpower','sucker-punch'] },
  { id: 730, name: 'primarina',   types: ['water','fairy'],    moves: ['surf','moonblast','energy-ball','ice-beam','shadow-ball','psychic'] },
  { id: 784, name: 'kommo-o',     types: ['dragon','fighting'],moves: ['close-combat','dragon-claw','poison-jab','iron-head','earthquake','flamethrower'] },
  { id: 823, name: 'corviknight', types: ['flying','steel'],   moves: ['brave-bird','iron-head','body-press','u-turn','steel-beam','shadow-ball'] },
  { id: 884, name: 'duraludon',   types: ['steel','dragon'],   moves: ['flash-cannon','dragon-pulse','thunderbolt','shadow-ball','dark-pulse','body-press'] },
  { id: 887, name: 'dragapult',   types: ['dragon','ghost'],   moves: ['dragon-darts','shadow-ball','fire-blast','thunderbolt','u-turn','phantom-force'] },
  { id: 497, name: 'serperior',   types: ['grass'],            moves: ['leaf-blade','giga-drain','energy-ball','aerial-ace','aqua-tail','knock-off'] },
  { id: 503, name: 'samurott',    types: ['water'],            moves: ['waterfall','megahorn','ice-beam','aqua-jet','superpower','grass-knot'] },
  { id: 405, name: 'luxray',      types: ['electric'],         moves: ['thunder-fang','crunch','ice-fang','fire-fang','wild-charge','superpower'] },
  { id: 450, name: 'hippowdon',   types: ['ground'],           moves: ['earthquake','stone-edge','ice-fang','fire-fang','crunch','body-slam'] },
  { id: 625, name: 'bisharp',     types: ['dark','steel'],     moves: ['iron-head','knock-off','sucker-punch','shadow-claw','stone-edge','iron-tail'] },
  { id: 428, name: 'lopunny',     types: ['normal'],           moves: ['high-jump-kick','ice-punch','thunder-punch','fire-punch','drain-punch','facade'] },
  { id: 157, name: 'typhlosion',  types: ['fire'],             moves: ['flamethrower','thunderbolt','solar-beam','shadow-ball','focus-blast','overheat'] },
  { id: 160, name: 'feraligatr',  types: ['water'],            moves: ['waterfall','ice-punch','earthquake','crunch','aqua-jet','superpower'] },
  { id: 530, name: 'excadrill',   types: ['ground','steel'],   moves: ['earthquake','iron-head','rock-slide','x-scissor','shadow-claw'] },
  { id: 645, name: 'landorus',    types: ['ground','flying'],  moves: ['earthquake','stone-edge','u-turn','rock-slide','knock-off'] },
  { id: 776, name: 'turtonator',  types: ['fire','dragon'],    moves: ['flamethrower','dragon-pulse','flash-cannon','earthquake','overheat','solar-beam'] },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function capitalize(slug) {
  return slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function effLabel(eff) {
  if (eff === 0)    return '×0 (inmune)'
  if (eff === 0.25) return '×0.25'
  if (eff === 0.5)  return '×½ (resiste)'
  if (eff === 1)    return '×1'
  if (eff === 2)    return '×2 (súper efectivo)'
  if (eff === 4)    return '×4 (muy efectivo)'
  return `×${eff}`
}

// ── Generador de explicación ──────────────────────────────────────────────────

function generateExplanation(best, rival, allScored) {
  const rivalName  = capitalize(rival.name)
  const rivalTypes = rival.types.map(t => TYPE_NAMES_ES[t]).join('/')
  const bestTypeEs = TYPE_NAMES_ES[best.type]

  // Breakdown dual tipo para el move correcto
  let bestDetail
  if (rival.types.length === 2) {
    const m1  = calcEffectiveness(best.type, [rival.types[0]])
    const m2  = calcEffectiveness(best.type, [rival.types[1]])
    const t1  = TYPE_NAMES_ES[rival.types[0]]
    const t2  = TYPE_NAMES_ES[rival.types[1]]
    bestDetail = `${bestTypeEs} hace ×${m1} a ${t1} y ×${m2} a ${t2} = ${effLabel(best.eff)}`
  } else {
    bestDetail = `${bestTypeEs} hace ${effLabel(best.eff)} contra ${rivalName}`
  }

  // Los otros 3 moves
  const others = allScored.slice(1, 4).map(s =>
    `${TYPE_NAMES_ES[s.type]} ${effLabel(s.eff)}`
  ).join(', ')

  return `${rivalName} es ${rivalTypes}. ${bestDetail}. Los demás: ${others}.`
}

// ── Construcción de un escenario ──────────────────────────────────────────────

function buildScenario(attacker, rival) {
  // Un Pokémon no puede battlear contra sí mismo
  if (attacker.id === rival.id) return null

  // Moves conocidos del atacante (con tipo en tabla)
  const movesWithType = attacker.moves.filter(m => MOVE_TYPE[m])

  // Agrupar por tipo — un move representativo por tipo
  const byType = {}
  for (const slug of movesWithType) {
    const t = MOVE_TYPE[slug]
    if (!byType[t]) byType[t] = slug
  }
  const uniqueMoves = Object.entries(byType).map(([type, slug]) => ({ slug, type }))

  if (uniqueMoves.length < 4) return null

  // Calcular efectividad de cada tipo contra el rival
  const scored = uniqueMoves
    .map(m => ({ ...m, eff: calcEffectiveness(m.type, rival.types) }))
    .sort((a, b) => b.eff - a.eff)

  const best       = scored[0]
  const secondBest = scored[1]

  // Condiciones para un escenario educativo válido:
  // 1. Hay un move claramente superior (≥ ×2)
  // 2. No hay empate en el primer puesto
  if (best.eff < 2)                return null
  if (best.eff <= secondBest.eff)  return null

  // Tomar los 4 mejores candidatos (best + 3 distractores)
  const selected = scored.slice(0, 4)
  shuffle(selected)

  return {
    id: `gen-${attacker.name}-${rival.name}`,
    your: {
      id:       attacker.id,
      name:     capitalize(attacker.name),
      types:    attacker.types,
      spriteUrl: attacker.spriteUrl ?? null,
    },
    rival: {
      id:       rival.id,
      name:     capitalize(rival.name),
      types:    rival.types,
      spriteUrl: rival.spriteUrl ?? null,
    },
    moves:       selected.map(m => ({ name: capitalize(m.slug), type: m.type })),
    correct:     capitalize(best.slug),
    explanation: generateExplanation(best, rival, scored),
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Genera n escenarios únicos usando PokéAPI + nuestra tabla de tipos.
 * - Primera visita: ~40 req en paralelo (~300-500 ms)
 * - Visitas siguientes: 0 req (caché localStorage 7 días)
 */
export async function getScenarios(n = 10) {
  const shuffled = shuffle([...POKEMON_POOL])

  // Resolver tipos y sprites en paralelo (PokéAPI o fallback)
  const resolved = await Promise.all(
    shuffled.map(async p => {
      try {
        const data = await fetchPokemonData(p.id)
        return { ...p, types: data.types, spriteUrl: data.spriteUrl }
      } catch {
        return { ...p, spriteUrl: null } // fallback a tipos del pool
      }
    })
  )

  const scenarios = []
  const used = new Set()

  outer:
  for (let i = 0; i < resolved.length; i++) {
    for (let j = 0; j < resolved.length; j++) {
      if (scenarios.length >= n) break outer
      if (i === j) continue

      const key = `${resolved[i].name}-${resolved[j].name}`
      if (used.has(key)) continue

      const s = buildScenario(resolved[i], resolved[j])
      if (s) {
        scenarios.push(s)
        used.add(key)
      }
    }
  }

  return scenarios
}

export { POKEMON_POOL }
