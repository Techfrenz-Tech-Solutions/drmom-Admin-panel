import React, { useState, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Classes from './pages/Classes'
import Subjects from './pages/Subjects'
import Chapters from './pages/Chapters'
import Videos from './pages/Lesson'
import Prices from './pages/Prices'
import Users from './pages/Users'
import Courses from './pages/Courses'
import ProductMaster from './pages/ProductMaster'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/classes': 'Classes',
  '/subjects': 'Subjects',
  '/courses': 'Courses',
  '/chapters': 'Chapters',
  '/lesson': 'Lesson Master',
  '/products': 'Product Master',
  '/prices': 'Pricing',
  '/users': 'Users',
}

function ProtectedRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('authToken')
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const isAuthenticated = !!localStorage.getItem('authToken')
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'Admin'
  const mainRef = useRef(null)

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/chapters" element={<Chapters />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/products" element={<ProductMaster />} />
            <Route path="/prices" element={<Prices />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
