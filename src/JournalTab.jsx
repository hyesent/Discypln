// ============================================================
//  JOURNAL TAB — Full Self-Contained
//  Single Global Search + Audio Recording + File Attachments
//  Storage: Supabase (text) + IndexedDB (images, audio)
// ============================================================

import { useState, useMemo, useEffect, useRef } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { saveFile, getFile, deleteFile, getFileUrl, getFilesByEntry, deleteFilesByEntry } from './lib'

ChartJS.register(ArcElement, Tooltip, Legend)

// ===== SVG ICONS =====
const IconPlus = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const IconX = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const IconChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const IconChevronUp = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15" />
  </svg>
)

const IconTrash = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const IconSave = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const IconSearch = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconTag = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

const IconMood = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
)

const IconMic = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
)

const IconMicOff = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 10v2a5 5 0 0 1-4.46 4.96" />
    <path d="M12 19v4" />
    <path d="M8 23h8" />
    <path d="M12 12a3 3 0 0 1-3-3" />
  </svg>
)

const IconImage = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const IconPlay = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const IconPause = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
)

const IconUpload = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

// ============================================================
//  TEMPLATES
// ============================================================

const TEMPLATES = [
  {
    id: 'gratitude',
    name: 'Gratitude',
    content: `# Gratitude Journal\n\n## What am I grateful for today?\n\n1. \n2. \n3. \n\n## Who am I grateful for?\n\n## What made me smile today?`
  },
  {
    id: 'daily-reflection',
    name: 'Daily Reflection',
    content: `# Daily Reflection\n\n## What went well today?\n\n## What could I have done better?\n\n## What did I learn?\n\n## What will I do differently tomorrow?`
  },
  {
    id: 'goal-setting',
    name: 'Goal Setting',
    content: `# Goal Setting\n\n## My main goal for today\n\n## Steps to achieve it\n\n1. \n2. \n3. \n\n## How I'll feel when I achieve it`
  },
  {
    id: 'free-writing',
    name: 'Free Writing',
    content: `# Free Writing\n\n## What's on my mind right now?\n\n*(Write anything that comes to mind for 5 minutes)*`
  }
]

// ============================================================
//  MOOD COLORS
// ============================================================

const MOOD_COLORS = {
  'happy': '#22C55E',
  'excited': '#F59E0B',
  'grateful': '#8B5CF6',
  'peaceful': '#60A5FA',
  'calm': '#34D399',
  'stressed': '#F87171',
  'anxious': '#F472B6',
  'sad': '#6B7280',
  'tired': '#9CA3AF',
  'angry': '#EF4444',
  'hopeful': '#A78BFA',
  'motivated': '#F97316',
  'loved': '#EC4899',
  'confused': '#94A3B8'
}

const DEFAULT_COLORS = ['#4F8CFF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4']

// ============================================================
//  JOURNAL TAB COMPONENT (Self-Contained)
// ============================================================

