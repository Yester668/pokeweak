import { memo } from 'react'
import { TYPE_COLORS } from '../data/types'

const ICONS = {
  normal:   <circle cx="12" cy="12" r="7" fill="none" strokeWidth="2.5"/>,
  fire:     <path d="M12 3c0 4-4 5-4 9a4 4 0 008 0c0-2-1-3-1-5 0 0-1 2-2 2s1-4-1-6z" fill="currentColor"/>,
  water:    <path d="M12 3L7 10a5 5 0 0010 0L12 3z" fill="currentColor"/>,
  electric: <path d="M13 2L6 13h5l-1 9 8-11h-5l2-9z" fill="currentColor"/>,
  grass:    <path d="M12 20V10M12 10C12 10 7 8 6 4c3 1 5 3 6 6M12 10C12 10 17 8 18 4c-3 1-5 3-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>,
  ice:      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>,
  fighting: <path d="M8 7l-2 5h4l-2 5 8-7h-5l3-3H8z" fill="currentColor"/>,
  poison:   <><circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  ground:   <><path d="M3 14c2-4 14-4 18 0v4H3v-4z" fill="currentColor"/><path d="M6 14l3-6 3 4 3-4 3 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/></>,
  flying:   <><path d="M12 12C8 8 4 9 3 12c3 0 6 1 9 4M12 12C16 8 20 9 21 12c-3 0-6 1-9 4" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M12 12v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  psychic:  <><circle cx="12" cy="12" r="5" fill="none" strokeWidth="2.5" stroke="currentColor"/><path d="M12 7V5M12 19v-2M7 12H5M19 12h-2M8.5 8.5l-1.4-1.4M16.9 16.9l-1.4-1.4M8.5 15.5L7.1 16.9M16.9 7.1l-1.4 1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  bug:      <><path d="M12 8a4 4 0 100 8 4 4 0 000-8z" fill="currentColor"/><path d="M8 8L5 5M16 8l3-3M8 16l-3 3M16 16l3 3M7 12H3M21 12h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  rock:     <path d="M6 17L4 10l5-6h6l5 6-2 7H6z" fill="currentColor"/>,
  ghost:    <><path d="M12 3a7 7 0 00-7 7v8l2-2 2 2 2-2 2 2 2-2 2 2v-8a7 7 0 00-7-7z" fill="currentColor"/><circle cx="9.5" cy="10.5" r="1" fill="white"/><circle cx="14.5" cy="10.5" r="1" fill="white"/></>,
  dragon:   <path d="M4 12c2-6 10-10 14-6-2 0-4 2-3 4 2-1 4 0 4 2s-2 3-4 2c1 2 0 4-2 4s-4-2-3-4C7 16 4 14 4 12z" fill="currentColor"/>,
  dark:     <path d="M12 3a9 9 0 100 18A6 6 0 0112 3z" fill="currentColor"/>,
  steel:    <path d="M12 3l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="currentColor"/>,
  fairy:    <><path d="M12 2l1.5 4.5H18l-3.7 2.7 1.4 4.3L12 11l-3.7 2.5 1.4-4.3L6 6.5h4.5z" fill="currentColor"/><circle cx="12" cy="17" r="3" fill="currentColor" opacity="0.6"/></>,
}

// memo: el ícono nunca cambia para el mismo type+size+invert
const TypeIcon = memo(function TypeIcon({ type, size = 16, invert = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ color: invert ? '#fff' : TYPE_COLORS[type], flexShrink: 0 }}
      aria-hidden="true"
    >
      {ICONS[type]}
    </svg>
  )
})

export default TypeIcon
