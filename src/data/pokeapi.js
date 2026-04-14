// Capa de acceso a PokéAPI con caché en localStorage
// Sin API key — rate limit generoso (100 req/min)

const CACHE_KEY = 'pokeweak_pokeapi_v1'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000 // 7 días

function getCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') }
  catch { return {} }
}

function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) }
  catch {} // cuota excedida → silencioso
}

/**
 * Devuelve { id, name, types: string[], spriteUrl: string }
 * Usa caché si los datos tienen menos de 7 días.
 * Lanza error si la red falla Y no hay caché.
 */
export async function fetchPokemonData(idOrName) {
  const cache = getCache()
  const key = String(idOrName).toLowerCase()

  if (cache[key]?.ts && Date.now() - cache[key].ts < CACHE_TTL) {
    return cache[key].data
  }

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`)
  if (!res.ok) throw new Error(`PokéAPI ${res.status}: ${idOrName}`)

  const json = await res.json()
  const data = {
    id: json.id,
    name: json.name,
    types: json.types.map(t => t.type.name),
    spriteUrl:
      json.sprites.other?.['official-artwork']?.front_default ??
      json.sprites.front_default,
  }

  saveCache({ ...cache, [key]: { ts: Date.now(), data } })
  return data
}

/**
 * Prefetch en background — no lanza errores, ideal para cargar
 * el pool antes de que el usuario llegue a Batallas.
 */
export function prefetchPokemon(ids) {
  for (const id of ids) fetchPokemonData(id).catch(() => {})
}

// ── Caché separada para datos completos de Pokédex ───────────────────────────
const FULL_CACHE_KEY = 'pokeweak_pokedex_v1'

function getFullCache() {
  try { return JSON.parse(localStorage.getItem(FULL_CACHE_KEY) || '{}') }
  catch { return {} }
}
function saveFullCache(cache) {
  try { localStorage.setItem(FULL_CACHE_KEY, JSON.stringify(cache)) }
  catch {}
}

/**
 * Devuelve datos completos para la Pokédex:
 * { id, name, types, spriteUrl, artworkUrl, height, weight, stats[] }
 */
export async function fetchPokemonFull(idOrName) {
  const cache = getFullCache()
  const key   = String(idOrName).toLowerCase()

  if (cache[key]?.ts && Date.now() - cache[key].ts < CACHE_TTL) {
    return cache[key].data
  }

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${key}`)
  if (!res.ok) throw new Error(`PokéAPI ${res.status}: ${idOrName}`)

  const json = await res.json()
  const STAT_KEYS = { hp: 'HP', attack: 'Ataque', defense: 'Defensa',
    'special-attack': 'At. Esp.', 'special-defense': 'Def. Esp.', speed: 'Velocidad' }

  const data = {
    id:         json.id,
    name:       json.name,
    types:      json.types.map(t => t.type.name),
    spriteUrl:  json.sprites.front_default,
    artworkUrl: json.sprites.other?.['official-artwork']?.front_default ?? json.sprites.front_default,
    height:     json.height,   // decímetros
    weight:     json.weight,   // hectogramos
    stats: json.stats.map(s => ({
      key:   s.stat.name,
      label: STAT_KEYS[s.stat.name] ?? s.stat.name,
      value: s.base_stat,
    })),
  }

  saveFullCache({ ...cache, [key]: { ts: Date.now(), data } })
  return data
}

/**
 * Devuelve los primeros N Pokémon de un tipo dado.
 * typeName: nombre en inglés ('electric', 'fire', …)
 * Retorna [{ id, name }] ordenados por ID.
 */
export async function fetchPokemonByType(typeName, limit = 24) {
  const cacheKey = `type_${typeName}`
  const cache    = getFullCache()

  if (cache[cacheKey]?.ts && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
    return cache[cacheKey].data
  }

  const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`)
  if (!res.ok) throw new Error(`PokéAPI type ${res.status}: ${typeName}`)

  const json = await res.json()
  // Extraer ID de la URL y filtrar formas alternativas (id > 10000)
  const list = json.pokemon
    .map(({ pokemon }) => {
      const parts = pokemon.url.split('/').filter(Boolean)
      const id    = parseInt(parts[parts.length - 1], 10)
      return { id, name: pokemon.name }
    })
    .filter(p => p.id <= 1025)       // excluir formas alternativas
    .sort((a, b) => a.id - b.id)
    .slice(0, limit)

  saveFullCache({ ...cache, [cacheKey]: { ts: Date.now(), data: list } })
  return list
}

/**
 * Descripción en español desde el endpoint de species.
 * Devuelve string o null si no hay entrada en español.
 */
export async function fetchPokemonSpecies(id) {
  const cacheKey = `species_${id}`
  const cache    = getFullCache()

  if (cache[cacheKey]?.ts && Date.now() - cache[cacheKey].ts < CACHE_TTL) {
    return cache[cacheKey].data
  }

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  if (!res.ok) return null

  const json = await res.json()
  const entry = json.flavor_text_entries.find(e => e.language.name === 'es')
    ?? json.flavor_text_entries.find(e => e.language.name === 'en')
  const text = entry?.flavor_text?.replace(/\f|\n/g, ' ') ?? null

  saveFullCache({ ...cache, [cacheKey]: { ts: Date.now(), data: text } })
  return text
}
