import Flashcards from '../components/Flashcards'

export default function FlashcardsPage() {
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 20 }}>Flashcards</h1>
        <p style={{ margin: 0, color: '#555', fontSize: 13 }}>
          Selecciona los tipos correctos antes de revelar. Verde = correcto · Ámbar = olvidado · Rojo = incorrecto.
        </p>
      </div>
      <Flashcards />
    </>
  )
}