export default function JournalTab({ user, supabase, showToast, addToTrash }) {
  // ===== State =====
  const [journalEntries, setJournalEntries] = useState([])
  const [loading, setLoading] = useState(false)

  // ===== Global Search =====
  const [globalSearch, setGlobalSearch] = useState('')

  // ===== Form State =====
  const [journalEntry, setJournalEntry] = useState('')
  const [journalMood, setJournalMood] = useState('')
  const [journalTags, setJournalTags] = useState('')
  const [journalSaving, setJournalSaving] = useState(false)

  // ===== File State (IndexedDB) =====
  const [fileIds, setFileIds] = useState([])
  const [fileData, setFileData] = useState([])
  const [audioFileId, setAudioFileId] = useState(null)

  // ===== Audio Recording =====
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // ===== Audio/File Upload =====
  const [showAudioOptions, setShowAudioOptions] = useState(false)

  // ===== Filters =====
  const [expandedEntries, setExpandedEntries] = useState({})

  // ===== Templates =====
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // ===== Mood Pie Chart =====
  const [showMoodChart, setShowMoodChart] = useState(false)

  // ===== Refs =====
  const fileInputRef = useRef(null)
  const audioInputRef = useRef(null)

  // ============================================================
  //  FETCH JOURNAL
  // ============================================================

  const fetchJournal = async () => {
    if (!user || !supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('journal')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) {
        setJournalEntries(data || [])
        
        // Load all file data for entries
        const allFileIds = []
        data.forEach(entry => {
          const ids = entry.metadata?.file_ids || []
          allFileIds.push(...ids)
        })
        
        if (allFileIds.length > 0) {
          const files = await loadFileData(allFileIds)
          setFileData(files)
        }
      }
    } catch (e) {
      console.error('Fetch journal error:', e)
    }
    setLoading(false)
  }

  // ============================================================
  //  FILE HANDLING (IndexedDB)
  // ============================================================

  const handleFileUpload = async (file, entryId) => {
    const id = await saveFile(file, entryId, 'journal')
    return id
  }

  const loadFileData = async (ids) => {
    if (!ids || ids.length === 0) return []
    const files = await Promise.all(ids.map(id => getFile(id)))
    return files.filter(f => f)
  }

  const deleteFileById = async (id) => {
    await deleteFile(id)
    setFileIds(prev => prev.filter(fid => fid !== id))
    setFileData(prev => prev.filter(f => f.id !== id))
  }

  const deleteFilesForEntry = async (entryId) => {
    await deleteFilesByEntry(entryId)
  }

  const getFileDisplayUrl = (file) => {
    return getFileUrl(file)
  }

  // ============================================================
  //  HELPERS
  // ============================================================

  const formatEntryDate = (date) => {
    const now = new Date()
    const entry = new Date(date)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const entryDay = new Date(entry.getFullYear(), entry.getMonth(), entry.getDate())

    if (entryDay.getTime() === today.getTime()) return 'Today'
    if (entryDay.getTime() === yesterday.getTime()) return 'Yesterday'

    const diffDays = Math.floor((today - entryDay) / (1000 * 60 * 60 * 24))
    if (diffDays <= 7) return 'This Week'
    return 'Earlier'
  }

  // ============================================================
  //  LINK DETECTION (Make URLs Clickable)
  // ============================================================

  const renderContentWithLinks = (content) => {
    if (!content) return ''

    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = content.split(urlRegex)

    return parts.map((part, i) => {
      if (part && part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand-blue)', textDecoration: 'underline' }}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        )
      }
      return part
    })
  }

  // ============================================================
  //  CRUD FUNCTIONS
  // ============================================================

  async function saveJournal() {
    if (!journalEntry.trim() && fileIds.length === 0 && !audioFileId) {
      showToast('Please write something or add an attachment', 'error')
      return
    }
    setJournalSaving(true)

    const metadata = {
      file_ids: fileIds,
      audio_file_id: audioFileId
    }

    const { error } = await supabase.from('journal').insert({
      user_id: user.id,
      content: journalEntry.trim(),
      date: new Date().toISOString().split('T')[0],
      mood: journalMood.trim(),
      tags: journalTags.trim(),
      metadata: metadata
    })

    if (error) {
      showToast('Error saving journal: ' + error.message, 'error')
    } else {
      setJournalEntry('')
      setJournalMood('')
      setJournalTags('')
      setFileIds([])
      setFileData([])
      setAudioFileId(null)
      showToast('Journal entry saved!', 'success')
      fetchJournal()
    }
    setJournalSaving(false)
  }

  async function deleteJournalEntry(id) {
    const entry = journalEntries.find(e => e.id === id)
    const { error } = await supabase
      .from('journal')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) {
      await deleteFilesForEntry(id)
      if (entry) addToTrash('journal', entry)
      showToast('Entry moved to trash', 'success')
      fetchJournal()
    }
  }

  // ============================================================
  //  AUDIO RECORDING
  // ============================================================

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          
          // Save to IndexedDB
          const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
          const id = await handleFileUpload(audioFile, 'new')
          setAudioFileId(id)
          setFileIds(prev => [...prev, id])
          
          const file = await getFile(id)
          if (file) {
            setFileData(prev => [...prev, file])
          }
          
          stream.getTracks().forEach(track => track.stop())
          showToast('Audio recording saved!', 'success')
          setShowAudioOptions(false)
        }

        mediaRecorder.start()
        setIsRecording(true)
        showToast('Recording... Tap stop when done.', 'info')
      })
      .catch(() => showToast('Microphone permission denied', 'error'))
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  // ============================================================
  //  FILE UPLOAD (Image or Audio)
  // ============================================================

  const handleFileUploadHandler = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const id = await handleFileUpload(file, 'new')
    setFileIds(prev => [...prev, id])
    
    const fileData = await getFile(id)
    if (fileData) {
      setFileData(prev => [...prev, fileData])
    }
    
    showToast(`File uploaded: ${file.name}`, 'success')
    e.target.value = ''
    setShowAudioOptions(false)
  }

  // ============================================================
  //  TEMPLATES
  // ============================================================

  const applyTemplate = (template) => {
    setJournalEntry(template.content)
    setShowTemplateModal(false)
    showToast(`Applied: ${template.name}`, 'success')
  }

  // ============================================================
  //  MOOD PIE CHART DATA
  // ============================================================

  const moodChartData = useMemo(() => {
    const moodCounts = {}
    journalEntries.forEach(entry => {
      if (entry.mood && entry.mood.trim()) {
        const mood = entry.mood.trim().toLowerCase()
        moodCounts[mood] = (moodCounts[mood] || 0) + 1
      }
    })

    const labels = Object.keys(moodCounts)
    const data = Object.values(moodCounts)
    const backgroundColors = labels.map(mood => MOOD_COLORS[mood] || DEFAULT_COLORS[labels.indexOf(mood) % DEFAULT_COLORS.length])

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: 'var(--bg-primary)',
          borderWidth: 2,
        }
      ]
    }
  }, [journalEntries])

  const hasMoodData = moodChartData.labels.length > 0

  // ============================================================
  //  GLOBAL SEARCH
  // ============================================================

  const filteredEntries = useMemo(() => {
    let entries = journalEntries

    if (globalSearch.trim()) {
      const searchTerm = globalSearch.trim().toLowerCase()
      entries = entries.filter(entry => {
        const contentMatch = entry.content?.toLowerCase().includes(searchTerm) || false
        const moodMatch = entry.mood?.toLowerCase().includes(searchTerm) || false
        const tagsMatch = entry.tags?.toLowerCase().includes(searchTerm) || false
        const dateMatch = entry.date?.includes(searchTerm) || false
        return contentMatch || moodMatch || tagsMatch || dateMatch
      })
    }

    return entries
  }, [journalEntries, globalSearch])

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = {}
    filteredEntries.forEach((entry) => {
      const group = formatEntryDate(entry.created_at)
      if (!groups[group]) groups[group] = []
      groups[group].push(entry)
    })
    return groups
  }, [filteredEntries])

  // ============================================================
  //  INITIAL FETCH
  // ============================================================

  useEffect(() => {
    fetchJournal()
  }, [])

  // ============================================================
  //  RENDER
  // ============================================================

  return (
    <div>
      <div className="section-title">Journal</div>
      <div className="section-subtitle">Reflect on your progress and track your growth over time.</div>

      {/* ===== MOOD PIE CHART ===== */}
      {hasMoodData && (
        <div
          className="card"
          style={{
            marginBottom: '16px',
            padding: '16px',
            cursor: 'pointer'
          }}
          onClick={() => setShowMoodChart(!showMoodChart)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="card-title" style={{ marginBottom: '0' }}>Mood Distribution</div>
              <div className="caption" style={{ marginTop: '2px' }}>
                {journalEntries.filter(e => e.mood).length} entries with mood
              </div>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>
              {showMoodChart ? <IconChevronUp /> : <IconChevronDown />}
            </span>
          </div>

          {showMoodChart && (
            <div style={{ marginTop: '16px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
              <Doughnut
                data={moodChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'var(--text-secondary)',
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    }
                  },
                  cutout: '60%'
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ===== GLOBAL SEARCH BAR ===== */}
      <div
        className="search-wrapper"
        style={{
          position: 'relative',
          marginBottom: '16px'
        }}
      >
        <span
          className="search-icon"
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }}
        >
          <IconSearch />
        </span>
        <input
          type="text"
          placeholder="Search entries by content, mood, tags, or date..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px 10px 44px',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            color: 'var(--text-primary)',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--brand-blue)'
            e.target.style.boxShadow = '0 0 0 3px rgba(79, 140, 255, 0.10)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--glass-border)'
            e.target.style.boxShadow = 'none'
          }}
        />
        {globalSearch && (
          <button
            onClick={() => setGlobalSearch('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <IconX />
          </button>
        )}
      </div>

      {/* ===== ENTRY EDITOR ===== */}
      <div
        className="glass"
        style={{
          marginBottom: '20px',
          padding: '16px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--glass-border)'
        }}
      >
        <textarea
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          placeholder="What's on your mind today? (Paste links and they'll become clickable)"
          className="textarea"
          style={{
            width: '100%',
            minHeight: '160px',
            padding: '16px',
            fontSize: '16px',
            lineHeight: 1.8,
            background: 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-primary)',
            outline: 'none',
            resize: 'vertical'
          }}
        />

        {/* File Attachments Preview */}
        {fileData.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {fileData.map((file) => {
              const fileUrl = getFileDisplayUrl(file)
              const isImage = file.type?.startsWith('image/')
              const isAudio = file.type?.startsWith('audio/')
              return (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={file.name}
                      style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : isAudio ? (
                    <audio controls src={fileUrl} style={{ width: '150px', height: '36px' }} />
                  ) : (
                    <span style={{ fontSize: '14px' }}>📎</span>
                  )}
                  <span style={{ fontSize: '12px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                    Local Only
                  </span>
                  <button
                    onClick={() => deleteFileById(file.id)}
                    style={{ padding: '2px 4px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <IconX size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '10px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <div style={{ flex: 1, minWidth: '120px' }}>
            <span className="tiny-label" style={{ display: 'block', marginBottom: '2px' }}>
              <IconMood size={14} style={{ marginRight: '4px' }} /> Mood
            </span>
            <input
              value={journalMood}
              onChange={(e) => setJournalMood(e.target.value)}
              placeholder="e.g., happy, stressed, calm"
              className="input"
              style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}
            />
          </div>
          <div style={{ flex: 2, minWidth: '180px' }}>
            <span className="tiny-label" style={{ display: 'block', marginBottom: '2px' }}>
              <IconTag size={14} style={{ marginRight: '4px' }} /> Tags (comma separated)
            </span>
            <input
              value={journalTags}
              onChange={(e) => setJournalTags(e.target.value)}
              placeholder="e.g., work, personal, ideas"
              className="input"
              style={{ padding: '6px 12px', fontSize: '12px', width: '100%' }}
            />
          </div>
        </div>

        {/* ===== TOOLBAR ===== */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginTop: '10px',
            flexWrap: 'wrap',
            padding: '8px',
            background: 'var(--glass-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            alignItems: 'center'
          }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px', fontSize: '12px', gap: '4px' }}
          >
            <IconImage size={16} /> Image
          </button>

          <button
            onClick={() => setShowAudioOptions(!showAudioOptions)}
            className={`btn btn-ghost btn-sm ${showAudioOptions ? 'btn-primary' : ''}`}
            style={{ padding: '4px 8px', fontSize: '12px', gap: '4px' }}
          >
            <IconMic size={16} /> Audio
          </button>

          <button
            onClick={() => setShowTemplateModal(true)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 8px', fontSize: '12px', gap: '4px' }}
          >
            <IconPlus size={16} /> Templates
          </button>

          <div style={{ flex: 1 }} />

          <button
            onClick={saveJournal}
            disabled={journalSaving}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <IconSave /> {journalSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>

        {/* ===== AUDIO OPTIONS (Record or Upload) ===== */}
        {showAudioOptions && (
          <div
            style={{
              marginTop: '10px',
              padding: '12px',
              background: 'var(--glass-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="btn btn-danger btn-sm"
                style={{ gap: '4px' }}
              >
                <IconPause size={16} /> Stop Recording
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="btn btn-primary btn-sm"
                style={{ gap: '4px' }}
              >
                <IconPlay size={16} /> Record Audio
              </button>
            )}
            <button
              onClick={() => audioInputRef.current?.click()}
              className="btn btn-ghost btn-sm"
              style={{ gap: '4px' }}
            >
              <IconUpload size={16} /> Upload Audio File
            </button>
            <button
              onClick={() => setShowAudioOptions(false)}
              className="btn btn-ghost btn-sm"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* ===== JOURNAL ENTRIES ===== */}
      {loading ? (
        <div className="card" style={{ padding: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ marginBottom: i < 3 ? '16px' : '0' }}>
              <div className="skeleton skeleton-title" style={{ width: '40%', height: '18px', marginBottom: '4px' }} />
              <div className="skeleton skeleton-text" style={{ width: '70%', height: '14px' }} />
              <div className="skeleton skeleton-text" style={{ width: '50%', height: '12px' }} />
            </div>
          ))}
        </div>
      ) : filteredEntries.length > 0 ? (
        (() => {
          const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier']

          return groupOrder.map((group) => {
            if (!groupedEntries[group] || groupedEntries[group].length === 0) return null
            return (
              <div key={group} style={{ marginBottom: '16px' }}>
                <div
                  className="tiny-label"
                  style={{
                    marginBottom: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  {group}
                </div>
                {groupedEntries[group].map((entry, index) => {
                  const isExpanded = expandedEntries[entry.id] || false
                  const previewLength = 120
                  const entryFileIds = entry.metadata?.file_ids || []
                  const entryAudioId = entry.metadata?.audio_file_id

                  return (
                    <div
                      key={entry.id}
                      className="card"
                      style={{
                        padding: '16px',
                        marginBottom: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        animation: `slideUp 0.5s var(--spring) both`,
                        animationDelay: `${index * 30}ms`
                      }}
                      onClick={() =>
                        setExpandedEntries((prev) => ({
                          ...prev,
                          [entry.id]: !prev[entry.id]
                        }))
                      }
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="caption" style={{ fontSize: '12px' }}>
                            {new Date(entry.created_at).toLocaleString()}
                          </span>
                          {entry.mood && (
                            <span
                              className="chip chip-tag"
                              style={{
                                height: '24px',
                                fontSize: '10px',
                                padding: '0 10px',
                                background: 'rgba(79, 140, 255, 0.08)',
                                color: 'var(--brand-blue)'
                              }}
                            >
                              <IconMood size={12} style={{ marginRight: '4px' }} />
                              {entry.mood}
                            </span>
                          )}
                          {entry.tags &&
                            entry.tags
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="chip chip-tag"
                                  style={{ height: '24px', fontSize: '10px', padding: '0 10px' }}
                                >
                                  <IconTag size={12} style={{ marginRight: '4px' }} />
                                  {tag}
                                </span>
                              ))}
                          {entryFileIds.length > 0 && (
                            <span
                              className="chip"
                              style={{ height: '24px', fontSize: '10px', padding: '0 10px', background: 'rgba(79, 140, 255, 0.08)', color: 'var(--brand-blue)' }}
                            >
                              <IconImage size={12} style={{ marginRight: '4px' }} />
                              {entryFileIds.length} file(s)
                            </span>
                          )}
                          {entryAudioId && (
                            <span
                              className="chip"
                              style={{ height: '24px', fontSize: '10px', padding: '0 10px', background: 'rgba(34, 197, 94, 0.08)', color: '#22C55E' }}
                            >
                              🎵 Audio
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Delete this entry?')) deleteJournalEntry(entry.id)
                          }}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>

                      {/* Content with clickable links */}
                      <div
                        style={{
                          fontSize: '15px',
                          lineHeight: 1.8,
                          color: 'var(--text-primary)',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxWidth: '70ch'
                        }}
                      >
                        {isExpanded
                          ? renderContentWithLinks(entry.content)
                          : entry.content.length > previewLength
                          ? renderContentWithLinks(entry.content.slice(0, previewLength) + '...')
                          : renderContentWithLinks(entry.content)}
                      </div>

                      {/* ===== DISPLAY FILES FROM INDEXEDDB ===== */}
                      {entryFileIds.length > 0 && (
                        <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {entryFileIds.map((fileId) => {
                            const file = fileData.find(f => f.id === fileId)
                            if (!file) return null
                            const fileUrl = getFileDisplayUrl(file)
                            const isImage = file.type?.startsWith('image/')
                            return isImage ? (
                              <img
                                key={file.id}
                                src={fileUrl}
                                alt={file.name}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--glass-border)'
                                }}
                              />
                            ) : (
                              <span key={file.id} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                📎 {file.name}
                              </span>
                            )
                          })}
                        </div>
                      )}

                      {/* ===== AUDIO PLAYER ===== */}
                      {entryAudioId && (
                        <div style={{ marginTop: '8px' }}>
                          {(() => {
                            const file = fileData.find(f => f.id === entryAudioId)
                            if (!file) {
                              // Try to load the file if not in fileData
                              return <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading audio...</span>
                            }
                            const fileUrl = getFileDisplayUrl(file)
                            return (
                              <audio
                                controls
                                src={fileUrl}
                                style={{ width: '100%', maxWidth: '300px', height: '40px' }}
                              />
                            )
                          })()}
                        </div>
                      )}

                      {entry.content.length > previewLength && (
                        <div style={{ marginTop: '8px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedEntries((prev) => ({
                                ...prev,
                                [entry.id]: !prev[entry.id]
                              }))
                            }}
                            className="btn btn-ghost btn-sm"
                            style={{
                              padding: '2px 12px',
                              fontSize: '12px',
                              height: '28px',
                              borderRadius: '999px'
                            }}
                          >
                            {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
                            {isExpanded ? ' Show less' : ' Read more'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })
        })()
      ) : globalSearch ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>🔍</div>
          <p style={{ fontSize: '16px', margin: 0, color: 'var(--text-secondary)' }}>
            No entries match your search.
          </p>
          <p style={{ fontSize: '14px', marginTop: '4px', color: 'var(--text-tertiary)' }}>
            Try a different keyword.
          </p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px', opacity: 0.5 }}>📖</div>
          <p style={{ fontSize: '16px', margin: 0, color: 'var(--text-secondary)' }}>
            No journal entries yet.
          </p>
          <p style={{ fontSize: '14px', marginTop: '4px', color: 'var(--text-tertiary)' }}>
            Write your first entry above to start tracking your journey.
          </p>
          <button
            onClick={() => {
              document.querySelector('textarea')?.focus()
            }}
            className="btn btn-primary"
            style={{ marginTop: '16px', gap: '6px' }}
          >
            <IconPlus /> Write First Entry
          </button>
        </div>
      )}

      {/* ===== TEMPLATES MODAL ===== */}
      {showTemplateModal && (
        <div className="stats-modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="stats-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="stats-modal-header">
              <div className="stats-modal-title">Entry Templates</div>
              <button className="stats-modal-close" onClick={() => setShowTemplateModal(false)}>
                <IconX />
              </button>
            </div>
            <div className="stats-modal-content">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    marginBottom: '8px',
                    textAlign: 'left',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{template.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {template.content.split('\n')[0].replace('#', '').trim()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== HIDDEN FILE INPUTS ===== */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileUploadHandler}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        accept="audio/*"
        ref={audioInputRef}
        onChange={handleFileUploadHandler}
        style={{ display: 'none' }}
      />
    </div>
  )
}