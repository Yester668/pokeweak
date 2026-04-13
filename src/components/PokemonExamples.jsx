import { memo } from 'react'
import { POKEMON_BY_TYPE, getSpriteUrl } from '../data/pokemon'
import { TYPE_COLORS } from '../data/types'

// memo: el tipo no cambia mientras el panel esté abierto
const PokemonExamples = memo(function PokemonExamples({ type }) {
  const pokemon = POKEMON_BY_TYPE[type] || []
  const color = TYPE_COLORS[type]

  return (
    <div className="pokemon-examples">
      <p className="pokemon-examples__label">Pokémon de ejemplo</p>
      <div className="pokemon-examples__grid">
        {pokemon.map(p => (
          <div key={p.id} className="pokemon-examples__item">
            <div
              className="pokemon-examples__sprite-wrap"
              style={{ background: `${color}18`, border: `1px solid ${color}44` }}
            >
              <img
                src={getSpriteUrl(p.id)}
                alt={p.name}
                width={52}
                height={52}
                loading="lazy"
                decoding="async"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <span className="pokemon-examples__name">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
})

export default PokemonExamples
