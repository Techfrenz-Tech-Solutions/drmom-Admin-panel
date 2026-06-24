// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Mail, Lock, Eye, EyeOff, LogIn, X, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'
// import Logo from '../assets/Logo.png'
// import './Login.css'

// function ForgotPasswordModal({ onClose }) {
//   const [step, setStep] = useState('email')   // 'email' | 'sent'
//   const [fpEmail, setFpEmail] = useState('')
//   const [fpError, setFpError] = useState('')
//   const [sending, setSending] = useState(false)

//   const handleSend = (e) => {
//     e.preventDefault()
//     if (!fpEmail.trim()) { setFpError('Please enter your email address'); return }
//     if (!/\S+@\S+\.\S+/.test(fpEmail)) { setFpError('Enter a valid email address'); return }
//     setFpError('')
//     setSending(true)
//     setTimeout(() => {
//       setSending(false)
//       setStep('sent')
//     }, 1200)
//   }

//   return (
//     <div className="fp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
//       <div className="fp-modal">

//         {/* Close */}
//         <button className="fp-close" onClick={onClose}><X size={16} /></button>

//         {step === 'email' ? (
//           <>
//             <div className="fp-icon-wrap">
//               <KeyRound size={28} color="#7B5EA7" />
//             </div>
//             <h2 className="fp-title">Forgot Password?</h2>
//             <p className="fp-desc">
//               Enter the email address linked to your admin account and we'll send you a reset link.
//             </p>

//             <form onSubmit={handleSend} className="fp-form">
//               <div className="fp-field">
//                 <label className="fp-label"><Mail size={13} /> Email Address</label>
//                 <input
//                   type="email"
//                   className="fp-input"
//                   placeholder="admin@drmom.in"
//                   value={fpEmail}
//                   onChange={e => { setFpEmail(e.target.value); setFpError('') }}
//                   autoFocus
//                 />
//                 {fpError && <span className="fp-error">{fpError}</span>}
//               </div>
//               <button type="submit" className="fp-btn" disabled={sending}>
//                 {sending ? 'Sending...' : 'Send Reset Link'}
//               </button>
//             </form>

//             <button className="fp-back" onClick={onClose}>
//               <ArrowLeft size={13} /> Back to Sign In
//             </button>
//           </>
//         ) : (
//           <>
//             <div className="fp-icon-wrap fp-icon-success">
//               <CheckCircle2 size={28} color="#6dd5a8" />
//             </div>
//             <h2 className="fp-title">Check Your Email</h2>
//             <p className="fp-desc">
//               A password reset link has been sent to<br />
//               <strong>{fpEmail}</strong>
//             </p>
//             <p className="fp-hint">Didn't receive it? Check your spam folder or try again.</p>
//             <button className="fp-btn" onClick={onClose}>Back to Sign In</button>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

// export default function Login() {
//   const navigate = useNavigate()
//   const [email, setEmail] = useState('admin@drmom.in')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [showForgot, setShowForgot] = useState(false)

//   const handleLogin = (e) => {
//     e.preventDefault()
//     setError('')

//     if (!email.trim() || !password.trim()) {
//       setError('Please fill in all fields')
//       return
//     }

//     setLoading(true)
//     setTimeout(() => {
//       // Write token first, then hard-navigate so ProtectedRoute re-reads it cleanly
//       localStorage.setItem('authToken', 'admin-token-' + Date.now())
//       localStorage.setItem('adminEmail', email.trim())
//       window.location.replace('/')
//     }, 800)
//   }

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         {/* Logo */}
//         <div className="login-header">
//           <img src={Logo} alt="Dr Mom Logo" className="login-logo" />
//           <h1 className="login-title">Dr Mom 2.0</h1>
//           <p className="login-subtitle">Admin Panel</p>
//         </div>

//         {/* Welcome */}
//         <div className="login-welcome">
//           <h2>Welcome Back</h2>
//           <p>Sign in to your admin account to continue</p>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleLogin} className="login-form">
//           {error && <div className="login-error">{error}</div>}

//           <div className="login-form-group">
//             <label className="login-label"><Mail size={14} /> Email Address</label>
//             <input
//               type="email"
//               className="login-input"
//               placeholder="admin@drmom.in"
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="login-form-group">
//             <label className="login-label"><Lock size={14} /> Password</label>
//             <div className="login-password-wrap">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 className="login-input"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 required
//               />
//               <button type="button" className="login-eye-btn" onClick={() => setShowPassword(v => !v)}>
//                 {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//               </button>
//             </div>
//           </div>

//           <div className="login-extras">
//             <label className="login-checkbox">
//               <input type="checkbox" />
//               <span>Remember me</span>
//             </label>
//             <button type="button" className="login-forgot" onClick={() => setShowForgot(true)}>
//               Forgot Password?
//             </button>
//           </div>

