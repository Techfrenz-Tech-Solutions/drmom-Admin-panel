// import React, { useState } from 'react'
// import { NavLink } from 'react-router-dom'
// import {
//   LayoutDashboard, BookOpen, Video, Layers, BookMarked,
//   DollarSign, Users, ChevronRight, GraduationCap
// } from 'lucide-react'
// import './Sidebar.css'
// import Logo from '../assets/Logo.png'
// import AdminProfile from './AdminProfile'

// const nav = [
//   { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
//   { to: '/classes', icon: GraduationCap, label: 'Classes' },
//   { to: '/subjects', icon: BookMarked, label: 'Subjects' },
//   { to: '/courses', icon: BookOpen, label: 'Courses' },
//   { to: '/chapters', icon: Layers, label: 'Chapters' },
//   { to: '/videos', icon: Video, label: 'Lesson Videos' },
//   { to: '/prices', icon: DollarSign, label: 'Pricing' },
//   { to: '/users', icon: Users, label: 'Users' },
// ]

// export default function Sidebar({ open, onClose }) {
//   const [showProfile, setShowProfile] = useState(false)
//   return (
//     <>
//       {open && <div className="sb-overlay" onClick={onClose} />}
//       <aside className={`sidebar ${open ? 'open' : ''}`}>
//         <div className="sb-brand">
//           <img src={Logo} alt="Dr Mom Logo" className="sb-logo-img" />
//           <div>
//             <div className="sb-title">Dr Mom 2.0</div>
//             <div className="sb-sub">Admin Panel</div>
//           </div>
//         </div>

//         <nav className="sb-nav">
//           <div className="sb-section-label">Main</div>
//           {nav.map(({ to, icon: Icon, label }) => (
//             <NavLink
//               key={to}
//               to={to}
//               end={to === '/'}
//               className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
//               onClick={onClose}
//             >
//               <Icon size={17} />
//               <span>{label}</span>
//               <ChevronRight size={13} className="sb-arrow" />
//             </NavLink>
//           ))}
//         </nav>

//         <div className="sb-footer">
//           <div className="sb-user" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
//             <div className="sb-avatar">A</div>
//             <div>
//               <div className="sb-uname">Admin</div>
//               <div className="sb-uemail">admin@drmom.in</div>
//             </div>
//           </div>
//         </div>
//       </aside>

//       {showProfile && <AdminProfile onClose={() => setShowProfile(false)} />}
//     </>
//   )
// }






















import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Video, Layers, BookMarked,
  DollarSign, Users, ChevronRight, GraduationCap, Package,
  ShoppingCart, UserCheck,
} from 'lucide-react'
import './Sidebar.css'
import Logo from '../Assets/Logo.png'
import AdminProfile from './AdminProfile'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/classes', icon: GraduationCap, label: 'Classes' },
  { to: '/subjects', icon: BookMarked, label: 'Subjects' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/chapters', icon: Layers, label: 'Chapters' },
  { to: '/videos', icon: Video, label: 'Lesson Master' },
  { to: '/products', icon: Package, label: 'Product Master' },
  { to: '/prices', icon: DollarSign, label: 'Pricing' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/enrollments', icon: UserCheck, label: 'Enrollments' },
]
 
export default function Sidebar({ open, onClose }) {
  const [showProfile, setShowProfile] = useState(false)
  return (
<>
      {open && <div className="sb-overlay" onClick={onClose} />}
<aside className={`sidebar ${open ? 'open' : ''}`}>
<div className="sb-brand">
<img src={Logo} alt="Dr Mom Logo" className="sb-logo-img" />
<div>
<div className="sb-title">Dr Mom 2.0</div>
<div className="sb-sub">Admin Panel</div>
</div>
</div>
 
        <nav className="sb-nav">
<div className="sb-section-label">Main</div>
          {nav.map(({ to, icon: Icon, label }) => (
<NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
>
<Icon size={17} />
<span>{label}</span>
<ChevronRight size={13} className="sb-arrow" />
</NavLink>
          ))}
</nav>
 
        <div className="sb-footer">
<div className="sb-user" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer' }}>
<div className="sb-avatar">A</div>
<div>
<div className="sb-uname">Admin</div>
<div className="sb-uemail">admin@drmom.in</div>
</div>
</div>
</div>
</aside>
 
      {showProfile && <AdminProfile onClose={() => setShowProfile(false)} />}
</>
  )
}