import { calcEffectiveness } from './types'

// ── Rivales por ante ─────────────────────────────────────────────────────────
// hp calibrado para: mano 6 tipos, juegas 1-3 por turno, 3 turnos
// daño base 30 por tipo × efectividad × amuletos

export const RIVALS = [
  // ANTE 1 — tipos simples, aprender lo básico
  { id: 'butterfree', name: 'Butterfree', types: ['bug', 'flying'], hp: 160, sprite: 12, ante: 1 },
  { id: 'geodude',    name: 'Geodude',    types: ['rock', 'ground'], hp: 180, sprite: 74, ante: 1 },
  { id: 'slowpoke',   name: 'Slowpoke',   types: ['water', 'psychic'], hp: 200, sprite: 79, ante: 1 },
  { id: 'vulpix',     name: 'Vulpix',     types: ['fire'],  hp: 140, sprite: 37, ante: 1 },
  { id: 'bellsprout', name: 'Bellsprout', types: ['grass', 'poison'], hp: 150, sprite: 69, ante: 1 },
  // ANTE 1 BOSS
  {
    id: 'charizard', name: 'Charizard', types: ['fire', 'flying'], hp: 320, sprite: 6, ante: 1,
    boss: true,
    bossEffect: 'niebla',
    bossDesc: 'Los tipos del rival están OCULTOS — debes atacar a ciegas',
  },

  // ANTE 2 — dobles tipos con resistencias importantes
  { id: 'scizor',    name: 'Scizor',    types: ['bug', 'steel'],    hp: 260, sprite: 212, ante: 2 },
  { id: 'gyarados',  name: 'Gyarados',  types: ['water', 'flying'], hp: 280, sprite: 130, ante: 2 },
  { id: 'gengar',    name: 'Gengar',    types: ['ghost', 'poison'], hp: 250, sprite: 94,  ante: 2 },
  { id: 'tyranitar', name: 'Tyranitar', types: ['rock', 'dark'],    hp: 300, sprite: 248, ante: 2 },
  { id: 'dragonite', name: 'Dragonite', types: ['dragon', 'flying'],hp: 310, sprite: 149, ante: 2 },
  // ANTE 2 BOSS
  {
    id: 'metagross', name: 'Metagross', types: ['steel', 'psychic'], hp: 480, sprite: 376, ante: 2,
    boss: true,
    bossEffect: 'maldicion',
    bossDesc: 'Maldición de Tipo: un tipo aleatorio de tu mano hace ×0 este turno',
  },

  // ANTE 3 — immunidades y combinaciones complicadas
  { id: 'garchomp',  name: 'Garchomp',  types: ['dragon', 'ground'], hp: 400, sprite: 445, ante: 3 },
  { id: 'togekiss',  name: 'Togekiss',  types: ['fairy', 'flying'],  hp: 380, sprite: 468, ante: 3 },
  { id: 'magnezone', name: 'Magnezone', types: ['electric', 'steel'], hp: 360, sprite: 462, ante: 3 },
  { id: 'spiritomb', name: 'Spiritomb', types: ['ghost', 'dark'],    hp: 420, sprite: 442, ante: 3 },
  { id: 'empoleon',  name: 'Empoleon',  types: ['water', 'steel'],   hp: 400, sprite: 395, ante: 3 },
  // ANTE 3 BOSS
  {
    id: 'mewtwo', name: 'Mewtwo', types: ['psychic'], hp: 700, sprite: 150, ante: 3,
    boss: true,
    bossEffect: 'regeneracion',
    bossDesc: 'Regeneración: el rival recupera 40 HP al inicio de cada turno',
  },
]

// ── Amuletos ─────────────────────────────────────────────────────────────────
// evaluate(context) → { triggered, flatBonus, multiplier, explain }
// context: { played[], rivalTypes[], cursedType: string|null }

