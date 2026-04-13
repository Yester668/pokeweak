import { memo, useCallback } from 'react'
import { TYPES } from '../data/types'
import TypeBadge from './TypeBadge'

// TypeSelector es memo: solo se rerenderiza si cambia selected/disabledType/label
const TypeSelector = memo(function TypeSelector({ selected, onSelect, disabledType = null, label = 'Selecciona un tipo' }) {
  // Un único handler estable — lee dataset.type del botón clickado
  // Evita crear 18 arrow functions distintas en cada render
  const handleClick = useCallback((e) => {
    const type = e.currentTarget.dataset.type
    if (type === disabledType) return
    onSelect(type === selected ? null : type)
  }, [selected, disabledType, onSelect])

  return (
    <div>
      <p className="type-selector__label">{label}</p>
      <div className="type-selector__grid">
        {TYPES.map(type => (
          <span key={type} data-type={type} onClick={type === disabledType ? undefined : handleClick}>
            <TypeBadge
              type={type}
              size="md"
              selected={selected === type}
              disabled={type === disabledType}
            />
          </span>
        ))}
      </div>
    </div>
  )
})

export default TypeSelector
