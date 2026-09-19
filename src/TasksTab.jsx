// ============================================================
//  TASKS TAB — V3
//  Pages: Tasks | Active Tasks | Task List | History
//  Charts live in the Extensive Analytics modal only
// ============================================================

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// ============================================================
//  ICONS
// ============================================================
const IconPlus = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>)
const IconX = ({ size = 20 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>)
const IconChevronDown = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>)
const IconChevronUp = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>)
const IconChevronLeft = ({ size = 20 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>)
const IconPlay = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>)
const IconPause = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>)
const IconReset = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>)
const IconCheck = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>)
const IconTrash = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>)
const IconTarget = ({ size = 16, color = 'currentColor' }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>)
const IconClock = ({ size = 16, color = 'currentColor' }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>)
const IconTrendingUp = ({ size = 16, color = 'currentColor' }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>)
const IconCalendar = ({ size = 16, color = 'currentColor' }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>)
const IconSparkle = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" /></svg>)
const IconChart = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" /><polyline points="9 15 12 12 16 16 21 11" /><line x1="21" y1="6" x2="21" y2="11" /><line x1="16" y1="11" x2="21" y2="11" /></svg>)
const IconRefresh = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>)
const IconHistory = ({ size = 18 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><polyline points="3 3 3 8 8 8" /><polyline points="12 7 12 12 15 14" /></svg>)
const IconFlame = ({ size = 16 }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3-3 2-5 5-5 9a8 8 0 0 0 16 0c0-5-4-9-8-14z" /></svg>)

// ============================================================
//  DATE HELPERS
// ============================================================
const WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
const WEEKDAY_SHORT = ['S','M','T','W','T','F','S']

const toDayKey = (d = new Date()) => {
  const x = d instanceof Date ? d : new Date(d)
  if (isNaN(x)) return toDayKey(new Date())
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`
}
const getWeekStart = (d) => {
  const x = new Date(d); const day = x.getDay()
  x.setDate(x.getDate() - day + (day === 0 ? -6 : 1)); x.setHours(0,0,0,0); return x
}
const getWeekKey = (d) => toDayKey(getWeekStart(d))
const nextWeekdayOnOrAfter = (date, weekday) => {
  const d = new Date(date); const target = WEEKDAYS.indexOf(weekday)
  if (target < 0) return d
  d.setDate(d.getDate() + (((target - d.getDay()) % 7) + 7) % 7); return d
}
const nextDueDate = (task, now) =>
  task.category === 'weekly' ? toDayKey(nextWeekdayOnOrAfter(now, task.weekday || 'monday')) : toDayKey(now)

const needsRollover = (task, now) => {
  if (task.type !== 'habit' || !task.done) return false
  const last = task.last_completed_on || task.due_date || task.created_at
  return task.category === 'weekly'
    ? getWeekKey(last) !== getWeekKey(now)
    : toDayKey(last) < toDayKey(now)
}

const isScheduledOn = (task, date, dayKey) => {
  if (task.type !== 'habit') return toDayKey(task.due_date || task.created_at) === dayKey
  if (toDayKey(task.created_at) > dayKey) return false
  if (task.category === 'daily') return true
  if (task.category === 'weekly') return date.getDay() === WEEKDAYS.indexOf(task.weekday || 'monday')
  return false
}

const cssVar = (name, fallback = '#888') => {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

// ============================================================
//  AUTO-RESET HOOK
// ============================================================
function useAutoReset({ tasks, enabled, onReset }) {
  const tasksRef = useRef(tasks); tasksRef.current = tasks
  const doneForDay = useRef(null)
  const busy = useRef(false)

  const runPass = useCallback(async () => {
    if (!enabled || busy.current) return
    if (tasksRef.current.length === 0) return
    const now = new Date(); const key = toDayKey(now)
    if (doneForDay.current === key) return
    busy.current = true; doneForDay.current = key
    try {
      const rows = tasksRef.current.filter((t) => needsRollover(t, now))
      if (rows.length) await onReset(rows, now)
    } catch (e) {
      console.error('rollover failed', e); doneForDay.current = null
    } finally { busy.current = false }
  }, [enabled, onReset])

  useEffect(() => { runPass() }, [runPass, tasks.length])
  useEffect(() => {
    const id = setInterval(runPass, 30000)
    const onVis = () => { if (!document.hidden) runPass() }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis) }
  }, [runPass])
}

// ============================================================
//  PUSH SUBSCRIBE
// ============================================================
const VAPID_PUBLIC = 'BHPWm5uJ4b9iexj95igoZRoiNOb1ta8tI9A4DG5pq9aRCe8WvItIjjn2sTGBH_osjLrl_NZ8TtdmIfrxph1wmSE'

const urlBase64ToUint8Array = (base64) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

async function ensurePushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    })
  }
  const json = sub.toJSON()
  return { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth }
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function TasksTab({ user, supabase, showToast, addToTrash }) {
  const toast = useCallback((msg, type) => { if (typeof showToast === 'function') showToast(msg, type) }, [showToast])
  const trash = useCallback((b, i) => { if (typeof addToTrash === 'function') addToTrash(b, i) }, [addToTrash])

  // ---- data ----
  const [tasks, setTasks] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(false)

  // ---- navigation ----
  const [page, setPage] = useState('tasks') // 'tasks' | 'activeTasks' | 'taskList' | 'history'

  // ---- modals ----
  const [showAddTask, setShowAddTask] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // ---- form ----
  const [task, setTask] = useState('')
  const [taskCategory, setTaskCategory] = useState('daily')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [taskTime, setTaskTime] = useState('')
  const [taskWeekDay, setTaskWeekDay] = useState('monday')
  const [taskDifficulty, setTaskDifficulty] = useState('medium')
  const [taskMinutes, setTaskMinutes] = useState(30)
  const [taskTag, setTaskTag] = useState('general')
  const [taskLabels, setTaskLabels] = useState('')
  const [taskSaving, setTaskSaving] = useState(false)

  // ---- ui ----
  const [activeTaskCategory, setActiveTaskCategory] = useState('daily')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTaskId, setActiveTaskId] = useState(null)
  const [historyFilter, setHistoryFilter] = useState('all')
  const [themeTick, setThemeTick] = useState(0)

  // ---- subtasks ----
  const [subTasks, setSubTasks] = useState({})
  const [newSubTask, setNewSubTask] = useState('')
  const [subTasksToAdd, setSubTasksToAdd] = useState([])

  // ---- pomodoro ----
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60)
  const [pomodoroRunning, setPomodoroRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [pomodoroSessions, setPomodoroSessions] = useState(0)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [pomodoroState, setPomodoroState] = useState('idle')
  const [showCelebration, setShowCelebration] = useState(false)
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const pomoRef = useRef(25 * 60)

  const setPomoTime = useCallback((sec) => { pomoRef.current = sec; setPomodoroTime(sec) }, [])

  // ---- active task timers ----
  // keyed by task id: { phase: 'countdown'|'active'|'idle', remaining, elapsed, running, shifted }
  const [timers, setTimers] = useState({})
  const timersRef = useRef({})

  const updateTimer = useCallback((id, patch) => {
    setTimers((prev) => {
      const next = { ...prev, [id]: { ...(prev[id] || {}), ...patch } }
      timersRef.current = next
      return next
    })
  }, [])

  // ---- session (Focus from Task List) ----
  const [activeSession, setActiveSession] = useState(null)
  const [sessionTaskId, setSessionTaskId] = useState(null)
  const [sessionPomodoroTime, setSessionPomodoroTime] = useState(25 * 60)
  const [sessionRunning, setSessionRunning] = useState(false)
  const [sessionPaused, setSessionPaused] = useState(false)
  const [sessionElapsed, setSessionElapsed] = useState(0)
  const sessionIntervalRef = useRef(null)
  const sessionTaskIdRef = useRef(null)
  const sessionTimeRef = useRef(25 * 60)
  const sessionElapsedRef = useRef(0)

  const setSessionTime = useCallback((sec) => { sessionTimeRef.current = sec; setSessionPomodoroTime(sec) }, [])
  useEffect(() => { sessionTaskIdRef.current = sessionTaskId }, [sessionTaskId])

  // ---- theme observer ----
  useEffect(() => {
    const mo = new MutationObserver(() => setThemeTick((t) => t + 1))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] })
    return () => mo.disconnect()
  }, [])

  // ============================================================
  //  FORMAT
  // ============================================================
  const formatTime = (sec) => {
    if (!sec && sec !== 0) return '00:00'
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60)
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }
  const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return '0m'
    const h = Math.floor(mins / 60), m = Math.round(mins % 60)
    if (h === 0) return `${m}m`
    if (m === 0) return `${h}h`
    return `${h}h ${m}m`
  }
  const formatDate = (date) => {
    const d = new Date(date)
    return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`
  }
  const formatDayHeader = (dayKey) => {
    const d = new Date(dayKey + 'T00:00:00')
    const today = toDayKey()
    const yest = toDayKey(new Date(Date.now() - 86400000))
    if (dayKey === today) return 'Today'
    if (dayKey === yest) return 'Yesterday'
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  // ============================================================
  //  FETCH
  // ============================================================
  const fetchTasks = useCallback(async () => {
    if (!user || !supabase) return
    setLoading(true)
    try {
      const [tasksRes, compsRes, pomoRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('task_completions').select('*').eq('user_id', user.id).order('completed_on', { ascending: false }).limit(1000),
        supabase.from('pomodoro_sessions').select('*').eq('user_id', user.id).eq('date', toDayKey()).maybeSingle(),
      ])
      if (!tasksRes.error) {
        setTasks(tasksRes.data || [])
        const map = {}
        tasksRes.data?.forEach((t) => { map[t.id] = t.subtasks || [] })
        setSubTasks(map)
      }
      setCompletions(compsRes.data || [])
      if (pomoRes?.data) {
        setPomodoroSessions(pomoRes.data.sessions_completed || 0)
        setTotalMinutes(pomoRes.data.total_minutes || 0)
      }
    } catch (e) { console.error('fetchTasks', e) }
    setLoading(false)
  }, [user, supabase])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // ============================================================
  //  PUSH SUBSCRIBE (permission asked separately, after first task)
  // ============================================================
  useEffect(() => {
    if (!user || !supabase) return
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return
    ensurePushSubscription().then(async (sub) => {
      if (!sub) return
      await supabase.from('push_subscriptions').upsert(
        { user_id: user.id, ...sub, last_seen_at: new Date().toISOString() },
        { onConflict: 'endpoint' }
      )
    }).catch(() => {})
  }, [user, supabase])

  // ============================================================
  //  ROLLOVER
  // ============================================================
  const handleRollover = useCallback(async (rows, now) => {
    if (!supabase || !user) return
    const dayKey = toDayKey(now)

    // 1. Record missed entries (task done=true but its day passed without user checking → it's already done, skip)
    //    Missed entries are recorded by the rollover for tasks that were done but not re-completed.
    //    For our model, rollover means: the task was done last cycle, we record the completion for THAT day,
    //    then reset. Missed entries are handled by the missed pass below.

    const payload = rows.map((t) => ({
      user_id: user.id,
      task_id: t.id,
      content: t.content,
      category: t.category,
      completed_on: t.last_completed_on || toDayKey(t.due_date || t.created_at),
      minutes: t.estimated_minutes || 0,
      status: 'completed',
    }))

    await supabase.from('task_completions').upsert(payload, { onConflict: 'task_id,completed_on', ignoreDuplicates: true })

    await Promise.all(rows.map((t) => supabase.from('tasks').update({
      done: false,
      last_completed_on: t.last_completed_on || toDayKey(t.due_date || t.created_at),
      due_date: nextDueDate(t, now),
      reset_count: (t.reset_count || 0) + 1,
      updated_at: now.toISOString(),
    }).eq('id', t.id).eq('user_id', user.id)))

    toast(`🔄 ${rows.length} habit${rows.length > 1 ? 's' : ''} rolled over`, 'info')
    await fetchTasks()
  }, [supabase, user, toast, fetchTasks])

  useAutoReset({ tasks, enabled: !!user && !!supabase, onReset: handleRollover })

  // ============================================================
  //  MISSED SWEEP
  //  Runs on mount + on focus. Anything whose day has ended unticked
  //  is recorded as missed and marked in local state.
  // ============================================================
  useEffect(() => {
    if (!supabase || !user || completions.length === 0 && tasks.length === 0) return
    let cancelled = false

    const sweep = async () => {
      const today = toDayKey()
      const yesterday = toDayKey(new Date(Date.now() - 86400000))
      const toMiss = []

      tasks.forEach((t) => {
        if (t.done) return
        if (t.type !== 'habit' && !t.due_date) return
        // Tasks that should have been done before today and never were
        const dueDay = t.type === 'habit'
          ? (t.category === 'weekly' ? null : toDayKey(t.created_at))
          : toDayKey(t.due_date)
        if (t.category === 'weekly') return // handled at weekly boundary via rollover
        if (dueDay && dueDay < today && dueDay >= yesterday) {
          const already = completions.find((c) => c.task_id === t.id && c.completed_on === dueDay)
          if (!already) toMiss.push({ task: t, day: dueDay })
        }
      })

      if (toMiss.length === 0 || cancelled) return

      const rows = toMiss.map(({ task: t, day }) => ({
        user_id: user.id, task_id: t.id, content: t.content,
        category: t.category, completed_on: day,
        minutes: 0, status: 'missed',
      }))

      await supabase.from('task_completions').upsert(rows, { onConflict: 'task_id,completed_on', ignoreDuplicates: true })
      if (!cancelled) await fetchTasks()
    }

    sweep()
    const onVis = () => { if (!document.hidden) sweep() }
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelled = true; document.removeEventListener('visibilitychange', onVis) }
  }, [tasks, completions, supabase, user, fetchTasks])

  // ============================================================
  //  TOGGLE / COMPLETE / MISS
  // ============================================================
  const endSession = useCallback(() => {
    if (sessionIntervalRef.current) { clearInterval(sessionIntervalRef.current); sessionIntervalRef.current = null }
    sessionElapsedRef.current = 0; sessionTimeRef.current = 0; sessionTaskIdRef.current = null
    setSessionElapsed(0); setSessionRunning(false); setSessionPaused(false)
    setActiveSession(null); setSessionTaskId(null)
  }, [])

  const recordCompletion = useCallback(async (task, { status = 'completed', minutes = 0, on = toDayKey() } = {}) => {
    if (!supabase || !user || !task) return
    await supabase.from('task_completions').upsert({
      user_id: user.id, task_id: task.id, content: task.content,
      category: task.category, completed_on: on, minutes, status,
    }, { onConflict: 'task_id,completed_on' })
  }, [supabase, user])

  const toggleTask = useCallback(async (id, { fromSession = false, elapsedSeconds = 0 } = {}) => {
    const t = tasks.find((x) => x.id === id)
    if (!t || !supabase || !user) return
    const now = new Date(); const dayKey = toDayKey(now)
    const nextDone = !t.done

    const patch = { done: nextDone, updated_at: now.toISOString() }
    if (t.type === 'habit') patch.last_completed_on = nextDone ? dayKey : null

    const { error } = await supabase.from('tasks').update(patch).eq('id', id).eq('user_id', user.id)
    if (error) { toast(error.message, 'error'); return }

    if (nextDone) {
      const actualMinutes = fromSession ? Math.max(0, Math.round(elapsedSeconds / 60)) : 0
      await recordCompletion(t, { status: 'completed', minutes: actualMinutes, on: dayKey })
      toast('Task completed!', 'success')
      if (fromSession || sessionTaskIdRef.current === id) endSession()
    } else {
      await supabase.from('task_completions').delete().eq('task_id', id).eq('completed_on', dayKey)
    }
    await fetchTasks()
  }, [tasks, supabase, user, toast, fetchTasks, endSession, recordCompletion])

  const markTaskStatus = useCallback(async (id, status) => {
    const t = tasks.find((x) => x.id === id)
    if (!t || !supabase || !user) return
    const now = new Date(); const dayKey = toDayKey(now)
    const done = status === 'completed'

    await supabase.from('tasks').update({
      done,
      last_completed_on: done && t.type === 'habit' ? dayKey : null,
      updated_at: now.toISOString(),
    }).eq('id', id).eq('user_id', user.id)

    await recordCompletion(t, { status, minutes: 0, on: dayKey })

    updateTimer(id, { phase: 'done' })
    toast(done ? 'Completed' : 'Marked missed', done ? 'success' : 'info')
    await fetchTasks()
  }, [tasks, supabase, user, toast, fetchTasks, recordCompletion, updateTimer])

  // ============================================================
  //  TASK CRUD
  // ============================================================
  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'default') return
    try {
      const perm = await Notification.requestPermission()
      if (perm === 'granted' && user && supabase) {
        const sub = await ensurePushSubscription()
        if (sub) {
          await supabase.from('push_subscriptions').upsert(
            { user_id: user.id, ...sub, last_seen_at: new Date().toISOString() },
            { onConflict: 'endpoint' }
          )
        }
      }
    } catch (e) { /* ignore */ }
  }, [user, supabase])

  const addTask = useCallback(async () => {
    if (!task.trim() || !user || !supabase) return
    setTaskSaving(true)

    let dueDate = toDayKey(); let taskType = 'task'
    if (taskCategory === 'daily') { taskType = 'habit'; dueDate = toDayKey() }
    else if (taskCategory === 'weekly') { taskType = 'habit'; dueDate = toDayKey(nextWeekdayOnOrAfter(new Date(), taskWeekDay)) }
    else if (taskCategory === 'custom') { dueDate = taskDueDate || toDayKey() }

    const labelsArray = taskLabels.split(',').map((l) => l.trim()).filter(Boolean)
    const minsNum = Number(taskMinutes)
    const safeMins = Number.isFinite(minsNum) && minsNum > 0 ? Math.min(Math.round(minsNum), 600) : 30
    const subtasksArray = subTasksToAdd.map((st) => ({ id: st.id, text: st.text, done: false }))

    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      content: task.trim(),
      category: taskCategory,
      type: taskType,
      weekday: taskCategory === 'weekly' ? taskWeekDay : null,
      time: taskTime || null,
      due_date: dueDate,
      difficulty: taskDifficulty,
      estimated_minutes: safeMins,
      category_tag: taskTag,
      labels: labelsArray,
      done: false,
      subtasks: subtasksArray,
      reset_count: 0,
      last_completed_on: null,
      created_at: new Date().toISOString(),
    })

    if (error) { toast('Error adding task: ' + error.message, 'error') }
    else {
      setTask(''); setTaskTime(''); setTaskDueDate(''); setTaskMinutes(30)
      setTaskTag('general'); setTaskLabels(''); setSubTasksToAdd([]); setNewSubTask('')
      toast('Task added!', 'success')
      setShowAddTask(false)
      await fetchTasks()
      requestNotificationPermission()
    }
    setTaskSaving(false)
  }, [task, user, supabase, taskCategory, taskDueDate, taskWeekDay, taskTime, taskDifficulty, taskMinutes, taskTag, taskLabels, subTasksToAdd, toast, fetchTasks, requestNotificationPermission])

  const deleteTask = useCallback(async (id) => {
    if (!supabase || !user) return
    const t = tasks.find((x) => x.id === id)
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id)
    if (!error) { if (t) trash('tasks', t); toast('Task moved to trash', 'success'); await fetchTasks() }
  }, [supabase, user, tasks, trash, toast, fetchTasks])

  // ============================================================
  //  SUBTASKS
  // ============================================================
  const addSubTask = useCallback(async (taskId) => {
       if (!newSubTask.trim() || !supabase || !user) return
    const current = subTasks[taskId] || []
    const updated = [...current, { id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, text: newSubTask.trim(), done: false }]
    const { error } = await supabase.from('tasks').update({ subtasks: updated }).eq('id', taskId).eq('user_id', user.id)
    if (!error) { setSubTasks((p) => ({ ...p, [taskId]: updated })); setNewSubTask(''); toast('Subtask added', 'success') }
  }, [newSubTask, supabase, user, subTasks, toast])

  const toggleSubTask = useCallback(async (taskId, subTaskId) => {
    if (!supabase || !user) return
    const current = subTasks[taskId] || []
    const updated = current.map((st) => st.id === subTaskId ? { ...st, done: !st.done } : st)
    const { error } = await supabase.from('tasks').update({ subtasks: updated }).eq('id', taskId).eq('user_id', user.id)
    if (!error) setSubTasks((p) => ({ ...p, [taskId]: updated }))
  }, [supabase, user, subTasks])

  const deleteSubTask = useCallback(async (taskId, subTaskId) => {
    if (!supabase || !user) return
    const current = subTasks[taskId] || []
    const updated = current.filter((st) => st.id !== subTaskId)
    const { error } = await supabase.from('tasks').update({ subtasks: updated }).eq('id', taskId).eq('user_id', user.id)
    if (!error) { setSubTasks((p) => ({ ...p, [taskId]: updated })); toast('Subtask deleted', 'success') }
  }, [supabase, user, subTasks, toast])

  // ============================================================
  //  POMODORO
  // ============================================================
  const togglePomodoro = () => {
    if (!pomodoroRunning && pomoRef.current === 0) { setPomoTime(focusDuration * 60); setIsBreak(false) }
    setPomodoroRunning(!pomodoroRunning)
    setPomodoroState(pomodoroRunning ? 'paused' : 'running')
  }
  const resetPomodoro = () => {
    setPomodoroRunning(false); setIsBreak(false)
    setPomoTime(Math.round(focusDuration * 60)); setPomodoroState('idle'); setShowCelebration(false)
  }

  const handlePomodoroCompleteRef = useRef(null)
  const handlePomodoroComplete = useCallback(async () => {
    if (!isBreak) {
      const newSessions = pomodoroSessions + 1
      const newMinutes = totalMinutes + focusDuration
      setPomodoroSessions(newSessions); setTotalMinutes(newMinutes)
      setShowCelebration(true); setTimeout(() => setShowCelebration(false), 3000)
      if (supabase && user) {
        await supabase.from('pomodoro_sessions').upsert({
          user_id: user.id, date: toDayKey(), sessions_completed: newSessions, total_minutes: newMinutes,
        }, { onConflict: 'user_id,date' })
      }
      toast('Focus Session Complete! Take a break.', 'success')
      setPomoTime(Math.round(breakDuration * 60))
    } else {
      toast('Break over. Ready to focus?', 'success')
      setPomoTime(Math.round(focusDuration * 60))
    }
    setIsBreak((b) => !b); setPomodoroRunning(false); setPomodoroState('finished')
  }, [isBreak, pomodoroSessions, totalMinutes, focusDuration, breakDuration, supabase, user, toast, setPomoTime])

  useEffect(() => { handlePomodoroCompleteRef.current = handlePomodoroComplete }, [handlePomodoroComplete])

  useEffect(() => {
    if (!pomodoroRunning) return
    const id = setInterval(() => {
      const next = Math.max(0, pomoRef.current - 1)
      pomoRef.current = next; setPomodoroTime(next)
      if (next === 0) { setPomodoroRunning(false); handlePomodoroCompleteRef.current?.() }
    }, 1000)
    return () => clearInterval(id)
  }, [pomodoroRunning])

  // ============================================================
  //  FOCUS SESSION (from Task List)
  // ============================================================
  const startTaskSession = useCallback((taskId) => {
    const t = tasks.find((x) => x.id === taskId); if (!t) return
    const duration = (t.estimated_minutes || 25) * 60
    sessionTaskIdRef.current = taskId; sessionTimeRef.current = duration; sessionElapsedRef.current = 0
    setSessionTaskId(taskId); setActiveSession(taskId)
    setSessionPomodoroTime(duration); setSessionElapsed(0)
    setSessionRunning(true); setSessionPaused(false)
    toast(`Focusing on: "${t.content}"`, 'success')
  }, [tasks, toast])

  const pauseSession = useCallback(() => { setSessionRunning(false); setSessionPaused(true); toast('Session paused', 'info') }, [toast])
  const resumeSession = useCallback(() => { setSessionRunning(true); setSessionPaused(false); toast('Session resumed', 'info') }, [toast])
  const stopSession = useCallback(() => { endSession(); toast('Session stopped', 'info') }, [endSession, toast])
  const completeTaskFromSession = useCallback(async () => {
    const id = sessionTaskIdRef.current; if (!id) return
    const elapsed = sessionElapsedRef.current
    endSession()
    await toggleTask(id, { fromSession: true, elapsedSeconds: elapsed })
  }, [endSession, toggleTask])

  useEffect(() => {
    if (!sessionRunning) return
    const id = setInterval(() => {
      sessionElapsedRef.current += 1; setSessionElapsed(sessionElapsedRef.current)
      const next = Math.max(0, sessionTimeRef.current - 1)
      sessionTimeRef.current = next; setSessionPomodoroTime(next)
      if (next === 0) { setSessionRunning(false); toast("Time's up! Take a break.", 'success') }
    }, 1000)
    return () => clearInterval(id)
  }, [sessionRunning, toast])

  useEffect(() => () => { if (sessionIntervalRef.current) clearInterval(sessionIntervalRef.current) }, [])

  // ============================================================
  //  ACTIVE TASK TIMER LOGIC
  //  Each visible Active card has an entry in `timers`.
  //  phase: 'idle' → not yet started (weekly/one-time no due time)
  //         'countdown' → before due time (state 1)
  //         'active' → estimated timer running (state 2)
  //  weekly + one-time + daily all share this; only the entry conditions differ.
  // ============================================================
  const activeTasksFor = useCallback((category) => {
    const now = new Date()
    const today = toDayKey(now)
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const weekday = WEEKDAYS[now.getDay()]

    return tasks.filter((t) => {
      if (t.done) return false
      if (category === 'daily' && t.category !== 'daily') return false
      if (category === 'weekly' && t.category !== 'weekly') return false
      if (category === 'custom' && t.category !== 'custom') return false

      if (t.category === 'daily') {
        // include daily tasks whose time is today, or with no time
        if (!t.time) return true
        const [h, m] = t.time.split(':').map(Number)
        const dueMin = h * 60 + m
        // active window: from dueMin - 30 up to end of day
        return nowMin >= dueMin - 30
      }
      if (t.category === 'weekly') {
        if (t.weekday !== weekday) return false
        // weekly tasks enter on their weekday
        return true
      }
      // custom
      return toDayKey(t.due_date) === today
    })
  }, [tasks])

  const activeDaily = useMemo(() => activeTasksFor('daily'), [activeTasksFor])
  const activeWeekly = useMemo(() => activeTasksFor('weekly'), [activeTasksFor])
  const activeCustom = useMemo(() => activeTasksFor('custom'), [activeTasksFor])

  // timer tick loop for all active cards
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      const nowMin = now.getHours() * 60 + now.getMinutes()
      const all = [...activeDaily, ...activeWeekly, ...activeCustom]

      all.forEach((t) => {
        const entry = timersRef.current[t.id]
        const estimated = (t.estimated_minutes || 25) * 60

        // determine due time in minutes
        let dueMin = null
        if (t.time) {
          const [h, m] = t.time.split(':').map(Number)
          if (Number.isFinite(h) && Number.isFinite(m)) dueMin = h * 60 + m
        }

        // If not initialized, do it now
        if (!entry) {
          const shifted = t._shiftedMinutes || 0
          const shiftedDue = dueMin != null ? dueMin + shifted : null

          if (shiftedDue != null && nowMin < shiftedDue) {
            updateTimer(t.id, {
              phase: 'countdown',
              remaining: (shiftedDue - nowMin) * 60,
              elapsed: 0,
              running: true,
            })
          } else if (shiftedDue != null && nowMin >= shiftedDue) {
            // due time passed, active phase with estimated timer
            updateTimer(t.id, {
              phase: 'active',
              remaining: estimated,
              elapsed: 0,
              running: true,
              startedAt: Date.now(),
            })
          } else {
            // no due time → idle, awaiting Start
            updateTimer(t.id, { phase: 'idle', remaining: estimated, elapsed: 0, running: false })
          }
          return
        }

        if (!entry.running) return

        if (entry.phase === 'countdown') {
          const rem = entry.remaining - 1
          if (rem <= 0) {
            // switch to active phase
            updateTimer(t.id, { phase: 'active', remaining: estimated, elapsed: 0, startedAt: Date.now() })
          } else {
            updateTimer(t.id, { remaining: rem })
          }
        } else if (entry.phase === 'active') {
          const rem = entry.remaining - 1
          const el = (entry.elapsed || 0) + 1
          if (rem <= 0) {
            if (t.category === 'daily') {
              // auto-missed for daily
              markTaskStatus(t.id, 'missed')
            } else {
              // weekly/one-time: stop, don't auto-tick
              updateTimer(t.id, { phase: 'idle', remaining: 0, elapsed: el, running: false })
            }
          } else {
            updateTimer(t.id, { remaining: rem, elapsed: el })
          }
        }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [activeDaily, activeWeekly, activeCustom, updateTimer, markTaskStatus])

  // shift handlers
  const shiftTask = useCallback((taskId, minutes) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, _shiftedMinutes: (t._shiftedMinutes || 0) + minutes } : t))
    updateTimer(taskId, { remaining: (timersRef.current[taskId]?.remaining || 0) + minutes * 60 })
    toast(`Shifted +${minutes}m`, 'info')
  }, [updateTimer, toast])

  const startActiveTimer = useCallback((taskId) => {
    const entry = timersRef.current[taskId]
    if (!entry) return
    updateTimer(taskId, { phase: 'active', running: true, remaining: entry.remaining, startedAt: Date.now() })
  }, [updateTimer])

  // ============================================================
  //  DERIVED — analytics from completions
  // ============================================================
  const completionsByDay = useMemo(() => {
    const m = {}
    completions.forEach((c) => { (m[c.completed_on] ||= new Set()).add(c.task_id) })
    return m
  }, [completions])

  const taskById = useMemo(() => { const m = {}; tasks.forEach((t) => { m[t.id] = t }); return m }, [tasks])

  const chartTheme = useMemo(() => ({
    text: cssVar('--text-secondary', '#94a3b8'),
    muted: cssVar('--text-tertiary', '#64748b'),
    grid: cssVar('--glass-border', 'rgba(128,128,128,0.15)'),
    blue: cssVar('--brand-blue', '#4F8CFF'),
    cyan: cssVar('--brand-cyan', '#22E2FF'),
    purple: cssVar('--brand-purple', '#B43DFF'),
    bg: cssVar('--bg-secondary', '#0b0f19'),
    surface: cssVar('--bg-surface', '#111'),
    green: '#22C55E',
    amber: '#F59E0B',
    red: '#EF4444',
  }), [themeTick])

  const chartBaseOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: chartTheme.text, boxWidth: 12, padding: 8, font: { size: 11 } } },
      tooltip: {
        backgroundColor: chartTheme.surface,
        titleColor: chartTheme.text,
        bodyColor: chartTheme.text,
        borderColor: chartTheme.grid,
        borderWidth: 1,
      },
    },
    scales: {
      x: { ticks: { color: chartTheme.muted, font: { size: 10 } }, grid: { color: chartTheme.grid } },
      y: { ticks: { color: chartTheme.muted, font: { size: 10 } }, grid: { color: chartTheme.grid }, beginAtZero: true },
    },
  }), [chartTheme])

  const completionChartData = useMemo(() => {
    const now = new Date()
    const labels = [], completed = [], scheduled = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i)
      const dayKey = toDayKey(d)
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }))
      completed.push(completions.filter((c) => c.completed_on === dayKey && c.status !== 'missed').length)
      scheduled.push(tasks.filter((t) => isScheduledOn(t, d, dayKey)).length)
    }
    return {
      labels,
      datasets: [
        { label: 'Completed', data: completed, backgroundColor: 'rgba(34, 197, 94, 0.75)', borderColor: chartTheme.green, borderWidth: 2, borderRadius: 4 },
        { label: 'Scheduled', data: scheduled, backgroundColor: 'rgba(79, 140, 255, 0.35)', borderColor: chartTheme.blue, borderWidth: 2, borderRadius: 4 },
      ],
    }
  }, [tasks, completions, chartTheme])

  const categoryChartData = useMemo(() => {
    const counts = {}
    tasks.forEach((t) => { const c = t.category_tag || 'Uncategorized'; counts[c] = (counts[c] || 0) + 1 })
    const labels = Object.keys(counts)
    const data = Object.values(counts)
    const colors = ['#4F8CFF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#6B7280']
    return {
      labels,
      datasets: [{ data, backgroundColor: labels.map((_, i) => colors[i % colors.length]), borderColor: chartTheme.bg, borderWidth: 2 }],
    }
  }, [tasks, chartTheme])

  const estimatedVsActualData = useMemo(() => {
    const now = new Date()
    const labels = [], est = [], act = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i)
      const dayKey = toDayKey(d)
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }))
      const dayComps = completions.filter((c) => c.completed_on === dayKey && c.status !== 'missed')
      est.push(dayComps.reduce((s, c) => s + (taskById[c.task_id]?.estimated_minutes || 0), 0))
      act.push(dayComps.reduce((s, c) => s + (c.minutes || 0), 0))
    }
    if (est.every((v) => v === 0) && act.every((v) => v === 0)) return { labels: ['No Data'], datasets: [] }
    return {
      labels,
      datasets: [
        { label: 'Estimated', data: est, backgroundColor: 'rgba(79, 140, 255, 0.6)', borderColor: chartTheme.blue, borderWidth: 2, borderRadius: 4 },
        { label: 'Actual (tracked)', data: act, backgroundColor: 'rgba(34, 197, 94, 0.6)', borderColor: chartTheme.green, borderWidth: 2, borderRadius: 4 },
      ],
    }
  }, [completions, taskById, chartTheme])

  const streak = useMemo(() => {
    let s = 0
    const today = new Date()
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i)
      const dayKey = toDayKey(d)
      const sched = tasks.filter((t) => isScheduledOn(t, d, dayKey))
      if (sched.length === 0) continue
      const allDone = sched.every((t) => completionsByDay[dayKey]?.has(t.id))
      if (allDone) s++
      else if (i === 0) continue
      else break
    }
    return s
  }, [tasks, completionsByDay])

  const missedCount = useMemo(() => completions.filter((c) => c.status === 'missed').length, [completions])
  const completedCount = useMemo(() => completions.filter((c) => c.status !== 'missed').length, [completions])

  const heatmap = useMemo(() => {
    const cells = []
    // 5 weeks back, aligned to Monday, 35 cells
    const today = new Date()
    const start = getWeekStart(today)
    start.setDate(start.getDate() - 28) // 4 weeks back + current = 5 rows
    for (let i = 0; i < 35; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i)
      const dayKey = toDayKey(d)
      const count = completions.filter((c) => c.completed_on === dayKey && c.status !== 'missed').length
      const isFuture = dayKey > toDayKey(today)
      cells.push({ dayKey, date: d, count, isToday: dayKey === toDayKey(today), isFuture })
    }
    return cells
  }, [completions])

  // ============================================================
  //  FILTERED LISTS
  // ============================================================
  const filteredTasks = useMemo(() => {
    const list = activeCategory === 'all' ? tasks : tasks.filter((t) => t.category === activeCategory)
    return [...list].sort((a, b) => {
      const da = a.due_date || '9999-12-31', db = b.due_date || '9999-12-31'
      if (da !== db) return da.localeCompare(db)
      return (a.time || '23:59').localeCompare(b.time || '23:59')
    })
  }, [tasks, activeCategory])

  const historyRows = useMemo(() => {
    const list = historyFilter === 'all' ? completions : completions.filter((c) => c.status === historyFilter)
    const grouped = {}
    list.forEach((c) => { (grouped[c.completed_on] ||= []).push(c) })
    return Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map((day) => ({
      day, rows: grouped[day].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')),
    }))
  }, [completions, historyFilter])

  const doneCount = tasks.filter((t) => t.done).length
  const habitTasks = tasks.filter((t) => t.type === 'habit')
  const habitDone = habitTasks.filter((t) => t.done).length

  // ============================================================
  //  RENDER HELPERS
  // ============================================================
  const renderPillNav = (opts = {}) => {
  const { bottom = false } = opts
  const activeCount = activeDaily.length + activeWeekly.length + activeCustom.length
  const listCount = tasks.length

  return (
    <div className={bottom ? 'pill-nav-bottom' : 'pill-nav'} style={bottom ? undefined : { marginBottom: 16 }}>
      <button
        className={`pill-btn ${bottom && page === 'activeTasks' ? 'active' : ''}`}
        onClick={() => setPage('activeTasks')}
        style={{ position: 'relative' }}
      >
        Active Tasks
        {!bottom && activeCount > 0 && (
          <span className="pill-badge pill-badge-red">{activeCount > 99 ? '99+' : activeCount}</span>
        )}
      </button>
      <button
        className={`pill-btn ${bottom && page === 'taskList' ? 'active' : ''}`}
        onClick={() => setPage('taskList')}
        style={{ position: 'relative' }}
      >
        Task List
        {!bottom && listCount > 0 && (
          <span className="pill-badge pill-badge-neutral">{listCount > 99 ? '99+' : listCount}</span>
        )}
      </button>
    </div>
  )
    }

  const renderSubtaskChip = (taskId) => {
    const st = subTasks[taskId] || []
    const total = st.length
    if (total === 0) return null
    const done = st.filter((x) => x.done).length
    return <span className="chip chip-progress" style={{ height: 22, fontSize: 10, padding: '0 8px' }}>subtasks {done}/{total}</span>
  }

  const renderTaskChips = (t, { showTime = false } = {}) => {
    const labels = t.labels || []
    return (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
        {showTime && t.time && (
          <span className="chip chip-tag" style={{ height: 22, fontSize: 10, padding: '0 8px' }}>
            <IconClock size={11} /> {t.time}
          </span>
        )}
        {t.difficulty && (
          <span className={`chip ${t.difficulty === 'hard' ? 'chip-hard' : t.difficulty === 'medium' ? 'chip-medium' : 'chip-easy'}`} style={{ height: 22, fontSize: 10, padding: '0 8px' }}>{t.difficulty}</span>
        )}
        {t.estimated_minutes && <span className="chip chip-minutes" style={{ height: 22, fontSize: 10, padding: '0 8px' }}>{t.estimated_minutes}m</span>}
        {labels.map((l) => (
          <span key={l} className="chip chip-tag" style={{ height: 22, fontSize: 10, padding: '0 8px', background: 'rgba(79,140,255,0.08)', color: 'var(--brand-blue)' }}>#{l}</span>
        ))}
        {t.category_tag && t.category_tag !== 'general' && (
          <span className="chip chip-tag" style={{ height: 22, fontSize: 10, padding: '0 8px' }}>{t.category_tag}</span>
        )}
        {renderSubtaskChip(t.id)}
      </div>
    )
  }

  const renderSubtaskPanel = (t) => {
    const list = subTasks[t.id] || []
    return (
      <div style={{ paddingTop: 10, marginTop: 10, borderTop: '1px solid var(--glass-border)', animation: 'fadeIn 0.25s ease' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <input value={newSubTask} onChange={(e) => setNewSubTask(e.target.value)} placeholder="Add subtask..."
            className="input" style={{ flex: 1, fontSize: 12, padding: '4px 10px' }}
            onKeyDown={(e) => { if (e.key === 'Enter') addSubTask(t.id) }} />
          <button onClick={() => addSubTask(t.id)} className="btn btn-primary btn-sm" style={{ height: 30 }}>Add</button>
        </div>
        {list.length > 0 ? list.map((st) => (
          <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
            <input type="checkbox" checked={st.done} onChange={() => toggleSubTask(t.id, st.id)}
              style={{ width: 14, height: 14, accentColor: 'var(--brand-blue)', cursor: 'pointer' }} />
            <span style={{ fontSize: 13, color: st.done ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: st.done ? 'line-through' : 'none', flex: 1 }}>{st.text}</span>
            <button onClick={() => deleteSubTask(t.id, st.id)}
              style={{ padding: '2px 4px', borderRadius: 4, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <IconTrash size={14} />
            </button>
          </div>
        )) : <p className="text-center" style={{ fontSize: 12, color: 'var(--text-muted)' }}>No subtasks yet</p>}
      </div>
    )
  }

  // ============================================================
  //  PAGE: TASKS (main)
  // ============================================================
  const renderTasksPage = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
        <div>
          <div className="section-title">Tasks</div>
          <div className="section-subtitle">Organize your day, track your focus, build discipline.</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddTask(true)} style={{ gap: 6 }}>
          <IconPlus size={16} /> Add New Task
        </button>
      </div>

      {/* Recurring bar */}
      <div className="card" style={{ marginBottom: 16, padding: '10px 16px', borderColor: 'rgba(79,140,255,0.15)', background: 'rgba(79,140,255,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconRefresh size={16} color="var(--brand-blue)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Recurring</span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Daily: <strong style={{ color: 'var(--text-primary)' }}>{tasks.filter((t) => t.category === 'daily' && t.type === 'habit').length}</strong></span>
            <span>Weekly: <strong style={{ color: 'var(--text-primary)' }}>{tasks.filter((t) => t.category === 'weekly' && t.type === 'habit').length}</strong></span>
            <span>Recorded: <strong style={{ color: 'var(--text-primary)' }}>{completions.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Heatmap — calendar-shaped, self-explanatory */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="tiny-label">Last 5 weeks</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <IconFlame size={13} /> {streak} day streak
          </div>
        </div>

        <div className="heatmap-calendar">
          <div className="heatmap-weekdays">
            {WEEKDAY_SHORT.map((d, i) => (<div key={i} className="heatmap-weekday">{d}</div>))}
          </div>
          <div className="heatmap-grid-7">
            {heatmap.map((cell) => {
              const intensity = cell.count === 0 ? 0 : cell.count < 2 ? 1 : cell.count < 4 ? 2 : cell.count < 6 ? 3 : 4
              const colors = [
                'var(--glass-bg)',
                'rgba(34,197,94,0.15)',
                'rgba(34,197,94,0.30)',
                'rgba(34,197,94,0.50)',
                'rgba(34,197,94,0.80)',
              ]
              return (
                <div key={cell.dayKey}
                  className={`heatmap-cell-7 ${cell.isToday ? 'today' : ''} ${cell.isFuture ? 'future' : ''}`}
                  title={`${cell.dayKey}: ${cell.count} completed`}
                  style={{
                    background: cell.isFuture ? 'transparent' : colors[intensity],
                    borderColor: cell.isToday ? 'var(--brand-blue)' : 'var(--glass-border)',
                    borderWidth: cell.isToday ? 2 : 1,
                    opacity: cell.isFuture ? 0.35 : 1,
                  }}
                >
                  {cell.date.getDate()}
                </div>
              )
            })}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            {['var(--glass-bg)', 'rgba(34,197,94,0.15)', 'rgba(34,197,94,0.30)', 'rgba(34,197,94,0.50)', 'rgba(34,197,94,0.80)'].map((c, i) => (
              <div key={i} className="heatmap-legend-swatch" style={{ background: c }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Stats card + extensive analytics link */}
      <div className="card" style={{ marginBottom: 16, padding: 20, position: 'relative' }}>
        <div className="stats-grid" style={{ marginTop: 0 }}>
          <div className="stat-item"><div className="stat-value" style={{ color: '#F59E0B' }}><IconTarget size={14} color="#F59E0B" />{doneCount}</div><div className="stat-label">Done</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: 'var(--brand-blue)' }}><IconClock size={14} color="var(--brand-blue)" />{tasks.length - doneCount}</div><div className="stat-label">Pending</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: '#22C55E' }}><IconTrendingUp size={14} color="#22C55E" />{formatMinutes(totalMinutes)}</div><div className="stat-label">Focus Time</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: '#A855F7' }}><IconTarget size={14} color="#A855F7" />{pomodoroSessions}</div><div className="stat-label">Sessions</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: '#F97316' }}><IconCalendar size={14} color="#F97316" />{tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0}%</div><div className="stat-label">Completion</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: 'var(--brand-purple)' }}><IconCheck size={14} color="var(--brand-purple)" />{habitTasks.length > 0 ? Math.round((habitDone / habitTasks.length) * 100) : 0}%</div><div className="stat-label">Habits</div></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={() => setShowAnalytics(true)} className="link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--brand-blue)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 4px' }}>
            <IconChart size={14} /> View extensive analytics
          </button>
        </div>
      </div>

      {/* Pills (plain buttons, navigate) */}
      {renderPillNav()}

      {/* Pomodoro (kept on main page) */}
      <div className="card" style={{ textAlign: 'center', padding: '24px 20px' }}>
        <div className="tiny-label" style={{ marginBottom: 8 }}>Focus Timer</div>
        <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1 }}>{formatTime(pomodoroTime)}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="tiny-label">Focus</span>
            <input type="number" min="10" max="60" value={focusDuration}
              onChange={(e) => { const v = Number(e.target.value); if (!Number.isFinite(v) || v < 10 || v > 60) return; setFocusDuration(v); if (!pomodoroRunning && !isBreak) setPomoTime(v * 60) }}
              className="input" style={{ width: 50, padding: '2px 4px', fontSize: 12, textAlign: 'center' }} />
            <span className="tiny-label">min</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="tiny-label">Break</span>
            <input type="number" min="1" max="15" value={breakDuration}
              onChange={(e) => { const v = Number(e.target.value); if (!Number.isFinite(v) || v < 1 || v > 15) return; setBreakDuration(v); if (!pomodoroRunning && isBreak) setPomoTime(v * 60) }}
              className="input" style={{ width: 50, padding: '2px 4px', fontSize: 12, textAlign: 'center' }} />
            <span className="tiny-label">min</span>
          </div>
        </div>
        <div className="progress-bar" style={{ marginTop: 10, maxWidth: 200, marginLeft: 'auto', marginRight: 'auto' }}>
          <div className="progress-bar-fill" style={{ width: `${focusDuration > 0 ? Math.max(0, Math.min(100, ((focusDuration * 60 - pomodoroTime) / (focusDuration * 60)) * 100)) : 0}%` }} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
          <button onClick={togglePomodoro} className={`btn ${pomodoroRunning ? 'btn-danger' : 'btn-primary'}`} style={{ minWidth: 80, gap: 4, height: 34, fontSize: 13 }}>
            {pomodoroRunning ? <IconPause /> : <IconPlay />}
            {pomodoroRunning ? ' Pause' : pomodoroState === 'paused' ? ' Resume' : ' Start'}
          </button>
          <button onClick={resetPomodoro} className="btn btn-ghost" style={{ gap: 4, height: 34, fontSize: 13 }}><IconReset /> Reset</button>
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-tertiary)' }}>
          {isBreak ? 'Break Time' : 'Focus Session'}<span style={{ marginLeft: 8 }}>{pomodoroSessions} sessions</span>
        </div>
        {showCelebration && (
          <div style={{ marginTop: 8, padding: '6px 12px', background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-md)', color: '#22C55E', fontSize: 12, fontWeight: 600 }}>
            <IconSparkle /> Focus Session Complete!
          </div>
        )}
      </div>
    </>
  )

  // ============================================================
  //  PAGE: ACTIVE TASKS
  // ============================================================
  const renderActiveTasksPage = () => {
    const buckets = { daily: activeDaily, weekly: activeWeekly, custom: activeCustom }
    const list = buckets[activeTaskCategory] || []

    return (
      <>
        <div className="subpage-header">
          <button className="icon-btn" onClick={() => setPage('tasks')}><IconChevronLeft /></button>
          <div className="subpage-title">Active Tasks</div>
          <button className="icon-btn" onClick={() => setPage('history')}><IconHistory size={18} /></button>
        </div>

        <div className="pill-nav" style={{ marginBottom: 16 }}>
          <button className={`pill-btn ${activeTaskCategory === 'daily' ? 'active' : ''}`} onClick={() => setActiveTaskCategory('daily')}>Daily {activeDaily.length}</button>
          <button className={`pill-btn ${activeTaskCategory === 'weekly' ? 'active' : ''}`} onClick={() => setActiveTaskCategory('weekly')}>Weekly {activeWeekly.length}</button>
          <button className={`pill-btn ${activeTaskCategory === 'custom' ? 'active' : ''}`} onClick={() => setActiveTaskCategory('custom')}>One-time {activeCustom.length}</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 6, opacity: 0.5 }}>⏳</div>
              <p style={{ fontSize: 15, margin: 0, color: 'var(--text-secondary)' }}>No active tasks</p>
              <p style={{ fontSize: 13, marginTop: 2, color: 'var(--text-tertiary)' }}>Nothing in this bucket right now.</p>
            </div>
          ) : list.map((t, index) => renderActiveCard(t, index))}
        </div>

        {renderPillNav({ bottom: true })}
      </>
    )
  }

  const renderActiveCard = (t, index) => {
    const timer = timers[t.id] || { phase: 'idle', remaining: (t.estimated_minutes || 25) * 60, elapsed: 0, running: false }
    const isExpanded = activeTaskId === t.id
    const phase = timer.phase

    return (
      <div key={t.id} className="card" style={{
        padding: '14px 16px', overflow: 'hidden',
        border: phase === 'active' ? '1px solid var(--brand-blue)' : '1px solid var(--glass-border)',
        animation: `slideUp 0.4s var(--spring) both`,
        animationDelay: `${index * 30}ms`,
      }}>
        {/* Top section — timer area */}
        {phase === 'countdown' && (
          <div className="active-timer-top">
            <div className="active-timer-label">Starts in</div>
            <div className="active-timer-value countdown">{formatTime(timer.remaining)}</div>
          </div>
        )}
        {phase === 'active' && (
          <div className="active-timer-top">
            <div className="active-timer-label">Active</div>
            <div className="active-timer-value active">{formatTime(timer.remaining)}</div>
          </div>
        )}

        {/* Main card body */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setActiveTaskId(isExpanded ? null : t.id)}>
          <input type="checkbox" checked={t.done} onChange={(e) => { e.stopPropagation(); toggleTask(t.id) }} className="custom-checkbox" style={{ width: 18, height: 18 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span>{t.content}</span>
              {t.category === 'weekly' && <span className="chip" style={{ height: 20, fontSize: 10, padding: '0 8px', background: 'rgba(180,61,255,0.10)', color: 'var(--brand-purple)' }}>{t.weekday}</span>}
            </div>
            {renderTaskChips(t, { showTime: true })}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}</span>
        </div>

        {/* Bottom section — dynamic buttons */}
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {phase === 'countdown' && (
            <>
              <button className="btn btn-sm" onClick={() => shiftTask(t.id, 60)}>+1h</button>
              <button className="btn btn-sm" onClick={() => shiftTask(t.id, 120)}>+2h</button>
              <button className="btn btn-sm" onClick={() => shiftTask(t.id, 180)}>+3h</button>
              <input type="number" min="1" max="600" placeholder="mins" className="input"
                style={{ width: 90, height: 34, padding: '0 10px', fontSize: 13 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    const v = Number(e.currentTarget.value)
                    if (Number.isFinite(v) && v > 0) shiftTask(t.id, v)
                    e.currentTarget.value = ''
                  }
                }} />
            </>
          )}

          {phase === 'active' && (
            <>
              <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => markTaskStatus(t.id, 'completed')}>
                <IconCheck size={14} /> Completed
              </button>
              <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => markTaskStatus(t.id, 'missed')}>
                Missed
              </button>
            </>
          )}

          {phase === 'idle' && (t.category === 'weekly' || t.category === 'custom') && (
            <>
              <button className="btn btn-primary btn-sm" style={{ flex: 1, gap: 4 }} onClick={() => startActiveTimer(t.id)}>
                <IconPlay size={14} /> Start Timer
              </button>
              <button className="btn btn-success btn-sm" style={{ width: 44 }} onClick={() => markTaskStatus(t.id, 'completed')}>
                <IconCheck size={14} />
              </button>
            </>
          )}
        </div>

        {isExpanded && renderSubtaskPanel(t)}
      </div>
    )
  }

  // ============================================================
  //  PAGE: TASK LIST
  // ============================================================
  const renderTaskListPage = () => (
    <>
      <div className="subpage-header">
        <button className="icon-btn" onClick={() => setPage('tasks')}><IconChevronLeft /></button>
        <div className="subpage-title">Task List</div>
        <div style={{ width: 36 }} />
      </div>

      <div className="pill-nav" style={{ marginBottom: 16 }}>
        {['all','daily','weekly','custom'].map((cat) => (
          <button key={cat} className={`pill-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {cat === 'custom' ? 'One-time' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <div className="card" style={{ padding: 16 }}>
            {[1,2,3,4,5].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--glass-border)' : 'none' }}>
                <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text" style={{ width: '60%', height: 16 }} />
                  <div className="skeleton skeleton-text" style={{ width: '40%', height: 12, marginTop: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 6, opacity: 0.5 }}>🎯</div>
            <p style={{ fontSize: 15, margin: 0, color: 'var(--text-secondary)' }}>Nothing here.</p>
            <p style={{ fontSize: 13, marginTop: 2, color: 'var(--text-tertiary)' }}>Add a task from the Tasks page.</p>
          </div>
        ) : filteredTasks.map((t, index) => {
          const taskSubtasks = subTasks[t.id] || []
          const isExpanded = activeTaskId === t.id
          const isActiveSession = activeSession === t.id
          const labels = t.labels || []

          return (
            <div key={t.id} className="card" style={{
              padding: '12px 16px', overflow: 'hidden',
              border: isActiveSession ? '2px solid var(--brand-blue)' : isExpanded ? '1px solid var(--brand-blue)' : '1px solid var(--glass-border)',
              animation: `slideUp 0.4s var(--spring) both`, animationDelay: `${index * 30}ms`,
              background: isActiveSession ? 'rgba(79,140,255,0.06)' : 'var(--glass-bg)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setActiveTaskId(isExpanded ? null : t.id)}>
                <input type="checkbox" checked={t.done} onChange={(e) => { e.stopPropagation(); toggleTask(t.id) }} className="custom-checkbox" style={{ width: 18, height: 18 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: t.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: t.done ? 'line-through' : 'none', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {t.content}
                    {isActiveSession && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-blue)', background: 'rgba(79,140,255,0.12)', padding: '2px 10px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: sessionRunning ? '#22C55E' : '#F59E0B' }} />
                        {sessionRunning ? 'LIVE' : 'PAUSED'} • {formatTime(sessionPomodoroTime)}
                      </span>
                    )}
                  </div>
                  {renderTaskChips(t, { showTime: true })}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {!t.done && (isActiveSession ? (
                    <button onClick={(e) => { e.stopPropagation(); stopSession() }} className="btn btn-danger btn-sm" style={{ height: 28, padding: '0 12px', fontSize: 11, gap: 4 }}>
                      <IconX size={14} /> Stop
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); startTaskSession(t.id) }} className="btn btn-primary btn-sm" style={{ height: 28, padding: '0 12px', fontSize: 11, gap: 4 }}>
                      <IconPlay size={14} /> Focus
                    </button>
                  ))}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteTask(t.id) }}
                    style={{ padding: '2px 6px', borderRadius: 4, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <>
                  {isActiveSession && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.1)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Focusing on:</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{tasks.find((x) => x.id === sessionTaskId)?.content}</span>
                      <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-blue)', marginLeft: 'auto' }}>{formatTime(sessionPomodoroTime)}</span>
                      {sessionRunning
                        ? <button onClick={pauseSession} className="btn btn-sm btn-ghost" style={{ height: 28 }}>Pause</button>
                        : <button onClick={resumeSession} className="btn btn-sm btn-primary" style={{ height: 28 }}>Resume</button>}
                      <button onClick={completeTaskFromSession} className="btn btn-sm btn-success" style={{ height: 28, gap: 4 }}>
                        <IconCheck size={14} /> Complete
                      </button>
                    </div>
                  )}
                  {renderSubtaskPanel(t)}
                </>
              )}
            </div>
          )
        })}
      </div>

      {renderPillNav({ bottom: true })}
    </>
  )

  // ============================================================
  //  PAGE: HISTORY
  // ============================================================
  const renderHistoryPage = () => (
    <>
      <div className="subpage-header">
        <button className="icon-btn" onClick={() => setPage('activeTasks')}><IconChevronLeft /></button>
        <div className="subpage-title">History</div>
        <div style={{ width: 36 }} />
      </div>

      <div className="pill-nav" style={{ marginBottom: 16 }}>
        <button className={`pill-btn ${historyFilter === 'all' ? 'active' : ''}`} onClick={() => setHistoryFilter('all')}>All</button>
        <button className={`pill-btn ${historyFilter === 'completed' ? 'active' : ''}`} onClick={() => setHistoryFilter('completed')}>Completed</button>
        <button className={`pill-btn ${historyFilter === 'missed' ? 'active' : ''}`} onClick={() => setHistoryFilter('missed')}>Missed</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {historyRows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 6, opacity: 0.5 }}>📜</div>
            <p style={{ fontSize: 15, margin: 0, color: 'var(--text-secondary)' }}>No history yet.</p>
          </div>
        ) : historyRows.map(({ day, rows }) => (
          <div key={day}>
            <div className="tiny-label" style={{ marginBottom: 6 }}>{formatDayHeader(day)}</div>
            <div className="card" style={{ padding: '8px 14px' }}>
              {rows.map((r, i) => (
                <div key={r.id || `${r.task_id}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < rows.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: r.status === 'missed' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                    color: r.status === 'missed' ? '#EF4444' : '#22C55E',
                  }}>
                    {r.status === 'missed' ? <IconX size={12} /> : <IconCheck size={12} />}
                  </span>
                  <span style={{ flex: 1, fontSize: 14, color: r.status === 'missed' ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: r.status === 'missed' ? 'line-through' : 'none' }}>
                    {r.content}
                  </span>
                  {r.minutes > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.minutes}m</span>}
                  <span className="chip" style={{ height: 20, fontSize: 10, padding: '0 8px', background: r.status === 'missed' ? 'rgba(239,68,68,0.10)' : 'rgba(34,197,94,0.10)', color: r.status === 'missed' ? '#EF4444' : '#22C55E' }}>
                    {r.status === 'missed' ? 'Missed' : 'Completed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )

  // ============================================================
  //  MODAL: ADD TASK
  // ============================================================
  const renderAddTaskModal = () => {
    if (!showAddTask) return null
    return (
      <div className="stats-modal-overlay" onClick={() => !taskSaving && setShowAddTask(false)}>
        <div className="stats-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
          <div className="stats-modal-header">
            <div className="stats-modal-title">New Task</div>
            <button className="stats-modal-close" onClick={() => setShowAddTask(false)}><IconX size={18} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="What needs doing?" className="input"
              onKeyDown={(e) => { if (e.key === 'Enter' && task.trim()) addTask() }} autoFocus />

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select value={taskCategory} onChange={(e) => setTaskCategory(e.target.value)} className="select" style={{ flex: 1, minWidth: 120 }}>
                <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="custom">One-time</option>
              </select>

              {taskCategory === 'weekly' && (
                <select value={taskWeekDay} onChange={(e) => setTaskWeekDay(e.target.value)} className="select" style={{ width: 150 }}>
                  {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              )}

              {taskCategory === 'custom' && (
                <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="input" style={{ width: 160 }} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="tiny-label" style={{ minWidth: 90 }}>
                {taskCategory === 'daily' ? 'Time' : 'Due time (optional)'}
              </span>
              <input type="time" value={taskTime} onChange={(e) => setTaskTime(e.target.value)} className="input" style={{ width: 140 }} />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select value={taskDifficulty} onChange={(e) => setTaskDifficulty(e.target.value)} className="select" style={{ width: 110 }}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
              <input type="number" value={taskMinutes} placeholder="Mins"
                onChange={(e) => { const v = Number(e.target.value); setTaskMinutes(Number.isFinite(v) ? Math.max(0, Math.min(600, v)) : 0) }}
                className="input" style={{ width: 90 }} />
              <select value={taskTag} onChange={(e) => setTaskTag(e.target.value)} className="select" style={{ width: 130 }}>
                <option value="general">General</option><option value="school">School</option><option value="work">Work</option><option value="health">Health</option><option value="personal">Personal</option>
              </select>
            </div>

            <input value={taskLabels} onChange={(e) => setTaskLabels(e.target.value)} placeholder="Labels (comma separated)" className="input" />

            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newSubTask} onChange={(e) => setNewSubTask(e.target.value)} placeholder="Add a subtask..." className="input" style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSubTask.trim()) {
                    setSubTasksToAdd([...subTasksToAdd, { id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, text: newSubTask.trim(), done: false }])
                    setNewSubTask('')
                  }
                }} />
              <button onClick={() => {
                if (newSubTask.trim()) {
                  setSubTasksToAdd([...subTasksToAdd, { id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, text: newSubTask.trim(), done: false }])
                  setNewSubTask('')
                }
              }} className="btn btn-ghost">Add</button>
            </div>

            {subTasksToAdd.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {subTasksToAdd.map((st) => (
                  <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(79,140,255,0.06)', borderRadius: 8 }}>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>{st.text}</span>
                    <button onClick={() => setSubTasksToAdd(subTasksToAdd.filter((s) => s.id !== st.id))}
                      style={{ padding: '2px 4px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowAddTask(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={addTask} disabled={taskSaving || !task.trim()} className="btn btn-primary" style={{ flex: 2, gap: 6 }}>
                <IconPlus size={16} /> {taskSaving ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  //  MODAL: EXTENSIVE ANALYTICS
  // ============================================================
  const renderAnalyticsModal = () => {
    if (!showAnalytics) return null
    return (
      <div className="stats-modal-overlay" onClick={() => setShowAnalytics(false)}>
        <div className="stats-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
          <div className="stats-modal-header">
            <div className="stats-modal-title">Extensive Analytics</div>
            <button className="stats-modal-close" onClick={() => setShowAnalytics(false)}><IconX size={18} /></button>
          </div>

          <div className="stats-section">
            <div className="stats-section-title"><IconChart size={16} /> Task Completion (7 Days)</div>
            <div className="stats-section-divider" />
            <Bar data={completionChartData} options={chartBaseOptions} />
          </div>

          <div className="stats-section">
            <div className="stats-section-title"><IconTarget size={16} /> Category Breakdown</div>
            <div className="stats-section-divider" />
            {categoryChartData.labels.length > 0 ? (
              <div style={{ maxWidth: 280, margin: '0 auto' }}>
                <Doughnut data={categoryChartData} options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: chartTheme.text, padding: 8, boxWidth: 10, font: { size: 11 } } },
                    tooltip: { backgroundColor: chartTheme.surface, titleColor: chartTheme.text, bodyColor: chartTheme.text, borderColor: chartTheme.grid, borderWidth: 1 },
                  },
                  cutout: '55%',
                }} />
              </div>
            ) : <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>No categories yet</div>}
          </div>

          <div className="stats-section">
            <div className="stats-section-title"><IconClock size={16} /> Estimated vs Actual (7 Days)</div>
            <div className="stats-section-divider" />
            {estimatedVsActualData.datasets.length > 0
              ? <Bar data={estimatedVsActualData} options={chartBaseOptions} />
              : <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)' }}>Complete tasks to see this chart</div>}
          </div>

          <div className="stats-section">
            <div className="stats-section-title"><IconTrendingUp size={16} /> Summary</div>
            <div className="stats-section-divider" />
            <div className="stats-grid" style={{ marginTop: 0 }}>
              <div className="stat-item"><div className="stat-value" style={{ color: '#22C55E' }}>{completedCount}</div><div className="stat-label">Completed</div></div>
              <div className="stat-item"><div className="stat-value" style={{ color: '#EF4444' }}>{missedCount}</div><div className="stat-label">Missed</div></div>
              <div className="stat-item"><div className="stat-value" style={{ color: '#F59E0B' }}>{streak}</div><div className="stat-label">Streak</div></div>
              <div className="stat-item"><div className="stat-value" style={{ color: 'var(--brand-purple)' }}>{formatMinutes(totalMinutes)}</div><div className="stat-label">Focus Time</div></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  //  ROOT
  // ============================================================
  return (
    <div style={{ width: '100%', maxWidth: '100%', paddingBottom: (page === 'activeTasks' || page === 'taskList') ? 90 : 0 }}>
      {page === 'tasks' && renderTasksPage()}
      {page === 'activeTasks' && renderActiveTasksPage()}
      {page === 'taskList' && renderTaskListPage()}
      {page === 'history' && renderHistoryPage()}

      {renderAddTaskModal()}
      {renderAnalyticsModal()}
    </div>
  )
}
