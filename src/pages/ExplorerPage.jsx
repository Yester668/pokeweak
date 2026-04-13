import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TypeSelector from '../components/TypeSelector'
import TypeDetail from '../components/TypeDetail'
import { TYPES } from '../data/types'

export default function ExplorerPage() {
  const { type: paramType, secondType: paramSecond } = useParams()
  const navigate = useNavigate()

  const initPrimary = TYPES.includes(paramType)   ? paramType   : null
  const initSecond  = TYPES.includes(paramSecond) ? paramSecond : null

  const [primaryType, setPrimaryType] = useState(initPrimary)
  const [secondType,  setSecondType]  = useState(initSecond)

  function handlePrimary(type) {
    const next = type === primaryType ? null : type
    setPrimaryType(next)
    if (!next || next === secondType) setSecondType(null)
    navigate(next ? `/explorar/${next}` : '/explorar', { replace: true })
  }

  function handleSecond(type) {
    const next = type === secondType ? null : type
    setSecondType(next)
    if (primaryType) navigate(next ? `/explorar/${primaryType}/${next}` : `/explorar/${primaryType}`, { replace: true })
  }

  return (
    <>
      <section style={{ marginBottom: 24 }}>
        <TypeSelector selected={primaryType} onSelect={handlePrimary} label="Tipo principal" />
      </section>

      {primaryType && (
        <section style={{ marginBottom: 32 }}>
          <TypeSelector
            selected={secondType}
            onSelect={handleSecond}
            disabledType={primaryType}
            label="Segundo tipo (opcional — doble tipo)"
          />
        </section>
      )}

      {primaryType
        ? (
          <section style={{ background: '#13132a', borderRadius: 14, padding: 24, border: '1px solid #1e1e38' }}>
            <TypeDetail type={primaryType} secondType={secondType} />
          </section>
        )
        : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#333' }}>
            <p style={{ fontSize: 48, margin: '0 0 12px' }}>🔍</p>
            <p style={{ fontSize: 15, margin: '0 0 6px', color: '#555' }}>
              Selecciona un tipo para explorar sus ventajas y debilidades
            </p>
            <p style={{ fontSize: 12, margin: 0, color: '#333' }}>
              La URL se actualiza — puedes compartir el enlace directamente
            </p>
          </div>
        )
      }
    </>
  )
}