export const AMULETS = [
  {
    id: 'hoguera',
    name: 'Hoguera',
    emoji: '🔥',
    rarity: 'common',
    description: 'Fuego vs Planta/Hielo/Bicho/Acero: +×0.5 adicional',
    shortDesc: 'Fuego vs Planta/Hielo/Bicho/Acero → ×1.5',
    hint: 'Enseña: coberturas del tipo Fuego',
    evaluate({ played, rivalTypes }) {
      const fire = played.includes('fire')
      const weak = rivalTypes.some(r => ['grass','ice','bug','steel'].includes(r))
      const triggered = fire && weak
      return { triggered, flatBonus: 0, multiplier: triggered ? 1.5 : 1, explain: triggered ? '🔥 Hoguera activa' : null }
    },
  },
  {
    id: 'marejada',
    name: 'Marejada',
    emoji: '🌊',
    rarity: 'common',
    description: 'Agua vs Fuego/Tierra/Roca: +60 de daño plano',
    shortDesc: 'Agua vs Fuego/Tierra/Roca → +60',
    hint: 'Enseña: coberturas del tipo Agua',
    evaluate({ played, rivalTypes }) {
      const water = played.includes('water')
      const weak = rivalTypes.some(r => ['fire','ground','rock'].includes(r))
      const triggered = water && weak
      return { triggered, flatBonus: triggered ? 60 : 0, multiplier: 1, explain: triggered ? '🌊 Marejada activa' : null }
    },
  },
  {
    id: 'tormenta',
    name: 'Tormenta',
    emoji: '⚡',
    rarity: 'common',
    description: 'Eléctrico vs Volador/Agua: ×2 adicional al daño total',
    shortDesc: 'Eléctrico vs Volador/Agua → ×2',
    hint: 'Enseña: ventaja Eléctrico/Volador — clave en competitivo',
    evaluate({ played, rivalTypes }) {
      const elec = played.includes('electric')
      const weak = rivalTypes.some(r => ['flying','water'].includes(r))
      const triggered = elec && weak
      return { triggered, flatBonus: 0, multiplier: triggered ? 2 : 1, explain: triggered ? '⚡ Tormenta activa' : null }
    },
  },
  {
    id: 'dragon_hielo',
    name: 'Dragón de Hielo',
    emoji: '🐉',
    rarity: 'rare',
    description: 'Hielo + Dragón en el mismo turno: ×3 al daño total',
    shortDesc: 'Hielo + Dragón juntos → ×3',
    hint: 'Enseña: Hielo hace ×4 vs Dragón/Volador — el combo más temido',
    evaluate({ played }) {
      const triggered = played.includes('ice') && played.includes('dragon')
      return { triggered, flatBonus: 0, multiplier: triggered ? 3 : 1, explain: triggered ? '🐉 Dragón de Hielo: ×4 activado' : null }
    },
  },
  {
    id: 'escudo_acero',
    name: 'Escudo de Acero',
    emoji: '🛡️',
    rarity: 'rare',
    description: 'Acero en mano jugada: +80 daño plano (Acero es el tipo con más resistencias)',
    shortDesc: 'Acero en turno → +80',
    hint: 'Enseña: el tipo Acero resiste 10 de los 18 tipos',
    evaluate({ played }) {
      const triggered = played.includes('steel')
      return { triggered, flatBonus: triggered ? 80 : 0, multiplier: 1, explain: triggered ? '🛡️ Escudo de Acero activo' : null }
    },
  },
  {
    id: 'barrera_hada',
    name: 'Barrera de Hada',
    emoji: '✨',
    rarity: 'rare',
    description: 'Hada vs Dragón/Lucha/Siniestro: ×2.5 al daño total',
    shortDesc: 'Hada vs Dragón/Lucha/Siniestro → ×2.5',
    hint: 'Enseña: Hada es inmune al Dragón — contrarresta al tipo más fuerte',
    evaluate({ played, rivalTypes }) {
      const fairy = played.includes('fairy')
      const weak = rivalTypes.some(r => ['dragon','fighting','dark'].includes(r))
      const triggered = fairy && weak
      return { triggered, flatBonus: 0, multiplier: triggered ? 2.5 : 1, explain: triggered ? '✨ Barrera de Hada activa' : null }
    },
  },
  {
    id: 'conductor',
    name: 'Conductor',
    emoji: '⬇️',
    rarity: 'common',
    description: 'Tierra en mano jugada: +70 daño plano (Tierra anula la inmunidad eléctrica)',
    shortDesc: 'Tierra en turno → +70',
    hint: 'Enseña: Tierra es la respuesta a rivales que resisten Eléctrico',
    evaluate({ played }) {
      const triggered = played.includes('ground')
      return { triggered, flatBonus: triggered ? 70 : 0, multiplier: 1, explain: triggered ? '⬇️ Conductor activo' : null }
    },
  },
  {
    id: 'veneno_profundo',
    name: 'Veneno Profundo',
    emoji: '☠️',
    rarity: 'common',
    description: 'Veneno vs Planta/Hada: ×1.5 adicional',
    shortDesc: 'Veneno vs Planta/Hada → ×1.5',
    hint: 'Enseña: Veneno es uno de los pocos tipos efectivos contra Hada',
    evaluate({ played, rivalTypes }) {
      const poison = played.includes('poison')
      const weak = rivalTypes.some(r => ['grass','fairy'].includes(r))
      const triggered = poison && weak
      return { triggered, flatBonus: 0, multiplier: triggered ? 1.5 : 1, explain: triggered ? '☠️ Veneno Profundo activo' : null }
    },
  },
  {
    id: 'puno_de_hierro',
    name: 'Puño de Hierro',
    emoji: '👊',
    rarity: 'common',
    description: 'Lucha vs Normal/Hielo/Roca/Siniestro/Acero: +50 daño plano',
    shortDesc: 'Lucha vs Normal/Hielo/Roca/Siniest./Acero → +50',
    hint: 'Enseña: Lucha es el tipo ofensivo más versátil del juego',
    evaluate({ played, rivalTypes }) {
      const fight = played.includes('fighting')
      const weak = rivalTypes.some(r => ['normal','ice','rock','dark','steel'].includes(r))
      const triggered = fight && weak
      return { triggered, flatBonus: triggered ? 50 : 0, multiplier: 1, explain: triggered ? '👊 Puño de Hierro activo' : null }
    },
  },
  {
    id: 'ojo_espiritu',
    name: 'Ojo de Espíritu',
    emoji: '👁️',
    rarity: 'rare',
    description: 'Fantasma vs Psíquico/Fantasma: ×2 adicional al daño total',
    shortDesc: 'Fantasma vs Psíquico/Fantasma → ×2',
    hint: 'Enseña: Fantasma se contraataca a sí mismo — clave en competitivo',
    evaluate({ played, rivalTypes }) {
      const ghost = played.includes('ghost')
      const weak = rivalTypes.some(r => ['psychic','ghost'].includes(r))
      const triggered = ghost && weak
      return { triggered, flatBonus: 0, multiplier: triggered ? 2 : 1, explain: triggered ? '👁️ Ojo de Espíritu activo' : null }
    },
  },
  {
    id: 'doble_efectivo',
    name: 'Doble Efectivo',
    emoji: '💥',
    rarity: 'rare',
    description: 'Si juegas 2+ tipos súper efectivos en el mismo turno: ×1.5 al total',
    shortDesc: '2+ tipos súper efectivos → ×1.5',
    hint: 'Enseña: cubrir un rival con varios ataques efectivos es mejor estrategia',
    evaluate({ played, rivalTypes }) {
      const superEffective = played.filter(t => calcEffectiveness(t, rivalTypes) >= 2)
      const triggered = superEffective.length >= 2
      return { triggered, flatBonus: 0, multiplier: triggered ? 1.5 : 1, explain: triggered ? `💥 Doble Efectivo: ${superEffective.length} tipos súper efectivos` : null }
    },
  },
  {
    id: 'maldicion_tipo',
    name: 'Maldición del Tipo',
    emoji: '🩸',
    rarity: 'cursed',
    description: 'RIESGO: si tu turno incluye un tipo con ×0 contra el rival, pierdes 30 HP del turno siguiente',
    shortDesc: 'Si usas tipo inmune (×0) → −60',
    hint: 'Enseña: las inmunidades son el mayor error en competitivo',
    evaluate({ played, rivalTypes }) {
      const immune = played.some(t => calcEffectiveness(t, rivalTypes) === 0)
      return { triggered: immune, flatBonus: immune ? -60 : 0, multiplier: 1, explain: immune ? '🩸 Maldición activada: ×0 detectado' : null }
    },
  },
]

export const AMULETS_MAP = Object.fromEntries(AMULETS.map(a => [a.id, a]))
