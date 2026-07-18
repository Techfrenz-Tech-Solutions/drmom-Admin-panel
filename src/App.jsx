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
import Orders from './pages/Orders'
import Enrollments from './pages/Enrollments'
import StudentProgress from './pages/StudentProgress'
import StudentDashboard from './pages/StudentDashboard'
import PaymentTracker from './pages/PaymentTracker'
import Newsletter from './pages/Newsletter'
import Storage from './pages/Storage'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/classes': 'Classes',
  '/subjects': 'Subjects',
  '/courses': 'Courses',
  '/chapters': 'Chapters',
  '/videos': 'Lesson Master',
  '/prices': 'Pricing',
  '/users': 'Users',
  '/orders': 'Orders',
  '/enrollments': 'Enrollments',
  '/student-progress': 'Student Progress',
  '/payment-tracker': 'Payment Tracker',
  '/newsletter': 'Newsletter',
  '/storage': 'Storage',
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
  const [sidebarOpen, setSidebarOpen] = useState(false)       // mobile overlay
  const [collapsed, setCollapsed] = useState(false)            // desktop collapse
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname]
    || (location.pathname.startsWith('/student-progress/') ? 'Student Dashboard' : 'Admin')
  const mainRef = useRef(null)

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
          onCollapseClick={() => setCollapsed(c => !c)}
        />
        <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/chapters" element={<Chapters />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/prices" element={<Prices />} />
            <Route path="/users" element={<Users />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="/student-progress" element={<StudentProgress />} />
            <Route path="/student-progress/:id" element={<StudentDashboard />} />
            <Route path="/payment-tracker" element={<PaymentTracker />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/storage" element={<Storage />} />
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
