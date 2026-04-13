// Tabla de tipos completa — Gen 9 (Scarlet/Violet)
// Perspectiva OFENSIVA: si usas un ataque de este tipo, ¿qué efecto tiene?
// attacking[tipo_atacante][tipo_defensor] = multiplicador

export const TYPE_COLORS = {
  normal:   '#A8A878',
  fire:     '#F08030',
  water:    '#6890F0',
  electric: '#F8D030',
  grass:    '#78C850',
  ice:      '#98D8D8',
  fighting: '#C03028',
  poison:   '#A040A0',
  ground:   '#E0C068',
  flying:   '#A890F0',
  psychic:  '#F85888',
  bug:      '#A8B820',
  rock:     '#B8A038',
  ghost:    '#705898',
  dragon:   '#7038F8',
  dark:     '#705848',
  steel:    '#B8B8D0',
  fairy:    '#EE99AC',
}

export const TYPE_NAMES_ES = {
  normal:   'Normal',
  fire:     'Fuego',
  water:    'Agua',
  electric: 'Eléctrico',
  grass:    'Planta',
  ice:      'Hielo',
  fighting: 'Lucha',
  poison:   'Veneno',
  ground:   'Tierra',
  flying:   'Volador',
  psychic:  'Psíquico',
  bug:      'Bicho',
  rock:     'Roca',
  ghost:    'Fantasma',
  dragon:   'Dragón',
  dark:     'Siniestro',
  steel:    'Acero',
  fairy:    'Hada',
}

export const TYPES = Object.keys(TYPE_COLORS)

// Tabla ofensiva: ATTACKING[atacante] = { defensor: multiplicador }
// Solo se listan los que no son 1x
export const ATTACKING = {
  normal: {
    rock: 0.5, ghost: 0, steel: 0.5,
  },
  fire: {
    fire: 0.5, water: 0.5, rock: 0.5, dragon: 0.5,
    grass: 2, ice: 2, bug: 2, steel: 2,
  },
  water: {
    water: 0.5, grass: 0.5, dragon: 0.5,
    fire: 2, ground: 2, rock: 2,
  },
  electric: {
    grass: 0.5, electric: 0.5, dragon: 0.5, ground: 0,
    water: 2, flying: 2,
  },
  grass: {
    fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, dragon: 0.5, steel: 0.5,
    water: 2, ground: 2, rock: 2,
  },
  ice: {
    water: 0.5, ice: 0.5, steel: 0.5,
    grass: 2, ground: 2, flying: 2, dragon: 2,
  },
  fighting: {
    ghost: 0,
    poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5,
    normal: 2, ice: 2, rock: 2, dark: 2, steel: 2,
  },
  poison: {
    poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0,
    grass: 2, fairy: 2,
  },
  ground: {
    flying: 0,
    grass: 0.5, bug: 0.5,
    fire: 2, electric: 2, poison: 2, rock: 2, steel: 2,
  },
  flying: {
    rock: 0.5, steel: 0.5, electric: 0.5,
    grass: 2, fighting: 2, bug: 2,
  },
  psychic: {
    dark: 0,
    psychic: 0.5, steel: 0.5,
    fighting: 2, poison: 2,
  },
  bug: {
    ghost: 0.5, fire: 0.5, fighting: 0.5, flying: 0.5, steel: 0.5, fairy: 0.5,
    grass: 2, psychic: 2, dark: 2,
  },
  rock: {
    fighting: 0.5, ground: 0.5, steel: 0.5,
    fire: 2, ice: 2, flying: 2, bug: 2,
  },
  ghost: {
    normal: 0, dark: 0.5,
    ghost: 2, psychic: 2,
  },
  dragon: {
    fairy: 0,
    steel: 0.5,
    dragon: 2,
  },
  dark: {
    fighting: 0.5, dark: 0.5, fairy: 0.5,
    ghost: 2, psychic: 2,
  },
  steel: {
    fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5,
    ice: 2, rock: 2, fairy: 2,
  },
  fairy: {
    fire: 0.5, poison: 0.5, steel: 0.5,
    fighting: 2, dragon: 2, dark: 2,
  },
}

// Calcula la efectividad de un ataque contra un defensor (1 o 2 tipos)
export function calcEffectiveness(attackingType, defenderTypes) {
  const row = ATTACKING[attackingType] || {}
  let multiplier = 1
  for (const defType of defenderTypes) {
    multiplier *= (row[defType] ?? 1)
  }
  return multiplier
}

// Perfil defensivo para uno o dos tipos — no cacheable fácilmente para dual types
export function getDefensiveProfile(defenderTypes) {
  const profile = { immune: [], quarter: [], half: [], normal: [], double: [], quadruple: [] }
  for (const atkType of TYPES) {
    const mult = calcEffectiveness(atkType, defenderTypes)
    if      (mult === 0)    profile.immune.push(atkType)
    else if (mult === 0.25) profile.quarter.push(atkType)
    else if (mult === 0.5)  profile.half.push(atkType)
    else if (mult === 1)    profile.normal.push(atkType)
    else if (mult === 2)    profile.double.push(atkType)
    else if (mult === 4)    profile.quadruple.push(atkType)
  }
  return profile
}

// Perfil ofensivo para un tipo
function _buildOffensiveProfile(attackingType) {
  const profile = { immune: [], half: [], normal: [], double: [] }
  const row = ATTACKING[attackingType] || {}
  for (const defType of TYPES) {
    const mult = row[defType] ?? 1
    if      (mult === 0)   profile.immune.push(defType)
    else if (mult === 0.5) profile.half.push(defType)
    else if (mult === 1)   profile.normal.push(defType)
    else if (mult === 2)   profile.double.push(defType)
  }
  return profile
}

// Perfiles precomputados al cargar el módulo — O(1) en runtime
export const OFFENSIVE_PROFILES = Object.freeze(
  Object.fromEntries(TYPES.map(t => [t, Object.freeze(_buildOffensiveProfile(t))]))
)
export const DEFENSIVE_PROFILES = Object.freeze(
  Object.fromEntries(TYPES.map(t => [t, Object.freeze(getDefensiveProfile([t]))]))
)

// Getters públicos — mantienen la API existente
export function getOffensiveProfile(type) { return OFFENSIVE_PROFILES[type] }

// Cache para dual-types calculados en sesión
const _dualCache = new Map()
export function getDualDefensiveProfile(type1, type2) {
  const key = type1 < type2 ? `${type1}/${type2}` : `${type2}/${type1}`
  if (_dualCache.has(key)) return _dualCache.get(key)
  const result = Object.freeze(getDefensiveProfile([type1, type2]))
  _dualCache.set(key, result)
  return result
}
