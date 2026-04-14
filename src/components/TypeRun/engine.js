import { TYPES, calcEffectiveness } from '../../data/types'
import { RIVALS, AMULETS } from '../../data/typerun'
import { fetchPokemonData } from '../../data/pokeapi'

const HAND_SIZE   = 6
const MAX_PLAY    = 3
const TURNS       = 3
const MAX_AMULETS = 5
const TIMER_SECS  = 15

// Daño base escala por ante — Ante 3 necesita más presión para ser desafiante
const BASE_DAMAGE_BY_ANTE = { 1: 30, 2: 42, 3: 58 }

export { MAX_PLAY, TURNS, TIMER_SECS, MAX_AMULETS }

// ── Mano aleatoria sin tipos duplicados ───────────────────────────────────────
// TYPES tiene 18 elementos, HAND_SIZE = 6 → siempre hay suficientes únicos
export function buildHand() {
  return shuffle([...TYPES]).slice(0, HAND_SIZE)
}

// Efectos de boss disponibles — se asignan aleatoriamente cada run
const BOSS_EFFECTS = [
  {
    bossEffect: 'niebla',
    bossDesc: 'Los tipos del rival están OCULTOS — debes atacar a ciegas',
  },
  {
    bossEffect: 'maldicion',
    bossDesc: 'Maldición de Tipo: un tipo aleatorio de tu mano hace ×0 este turno',
  },
  {
    bossEffect: 'regeneracion',
    bossDesc: 'Regeneración: el rival recupera 40 HP al inicio de cada turno',
  },
]

// ── Estructura de run ─────────────────────────────────────────────────────────
export function buildRun() {
  // Cada run asigna los 3 efectos de boss en orden aleatorio (nunca se repiten)
  const effectOrder = shuffle([...BOSS_EFFECTS])
  const run = []

  for (let ante = 1; ante <= 3; ante++) {
    const pool   = RIVALS.filter(r => r.ante === ante && !r.boss)
    const boss   = RIVALS.find(r => r.ante === ante && r.boss)
    const normals = shuffle(pool).slice(0, 2)
    // Sobreescribir el efecto del boss con el asignado a este ante
    const bossWithEffect = { ...boss, ...effectOrder[ante - 1] }
    run.push(...normals, bossWithEffect)
  }
  return run  // 9 rivales: 3 antes × (2 normales + 1 boss)
}

