import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import './index.css'
import Dashboard from './Dashboard'
import NotesTab from './NotesTab'
import TasksTab from './TasksTab'
import JournalTab from './JournalTab'
import StatsModal from './StatsModal'
import TrashModal from './TrashModal'

// ===== Supabase =====
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase = null
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
} catch (e) {
  console.warn('Supabase init failed:', e)
}

// ===== SVG ICONS =====
const IconMoon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const IconSun = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const IconAmber = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const IconSolarized = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const IconMenuDots = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
)

const IconLogout = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const IconBack = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const IconTrash = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

// ===== IMPORT / EXPORT SVG ICONS =====
const IconImport = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const IconExport = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const IconFolder = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
)

const LogoIcon = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E2FF"/>
        <stop offset="48%" stopColor="#4A8EFF"/>
        <stop offset="100%" stopColor="#B43DFF"/>
      </linearGradient>
      <linearGradient id="innerGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2"/>
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="7"/>
      </filter>
      <filter id="shadow">
        <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="#4A8EFF" floodOpacity="0.3"/>
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#B43DFF" floodOpacity="0.2"/>
      </filter>
      <mask id="cutouts">
        <rect width="512" height="512" fill="white"/>
        <path fill="black" d="M70 162 H198 Q212 162 212 174 Q212 186 198 186 H70 Q54 186 54 174 Q54 162 70 162 Z"/>
        <path fill="black" d="M60 228 H222 Q238 228 238 242 Q238 256 222 256 H60 Q44 256 44 242 Q44 228 60 228 Z"/>
        <path fill="black" d="M72 296 H184 L212 330 H70 Q54 330 54 314 Q54 296 72 296 Z"/>
      </mask>
      <g id="sparkle">
        <path d="M0-24 C0-8 8 0 24 0 C8 0 0 8 0 24 C0 8 -8 0 -24 0 C-8 0 0-8 0-24Z" fill="#ffffff"/>
      </g>
    </defs>
    <g filter="url(#glow) url(#shadow)">
      <g mask="url(#cutouts)">
        <path fill="url(#logoGrad)" d="M176 74 H288 C408 74 472 150 472 256 C472 362 408 438 288 438 H176 Q146 438 146 406 V106 Q146 74 176 74 Z"/>
        <path fill="url(#innerGlow)" d="M176 74 H288 C408 74 472 150 472 256 C472 362 408 438 288 438 H176 Q146 438 146 406 V106 Q146 74 176 74 Z"/>
      </g>
      <path fill="#0F1115" d="M236 122 Q214 122 214 144 V368 Q214 390 236 390 H282 C365 390 414 338 414 256 C414 174 365 122 282 122 Z"/>
      <path fill="none" stroke="#000" strokeOpacity="0.3" strokeWidth="4" d="M236 122 Q214 122 214 144 V368 Q214 390 236 390 H282 C365 390 414 338 414 256 C414 174 365 122 282 122 Z"/>
      <path fill="none" stroke="#ffffff" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" d="M242 262 L274 296 L338 214"/>
      <path fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="50" strokeLinecap="round" strokeLinejoin="round" d="M242 262 L274 296 L338 214"/>
    </g>
    <use href="#sparkle" x="80" y="80" transform="scale(0.8)" opacity="0.9">
      <animateTransform attributeName="transform" type="translate" values="0,0; -6,-6; 0,0" dur="4s" repeatCount="indefinite"/>
    </use>
    <use href="#sparkle" x="410" y="120" transform="scale(0.6)" opacity="0.7">
      <animateTransform attributeName="transform" type="translate" values="0,0; 4,-8; 0,0" dur="5s" repeatCount="indefinite"/>
    </use>
    <use href="#sparkle" x="430" y="380" transform="scale(0.7)" opacity="0.8">
      <animateTransform attributeName="transform" type="translate" values="0,0; -8,4; 0,0" dur="4.5s" repeatCount="indefinite"/>
    </use>
    <use href="#sparkle" x="90" y="420" transform="scale(0.5)" opacity="0.6">
      <animateTransform attributeName="transform" type="translate" values="0,0; 6,4; 0,0" dur="3.5s" repeatCount="indefinite"/>
    </use>
  </svg>
)

