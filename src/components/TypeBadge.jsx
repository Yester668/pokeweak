import { memo } from 'react'
import { TYPE_COLORS, TYPE_NAMES_ES } from '../data/types'
import TypeIcon from './TypeIcon'

const ICON_SIZES = { sm: 12, md: 16, lg: 20 }

// Comparación custom: ignoramos onClick deliberadamente.
// El estado visual del badge solo depende de type, size, selected y disabled.
// Esto evita que los 18 badges se rerenderizen cuando el padre recrea la función onClick.
const TypeBadge = memo(function TypeBadge({ type, size = 'md', onClick, selected = false, disabled = false }) {
  const color = TYPE_COLORS[type]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'type-badge',
        `type-badge--${size}`,
        disabled ? 'type-badge--disabled' : '',
        !onClick ? 'type-badge--static' : '',
      ].join(' ')}
      style={{
        background: selected ? color : `${color}22`,
        color: selected ? '#fff' : color,
        borderColor: disabled ? '#333' : color,
      }}
    >
      <TypeIcon type={type} size={ICON_SIZES[size]} invert={selected} />
      {TYPE_NAMES_ES[type]}
    </button>
  )
}, (prev, next) =>
  prev.type === next.type &&
  prev.size === next.size &&
  prev.selected === next.selected &&
  prev.disabled === next.disabled
)

export default TypeBadge
