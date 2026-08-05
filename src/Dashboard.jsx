// ============================================================
//  DASHBOARD — Main Landing Page
//  Self-contained: fetches its own data
// ============================================================

import { useState, useEffect } from 'react'

// ===== SVG ICONS =====
const IconTarget = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
)

const IconTrendingUp = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
)

const IconClock = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const IconCheck = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconCalendar = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconTrophy = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
)

const IconChevronRight = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const IconNotes = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const IconTasks = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const IconJournal = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="10" y1="8" x2="16" y2="8" />
    <line x1="10" y1="12" x2="16" y2="12" />
    <line x1="10" y1="16" x2="14" y2="16" />
  </svg>
)

const IconAlertTriangle = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

// ============================================================
//  HELPERS
// ============================================================

const formatMinutes = (mins) => {
  if (!mins || mins === 0) return '0m'
  const hours = Math.floor(mins / 60)
  const minutes = mins % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

// ============================================================
//  DASHBOARD COMPONENT (Self-Contained)
// ============================================================

export default function Dashboard({ user, supabase, onNavigate, onOpenStats }) {
  // ===== State =====
  const [notes, setNotes] = useState([])
  const [tasks, setTasks] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  // ===== Stats State =====
  const [statsData, setStatsData] = useState({
    disciplineScore: 0,
    disciplineLevel: 'Novice',
    disciplineBadge: '🌱',
    longestStreak: 0,
    dailyAverage: 0,
    bestDay: null,
    bestDayCount: 0,
    commitmentRate: 0,
    habitCompletion: 0,
    weeklyBreakdown: [],
    streakEndangered: false,
    daysUntilStreakLoss: 0,
    nextMilestone: 0,
    totalTasksEver: 0,
    completionRate: 0,
    weeklyGoalProgress: 0
  })

  // ============================================================
  //  FETCH DATA
  // ============================================================

  const fetchDashboardData = async () => {
    if (!user || !supabase) return
    setLoading(true)

    try {
      // Fetch notes
      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)

      // Fetch journal
      const { data: journalData } = await supabase
        .from('journal')
        .select('*')
        .eq('user_id', user.id)

      // Fetch pomodoro stats
      const today = new Date().toISOString().split('T')[0]
      const { data: pomodoroData } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('date', today)
        .eq('user_id', user.id)

      setNotes(notesData || [])
      setTasks(tasksData || [])
      setJournalEntries(journalData || [])
      setTotalMinutes(pomodoroData?.[0]?.total_minutes || 0)

      // Calculate stats
      calculateStats(tasksData || [])

    } catch (e) {
      console.error('Dashboard fetch error:', e)
    }
    setLoading(false)
  }

  // ============================================================
  //  CALCULATE STATS
  // ============================================================

  const calculateStats = (tasksData) => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Streak
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayHabits = tasksData.filter(t => t.type === 'habit' && t.due_date === dateStr)
      if (dayHabits.length === 0) continue
      const allDone = dayHabits.every(t => t.done)
      if (allDone) streak++
      else break
    }

    // Longest streak
    let maxStreak = 0
    let currentStreak = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayHabits = tasksData.filter(t => t.type === 'habit' && t.due_date === dateStr)
      if (dayHabits.length > 0 && dayHabits.every(t => t.done)) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }

    const doneTasks = tasksData.filter(t => t.done).length
    const totalTasks = tasksData.length
    const commitmentRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    // Habits
    const habits = tasksData.filter(t => t.type === 'habit')
    const habitsDone = habits.filter(t => t.done).length
    const habitCompletion = habits.length > 0 ? Math.round((habitsDone / habits.length) * 100) : 0

    // Daily average
    const dailyAverage = totalTasks > 0 ? (doneTasks / 30).toFixed(1) : 0

    // Weekly breakdown
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const weeklyBreakdown = weekDays.map((day, index) => {
      const dayNum = index + 1
      const dayTasks = tasksData.filter(t => {
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

    const weeklyGoalProgress = weeklyBreakdown.reduce((acc, d) => acc + d.percent, 0) / 7

    // Discipline score
    const streakWeight = Math.min(streak / 100, 1) * 35
    const completionWeight = commitmentRate / 100 * 35
    const focusWeight = Math.min(totalMinutes / 6000, 1) * 30
    const disciplineScore = Math.round(streakWeight + completionWeight + focusWeight)

    let disciplineLevel = 'Novice'
    let disciplineBadge = '🌱'
    if (disciplineScore >= 90) { disciplineLevel = 'Legend'; disciplineBadge = '👑' }
    else if (disciplineScore >= 80) { disciplineLevel = 'Master'; disciplineBadge = '🏆' }
    else if (disciplineScore >= 60) { disciplineLevel = 'Focused'; disciplineBadge = '🎯' }
    else if (disciplineScore >= 40) { disciplineLevel = 'Disciplined'; disciplineBadge = '⚡' }
    else if (disciplineScore >= 20) { disciplineLevel = 'Apprentice'; disciplineBadge = '📚' }

    // Streak protection
    let daysUntilStreakLoss = 0
    let streakEndangered = false
    if (streak > 0) {
      for (let i = 1; i <= 7; i++) {
        const d = new Date(now)
        d.setDate(now.getDate() + i)
        const dateStr = d.toISOString().split('T')[0]
        const dayHabits = tasksData.filter(t => t.type === 'habit' && t.due_date === dateStr)
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

    // Next milestone
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
      commitmentRate,
      habitCompletion,
      weeklyBreakdown,
      streakEndangered,
      daysUntilStreakLoss,
      nextMilestone,
      totalTasksEver: totalTasks,
      completionRate: commitmentRate,
      weeklyGoalProgress: Math.round(weeklyGoalProgress)
    })
  }

  // ============================================================
  //  EFFECTS
  // ============================================================

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ============================================================
  //  RENDER
  // ============================================================

  const greeting = getGreeting()
  const streak = statsData.dailyAverage > 0 ? Math.round(statsData.dailyAverage) : 0

  return (
    <>
      {/* ===== HERO CARD ===== */}
      <div className="stats-hero" style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
          position: 'relative',
          zIndex: 1
        }}>
          <div>
            <div className="hero-title" style={{ fontSize: '36px', marginBottom: '2px' }}>
              {greeting}
            </div>
            <div style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
              {user?.email?.split('@')[0] || 'User'}
              <span style={{ marginLeft: '12px', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="discipline-badge">
              <IconTrophy size={16} style={{ marginRight: '4px' }} />
              {statsData.disciplineBadge} {statsData.disciplineLevel}
              <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>
                {statsData.disciplineScore}/100
              </span>
            </div>
            <button
              onClick={onOpenStats}
              className="btn btn-ghost btn-sm"
              style={{
                borderRadius: '999px',
                padding: '6px 16px',
                fontSize: '12px',
                height: '32px',
                gap: '4px'
              }}
            >
              View More <IconChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#F59E0B' }}>
              <IconTarget size={16} color="#F59E0B" style={{ marginRight: '4px' }} />
              {streak || 0}
            </div>
            <div className="stat-label">Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--brand-blue)' }}>
              <IconTrendingUp size={16} color="var(--brand-blue)" style={{ marginRight: '4px' }} />
              {statsData.commitmentRate || 0}%
            </div>
            <div className="stat-label">Commitment</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#22C55E' }}>
              <IconClock size={16} color="#22C55E" style={{ marginRight: '4px' }} />
              {formatMinutes(totalMinutes)}
            </div>
            <div className="stat-label">Focus</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: 'var(--brand-purple)' }}>
              <IconCheck size={16} color="var(--brand-purple)" style={{ marginRight: '4px' }} />
              {tasks.filter(t => t.done).length || 0}
            </div>
            <div className="stat-label">Tasks Done</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#A855F7' }}>
              <IconTarget size={16} color="#A855F7" style={{ marginRight: '4px' }} />
              {statsData.habitCompletion || 0}%
            </div>
            <div className="stat-label">Habits</div>
          </div>
          <div className="stat-item">
            <div className="stat-value" style={{ color: '#F97316' }}>
              <IconCalendar size={16} color="#F97316" style={{ marginRight: '4px' }} />
              {statsData.dailyAverage || 0}
            </div>
            <div className="stat-label">Daily Avg</div>
          </div>
        </div>

        {/* Streak Protection Warning */}
        {statsData.streakEndangered && (
          <div style={{
            marginTop: '12px',
            padding: '10px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            position: 'relative',
            zIndex: 1
          }}>
            <IconAlertTriangle size={18} color="var(--text-muted)" />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {statsData.daysUntilStreakLoss} day{statsData.daysUntilStreakLoss > 1 ? 's' : ''} until streak loss!
              {statsData.nextMilestone > 0 && ` Complete today to reach ${statsData.nextMilestone} days`}
            </span>
          </div>
        )}
      </div>

      {/* ===== FEATURE CARDS ===== */}
      <div className="dashboard-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>

        {/* Notes Card */}
        <div
          className="card card-glow"
          style={{ cursor: 'pointer', padding: '24px', transition: 'all 0.2s ease' }}
          onClick={() => onNavigate('notes')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--glass-border-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
        >
          <div style={{ marginBottom: '8px' }}>
            <IconNotes size={28} />
          </div>
          <div className="card-title">Notes</div>
          <div className="caption" style={{ marginBottom: '12px', color: 'var(--text-tertiary)' }}>
            Capture, organize and retrieve information quickly.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="tiny-label">{notes.length} notes</span>
            <span style={{ color: 'var(--brand-blue)', fontSize: '14px', fontWeight: 500 }}>Open →</span>
          </div>
        </div>

        {/* Tasks Card */}
        <div
          className="card card-glow"
          style={{ cursor: 'pointer', padding: '24px', transition: 'all 0.2s ease' }}
          onClick={() => onNavigate('tasks')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--glass-border-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
        >
          <div style={{ marginBottom: '8px' }}>
            <IconTasks size={28} />
          </div>
          <div className="card-title">Tasks</div>
          <div className="caption" style={{ marginBottom: '12px', color: 'var(--text-tertiary)' }}>
            Organize your day efficiently and build discipline.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="tiny-label">
              {tasks.filter(t => !t.done).length} pending • {tasks.filter(t => t.done).length} done
            </span>
            <span style={{ color: 'var(--brand-blue)', fontSize: '14px', fontWeight: 500 }}>Open →</span>
          </div>
        </div>

        {/* Journal Card */}
        <div
          className="card card-glow"
          style={{ cursor: 'pointer', padding: '24px', transition: 'all 0.2s ease' }}
          onClick={() => onNavigate('journal')}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--glass-border-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
        >
          <div style={{ marginBottom: '8px' }}>
            <IconJournal size={28} />
          </div>
          <div className="card-title">Journal</div>
          <div className="caption" style={{ marginBottom: '12px', color: 'var(--text-tertiary)' }}>
            Reflect on your progress and track your growth over time.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="tiny-label">{journalEntries.length} entries</span>
            <span style={{ color: 'var(--brand-blue)', fontSize: '14px', fontWeight: 500 }}>Open →</span>
          </div>
        </div>

      </div>
    </>
  )
}