//           <button type="submit" className="login-btn" disabled={loading}>
//             <LogIn size={16} />
//             {loading ? 'Signing In...' : 'Sign In'}
//           </button>
//         </form>

//         <div className="login-footer">
//           <p>© 2024 Dr Mom. All rights reserved.</p>
//         </div>
//       </div>

//       {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
//     </div>
//   )
// }
















import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, X, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Logo from '../Assets/Logo.png'
import './Login.css'
 
function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState('email')   // 'email' | 'sent'
  const [fpEmail, setFpEmail] = useState('')
  const [fpError, setFpError] = useState('')
  const [sending, setSending] = useState(false)
 
  const handleSend = (e) => {
    e.preventDefault()
    if (!fpEmail.trim()) { setFpError('Please enter your email address'); return }
    if (!/\S+@\S+\.\S+/.test(fpEmail)) { setFpError('Enter a valid email address'); return }
    setFpError('')
    setSending(true)
    setTimeout(() => {
      setSending(false)                   
      setStep('sent')
    }, 1200)
  }
 
  return (
<div className="fp-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
<div className="fp-modal">
 
        {/* Close */}
<button className="fp-close" onClick={onClose}><X size={16} /></button>
 
        {step === 'email' ? (
<>
<div className="fp-icon-wrap">
<KeyRound size={28} color="#7B5EA7" />
</div>
<h2 className="fp-title">Forgot Password?</h2>
<p className="fp-desc">
              Enter the email address linked to your admin account and we'll send you a reset link.
</p>
 
            <form onSubmit={handleSend} className="fp-form">
<div className="fp-field">
<label className="fp-label"><Mail size={13} /> Email Address</label>
<input
                  type="email"
                  className="fp-input"
                  placeholder="admin@drmom.in"
                  value={fpEmail}
                  onChange={e => { setFpEmail(e.target.value); setFpError('') }}
                  autoFocus
                />
                {fpError && <span className="fp-error">{fpError}</span>}
</div>
<button type="submit" className="fp-btn" disabled={sending}>
                {sending ? 'Sending...' : 'Send Reset Link'}
</button>
</form>
 
            <button className="fp-back" onClick={onClose}>
<ArrowLeft size={13} /> Back to Sign In
</button>
</>
        ) : (
<>
<div className="fp-icon-wrap fp-icon-success">
<CheckCircle2 size={28} color="#6dd5a8" />
</div>
<h2 className="fp-title">Check Your Email</h2>
<p className="fp-desc">
              A password reset link has been sent to
 
              <strong>{fpEmail}</strong>
</p>
<p className="fp-hint">Didn't receive it? Check your spam folder or try again.</p>
<button className="fp-btn" onClick={onClose}>Back to Sign In</button>
</>
        )}
</div>
</div>
  )
}
 
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@drmom.in')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
 
  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
 
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }
 
    setLoading(true)
    setTimeout(() => {
      // Write token first, then hard-navigate so ProtectedRoute re-reads it cleanly
      localStorage.setItem('authToken', 'admin-token-' + Date.now())
      localStorage.setItem('adminEmail', email.trim())
      window.location.replace('/')
    }, 800)
  }
 
  return (
<div className="login-container">
<div className="login-card">
        {/* Logo */}
<div className="login-header">
<img src={Logo} alt="Dr Mom Logo" className="login-logo" />
<h1 className="login-title">Dr Mom 2.0</h1>
<p className="login-subtitle">Admin Panel</p>
</div>
 
        {/* Welcome */}
<div className="login-welcome">
<h2>Welcome Back</h2>
<p>Sign in to your admin account to continue</p>
</div>
 
        {/* Form */}
<form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
 
          <div className="login-form-group">
<label className="login-label"><Mail size={14} /> Email Address</label>
<input
              type="email"
              className="login-input"
              placeholder="admin@drmom.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
</div>
 
          <div className="login-form-group">
<label className="login-label"><Lock size={14} /> Password</label>
<div className="login-password-wrap">
<input
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
<button type="button" className="login-eye-btn" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
</button>
</div>
</div>
 
          <div className="login-extras">
<label className="login-checkbox">
<input type="checkbox" />
<span>Remember me</span>
</label>
<button type="button" className="login-forgot" onClick={() => setShowForgot(true)}>
              Forgot Password?
</button>
</div>
 
          <button type="submit" className="login-btn" disabled={loading}>
<LogIn size={16} />
            {loading ? 'Signing In...' : 'Sign In'}
</button>
</form>
 
        <div className="login-footer">
<p>© 2024 Dr Mom. All rights reserved.</p>
</div>
</div>
 
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
</div>
  )
}
