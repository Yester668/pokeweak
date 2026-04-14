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
