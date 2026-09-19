import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE= Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT= Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

const sb = createClient(SUPABASE_URL, SERVICE_KEY)

const toDayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

const WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

type Row = {
  id: string
  user_id: string
  content: string
  category: string
  type: string
  weekday: string | null
  time: string | null
  due_date: string | null
  estimated_minutes: number | null
  done: boolean
}

async function alreadySent(user_id: string, task_id: string, kind: string, day: string) {
  const { data } = await sb.from('push_log')
    .select('id').eq('user_id', user_id).eq('task_id', task_id)
    .eq('kind', kind).eq('sent_on', day).maybeSingle()
  return !!data
}

async function markSent(user_id: string, task_id: string, kind: string, day: string) {
  await sb.from('push_log').insert({ user_id, task_id, kind, sent_on: day })
}

async function sendTo(user_id: string, payload: { title: string; body: string; tag: string; url: string }) {
  const { data: subs } = await sb.from('push_subscriptions').select('*').eq('user_id', user_id)
  if (!subs?.length) return

  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload)
      )
    } catch (e: any) {
      // 404/410 → subscription is dead, drop it
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await sb.from('push_subscriptions').delete().eq('id', s.id)
      }
    }
  }))
}

Deno.serve(async () => {
  const now = new Date()
  const day = toDayKey(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const weekday = WEEKDAYS[now.getDay()]

  // Pull every open task that could conceivably fire this minute.
  // Scoped by due_date == today OR weekday == today for repeating tasks.
  const { data: tasks, error } = await sb.from('tasks')
    .select('id,user_id,content,category,type,weekday,time,due_date,estimated_minutes,done')
    .eq('done', false)
    .or(`due_date.eq.${day},weekday.eq.${weekday}`)

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 })
  }

  const rows = (tasks || []) as Row[]
  let sent = 0

  for (const t of rows) {
    if (!t.time) continue          // no clock time → no timed notification
    const [h, m] = t.time.split(':').map(Number)
    if (!Number.isFinite(h) || !Number.isFinite(m)) continue
    const dueMin = h * 60 + m

    // T-30
    if (nowMinutes === dueMin - 30) {
      if (!(await alreadySent(t.user_id, t.id, 't30', day))) {
        await sendTo(t.user_id, {
          title: 'Task soon',
          body: `"${t.content}" starts in 30 minutes`,
          tag: `task-${t.id}-t30`,
          url: `/tasks/active?task=${t.id}`,
        })
        await markSent(t.user_id, t.id, 't30', day)
        sent++
      }
    }

    // Activation (due time hit)
    if (nowMinutes === dueMin) {
      if (!(await alreadySent(t.user_id, t.id, 'activation', day))) {
        await sendTo(t.user_id, {
          title: 'Task active',
          body: `"${t.content}" is now active`,
          tag: `task-${t.id}-active`,
          url: `/tasks/active?task=${t.id}`,
        })
        await markSent(t.user_id, t.id, 'activation', day)
        sent++
      }
    }
  }

  // Missed notification runs at 23:59 local — one sweep per day per user.
  if (now.getHours() === 23 && now.getMinutes() === 59) {
    const { data: pending } = await sb.from('tasks')
      .select('id,user_id,content,category,weekday,due_date,time')
      .eq('done', false)
      .or(`due_date.eq.${day},weekday.eq.${weekday}`)

    for (const t of (pending || []) as Row[]) {
      if (await alreadySent(t.user_id, t.id, 'missed', day)) continue
      await sendTo(t.user_id, {
        title: 'Missed',
        body: `"${t.content}" rolled over to missed`,
        tag: `task-${t.id}-missed`,
        url: `/tasks/history`,
      })
      await markSent(t.user_id, t.id, 'missed', day)
      sent++
    }
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
