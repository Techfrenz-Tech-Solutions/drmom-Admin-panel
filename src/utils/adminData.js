import { apiRequest } from './api'

export const loadAdminCatalog = () => apiRequest('/admin/catalog')
export const loadAdminDashboard = () => apiRequest('/admin/dashboard')

export const classNames = (catalog) =>
  (catalog.classes || []).map((item) => item.name).filter(Boolean)

export const subjectNames = (catalog) =>
  [...new Set((catalog.subjects || []).map((item) => item.name).filter(Boolean))]

export const flattenLessons = (courses = []) =>
  courses.flatMap((course) =>
    (course.lessons || []).map((lesson) => ({
      ...lesson,
      course,
      courseId: course.id,
      courseTitle: course.title,
      classLabel: course.classLabel || course.classId || '',
      subject: course.subject || '',
    })),
  )

export const secondsToLabel = (seconds) => {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export const paiseToRupees = (paise) => Math.round(Number(paise || 0) / 100)
export const rupeesToPaise = (rupees) => Math.round(Number(rupees || 0) * 100)
