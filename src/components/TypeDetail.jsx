import { memo, useMemo } from 'react'
import { TYPE_COLORS, TYPE_NAMES_ES, OFFENSIVE_PROFILES, DEFENSIVE_PROFILES, getDualDefensiveProfile } from '../data/types'
import TypeBadge from './TypeBadge'
import PokemonExamples from './PokemonExamples'

// Section y Column son puros — memo los protege de re-renders del padre
const Section = memo(function Section({ title, emoji, types, emptyMsg }) {
  return (
    <div className="type-section">
      <p className="type-section__title"><span>{emoji}</span> {title}</p>
      {types.length === 0
        ? <p className="type-section__empty">{emptyMsg}</p>
        : <div className="type-section__badges">
            {types.map(t => <TypeBadge key={t} type={t} size="sm" />)}
          </div>
      }
    </div>
  )
})

const Column = memo(function Column({ title, icon, children }) {
  return (
    <div className="type-column">
      <h3 className="type-column__title"><span>{icon}</span> {title}</h3>
      <div className="type-column__body">{children}</div>
    </div>
  )
})

const TypeDetail = memo(function TypeDetail({ type, secondType = null }) {
  // useMemo: solo recalcula si cambian los tipos — el perfil defensivo dual
  // usa el cache de getDualDefensiveProfile para no recomputar nada
  const defensive = useMemo(
    () => secondType ? getDualDefensiveProfile(type, secondType) : DEFENSIVE_PROFILES[type],
    [type, secondType]
  )
  const offensive = OFFENSIVE_PROFILES[type] // ya precomputado, O(1)

  const color  = TYPE_COLORS[type]
  const name   = TYPE_NAMES_ES[type]
  const color2 = secondType ? TYPE_COLORS[secondType] : null
  const name2  = secondType ? TYPE_NAMES_ES[secondType] : null

  return (
    <div className="fade-in">
      <div className="type-detail__header">
        <div className="type-detail__dot" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>
          <span style={{ color }}>{name}</span>
          {name2 && <>
            <span style={{ color: '#444', margin: '0 6px' }}>/</span>
            <span style={{ color: color2 }}>{name2}</span>
          </>}
        </h2>
      </div>

      <div className="type-detail__columns">
        <Column title={`Ofensiva — tipo ${name}`} icon="⚔️">
          <Section title="Súper efectivo (×2)" emoji="🟢" types={offensive.double} emptyMsg="Ninguno" />
          <Section title="Poco efectivo (×0.5)" emoji="🔴" types={offensive.half} emptyMsg="Ninguno" />
          <Section title="Sin efecto (×0)" emoji="⚫" types={offensive.immune} emptyMsg="Ninguno" />
        </Column>

        <Column title={`Defensiva${name2 ? ` — ${name}/${name2}` : ''}`} icon="🛡️">
          {defensive.quadruple.length > 0 &&
            <Section title="Debilidad crítica (×4)" emoji="💀" types={defensive.quadruple} emptyMsg="Ninguno" />
          }
          <Section title="Debilidad (×2)"         emoji="🔴" types={defensive.double} emptyMsg="Ninguno" />
          <Section title="Resistencia (×0.5)"      emoji="🟢" types={defensive.half}   emptyMsg="Ninguno" />
          {defensive.quarter.length > 0 &&
            <Section title="Súper resistencia (×0.25)" emoji="💪" types={defensive.quarter} emptyMsg="Ninguno" />
          }
          <Section title="Inmune (×0)" emoji="⚫" types={defensive.immune} emptyMsg="Ninguno" />
        </Column>
      </div>

      <PokemonExamples type={type} />
    </div>
  )
})

export default TypeDetail
