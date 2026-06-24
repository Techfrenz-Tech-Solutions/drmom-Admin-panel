import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

const INIT_CLASSES = ['LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th']
const INIT_SUBJECTS = ['Mathematics', 'Science', 'English', 'Tamil', 'EVS', 'GK', 'Art & Craft']

const initialData = {
  classes: INIT_CLASSES,
  subjects: INIT_SUBJECTS,
  chapters: [
    { id: 1, title: 'Numbers 1-10', class: 'LKG', subject: 'Mathematics', order: 1 },
    { id: 2, title: 'Alphabets A-Z', class: 'LKG', subject: 'English', order: 1 },
    { id: 3, title: 'Animals Around Us', class: 'UKG', subject: 'EVS', order: 1 },
    { id: 4, title: 'Addition & Subtraction', class: '1st', subject: 'Mathematics', order: 1 },
    { id: 5, title: 'Plants & Their Parts', class: '2nd', subject: 'Science', order: 2 },
  ],
  videos: [
    { id: 1, title: 'Counting 1 to 10', chapterId: 1, class: 'LKG', subject: 'Mathematics', duration: '5:30', url: 'https://youtube.com/watch?v=xxx', thumbnail: '', order: 1, free: true },
    { id: 2, title: 'Alphabet Song', chapterId: 2, class: 'LKG', subject: 'English', duration: '4:15', url: 'https://youtube.com/watch?v=yyy', thumbnail: '', order: 1, free: true },
    { id: 3, title: 'Farm Animals', chapterId: 3, class: 'UKG', subject: 'EVS', duration: '6:00', url: 'https://youtube.com/watch?v=zzz', thumbnail: '', order: 1, free: false },
    { id: 4, title: 'Addition Basics', chapterId: 4, class: '1st', subject: 'Mathematics', duration: '8:20', url: 'https://youtube.com/watch?v=aaa', thumbnail: '', order: 1, free: false },
  ],
  prices: [
    { id: 1, class: 'LKG', plan: 'Monthly', amount: 299, features: ['All Subjects', 'Unlimited Videos', 'Progress Reports'], active: true },
    { id: 2, class: 'LKG', plan: 'Quarterly', amount: 799, features: ['All Subjects', 'Unlimited Videos', 'Progress Reports', 'Doubt Sessions'], active: true },
    { id: 3, class: 'UKG', plan: 'Monthly', amount: 299, features: ['All Subjects', 'Unlimited Videos', 'Progress Reports'], active: true },
    { id: 4, class: '1st', plan: 'Monthly', amount: 349, features: ['All Subjects', 'Unlimited Videos', 'Progress Reports'], active: true },
    { id: 5, class: '1st', plan: 'Yearly', amount: 2999, features: ['All Subjects', 'Unlimited Videos', 'Progress Reports', 'Doubt Sessions', 'Certificate'], active: true },
  ],
  users: [
    { id: 1, name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543210', class: '2nd', plan: 'Monthly', joined: '2024-01-15', status: 'active', avatar: '' },
    { id: 2, name: 'Arjun Kumar', email: 'arjun@example.com', phone: '9871234567', class: 'LKG', plan: 'Quarterly', joined: '2024-02-10', status: 'active', avatar: '' },
    { id: 3, name: 'Meena Raj', email: 'meena@example.com', phone: '9865432109', class: '1st', plan: 'Yearly', joined: '2024-01-20', status: 'inactive', avatar: '' },
    { id: 4, name: 'Ravi Pillai', email: 'ravi@example.com', phone: '9843210987', class: 'UKG', plan: 'Monthly', joined: '2024-03-05', status: 'active', avatar: '' },
    { id: 5, name: 'Lakshmi Devi', email: 'lakshmi@example.com', phone: '9812345678', class: '3rd', plan: 'Monthly', joined: '2024-02-28', status: 'active', avatar: '' },
  ]
}

export function AppProvider({ children }) {
  const [data, setData] = useState(initialData)
  const [nextId, setNextId] = useState({ chapters: 10, videos: 10, prices: 10, users: 10 })

  const genId = (type) => {
    const id = nextId[type]
    setNextId(p => ({ ...p, [type]: p[type] + 1 }))
    return id
  }

  // CLASSES
  const addClass = (name) => {
    if (!name || data.classes.includes(name)) return
    setData(p => ({ ...p, classes: [...p.classes, name] }))
  }
  const updateClass = (oldName, newName) => {
    if (!newName || newName === oldName) return
    setData(p => ({
      ...p,
      classes: p.classes.map(c => c === oldName ? newName : c),
      chapters: p.chapters.map(c => c.class === oldName ? { ...c, class: newName } : c),
      videos: p.videos.map(v => v.class === oldName ? { ...v, class: newName } : v),
      prices: p.prices.map(pr => pr.class === oldName ? { ...pr, class: newName } : pr),
      users: p.users.map(u => u.class === oldName ? { ...u, class: newName } : u),
    }))
  }
  const deleteClass = (name) => {
    setData(p => ({
      ...p,
      classes: p.classes.filter(c => c !== name),
      chapters: p.chapters.filter(c => c.class !== name),
      videos: p.videos.filter(v => v.class !== name),
      prices: p.prices.filter(pr => pr.class !== name),
      users: p.users.filter(u => u.class !== name),
    }))
  }

  // SUBJECTS
  const addSubject = (name) => {
    if (!name || data.subjects.includes(name)) return
    setData(p => ({ ...p, subjects: [...p.subjects, name] }))
  }
  const updateSubject = (oldName, newName) => {
    if (!newName || newName === oldName) return
    setData(p => ({
      ...p,
      subjects: p.subjects.map(s => s === oldName ? newName : s),
      chapters: p.chapters.map(c => c.subject === oldName ? { ...c, subject: newName } : c),
      videos: p.videos.map(v => v.subject === oldName ? { ...v, subject: newName } : v),
    }))
  }
  const deleteSubject = (name) => {
    setData(p => ({
      ...p,
      subjects: p.subjects.filter(s => s !== name),
      chapters: p.chapters.filter(c => c.subject !== name),
      videos: p.videos.filter(v => v.subject !== name),
    }))
  }

  // CHAPTERS
  const addChapter = (ch) => setData(p => ({ ...p, chapters: [...p.chapters, { ...ch, id: genId('chapters') }] }))
  const updateChapter = (id, ch) => setData(p => ({ ...p, chapters: p.chapters.map(c => c.id === id ? { ...c, ...ch } : c) }))
  const deleteChapter = (id) => setData(p => ({ ...p, chapters: p.chapters.filter(c => c.id !== id) }))

  // VIDEOS
  const addVideo = (v) => setData(p => ({ ...p, videos: [...p.videos, { ...v, id: genId('videos') }] }))
  const updateVideo = (id, v) => setData(p => ({ ...p, videos: p.videos.map(x => x.id === id ? { ...x, ...v } : x) }))
  const deleteVideo = (id) => setData(p => ({ ...p, videos: p.videos.filter(v => v.id !== id) }))

  // PRICES
  const addPrice = (pr) => setData(p => ({ ...p, prices: [...p.prices, { ...pr, id: genId('prices') }] }))
  const updatePrice = (id, pr) => setData(p => ({ ...p, prices: p.prices.map(x => x.id === id ? { ...x, ...pr } : x) }))
  const deletePrice = (id) => setData(p => ({ ...p, prices: p.prices.filter(x => x.id !== id) }))

  // USERS
  const addUser = (u) => setData(p => ({ ...p, users: [...p.users, { ...u, id: genId('users') }] }))
  const updateUser = (id, u) => setData(p => ({ ...p, users: p.users.map(x => x.id === id ? { ...x, ...u } : x) }))
  const deleteUser = (id) => setData(p => ({ ...p, users: p.users.filter(x => x.id !== id) }))

  return (
    <AppContext.Provider value={{
      data,
      CLASSES: data.classes,
      SUBJECTS: data.subjects,
      addClass, updateClass, deleteClass,
      addSubject, updateSubject, deleteSubject,
      addChapter, updateChapter, deleteChapter,
      addVideo, updateVideo, deleteVideo,
      addPrice, updatePrice, deletePrice,
      addUser, updateUser, deleteUser,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