// ===== HELPERS =====
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const formatMinutes = (mins) => {
  if (!mins || mins === 0) return '0m'
  const hours = Math.floor(mins / 60)
  const minutes = mins % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

const CACHE_KEY = 'discypln_cache'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000

const saveToCache = (data) => {
  try {
    const cache = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (e) {}
}

const loadFromCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch (e) { return null }
}

// ============================================================
//  APP COMPONENT
// ============================================================

export default function App() {
  // ===== Auth =====
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // ===== Theme =====
  const [themeMode, setThemeMode] = useState('dark')

  // ===== Navigation =====
  const [currentView, setCurrentView] = useState('dashboard')

  // ===== UI =====
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [showTrashModal, setShowTrashModal] = useState(false)

  // ===== Data =====
  const [notes, setNotes] = useState([])
  const [tasks, setTasks] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [trash, setTrash] = useState({ notes: [], tasks: [], journal: [] })
  const [loadingStates, setLoadingStates] = useState({ notes: false, tasks: false, journal: false })

  // ===== Stats =====
  const [statsData, setStatsData] = useState({
    disciplineScore: 0,
    disciplineLevel: 'Novice',
    disciplineBadge: '🌱',
    longestStreak: 0,
    dailyAverage: 0,
    bestDay: null,
    bestDayCount: 0,
    commitmentRate: 0,
    focusScore: 0,
    monthlyProgress: 0,
    habitCompletion: 0,
    taskVelocity: 0,
    weeklyBreakdown: [],
    dailyHabitsDone: 0,
    dailyHabitsTotal: 0,
    weeklyHabitsDone: 0,
    weeklyHabitsTotal: 0,
    monthlyHabitsDone: 0,
    monthlyHabitsTotal: 0,
    todayFocus: 0,
    weekFocus: 0,
    monthFocus: 0,
    bestFocusDay: null,
    bestFocusMinutes: 0,
    avgFocusPerDay: 0,
    streakEndangered: false,
    daysUntilStreakLoss: 0,
    nextMilestone: 0,
    totalTasksEver: 0,
    completionRate: 0,
    averageTaskTime: 0,
    mostProductiveHour: '--',
    weeklyGoalProgress: 0,
    totalMinutes: 0
  })

  // ===== Toast =====
  const [toast, setToast] = useState({ show: false, message: '', type: 'success', undo: null })
  const toastTimeout = useRef(null)

  // ============================================================
  //  HELPERS
  // ============================================================

  const getStreak = () => {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayHabits = tasks.filter(t => t.type === 'habit' && t.due_date === dateStr)
      if (dayHabits.length === 0) continue
      const allDone = dayHabits.every(t => t.done)
      if (allDone) streak++
      else break
    }
    return streak
  }

  // ===== TOAST: 3 seconds =====
  const showToast = (message, type = 'success', undo = null) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current)
    setToast({ show: true, message, type, undo })
    toastTimeout.current = setTimeout(() => {
      setToast({ show: false, message: '', type: 'success', undo: null })
    }, 3000)
  }

  // ============================================================
  //  THEME HELPERS
  // ============================================================

  const getThemeIcon = () => {
    switch(themeMode) {
      case 'dark': return <IconMoon />
      case 'light': return <IconSun />
      case 'amber': return <IconAmber style={{ color: '#F59E0B' }} />
      case 'solarized': return <IconSolarized style={{ color: '#B58900' }} />
      default: return <IconMoon />
    }
  }

  const getThemeName = () => {
    switch(themeMode) {
      case 'dark': return 'Dark Mode'
      case 'light': return 'Light Mode'
      case 'amber': return 'Amber Mode'
      case 'solarized': return 'Solarized Mode'
      default: return 'Dark Mode'
    }
  }

  // ============================================================
  //  EFFECTS
  // ============================================================

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    document.body.setAttribute('data-theme', themeMode)
  }, [themeMode])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ===== Supabase Auth =====
  useEffect(() => {
    if (!supabase) {
      setAuthError('Supabase not configured. Check your .env file.')
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        // Tabs fetch their own data, no need to fetch here
      } else {
        const cached = loadFromCache()
        if (cached) {
          setNotes(cached.notes || [])
          setTasks(cached.tasks || [])
          setJournalEntries(cached.journal || [])
        }
      }
    }).catch(err => {
      console.error('Auth session error:', err)
      setAuthError('Failed to connect to Supabase')
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ============================================================
  //  DATA FETCHING (only for App-level state, tabs fetch their own)
  // ============================================================

  async function fetchNotes() {
    if (!user || !supabase) return
    setLoadingStates(prev => ({ ...prev, notes: true }))
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) setNotes(data || [])
    } catch (e) { console.error('Fetch notes error:', e) }
    setLoadingStates(prev => ({ ...prev, notes: false }))
  }

  async function fetchTasks() {
    if (!user || !supabase) return
    setLoadingStates(prev => ({ ...prev, tasks: true }))
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) setTasks(data || [])
    } catch (e) { console.error('Fetch tasks error:', e) }
    setLoadingStates(prev => ({ ...prev, tasks: false }))
  }

  async function fetchJournal() {
    if (!user || !supabase) return
    setLoadingStates(prev => ({ ...prev, journal: true }))
    try {
      const { data, error } = await supabase
        .from('journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) setJournalEntries(data || [])
    } catch (e) { console.error('Fetch journal error:', e) }
    setLoadingStates(prev => ({ ...prev, journal: false }))
  }

  const fetchAllData = async () => {
    await Promise.all([fetchNotes(), fetchTasks(), fetchJournal()])
    saveToCache({ notes, tasks, journal: journalEntries })
  }

  // ============================================================
  //  AUTH FUNCTIONS
  // ============================================================

  async function signUp() {
    if (!supabase) { setAuthError('Supabase not configured'); return }
    setLoading(true); setAuthError('')
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthError(error.message)
      else setAuthError('Check email for confirmation link')
    } catch (e) { setAuthError('Network error. Please try again.') }
    setLoading(false)
  }

  async function signIn() {
    if (!supabase) { setAuthError('Supabase not configured'); return }
    setLoading(true); setAuthError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthError(error.message)
    } catch (e) { setAuthError('Network error. Please try again.') }
    setLoading(false)
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    setNotes([]); setTasks([]); setJournalEntries([])
    setCurrentView('dashboard')
  }

  // ============================================================
  //  TRASH FUNCTIONS
  // ============================================================

  const addToTrash = (type, item) => {
    const trashItem = {
      ...item,
      deletedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + CACHE_DURATION).toISOString()
    }
    setTrash(prev => ({ ...prev, [type]: [...prev[type], trashItem] }))
    try { localStorage.setItem('discypln_trash', JSON.stringify(trash)) } catch (e) {}
  }

  const restoreFromTrash = (type, id) => {
    const item = trash[type].find(t => t.id === id)
    if (!item) return null
    setTrash(prev => ({ ...prev, [type]: prev[type].filter(t => t.id !== id) }))
    return item
  }

  const emptyTrash = (type) => {
    setTrash(prev => ({ ...prev, [type]: [] }))
    showToast('Trash emptied', 'success')
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
  }

  // ============================================================
  //  STATS CALCULATIONS
  // ============================================================

  const calculateAllStats = useCallback(() => {
    if (!tasks.length && !journalEntries.length) return

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    const streak = getStreak()
    
    let maxStreak = 0
    let currentStreak = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayHabits = tasks.filter(t => t.type === 'habit' && t.due_date === dateStr)
      if (dayHabits.length > 0 && dayHabits.every(t => t.done)) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
    
    const doneTasks = tasks.filter(t => t.done).length
    const dailyAverage = (doneTasks / 30).toFixed(1)
    
    const dayCounts = {}
    tasks.filter(t => t.done).forEach(t => {
      const day = new Date(t.updated_at || t.due_date).toLocaleDateString()
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })
    let bestDay = null
    let bestDayCount = 0
    Object.entries(dayCounts).forEach(([day, count]) => {
      if (count > bestDayCount) {
        bestDayCount = count
        bestDay = day
      }
    })
    
    const totalTasks = tasks.length
    const doneTasksCount = tasks.filter(t => t.done).length
    const commitmentRate = totalTasks > 0 ? Math.round((doneTasksCount / totalTasks) * 100) : 0
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthTasks = tasks.filter(t => new Date(t.due_date) >= monthStart)
    const monthDone = monthTasks.filter(t => t.done).length
    const monthlyProgress = monthTasks.length > 0 ? Math.round((monthDone / monthTasks.length) * 100) : 0
    
    const habits = tasks.filter(t => t.type === 'habit')
    const habitsDone = habits.filter(t => t.done).length
    const habitCompletion = habits.length > 0 ? Math.round((habitsDone / habits.length) * 100) : 0
    
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const weeklyBreakdown = weekDays.map((day, index) => {
      const dayNum = index + 1
      const dayTasks = tasks.filter(t => {
        const d = new Date(t.due_date)
        return d.getDay() === (dayNum % 7)
      })
      const done = dayTasks.filter(t => t.done).length
      const total = dayTasks.length
      return {
        day,
        done,
        total,
        percent: total > 0 ? Math.round((done / total) * 100) : 0
      }
    })
    
    const dailyHabits = tasks.filter(t => t.type === 'habit' && t.category === 'daily')
    const dailyHabitsDone = dailyHabits.filter(t => t.done).length
    const dailyHabitsTotal = dailyHabits.length
    
    const weeklyHabits = tasks.filter(t => t.type === 'habit' && t.category === 'weekly')
    const weeklyHabitsDone = weeklyHabits.filter(t => t.done).length
    const weeklyHabitsTotal = weeklyHabits.length
    
    const monthlyHabits = tasks.filter(t => t.type === 'habit' && t.category === 'monthly')
    const monthlyHabitsDone = monthlyHabits.filter(t => t.done).length
    const monthlyHabitsTotal = monthlyHabits.length
    
    const todayFocus = tasks
      .filter(t => t.done && t.estimated_minutes)
      .filter(t => new Date(t.updated_at || t.due_date).toISOString().split('T')[0] === today)
      .reduce((sum, t) => sum + t.estimated_minutes, 0)
    
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    const weekFocus = tasks
      .filter(t => t.done && t.estimated_minutes)
      .filter(t => new Date(t.updated_at || t.due_date) >= weekAgo)
      .reduce((sum, t) => sum + t.estimated_minutes, 0)
    
    const monthAgo = new Date(now)
    monthAgo.setDate(now.getDate() - 30)
    const monthFocus = tasks
      .filter(t => t.done && t.estimated_minutes)
      .filter(t => new Date(t.updated_at || t.due_date) >= monthAgo)
      .reduce((sum, t) => sum + t.estimated_minutes, 0)
    
    const focusDayCounts = {}
    tasks
      .filter(t => t.done && t.estimated_minutes)
      .forEach(t => {
        const day = new Date(t.updated_at || t.due_date).toLocaleDateString()
        focusDayCounts[day] = (focusDayCounts[day] || 0) + t.estimated_minutes
      })
    let bestFocusDay = null
    let bestFocusMinutes = 0
    Object.entries(focusDayCounts).forEach(([day, minutes]) => {
      if (minutes > bestFocusMinutes) {
        bestFocusMinutes = minutes
        bestFocusDay = day
      }
    })
    
    const avgFocusPerDay = 30 > 0 ? Math.round(monthFocus / 30) : 0
    
    const streakWeight = Math.min(streak / 100, 1) * 35
    const completionWeight = commitmentRate / 100 * 35
    const focusWeight = 0
    const disciplineScore = Math.round(streakWeight + completionWeight + focusWeight)
    
    let disciplineLevel = 'Novice'
    let disciplineBadge = '🌱'
    if (disciplineScore >= 90) { disciplineLevel = 'Legend'; disciplineBadge = '👑' }
    else if (disciplineScore >= 80) { disciplineLevel = 'Master'; disciplineBadge = '🏆' }
    else if (disciplineScore >= 60) { disciplineLevel = 'Focused'; disciplineBadge = '🎯' }
    else if (disciplineScore >= 40) { disciplineLevel = 'Disciplined'; disciplineBadge = '⚡' }
    else if (disciplineScore >= 20) { disciplineLevel = 'Apprentice'; disciplineBadge = '📚' }
    
    let daysUntilStreakLoss = 0
    let streakEndangered = false
    if (streak > 0) {
      for (let i = 1; i <= 7; i++) {
        const d = new Date(now)
        d.setDate(now.getDate() + i)
        const dateStr = d.toISOString().split('T')[0]
        const dayHabits = tasks.filter(t => t.type === 'habit' && t.due_date === dateStr)
        if (dayHabits.length > 0) {
          const done = dayHabits.filter(t => t.done).length
          if (done < dayHabits.length) {
            daysUntilStreakLoss = i
            streakEndangered = true
            break
          }
        }
      }
    }
    
    const milestones = [10, 25, 50, 75, 100, 150, 200, 365]
    let nextMilestone = 0
    for (const m of milestones) {
      if (m > streak) {
        nextMilestone = m
        break
      }
    }
    
    setStatsData({
      disciplineScore,
      disciplineLevel,
      disciplineBadge,
      longestStreak: maxStreak,
      dailyAverage: parseFloat(dailyAverage),
      bestDay,
      bestDayCount,
      commitmentRate,
      focusScore: 0,
      monthlyProgress,
      habitCompletion,
      taskVelocity: 0,
      weeklyBreakdown,
      dailyHabitsDone,
      dailyHabitsTotal,
      weeklyHabitsDone,
      weeklyHabitsTotal,
      monthlyHabitsDone,
      monthlyHabitsTotal,
      todayFocus,
      weekFocus,
      monthFocus,
      bestFocusDay,
      bestFocusMinutes,
      avgFocusPerDay,
      streakEndangered,
      daysUntilStreakLoss,
      nextMilestone,
      totalTasksEver: totalTasks,
      completionRate: commitmentRate,
      averageTaskTime: 0,
      mostProductiveHour: '--',
      weeklyGoalProgress: weeklyBreakdown.reduce((acc, d) => acc + d.percent, 0) / 7,
      totalMinutes: 0
    })
  }, [tasks, journalEntries])

  useEffect(() => {
    if (user) {
      calculateAllStats()
    }
  }, [tasks, journalEntries, user])

  // ============================================================
  //  RENDER
  // ============================================================

  if (!user) {
    return (
      <>
        <div className="bg-glow" />
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', position: 'relative', zIndex: 1 }}>
          <div className="glass glass-heavy" style={{ maxWidth: '400px', width: '100%', padding: '32px', borderRadius: 'var(--radius-2xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', marginBottom: '12px' }}>
              <LogoIcon className="logo-svg" style={{ width: '48px', height: '48px' }} />
              <span className="hero-title" style={{ fontSize: '32px' }}>iscypln</span>
            </div>
            <p className="text-secondary text-center" style={{ marginBottom: '24px', fontSize: '14px' }}>Stay focused. Stay disciplined.</p>
            {authError && <p className="text-center" style={{ marginBottom: '12px', color: '#EF4444', fontSize: '13px' }}>{authError}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" style={{ marginBottom: '12px', width: '100%', padding: '12px 16px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)', fontSize: '15px', outline: 'none' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" style={{ marginBottom: '16px', width: '100%', padding: '12px 16px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-primary)', fontSize: '15px', outline: 'none' }} />
            <div className="flex gap-3">
              <button onClick={signIn} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>{loading ? 'Loading...' : 'Sign In'}</button>
              <button onClick={signUp} disabled={loading} className="btn btn-ghost" style={{ flex: 1 }}>{loading ? 'Loading...' : 'Sign Up'}</button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const greeting = getGreeting()

  return (
    <>
      <div className="bg-glow" />
      <div className="container fade-in" style={{ position: 'relative', zIndex: 1 }}>

        {/* ===== HEADER - SIMPLIFIED ===== */}
        <header className="app-header" style={{ position: 'relative', zIndex: 100 }}>
          <div className="header-left">
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
              <LogoIcon className="logo-svg" style={{ width: '40px', height: '40px' }} />
              <span className="logo-text" style={{
                fontSize: '26px',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                marginLeft: '-4px',
                background: 'var(--gradient-primary)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientShift 15s ease infinite'
              }}>
                iscypln
              </span>
            </div>
          </div>

          <div className="header-right" style={{ position: 'relative', zIndex: 1000 }} ref={userMenuRef}>
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="btn btn-ghost btn-icon" style={{ padding: '0', fontSize: '22px' }}>
              <IconMenuDots />
            </button>
            {showUserMenu && (
              <div className="glass glass-heavy" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: '220px',
                borderRadius: 'var(--radius-lg)',
                padding: '8px',
                zIndex: 9999,
                animation: 'slideDown 0.2s ease',
                background: 'var(--bg-secondary)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid var(--glass-border)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)'
              }}>
                <div style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--glass-border)', marginBottom: '4px' }}>
                  {user?.email}
                </div>

                <button onClick={() => { setCurrentView('dashboard'); setShowUserMenu(false) }}
                  className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '10px 14px' }}>
                  <IconBack /> Dashboard
                </button>

                <button onClick={() => {
                  const themes = ['dark', 'light', 'amber', 'solarized']
                  const currentIndex = themes.indexOf(themeMode)
                  const nextIndex = (currentIndex + 1) % themes.length
                  setThemeMode(themes[nextIndex])
                  setShowUserMenu(false)
                }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '10px 14px' }}>
                  {getThemeIcon()} {getThemeName()}
                </button>

                <button onClick={() => setShowTrashModal(true)} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', gap: '10px', padding: '10px 14px' }}>
                  <IconTrash /> Trash ({trash.notes.length + trash.tasks.length + trash.journal.length})
                </button>

                {/* ===== LOCAL FILE MANAGEMENT ===== */}
                <div style={{
                  padding: '4px 8px',
                  marginTop: '4px',
                  borderTop: '1px solid var(--glass-border)'
                }}>
                  <div className="tiny-label" style={{ padding: '4px 0', color: 'var(--text-muted)' }}>
                    <IconFolder size={14} style={{ marginRight: '4px' }} /> Local Files
                  </div>
                  
                  <button
                    onClick={async () => {
                      try {
                        const { getAllFiles, getFileUrl } = await import('./lib')
                        const files = await getAllFiles()
                        if (files.length === 0) {
                          showToast('No local files to export', 'info')
                          return
                        }
                        
                        const fileList = files.map(f => ({
                          id: f.id,
                          name: f.name,
                          type: f.type,
                          size: f.size,
                          createdAt: f.createdAt
                        }))
                        
                        const blob = new Blob([JSON.stringify(fileList, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `local-files-${Date.now()}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                        showToast(`Exported ${files.length} file references`, 'success')
                        setShowUserMenu(false)
                      } catch (err) {
                        showToast('Export failed: ' + err.message, 'error')
                      }
                    }}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', padding: '6px 14px', fontSize: '13px' }}
                  >
                    <IconExport size={16} /> Export Local Files
                  </button>
                  
                  <button
                    onClick={() => {
                      document.getElementById('importLocalFiles').click()
                      setShowUserMenu(false)
                    }}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', padding: '6px 14px', fontSize: '13px' }}
                  >
                    <IconImport size={16} /> Import Local Files
                  </button>
                  
                  <input
                    id="importLocalFiles"
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      
                      try {
                        const text = await file.text()
                        const data = JSON.parse(text)
                        showToast(`Imported ${data.length} file references`, 'success')
                      } catch (err) {
                        showToast('Invalid file format', 'error')
                      }
                      e.target.value = ''
                    }}
                  />
                </div>

                <button onClick={() => { signOut(); setShowUserMenu(false) }} className="btn btn-ghost" style={{
                  width: '100%', justifyContent: 'flex-start', gap: '10px', color: 'var(--text-muted)',
                  borderTop: '1px solid var(--glass-border)', marginTop: '4px', padding: '10px 14px'
                }}>
                  <IconLogout /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ===== CAPSULE NAV (Only when NOT on dashboard) ===== */}
        {currentView !== 'dashboard' && (
          <nav className="capsule-nav">
            <div className="capsule-nav-inner">
              {['notes', 'tasks', 'journal'].map((tab) => (
                <button
                  key={tab}
                  className={currentView === tab ? 'active' : ''}
                  onClick={() => setCurrentView(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </nav>
        )}

        {/* ===== CONTENT ===== */}
        {currentView === 'dashboard' && (
          <Dashboard
            user={user}
            supabase={supabase}
            onNavigate={setCurrentView}
            onOpenStats={() => setShowStatsModal(true)}
          />
        )}

        {currentView === 'notes' && (
          <NotesTab
            user={user}
            supabase={supabase}
            showToast={showToast}
            addToTrash={addToTrash}
          />
        )}

        {currentView === 'tasks' && (
          <TasksTab
            user={user}
            supabase={supabase}
            showToast={showToast}
            addToTrash={addToTrash}
          />
        )}

        {currentView === 'journal' && (
          <JournalTab
            user={user}
            supabase={supabase}
            showToast={showToast}
            addToTrash={addToTrash}
          />
        )}

        {/* ===== MODALS ===== */}
        {showStatsModal && (
          <StatsModal
            onClose={() => setShowStatsModal(false)}
            user={user}
            supabase={supabase}
            showToast={showToast}
          />
        )}

        {showTrashModal && (
          <TrashModal
            onClose={() => setShowTrashModal(false)}
            trash={trash}
            onRestore={restoreFromTrash}
            onEmptyTrash={emptyTrash}
            formatDate={formatDate}
          />
        )}

        {/* ===== TOAST: 3 seconds ===== */}
        {toast.show && (
          <div className={`toast show ${toast.type}`}>
            {toast.message}
            {toast.undo && <span className="undo" onClick={toast.undo}>Undo</span>}
          </div>
        )}

      </div>
    </>
  )
}