// ── Cálculo de turno ──────────────────────────────────────────────────────────
// Devuelve { damage, perType, amuletResults, totalMultiplier, flatBonus }
export function calculateTurn({ played, rivalTypes, amulets, cursedType, ante = 1 }) {
  const BASE_DAMAGE = BASE_DAMAGE_BY_ANTE[ante] ?? 30
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

// ── Pools para rivales dinámicos ──────────────────────────────────────────────
// id = ID numérico de PokéAPI (también se usa como sprite)
// types = fallback en caso de fallo de red
const DYNAMIC_POOLS = {
  ante1: [
    { id: 9,   name: 'Blastoise',  types: ['water'],           hp: 170 },
    { id: 3,   name: 'Venusaur',   types: ['grass','poison'],  hp: 175 },
    { id: 157, name: 'Typhlosion', types: ['fire'],            hp: 160 },
    { id: 405, name: 'Luxray',     types: ['electric'],        hp: 155 },
    { id: 254, name: 'Sceptile',   types: ['grass'],           hp: 150 },
    { id: 197, name: 'Umbreon',    types: ['dark'],            hp: 180 },
    { id: 196, name: 'Espeon',     types: ['psychic'],         hp: 150 },
    { id: 450, name: 'Hippowdon',  types: ['ground'],          hp: 190 },
    { id: 160, name: 'Feraligatr', types: ['water'],           hp: 168 },
    { id: 359, name: 'Absol',      types: ['dark'],            hp: 145 },
    { id: 503, name: 'Samurott',   types: ['water'],           hp: 172 },
    { id: 497, name: 'Serperior',  types: ['grass'],           hp: 152 },
  ],
  ante1_boss: [
    { id: 6,   name: 'Charizard',  types: ['fire','flying'],    hp: 320 },
    { id: 448, name: 'Lucario',    types: ['fighting','steel'], hp: 300 },
    { id: 130, name: 'Gyarados',   types: ['water','flying'],   hp: 310 },
    { id: 257, name: 'Blaziken',   types: ['fire','fighting'],  hp: 295 },
  ],
  ante2: [
    { id: 212, name: 'Scizor',    types: ['bug','steel'],     hp: 265 },
    { id: 149, name: 'Dragonite', types: ['dragon','flying'], hp: 285 },
    { id: 94,  name: 'Gengar',    types: ['ghost','poison'],  hp: 255 },
    { id: 248, name: 'Tyranitar', types: ['rock','dark'],     hp: 295 },
    { id: 472, name: 'Gliscor',   types: ['ground','flying'], hp: 270 },
    { id: 625, name: 'Bisharp',   types: ['dark','steel'],    hp: 260 },
    { id: 460, name: 'Abomasnow', types: ['grass','ice'],     hp: 270 },
    { id: 468, name: 'Togekiss',  types: ['fairy','flying'],  hp: 275 },
    { id: 392, name: 'Infernape', types: ['fire','fighting'], hp: 250 },
    { id: 373, name: 'Salamence', types: ['dragon','flying'], hp: 285 },
  ],
  ante2_boss: [
    { id: 376, name: 'Metagross', types: ['steel','psychic'],   hp: 480 },
    { id: 700, name: 'Sylveon',   types: ['fairy'],             hp: 440 },
    { id: 612, name: 'Haxorus',   types: ['dragon'],            hp: 450 },
    { id: 445, name: 'Garchomp',  types: ['dragon','ground'],   hp: 460 },
  ],
  ante3: [
    { id: 681, name: 'Aegislash',  types: ['steel','ghost'],   hp: 365 },
    { id: 887, name: 'Dragapult',  types: ['dragon','ghost'],  hp: 380 },
    { id: 823, name: 'Corviknight',types: ['flying','steel'],  hp: 370 },
    { id: 784, name: 'Kommo-o',    types: ['dragon','fighting'],hp: 375 },
    { id: 730, name: 'Primarina',  types: ['water','fairy'],   hp: 370 },
    { id: 635, name: 'Hydreigon',  types: ['dark','dragon'],   hp: 385 },
    { id: 395, name: 'Empoleon',   types: ['water','steel'],   hp: 375 },
    { id: 884, name: 'Duraludon',  types: ['steel','dragon'],  hp: 360 },
    { id: 609, name: 'Chandelure', types: ['ghost','fire'],    hp: 355 },
    { id: 442, name: 'Spiritomb',  types: ['ghost','dark'],    hp: 390 },
  ],
  ante3_boss: [
    { id: 150, name: 'Mewtwo',  types: ['psychic'],         hp: 700 },
    { id: 250, name: 'Ho-oh',   types: ['fire','flying'],   hp: 680 },
    { id: 249, name: 'Lugia',   types: ['psychic','flying'],hp: 680 },
    { id: 383, name: 'Groudon', types: ['ground'],          hp: 650 },
  ],
}

// Resuelve tipos de un pool de Pokémon via PokéAPI (con fallback)
async function resolveTypes(pool) {
  return Promise.all(
    pool.map(async p => {
      try {
        const data = await fetchPokemonData(p.id)
        return { ...p, types: data.types }
      } catch {
        return p // usa tipos de fallback del pool
      }
    })
  )
}

// ── Run dinámica via PokéAPI ─────────────────────────────────────────────────
// Misma estructura que buildRun() pero con Pokémon aleatorios y tipos frescos
export async function buildDynamicRun() {
  const effectOrder = shuffle([...BOSS_EFFECTS])
  const run = []

  const antePairs = [
    { normals: DYNAMIC_POOLS.ante1, bosses: DYNAMIC_POOLS.ante1_boss },
    { normals: DYNAMIC_POOLS.ante2, bosses: DYNAMIC_POOLS.ante2_boss },
    { normals: DYNAMIC_POOLS.ante3, bosses: DYNAMIC_POOLS.ante3_boss },
  ]

  for (let i = 0; i < 3; i++) {
    const ante = i + 1
    const { normals, bosses } = antePairs[i]
    const pickedNormals = shuffle([...normals]).slice(0, 2)
    const pickedBoss    = shuffle([...bosses])[0]

    // Fetch tipos en paralelo para los 3 rivales de este ante
    const [n1, n2, boss] = await resolveTypes([...pickedNormals, pickedBoss])

    run.push(
      { ...n1, sprite: n1.id, ante, boss: false },
      { ...n2, sprite: n2.id, ante, boss: false },
      { ...boss, sprite: boss.id, ante, boss: true, ...effectOrder[i] },
    )
  }

  return run
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
