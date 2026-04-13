import { lazy, Suspense } from 'react'
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'

// Lazy load — cada página se carga solo cuando se navega a ella
const Home               = lazy(() => import('./pages/Home'))
const ExplorerPage       = lazy(() => import('./pages/ExplorerPage'))
const FlashcardsPage     = lazy(() => import('./pages/FlashcardsPage'))
const BattlasPage        = lazy(() => import('./pages/BattlasPage'))
const TypeRunHub         = lazy(() => import('./pages/TypeRunHub'))
const TypeRunPage        = lazy(() => import('./pages/TypeRunPage'))
const TypeRunSurvivalPage = lazy(() => import('./pages/TypeRunSurvivalPage'))

const NAV = [
  { to: '/',           label: 'Inicio',      icon: '⚡', exact: true },
  { to: '/explorar',   label: 'Explorar',    icon: '🔍' },
  { to: '/flashcards', label: 'Flashcards',  icon: '🃏' },
  { to: '/batallas',   label: 'Batallas',    icon: '⚔️' },
  { to: '/typerun',    label: 'TypeRun',     icon: '🎰' },
]

function Spinner() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid #1e1e38',
        borderTopColor: '#7038F8',
        borderRadius: '50%',
        margin: '0 auto',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )
}

function Layout() {
  const { pathname } = useLocation()
  const isTypeRun = pathname.startsWith('/typerun')

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="app-header">
        <NavLink to="/" className="app-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>⚡</span> PokéWeak
        </NavLink>
        <nav className="app-nav">
          {NAV.map(({ to, label, icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `nav-tab${isActive || (to === '/typerun' && isTypeRun) ? ' nav-tab--active' : ''}`
              }
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="app-main">
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route index element={<Home />} />
            <Route path="explorar"                    element={<ExplorerPage />} />
            <Route path="explorar/:type"              element={<ExplorerPage />} />
            <Route path="explorar/:type/:secondType"  element={<ExplorerPage />} />
            <Route path="flashcards"                  element={<FlashcardsPage />} />
            <Route path="batallas"                    element={<BattlasPage />} />
            <Route path="typerun"                     element={<TypeRunHub />} />
            <Route path="typerun/clasico"             element={<TypeRunPage />} />
            <Route path="typerun/supervivencia"       element={<TypeRunSurvivalPage />} />
            <Route path="*"                           element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default function App() {
  return <Layout />
}
