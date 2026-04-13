import BattleMode from '../components/BattleMode'

export default function BattlasPage() {
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 20 }}>Escenarios de Batalla</h1>
        <p style={{ margin: 0, color: '#555', fontSize: 13 }}>
          Elige el movimiento más efectivo según los tipos del rival. Piénsalo antes de revelar.
        </p>
      </div>
      <BattleMode />
    </>
  )
}
