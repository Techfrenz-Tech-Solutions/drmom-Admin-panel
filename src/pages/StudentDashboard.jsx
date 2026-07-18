import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, GraduationCap, BookOpen,
  CheckCircle2, Clock, TrendingUp, Award, PlayCircle, Layers,
  ToggleLeft, ToggleRight, Calendar,
} from 'lucide-react'
import { apiRequest } from '../utils/api'
import { secondsToLabel } from '../utils/adminData'

const COLORS = ['#6c63ff', '#ff6b9d', '#00d4aa', '#ffa94d', '#4dabf7']
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

export default function StudentDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [progress, setProgress] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [userRes, enrollRes] = await Promise.all([
          apiRequest(`/admin/users/${id}`),
          apiRequest(`/admin/enrollments?userId=${id}`),
        ])
        setStudent(userRes.user || userRes)
        const enrList = enrollRes.enrollments || []
        setEnrollments(enrList)

        try {
          const progRes = await apiRequest(`/admin/users/${id}/progress`)
          setProgress(progRes.progress || progRes || [])
        } catch {
          setProgress(enrList.map(e => ({
            courseId: e.courseId,
            courseTitle: e.course?.title || '—',
            completedLessons: e.completedLessons ?? 0,
            totalLessons: e.totalLessons ?? 0,
            watchedSeconds: e.watchedSeconds ?? 0,
            lastActive: e.lastActive ?? null,
          })))
        }
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, flexDirection: 'column' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ color: 'var(--text3)', fontSize: 13 }}>Loading student data…</p>
    </div>
  )

  if (error) return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/student-progress')}>
        <ArrowLeft size={14} /> Back
      </button>
      <div className="card"><p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p></div>
    </div>
  )

  if (!student) return null

  const color = COLORS[0]
  const totalCourses = enrollments.length
  const completedCourses = progress.filter(p => p.totalLessons > 0 && p.completedLessons >= p.totalLessons).length
  const totalWatched = progress.reduce((acc, p) => acc + (p.watchedSeconds || 0), 0)
  const totalLessonsCompleted = progress.reduce((acc, p) => acc + (p.completedLessons || 0), 0)

  const stats = [
    { label: 'Enrolled Courses',  value: totalCourses,          icon: BookOpen,    color: '#6c63ff', bg: 'rgba(108,99,255,0.12)' },
    { label: 'Courses Completed', value: completedCourses,       icon: Award,       color: '#00d4aa', bg: 'rgba(0,212,170,0.12)' },
    { label: 'Lessons Done',      value: totalLessonsCompleted,  icon: CheckCircle2,color: '#ff6b9d', bg: 'rgba(255,107,157,0.12)' },
    { label: 'Watch Time',        value: secondsToLabel(totalWatched) || '0:00', icon: Clock, color: '#ffa94d', bg: 'rgba(255,169,77,0.12)' },
  ]

  return (
    <div>
      {/* Back button */}
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate('/student-progress')}>
        <ArrowLeft size={14} /> Back to Student Progress
      </button>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: color + '22', border: `3px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 22, color,
        }}>
          {initials(student.name)}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
            {student.name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text3)' }}>
              <Mail size={13} /> {student.email}
            </span>
            {student.phone && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text3)' }}>
                <Phone size={13} /> {student.phone}
              </span>
            )}
            {student.gradeLabel && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text3)' }}>
                <GraduationCap size={13} /> {student.gradeLabel}
              </span>
            )}
            {student.createdAt && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text3)' }}>
                <Calendar size={13} /> Joined {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
        <div>
          {student.isActive
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ToggleRight size={20} color="var(--green)" /><span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Active</span></span>
            : <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ToggleLeft size={20} color="var(--text3)" /><span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600 }}>Inactive</span></span>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Course Progress */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} color="var(--accent)" /> Course Progress
        </h3>
        {progress.length === 0 ? (
          <div className="empty-state"><BookOpen size={28} /><p>No course progress found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course</th>
                  <th>Lessons Completed</th>
                  <th>Progress</th>
                  <th>Watch Time</th>
                  <th>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((p, i) => {
                  const pct = p.totalLessons > 0 ? Math.round((p.completedLessons / p.totalLessons) * 100) : 0
                  const barColor = pct >= 100 ? '#00d4aa' : pct >= 50 ? '#6c63ff' : '#ffa94d'
                  return (
                    <tr key={p.courseId || i}>
                      <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <BookOpen size={13} color="var(--accent)" />
                          <span style={{ color: 'var(--text)', fontWeight: 600 }}>{p.courseTitle}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text2)', fontSize: 13 }}>{p.completedLessons} / {p.totalLessons || '—'}</td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 7, borderRadius: 10, background: 'var(--bg3)', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 10, transition: 'width 0.4s' }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: barColor, minWidth: 34 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text2)', fontSize: 13 }}>{p.watchedSeconds ? secondsToLabel(p.watchedSeconds) : '—'}</td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {p.lastActive ? new Date(p.lastActive).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enrollments */}
      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--text)', fontSize: 15, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={16} color="var(--accent)" /> Enrolled Courses
        </h3>
        {enrollments.length === 0 ? (
          <div className="empty-state"><BookOpen size={28} /><p>Not enrolled in any course yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course</th>
                  <th>Source</th>
                  <th>Enrolled On</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e, i) => (
                  <tr key={e.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 13 }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <PlayCircle size={13} color="var(--accent)" />
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{e.course?.title || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${e.source === 'MANUAL' ? 'badge-yellow' : e.source === 'PURCHASE' ? 'badge-green' : 'badge-blue'}`}>
                        {e.source}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                      {new Date(e.grantedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
