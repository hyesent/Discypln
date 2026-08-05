// ============================================================
//  NOTES TAB — Full Notes Management
//  Minimal Toolbar: Voice to Text, Image to Text, Grammar, More
//  Everything else in More modal
//  Storage: Supabase (text) + IndexedDB (files)
// ============================================================

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createWorker } from 'tesseract.js'
import Fuse from 'fuse.js'
import { format } from 'prettier/standalone'
import parserBabel from 'prettier/parser-babel'
import parserHtml from 'prettier/parser-html'
import parserPostcss from 'prettier/parser-postcss'
import parserTypescript from 'prettier/parser-typescript'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import jsPDF from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import 'highlight.js/styles/github-dark.css'
import { saveFile, getFile, getFilesByEntry, deleteFile, deleteFilesByEntry, getFileUrl, getAllFiles } from './lib'

// ============================================================
//  SVG ICONS (All Custom – No Emojis)
// ============================================================

const IconSearch = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

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

const IconCheck = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconTrash = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const IconBack = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const IconSave = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
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

const IconCopy = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const IconShare = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)

const IconTranslate = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const IconStar = ({ size = 18, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const IconArchive = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
)

const IconCodeBlock = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)

const IconSparkle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
  </svg>
)

const IconBold = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
)

const IconItalic = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
)

const IconLink = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
)

const IconH1 = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h12" />
    <path d="M3 18V6" />
    <path d="M15 18V6" />
    <text x="17" y="16" fontSize="14" fontWeight="bold" fill="currentColor">1</text>
  </svg>
)

const IconH2 = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h12" />
    <path d="M3 18V6" />
    <path d="M15 18V6" />
    <text x="17" y="16" fontSize="14" fontWeight="bold" fill="currentColor">2</text>
  </svg>
)

const IconH3 = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h12" />
    <path d="M3 18V6" />
    <path d="M15 18V6" />
    <text x="17" y="16" fontSize="14" fontWeight="bold" fill="currentColor">3</text>
  </svg>
)

const IconAttach = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
)

const IconMenuDots = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
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

const IconChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const IconFilter = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 13 10 21 14 18 14 13 22 3" />
  </svg>
)

const IconCalendar = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconCloud = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" />
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

const IconRefresh = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
)

const IconHelp = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const IconHeading1 = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <text x="2" y="20" fontSize="20" fontWeight="bold" fill="currentColor">H1</text>
  </svg>
)

const IconHeading2 = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <text x="2" y="20" fontSize="20" fontWeight="bold" fill="currentColor">H2</text>
  </svg>
)

const IconHeading3 = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <text x="2" y="20" fontSize="20" fontWeight="bold" fill="currentColor">H3</text>
  </svg>
)

// ============================================================
//  CONSTANTS
// ============================================================

const CODE_LANGUAGES = [
  'javascript', 'typescript', 'jsx', 'tsx', 'python', 'html', 'css',
  'json', 'yaml', 'sql', 'bash', 'php', 'java', 'c', 'cpp',
  'csharp', 'go', 'rust', 'ruby', 'swift', 'kotlin', 'markdown'
]

const ALL_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh-CN', name: 'Chinese Simplified' },
  { code: 'zh-TW', name: 'Chinese Traditional' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'he', name: 'Hebrew' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'cs', name: 'Czech' },
  { code: 'el', name: 'Greek' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'fa', name: 'Persian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'sw', name: 'Swahili' },
  { code: 'tl', name: 'Filipino' }
]

const TEMPLATES = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    content: `# Meeting Notes\n\n## Date\n\n## Attendees\n\n## Agenda\n\n## Action Items\n\n## Notes`
  },
  {
    id: 'daily',
    name: 'Daily Log',
    content: `# Daily Log\n\n## Date\n\n## Tasks\n\n## Notes\n\n## Reflection`
  },
  {
    id: 'project',
    name: 'Project Plan',
    content: `# Project Plan\n\n## Goal\n\n## Timeline\n\n## Tasks\n\n## Resources\n\n## Milestones`
  }
]

const BODY_FONTS = [
  'Inter', 'Georgia', "'Times New Roman'", "'Courier New'", 'Arial',
  'Poppins', "'Roboto Slab'", 'Montserrat', 'Lora', 'Merriweather',
  'Ubuntu', 'Quicksand', 'Caveat', 'Pacifico', "'JetBrains Mono'"
]

const TITLE_FONTS = [
  'Inter', 'Georgia', "'Times New Roman'", 'Poppins', 'Merriweather',
  'Arial', 'Pacifico', 'Caveat'
]

const FONT_SIZES = ['14', '16', '18', '20', '24']

// ============================================================
//  OCR POST-PROCESSING (Clean & Fix Results)
// ============================================================

const cleanOCRText = (text) => {
  if (!text) return ''

  let cleaned = text

  const fixes = {
    'O': '0',
    'l': '1',
    'I': '1',
    'S': '5',
    'B': '8',
    'Z': '2',
    'G': '6',
    'T': '7',
    'rn': 'm',
    'cl': 'd',
    'corn': 'com',
    'vveb': 'web',
    '  ': ' '
  }

  for (const [bad, good] of Object.entries(fixes)) {
    cleaned = cleaned.replaceAll(bad, good)
  }

  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  cleaned = cleaned.replace(/[^\w\s.,!?()\-:;"'%$#@&*+=\/\\]/g, '')
  cleaned = cleaned.replace(/(^\s*\w|[.!?]\s*\w)/g, (match) => match.toUpperCase())

  return cleaned
}

// ============================================================
//  OCR (Tesseract.js)
// ============================================================

const ocrWithTesseract = async (file) => {
  try {
    const worker = await createWorker({
      logger: (m) => console.log(m.status, m.progress)
    })
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    
    const { data: { text } } = await worker.recognize(file, {
      rotateAuto: true,
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!? '
    })
    await worker.terminate()
    return { 
      text, 
      source: 'tesseract.js', 
      confidence: 0.85 
    }
  } catch (e) {
    console.warn('Tesseract failed:', e)
    return null
  }
}

const smartOCR = async (file) => {
  return await ocrWithTesseract(file)
}

// ============================================================
//  SPELL-CHECK (LanguageTool API - Free)
// ============================================================

const spellCheck = async (text) => {
  try {
    const res = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `text=${encodeURIComponent(text)}&language=en-US`
    })
    const data = await res.json()
    return data.matches || []
  } catch (e) {
    return []
  }
}

// ============================================================
//  FORMAT CODE (Prettier)
// ============================================================

const formatCode = (code, language) => {
  try {
    const parserMap = {
      javascript: 'babel',
      typescript: 'typescript',
      jsx: 'babel',
      tsx: 'typescript',
      html: 'html',
      css: 'postcss',
      json: 'json',
    }
    const parser = parserMap[language] || 'babel'
    const plugins = {
      babel: parserBabel,
      html: parserHtml,
      postcss: parserPostcss,
      typescript: parserTypescript,
      json: parserTypescript
    }
    const formatted = format(code, {
      parser,
      plugins: [plugins[parser]],
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: true
    })
    return formatted
  } catch (e) {
    return code
  }
}

// ============================================================
//  TRANSLATION CHAIN (5 engines)
// ============================================================

const getNLLBLangCode = (code) => {
  const map = {
    en: 'eng_Latn', fr: 'fra_Latn', es: 'spa_Latn', de: 'deu_Latn',
    it: 'ita_Latn', pt: 'por_Latn', ru: 'rus_Cyrl', 'zh-CN': 'zho_Hans',
    'zh-TW': 'zho_Hant', ja: 'jpn_Jpan', ko: 'kor_Hang', ar: 'arb_Arab',
    hi: 'hin_Deva', nl: 'nld_Latn', pl: 'pol_Latn', tr: 'tur_Latn',
    vi: 'vie_Latn', th: 'tha_Thai', he: 'heb_Hebr', sv: 'swe_Latn',
    da: 'dan_Latn', fi: 'fin_Latn', no: 'nob_Latn', cs: 'ces_Latn',
    el: 'ell_Grek', hu: 'hun_Latn', ro: 'ron_Latn', uk: 'ukr_Cyrl',
    id: 'ind_Latn', ms: 'zsm_Latn', fa: 'pes_Arab', bn: 'ben_Beng',
    ta: 'tam_Taml', te: 'tel_Telu', mr: 'mar_Deva', ur: 'urd_Arab',
    sw: 'swh_Latn', tl: 'tgl_Latn'
  }
  return map[code] || 'eng_Latn'
}

const translateWithHuggingFace = async (text, targetLang) => {
  try {
    const res = await fetch(
      'https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            src_lang: 'eng_Latn',
            tgt_lang: getNLLBLangCode(targetLang)
          }
        })
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data[0]?.translation_text) return data[0].translation_text
    }
  } catch (e) {}
  return null
}

const translateWithLibre = async (text, targetLang) => {
  try {
    const res = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'auto', target: targetLang, format: 'text' })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.translatedText) return data.translatedText
    }
  } catch (e) {}
  return null
}

const translateWithGoogle = async (text, targetLang) => {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    const res = await fetch(url)
    const parsed = await res.json()
    const translated = parsed[0].map((item) => item[0]).join('')
    if (translated) return translated
  } catch (e) {}
  return null
}

const translateWithMyMemory = async (text, targetLang) => {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }
  } catch (e) {}
  return null
}

const translateNote = async (text, targetLang) => {
  const engines = [
    translateWithHuggingFace,
    translateWithLibre,
    translateWithGoogle,
    translateWithMyMemory
  ]
  for (const engine of engines) {
    const result = await engine(text, targetLang)
    if (result) return result
  }
  return null
}

// ============================================================
//  LINK RENDERER (Make URLs Clickable in Note Cards)
// ============================================================

const renderContentWithLinks = (content) => {
  if (!content) return ''

  // Split by Markdown links [text](url) and plain URLs
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const urlRegex = /(https?:\/\/[^\s]+)/g
  
  // First, replace Markdown links with a placeholder marker
  let processed = content
  const links = []
  
  // Extract Markdown links
  let match
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    links.push({
      text: match[1],
      url: match[2],
      index: match.index,
      full: match[0]
    })
  }
  
  // Extract plain URLs
  let plainMatch
  while ((plainMatch = urlRegex.exec(content)) !== null) {
    // Check if this URL is already inside a Markdown link
    const isInsideMarkdown = links.some(l => 
      plainMatch.index > l.index && plainMatch.index < l.index + l.full.length
    )
    if (!isInsideMarkdown) {
      links.push({
        text: plainMatch[0],
        url: plainMatch[0],
        index: plainMatch.index,
        full: plainMatch[0],
        isPlain: true
      })
    }
  }
  
  // Sort by index
  links.sort((a, b) => a.index - b.index)
  
  if (links.length === 0) {
    return content
  }
  
  // Build result with links
  const result = []
  let lastIndex = 0
  
  links.forEach((link, i) => {
    // Add text before link
    if (link.index > lastIndex) {
      result.push(content.substring(lastIndex, link.index))
    }
    
    // Add link
    result.push(
      <a
        key={i}
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ 
          color: 'var(--brand-blue)', 
          textDecoration: 'underline',
          cursor: 'pointer'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {link.text}
      </a>
    )
    
    lastIndex = link.index + link.full.length
  })
  
  // Add remaining text
  if (lastIndex < content.length) {
    result.push(content.substring(lastIndex))
  }
  
  return result
}

// ============================================================
//  MAIN COMPONENT
// ============================================================

export default function NotesTab({
  user,
  supabase,
  onFetchNotes,
  showToast,
  addToTrash
}) {
  // ============================================================
  //  STATE
  // ============================================================

  // Notes
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)

  // UI
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedNotes, setSelectedNotes] = useState([])
  const [selectionMode, setSelectionMode] = useState(false)
  const [viewMode, setViewMode] = useState('home')
  const [editingNote, setEditingNote] = useState(null)

  // Form
  const [title, setTitle] = useState('')
  const [noteText, setNoteText] = useState('')
  const [category, setCategory] = useState('')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [fontSize, setFontSize] = useState('16')
  const [titleFont, setTitleFont] = useState('Inter')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [selectedDate] = useState(new Date().toISOString().split('T')[0])

  // Favorites & Archive
  const [favorites, setFavorites] = useState([])
  const [archived, setArchived] = useState([])
  const [showArchived, setShowArchived] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Filters
  const [filterDate, setFilterDate] = useState('all')
  const [filterWordCount, setFilterWordCount] = useState('all')

  // Code Blocks
  const [codeBlocks, setCodeBlocks] = useState([])

  // ===== FILE ATTACHMENTS (IndexedDB) =====
  const [fileIds, setFileIds] = useState([])
  const [fileData, setFileData] = useState([])
  const [audioFileIds, setAudioFileIds] = useState([])

  // ===== AUDIO RECORDING =====
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  // ===== VOICE-TO-TEXT =====
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  // ===== FOCUS MODE =====
  const [focusMode, setFocusMode] = useState(false)

  // ===== AUTO-SAVE =====
  const [autoSave, setAutoSave] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveTimerRef = useRef(null)

  // ===== MODALS =====
  const [showToolbarModal, setShowToolbarModal] = useState(false)
  const [showTranslationModal, setShowTranslationModal] = useState(false)
  const [targetLang, setTargetLang] = useState('fr')
  const [translatedText, setTranslatedText] = useState('')
  const [translating, setTranslating] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showBackupModal, setShowBackupModal] = useState(false)

  // ===== LINK MODAL =====
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')

  // ===== REFS =====
  const fileInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const imageInputRef = useRef(null)

  // ============================================================
  //  HELPERS
  // ============================================================

  const getWordCount = (text) => {
    if (!text) return 0
    return text.trim().split(/\s+/).length
  }

  const getReadingTime = (text) => {
    const words = getWordCount(text)
    if (words < 1) return 0
    return Math.max(1, Math.round(words / 200))
  }

  const formatDate = (date) => {
    const d = new Date(date)
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
  }

  const formatNoteTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const detectUrls = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const matches = text.match(urlRegex)
    return matches || []
  }

  const detectYouTubeUrl = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // ============================================================
  //  FETCH NOTES
  // ============================================================

  const fetchNotes = useCallback(async () => {
    if (!user || !supabase) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!error) {
        setNotes(data || [])
        const savedFavorites = JSON.parse(localStorage.getItem('note_favorites') || '[]')
        const savedArchived = JSON.parse(localStorage.getItem('note_archived') || '[]')
        setFavorites(savedFavorites)
        setArchived(savedArchived)
      }
    } catch (e) {
      console.error('Fetch notes error:', e)
    }
    setLoading(false)
  }, [user, supabase])

  // ============================================================
  //  FILE HANDLING (IndexedDB)
  // ============================================================

  const handleFileUpload = async (file, entryId) => {
    const id = await saveFile(file, entryId, 'note')
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
  //  CRUD OPERATIONS
  // ============================================================

  const saveNote = async () => {
    if (!title.trim() && !noteText.trim() && codeBlocks.length === 0 && fileIds.length === 0) {
      showToast('Please add some content', 'error')
      return
    }

    setIsSaving(true)
    setSaveStatus('Saving...')

    let fullContent = noteText.trim()

    codeBlocks.forEach(block => {
      if (block.code.trim()) {
        const titleAttr = block.title ? ` title="${block.title}"` : ''
        fullContent += `\n\n\`\`\`${block.language}${titleAttr}\n${block.code}\n\`\`\``
      }
    })

    const metadata = {
      file_ids: fileIds,
      audio_file_ids: audioFileIds,
      code_blocks: codeBlocks,
      favorite: favorites.includes(editingNote?.id) || false,
      archived: archived.includes(editingNote?.id) || false
    }

    const noteData = {
      title: title.trim() || 'Untitled',
      content: fullContent.trim(),
      font_family: fontFamily,
      title_font: titleFont,
      font_size: parseInt(fontSize),
      category: category.trim() || 'Uncategorized',
      user_id: user.id,
      date: selectedDate,
      metadata: metadata
    }

    if (editingNote) {
      const { error } = await supabase
        .from('notes')
        .update(noteData)
        .eq('id', editingNote.id)
        .eq('user_id', user.id)

      if (error) {
        showToast('Error: ' + error.message, 'error')
        setIsSaving(false)
        setSaveStatus('')
        return
      }

      setSaveStatus('Saved ✓')
      setTimeout(() => setSaveStatus(''), 1500)
      showToast('Note updated!', 'success')
      setEditingNote(null)
      resetEditor()
      await fetchNotes()
      setViewMode('home')
      setIsSaving(false)
      setHasUnsavedChanges(false)
      if (onFetchNotes) onFetchNotes()
    } else {
      const { error } = await supabase.from('notes').insert([noteData])

      if (error) {
        showToast('Error: ' + error.message, 'error')
        setIsSaving(false)
        setSaveStatus('')
        return
      }

      setSaveStatus('Saved ✓')
      setTimeout(() => setSaveStatus(''), 1500)
      showToast('Note saved!', 'success')
      resetEditor()
      await fetchNotes()
      setViewMode('home')
      setIsSaving(false)
      setHasUnsavedChanges(false)
      if (onFetchNotes) onFetchNotes()
    }
  }

  const resetEditor = () => {
    setTitle('')
    setNoteText('')
    setCategory('')
    setCodeBlocks([])
    setFileIds([])
    setFileData([])
    setAudioFileIds([])
    setHasUnsavedChanges(false)
    localStorage.removeItem('note_draft')
    setAudioUrl(null)
    setAudioBlob(null)
  }

  const openAddNote = () => {
    setEditingNote(null)
    resetEditor()
    setViewMode('add')
    setSaveStatus('')
    const draft = localStorage.getItem('note_draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        setTitle(parsed.title || '')
        setNoteText(parsed.noteText || '')
        setCategory(parsed.category || '')
        setCodeBlocks(parsed.codeBlocks || [])
        setFileIds(parsed.fileIds || [])
        setAudioFileIds(parsed.audioFileIds || [])
        setHasUnsavedChanges(true)
      } catch (e) {}
    }
  }

  const openEditNote = async (note) => {
    setEditingNote(note)
    setTitle(note.title)
    setNoteText(note.content)
    setFontFamily(note.font_family || 'Inter')
    setTitleFont(note.title_font || 'Inter')
    setFontSize(note.font_size?.toString() || '16')
    setCategory(note.category || '')
    setCodeBlocks(note.metadata?.code_blocks || [])
    
    const fileIdsFromMeta = note.metadata?.file_ids || []
    const audioIdsFromMeta = note.metadata?.audio_file_ids || []
    setFileIds(fileIdsFromMeta)
    setAudioFileIds(audioIdsFromMeta)
    
    const allIds = [...fileIdsFromMeta, ...audioIdsFromMeta]
    if (allIds.length > 0) {
      const files = await loadFileData(allIds)
      setFileData(files)
    }
    
    setViewMode('edit')
    setSaveStatus('')
    setHasUnsavedChanges(false)
  }

  const deleteNote = async (id) => {
    const note = notes.find(n => n.id === id)
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      showToast('Delete failed: ' + error.message, 'error')
    } else {
      await deleteFilesForEntry(id)
      if (note && addToTrash) addToTrash('notes', note)
      showToast('Note moved to trash', 'success')
      await fetchNotes()
      setViewMode('home')
    }
  }

  const deleteMultipleNotes = async () => {
    const notesToDelete = notes.filter(n => selectedNotes.includes(n.id))
    const { error } = await supabase
      .from('notes')
      .delete()
      .in('id', selectedNotes)
      .eq('user_id', user.id)

    if (error) {
      showToast('Delete failed: ' + error.message, 'error')
    } else {
      for (const note of notesToDelete) {
        await deleteFilesForEntry(note.id)
        if (addToTrash) addToTrash('notes', note)
      }
      showToast(`${selectedNotes.length} note(s) moved to trash`, 'success')
      setSelectedNotes([])
      setSelectionMode(false)
      await fetchNotes()
    }
  }

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      localStorage.setItem('note_favorites', JSON.stringify(newFavs))
      return newFavs
    })
    showToast(
      favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites',
      'success'
    )
  }

  const toggleArchive = (id) => {
    setArchived(prev => {
      const newArch = prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
      localStorage.setItem('note_archived', JSON.stringify(newArch))
      return newArch
    })
    showToast(
      archived.includes(id) ? 'Unarchived' : 'Archived',
      'success'
    )
  }

  const duplicateNote = (note) => {
    setEditingNote(null)
    setTitle(`${note.title} (Copy)`)
    setNoteText(note.content)
    setCategory(note.category || '')
    setFontFamily(note.font_family || 'Inter')
    setTitleFont(note.title_font || 'Inter')
    setFontSize(note.font_size?.toString() || '16')
    setCodeBlocks(note.metadata?.code_blocks || [])
    setFileIds(note.metadata?.file_ids || [])
    setAudioFileIds(note.metadata?.audio_file_ids || [])
    setViewMode('add')
    setSaveStatus('')
    setHasUnsavedChanges(true)
    showToast('Note duplicated! Edit and save.', 'success')
  }

  const toggleSelect = (id) => {
    setSelectedNotes(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // ============================================================
  //  EXPORT FUNCTIONS
  // ============================================================

  const exportNoteAsMarkdown = (note) => {
    const content = `# ${note.title}\n\n${note.content}`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${note.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Exported as Markdown!', 'success')
  }

  const exportSelectedNotes = () => {
    const notesToExport = notes.filter(n => selectedNotes.includes(n.id))
    if (notesToExport.length === 0) {
      showToast('Select notes to export', 'error')
      return
    }

    if (notesToExport.length === 1) {
      exportNoteAsMarkdown(notesToExport[0])
      setSelectedNotes([])
      setSelectionMode(false)
      return
    }

    let content = '# Exported Notes\n\n'
    notesToExport.forEach((note, i) => {
      content += `## ${i + 1}. ${note.title}\n\n${note.content}\n\n---\n\n`
    })

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes-export-${selectedDate}.md`
    a.click()
    URL.revokeObjectURL(url)

    showToast(`${selectedNotes.length} note(s) exported!`, 'success')
    setSelectedNotes([])
    setSelectionMode(false)
  }

  const exportNotesPDF = () => {
    const notesToExport = notes.filter(n => selectedNotes.includes(n.id))
    if (notesToExport.length === 0) {
      showToast('Select notes to export', 'error')
      return
    }

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Discypln Notes', 20, 20)
    let yPos = 40

    notesToExport.forEach((note, idx) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }
      doc.setFontSize(14)
      doc.text(`${idx + 1}. ${note.title}`, 20, yPos)
      doc.setFontSize(11)
      const splitText = doc.splitTextToSize(note.content, 170)
      splitText.forEach((line) => {
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 20, yPos)
        yPos += 6
      })
      yPos += 6
      doc.text(`Category: ${note.category || 'Uncategorized'}`, 20, yPos)
      yPos += 12
    })

    doc.save(`discypln-notes-${selectedDate}.pdf`)
    showToast('PDF exported!', 'success')
    setSelectedNotes([])
    setSelectionMode(false)
  }

  // ============================================================
  //  BACKUP FUNCTIONS
  // ============================================================

  const exportBackup = () => {
    const data = {
      notes,
      favorites,
      archived,
      categories: [...new Set(notes.map(n => n.category || 'Uncategorized'))],
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `discypln-backup-${selectedDate}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Backup exported!', 'success')
  }

  const importBackup = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result)
        if (data.notes && Array.isArray(data.notes)) {
          for (const note of data.notes) {
            const { error } = await supabase.from('notes').insert({
              ...note,
              user_id: user.id,
              created_at: note.created_at || new Date().toISOString()
            })
            if (error) console.error('Restore error:', error)
          }
          if (data.favorites) {
            localStorage.setItem('note_favorites', JSON.stringify(data.favorites))
            setFavorites(data.favorites)
          }
          if (data.archived) {
            localStorage.setItem('note_archived', JSON.stringify(data.archived))
            setArchived(data.archived)
          }
          await fetchNotes()
          showToast('Backup restored!', 'success')
        }
      } catch (err) {
        showToast('Invalid backup file', 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ============================================================
  //  VOICE-TO-TEXT (Speech Recognition)
  // ============================================================

  const toggleVoiceToText = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      showToast('Speech Recognition not supported in this browser. Use Chrome or Edge.', 'error')
      return
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      setIsListening(false)
      showToast('Voice input stopped', 'info')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        showToast('🎙️ Listening... Speak now', 'info')
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          showToast('Microphone access denied. Please allow microphone permission.', 'error')
        } else if (event.error === 'no-speech') {
          // Silent fail - user just didn't speak
        } else if (event.error === 'audio-capture') {
          showToast('No microphone found. Please connect a microphone.', 'error')
        } else if (event.error === 'network') {
          showToast('Network error. Please check your internet connection.', 'error')
        } else {
          showToast(`Voice error: ${event.error}`, 'error')
        }
      }

      recognition.onresult = (event) => {
        let final = ''
        let interim = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript + ' '
          } else {
            interim += transcript + ' '
          }
        }

        if (final) {
          setNoteText(prev => {
            const cleanPrev = prev.replace(/\s*\[[^\]]*\]$/, '')
            return cleanPrev + ' ' + final
          })
          setHasUnsavedChanges(true)
        }

        if (interim) {
          console.log('Interim:', interim)
        }
      }

      recognitionRef.current = recognition

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          recognition.start()
        })
        .catch((err) => {
          console.error('Microphone error:', err)
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            showToast('Microphone access denied. Please allow microphone permission in your browser.', 'error')
          } else {
            showToast('Could not access microphone: ' + err.message, 'error')
          }
          setIsListening(false)
        })

    } catch (err) {
      console.error('Speech recognition init error:', err)
      showToast('Failed to initialize voice input: ' + err.message, 'error')
      setIsListening(false)
    }
  }

  // ============================================================
  //  ADD AUDIO (Record OR Upload)
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
          const url = URL.createObjectURL(audioBlob)
          setAudioBlob(audioBlob)
          setAudioUrl(url)
          
          const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
          const id = await handleFileUpload(audioFile, editingNote?.id || 'new')
          setAudioFileIds(prev => [...prev, id])
          setFileIds(prev => [...prev, id])
          
          const file = await getFile(id)
          if (file) {
            setFileData(prev => [...prev, file])
          }
          
          setHasUnsavedChanges(true)
          stream.getTracks().forEach(track => track.stop())
          showToast('Audio saved!', 'success')
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

  const handleAudioUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      showToast('Please select an audio file', 'error')
      e.target.value = ''
      return
    }

    // Show a toast to let user know it's uploading
    showToast('Uploading audio...', 'info')
    
    handleFileUpload(file, editingNote?.id || 'new')
      .then(id => {
        setAudioFileIds(prev => [...prev, id])
        setFileIds(prev => [...prev, id])
        return getFile(id)
      })
      .then(fileData => {
        if (fileData) {
          setFileData(prev => [...prev, fileData])
        }
        setHasUnsavedChanges(true)
        showToast(`Audio uploaded: ${file.name}`, 'success')
      })
      .catch(err => {
        console.error('Audio upload error:', err)
        showToast('Failed to upload audio', 'error')
      })
    
    e.target.value = ''
  }

  // ============================================================
  //  IMAGE TO TEXT (OCR) - Image discarded after extraction
  // ============================================================

  const handleOCRImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    setIsSaving(true)
    showToast('Extracting text from image...', 'info')

    try {
      const result = await smartOCR(file)

      if (result && result.text && result.text.trim().length > 5) {
        let cleanedText = cleanOCRText(result.text)

        if (result.confidence && result.confidence < 50) {
          showToast('Low confidence OCR - results may be inaccurate', 'warning')
        }

        setNoteText(prev => prev + (prev ? '\n\n' : '') + cleanedText)
        setHasUnsavedChanges(true)

        const errors = await spellCheck(cleanedText)
        if (errors.length > 0) {
          showToast(`${errors.length} possible spelling issues found.`, 'info')
          console.log('Spelling suggestions:', errors)
        }

        showToast(`✅ Text extracted (${result.source})`, 'success')
      } else {
        showToast('❌ No text found in image', 'error')
      }
    } catch (err) {
      showToast('OCR failed: ' + err.message, 'error')
    }

    setIsSaving(false)
    e.target.value = ''
  }

  // ============================================================
  //  FILE ATTACHMENT
  // ============================================================

  const handleFileAttachment = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const id = await handleFileUpload(file, editingNote?.id || 'new')
    setFileIds(prev => [...prev, id])
    
    const fileData = await getFile(id)
    if (fileData) {
      setFileData(prev => [...prev, fileData])
    }
    
    setHasUnsavedChanges(true)
    showToast(`File attached: ${file.name}`, 'success')
    e.target.value = ''
  }

  // ============================================================
  //  CODE BLOCKS
  // ============================================================

  const addCodeBlock = () => {
    setCodeBlocks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: '',
        language: 'javascript',
        code: '',
        expanded: true
      }
    ])
    setHasUnsavedChanges(true)
  }

  const removeCodeBlock = (id) => {
    setCodeBlocks(prev => prev.filter(block => block.id !== id))
    setHasUnsavedChanges(true)
  }

  const toggleCodeBlock = (id) => {
    setCodeBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, expanded: !block.expanded } : block
    ))
  }

  const updateCodeBlock = (id, field, value) => {
    setCodeBlocks(prev => prev.map(block =>
      block.id === id ? { ...block, [field]: value } : block
    ))
    setHasUnsavedChanges(true)
  }

  const formatCodeBlock = (id) => {
    const block = codeBlocks.find(b => b.id === id)
    if (!block) return
    const formatted = formatCode(block.code, block.language)
    updateCodeBlock(id, 'code', formatted)
    showToast('Code formatted!', 'success')
  }

  // ============================================================
  //  TRANSLATION
  // ============================================================

  const handleTranslate = async () => {
    if (!noteText.trim()) {
      showToast('Nothing to translate', 'error')
      return
    }

    setTranslating(true)
    setTranslatedText('')
    showToast('Translating...', 'info')

    const result = await translateNote(noteText, targetLang)

    if (result) {
      setTranslatedText(result)
      showToast('Translation complete!', 'success')
    } else {
      showToast('Translation failed. Try shorter text.', 'error')
    }
    setTranslating(false)
  }

  const insertTranslation = () => {
    if (translatedText) {
      setNoteText(prev => prev + '\n\n' + translatedText)
      setHasUnsavedChanges(true)
      setShowTranslationModal(false)
      showToast('Translation inserted!', 'success')
    }
  }

  const replaceWithTranslation = () => {
    if (translatedText) {
      setNoteText(translatedText)
      setHasUnsavedChanges(true)
      setShowTranslationModal(false)
      showToast('Original replaced!', 'success')
    }
  }

  const copyTranslation = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText)
      showToast('Copied to clipboard!', 'success')
    }
  }

  // ============================================================
  //  TEMPLATES
  // ============================================================

  const applyTemplate = (template) => {
    setNoteText(template.content)
    setTitle(template.name)
    setShowTemplateModal(false)
    setHasUnsavedChanges(true)
    showToast(`Applied: ${template.name}`, 'success')
  }

  // ============================================================
  //  GRAMMAR CHECK
  // ============================================================

  const checkGrammar = async () => {
    if (!noteText.trim()) {
      showToast('Nothing to check', 'error')
      return
    }

    try {
      const res = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `text=${encodeURIComponent(noteText)}&language=en-US`
      })
      const data = await res.json()
      const errors = data.matches || []

      if (errors.length === 0) {
        showToast('No grammar issues found!', 'success')
      } else {
        showToast(`${errors.length} grammar issue(s) found. Check console for details.`, 'info')
        console.log('Grammar issues:', errors)
      }
    } catch (e) {
      showToast('Grammar check failed', 'error')
    }
  }

  // ============================================================
  //  TOOLBAR BUTTON HELPERS
  // ============================================================

  const insertBold = () => {
    const textarea = document.querySelector('.note-textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = noteText.substring(start, end)
      const newText = noteText.substring(0, start) + `**${selectedText}**` + noteText.substring(end)
      setNoteText(newText)
      setHasUnsavedChanges(true)
    }
  }

  const insertItalic = () => {
    const textarea = document.querySelector('.note-textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = noteText.substring(start, end)
      const newText = noteText.substring(0, start) + `*${selectedText}*` + noteText.substring(end)
      setNoteText(newText)
      setHasUnsavedChanges(true)
    }
  }

  const insertLink = () => {
    const textarea = document.querySelector('.note-textarea')
    if (!textarea) {
      showToast('Please select text to link', 'error')
      return
    }
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = noteText.substring(start, end) || 'link'
    
    setLinkText(selectedText)
    setLinkUrl('')
    setShowLinkModal(true)
  }

  const handleLinkInsert = () => {
    if (!linkUrl.trim()) {
      showToast('Please enter a URL', 'error')
      return
    }
    
    const textarea = document.querySelector('.note-textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = noteText.substring(0, start) + `[${linkText}](${linkUrl.trim()})` + noteText.substring(end)
      setNoteText(newText)
      setHasUnsavedChanges(true)
      setShowLinkModal(false)
      setLinkUrl('')
      showToast('Link inserted!', 'success')
    }
  }

  const insertH1 = () => {
    const textarea = document.querySelector('.note-textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = noteText.substring(start, end) || 'Header'
      const newText = noteText.substring(0, start) + `# ${selectedText}` + noteText.substring(end)
      setNoteText(newText)
      setHasUnsavedChanges(true)
    }
  }

  const insertH2 = () => {
    const textarea = document.querySelector('.note-textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = noteText.substring(start, end) || 'Heading'
      const newText = noteText.substring(0, start) + `## ${selectedText}` + noteText.substring(end)
      setNoteText(newText)
      setHasUnsavedChanges(true)
    }
  }

  const insertH3 = () => {
    const textarea = document.querySelector('.note-textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = noteText.substring(start, end) || 'Heading'
      const newText = noteText.substring(0, start) + `### ${selectedText}` + noteText.substring(end)
      setNoteText(newText)
      setHasUnsavedChanges(true)
    }
  }

  // ============================================================
  //  AUTO-SAVE
  // ============================================================

  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)

    if (hasUnsavedChanges && viewMode !== 'home') {
      autoSaveTimerRef.current = setTimeout(() => {
        setAutoSave(true)
        setSaveStatus('Saving draft...')
        const draft = { title, noteText, category, codeBlocks, fileIds, audioFileIds }
        localStorage.setItem('note_draft', JSON.stringify(draft))
        setSaveStatus('Draft saved ✓')
        setTimeout(() => setSaveStatus(''), 1500)
        setAutoSave(false)
        setHasUnsavedChanges(false)
      }, 5000)
    }

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [title, noteText, category, codeBlocks, fileIds, audioFileIds, hasUnsavedChanges, viewMode])

  // ============================================================
  //  UNSAVED CHANGES WARNING
  // ============================================================

  const handleBack = () => {
    if (hasUnsavedChanges && viewMode !== 'home') {
      if (confirm('You have unsaved changes. Do you want to save before leaving?')) {
        saveNote()
      } else {
        setViewMode('home')
        resetEditor()
      }
    } else {
      setViewMode('home')
      resetEditor()
    }
  }

  // ============================================================
  //  KEYBOARD SHORTCUTS
  // ============================================================

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode === 'home') return

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveNote()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        insertBold()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault()
        insertItalic()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        insertLink()
      }

      if (e.key === 'Escape') {
        handleBack()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode, hasUnsavedChanges, noteText])

  // ============================================================
  //  DETECT URLs AND MEDIA
  // ============================================================

  useEffect(() => {
    if (!noteText) return

    const urls = detectUrls(noteText)
    const newMedia = []

    urls.forEach(url => {
      const videoId = detectYouTubeUrl(url)
      if (videoId) {
        newMedia.push({
          type: 'youtube',
          url: url,
          videoId: videoId
        })
      } else if (/\.(jpg|jpeg|png|gif|webp|svg)/i.test(url)) {
        newMedia.push({
          type: 'image',
          url: url
        })
      } else {
        newMedia.push({
          type: 'link',
          url: url
        })
      }
    })

    // Store in state for rendering
  }, [noteText])

  // ============================================================
  //  CATEGORY MANAGEMENT
  // ============================================================

  const addCategory = () => {
    if (newCategoryName.trim()) {
      setActiveCategory(newCategoryName.trim())
      setNewCategoryName('')
      setShowCategoryModal(false)
      showToast('Category added!', 'success')
    }
  }

  // ============================================================
  //  LOAD DRAFT
  // ============================================================

  useEffect(() => {
    if (viewMode === 'add') {
      const draft = localStorage.getItem('note_draft')
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          setTitle(parsed.title || '')
          setNoteText(parsed.noteText || '')
          setCategory(parsed.category || '')
          setCodeBlocks(parsed.codeBlocks || [])
          setFileIds(parsed.fileIds || [])
          setAudioFileIds(parsed.audioFileIds || [])
          setHasUnsavedChanges(true)
        } catch (e) {}
      }
    }
  }, [viewMode])

  // ============================================================
  //  FUZZY SEARCH
  // ============================================================

  const fuse = useMemo(() => {
    return new Fuse(notes, {
      keys: ['title', 'content', 'category'],
      threshold: 0.3,
      includeScore: true
    })
  }, [notes])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return notes
    return fuse.search(searchQuery).map(result => result.item)
  }, [fuse, searchQuery, notes])

  // ============================================================
  //  FILTERS
  // ============================================================

  const filteredNotes = useMemo(() => {
    let result = searchResults

    if (activeCategory !== 'All') {
      result = result.filter(n => (n.category || 'Uncategorized') === activeCategory)
    }

    if (showFavoritesOnly) {
      result = result.filter(n => favorites.includes(n.id))
    }

    if (!showArchived) {
      result = result.filter(n => !archived.includes(n.id))
    } else {
      result = result.filter(n => archived.includes(n.id))
    }

    const now = new Date()
    if (filterDate === 'today') {
      const today = now.toISOString().split('T')[0]
      result = result.filter(n => n.date === today)
    } else if (filterDate === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      result = result.filter(n => new Date(n.date) >= weekAgo)
    } else if (filterDate === 'month') {
      const monthAgo = new Date(now)
      monthAgo.setDate(now.getDate() - 30)
      result = result.filter(n => new Date(n.date) >= monthAgo)
    }

    if (filterWordCount === 'short') {
      result = result.filter(n => getWordCount(n.content) < 50)
    } else if (filterWordCount === 'medium') {
      result = result.filter(n => getWordCount(n.content) >= 50 && getWordCount(n.content) < 200)
    } else if (filterWordCount === 'long') {
      result = result.filter(n => getWordCount(n.content) >= 200)
    }

    return result
  }, [searchResults, activeCategory, favorites, archived, showArchived, showFavoritesOnly, filterDate, filterWordCount])

  // ============================================================
  //  INITIAL FETCH
  // ============================================================

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // ============================================================
  //  RENDER: HOME VIEW
  // ============================================================

  if (viewMode === 'home') {
    return (
      <div className="notes-tab">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Notes</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {selectionMode ? (
              <>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedNotes.length} selected
                </span>
                <button
                  onClick={() => {
                    if (selectedNotes.length === filteredNotes.length) {
                      setSelectedNotes([])
                    } else {
                      setSelectedNotes(filteredNotes.map(n => n.id))
                    }
                  }}
                  className="btn btn-sm btn-ghost"
                  style={{ borderRadius: '999px', padding: '6px 16px', fontSize: '12px', height: '32px' }}
                >
                  {selectedNotes.length === filteredNotes.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={() => {
                    if (selectedNotes.length === 0) {
                      showToast('Select notes first', 'error')
                      return
                    }
                    if (confirm(`Delete ${selectedNotes.length} selected note(s)?`)) {
                      deleteMultipleNotes()
                    }
                  }}
                  className="btn btn-danger btn-sm"
                  style={{ borderRadius: '999px', padding: '6px 16px', fontSize: '12px', height: '32px', gap: '4px' }}
                >
                  <IconTrash size={14} /> Delete
                </button>
                <button
                  onClick={() => {
                    if (selectedNotes.length === 0) {
                      showToast('Select notes to export', 'error')
                      return
                    }
                    exportSelectedNotes()
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '999px', padding: '6px 16px', fontSize: '12px', height: '32px' }}
                >
                  Export MD
                </button>
                <button
                  onClick={() => {
                    if (selectedNotes.length === 0) {
                      showToast('Select notes to export', 'error')
                      return
                    }
                    exportNotesPDF()
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '999px', padding: '6px 16px', fontSize: '12px', height: '32px' }}
                >
                  Export PDF
                </button>
                <button
                  onClick={() => { setSelectionMode(false); setSelectedNotes([]) }}
                  className="btn btn-ghost btn-sm"
                  style={{ borderRadius: '999px', padding: '6px 16px', fontSize: '12px', height: '32px' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="btn btn-ghost btn-sm"
                  style={{ borderRadius: '999px', padding: '6px 12px', fontSize: '12px', height: '32px', gap: '4px' }}
                >
                  <IconArchive size={14} /> {showArchived ? 'All' : 'Archived'}
                </button>
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`btn btn-sm ${showFavoritesOnly ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ borderRadius: '999px', padding: '6px 12px', fontSize: '12px', height: '32px', gap: '4px' }}
                >
                  <IconStar size={14} filled={showFavoritesOnly} /> {showFavoritesOnly ? 'Favorites' : '☆'}
                </button>
                <button
                  onClick={() => setSelectionMode(true)}
                  className="btn btn-ghost btn-sm"
                  style={{ borderRadius: '999px', padding: '6px 16px', fontSize: '12px', height: '32px' }}
                >
                  Select
                </button>
                <button
                  onClick={openAddNote}
                  className="btn btn-primary"
                  style={{ borderRadius: '999px', padding: '6px 20px', fontSize: '12px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <IconPlus /> New
                </button>
              </>
            )}
          </div>
        </div>

        <div className="section-subtitle">Capture, organize and retrieve information quickly.</div>

        {/* Search Bar */}
        <div className="search-wrapper" style={{ position: 'relative', marginBottom: '12px' }}>
          <span className="search-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            onFocus={(e) => { e.target.style.borderColor = 'var(--brand-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(79, 140, 255, 0.10)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.boxShadow = 'none' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <IconX />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="select"
            style={{ width: 'auto', padding: '4px 10px', fontSize: '11px', height: '28px' }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <select
            value={filterWordCount}
            onChange={(e) => setFilterWordCount(e.target.value)}
            className="select"
            style={{ width: 'auto', padding: '4px 10px', fontSize: '11px', height: '28px' }}
          >
            <option value="all">Any Length</option>
            <option value="short">Short (&lt;50)</option>
            <option value="medium">Medium (50-200)</option>
            <option value="long">Long (&gt;200)</option>
          </select>

          <button
            onClick={() => setShowBackupModal(true)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 10px', fontSize: '11px', height: '28px', gap: '4px' }}
          >
            <IconCloud size={14} /> Backup
          </button>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['All', ...new Set(notes.map(n => n.category || 'Uncategorized'))].map((cat) => {
            const count = cat === 'All'
              ? filteredNotes.length
              : filteredNotes.filter(n => (n.category || 'Uncategorized') === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  borderRadius: '999px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  height: '32px',
                  background: activeCategory === cat ? 'var(--gradient-primary)' : 'transparent',
                  color: activeCategory === cat ? 'var(--text-inverse)' : 'var(--text-secondary)',
                  borderColor: activeCategory === cat ? 'transparent' : 'var(--glass-border)'
                }}
              >
                {cat} ({count})
              </button>
            )
          })}
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn btn-ghost btn-sm"
            style={{ borderRadius: '999px', padding: '6px 12px', fontSize: '12px', height: '32px' }}
          >
            + Category
          </button>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card" style={{ padding: '20px', minHeight: '120px' }}>
                <div className="skeleton skeleton-title" style={{ width: '70%', height: '20px', marginBottom: '8px' }} />
                <div className="skeleton skeleton-text" style={{ width: '90%', height: '14px' }} />
                <div className="skeleton skeleton-text" style={{ width: '60%', height: '14px' }} />
              </div>
            ))}
          </div>
        ) : filteredNotes.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
            {filteredNotes.map((note, index) => {
              const isSelected = selectedNotes.includes(note.id)
              const isFavorite = favorites.includes(note.id)
              const isArchived = archived.includes(note.id)

              return (
                <div
                  key={note.id}
                  className="card"
                  onClick={() => {
                    if (selectionMode) {
                      toggleSelect(note.id)
                    } else {
                      openEditNote(note)
                    }
                  }}
                  style={{
                    position: 'relative',
                    overflow: 'visible',
                    cursor: 'pointer',
                    padding: '20px',
                    transition: 'all 0.2s ease',
                    border: selectionMode && isSelected
                      ? '2px solid var(--brand-blue)'
                      : selectionMode
                        ? '2px solid var(--glass-border)'
                        : '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-xl)',
                    background: selectionMode && isSelected
                      ? 'rgba(79, 140, 255, 0.06)'
                      : 'var(--glass-bg)',
                    transform: selectionMode && isSelected ? 'scale(0.98)' : 'scale(1)',
                    opacity: isArchived ? 0.6 : 1,
                    animation: `slideUp 0.5s var(--spring) both`,
                    animationDelay: `${index * 40}ms`
                  }}
                  onMouseEnter={(e) => {
                    if (!selectionMode) {
                      e.currentTarget.style.borderColor = 'var(--glass-border-hover)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectionMode) {
                      e.currentTarget.style.borderColor = 'var(--glass-border)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }
                  }}
                >
                  {selectionMode && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid var(--brand-blue)' : '2px solid var(--text-muted)',
                      background: isSelected ? 'var(--brand-blue)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      zIndex: 100
                    }}>
                      {isSelected && <IconCheck />}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3,
                      flex: 1,
                      marginRight: '8px'
                    }}>
                      {note.title || 'Untitled'}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {isFavorite && (
                        <span style={{ color: '#F59E0B' }}><IconStar size={14} filled={true} /></span>
                      )}
                      {isArchived && (
                        <span style={{ color: 'var(--text-muted)' }}><IconArchive size={14} /></span>
                      )}
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const menu = e.currentTarget.nextElementSibling
                            if (menu) {
                              menu.style.display = menu.style.display === 'block' ? 'none' : 'block'
                            }
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 6px', height: 'auto', position: 'relative', zIndex: 10 }}
                        >
                          <IconMenuDots size={16} />
                        </button>
                        <div style={{
                          display: 'none',
                          position: 'absolute',
                          right: 0,
                          top: 'calc(100% + 4px)',
                          minWidth: '160px',
                          background: 'var(--bg-secondary)',
                          backdropFilter: 'blur(24px) saturate(180%)',
                          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '4px',
                          zIndex: 99999,
                          boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                          animation: 'slideDown 0.15s ease'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(note.id)
                              e.currentTarget.parentElement.style.display = 'none'
                            }}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', padding: '8px 14px', fontSize: '13px' }}
                          >
                            <IconStar size={14} filled={isFavorite} /> {isFavorite ? 'Unfavorite' : 'Favorite'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleArchive(note.id)
                              e.currentTarget.parentElement.style.display = 'none'
                            }}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', padding: '8px 14px', fontSize: '13px' }}
                          >
                            <IconArchive size={14} /> {isArchived ? 'Unarchive' : 'Archive'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateNote(note)
                              e.currentTarget.parentElement.style.display = 'none'
                            }}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', padding: '8px 14px', fontSize: '13px' }}
                          >
                            <IconCopy size={14} /> Duplicate
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              exportNoteAsMarkdown(note)
                              e.currentTarget.parentElement.style.display = 'none'
                            }}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', padding: '8px 14px', fontSize: '13px' }}
                          >
                            <IconSave size={14} /> Export MD
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Delete this note?')) deleteNote(note.id)
                              e.currentTarget.parentElement.style.display = 'none'
                            }}
                            className="btn btn-ghost"
                            style={{ width: '100%', justifyContent: 'flex-start', gap: '8px', padding: '8px 14px', fontSize: '13px', color: 'var(--text-muted)' }}
                          >
                            <IconTrash size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ===== NOTE PREVIEW WITH LINKS FIXED ===== */}
                  <div style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.5,
                    marginTop: '8px'
                  }}>
                    {renderContentWithLinks(note.content)}
                  </div>

                  <div style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>
                      {note.category || 'Uncategorized'}
                      <span style={{ marginLeft: '8px', opacity: 0.5 }}>•</span>
                      <span style={{ marginLeft: '8px' }}>{getWordCount(note.content)} words</span>
                      <span style={{ marginLeft: '8px', opacity: 0.5 }}>•</span>
                      <span style={{ marginLeft: '8px' }}>{getReadingTime(note.content)} min read</span>
                    </span>
                    <span style={{ fontSize: '11px', opacity: 0.6 }}>{formatNoteTime(note.created_at)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : searchQuery ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>🔍</div>
            <p style={{ fontSize: '16px', margin: 0, color: 'var(--text-secondary)' }}>No notes found.</p>
            <p style={{ fontSize: '14px', marginTop: '4px', color: 'var(--text-tertiary)' }}>Try a different search term.</p>
          </div>
        ) : showArchived ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📦</div>
            <p style={{ fontSize: '16px', margin: 0, color: 'var(--text-secondary)' }}>No archived notes.</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📭</div>
            <p style={{ fontSize: '16px', margin: 0, color: 'var(--text-secondary)' }}>No notes available.</p>
            <p style={{ fontSize: '14px', marginTop: '4px', color: 'var(--text-tertiary)' }}>Create your first note to start building your knowledge base.</p>
            <button onClick={openAddNote} className="btn btn-primary" style={{ marginTop: '16px', gap: '6px' }}>
              <IconPlus /> New Note
            </button>
          </div>
        )}

        {/* ============================================================
            MODALS
            ============================================================ */}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="stats-modal-overlay" onClick={() => setShowCategoryModal(false)}>
            <div className="stats-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="stats-modal-header">
                <div className="stats-modal-title">Add Category</div>
                <button className="stats-modal-close" onClick={() => setShowCategoryModal(false)}>
                  <IconX />
                </button>
              </div>
              <div className="stats-modal-content">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="input"
                  style={{ marginBottom: '12px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      addCategory()
                    }
                  }}
                />
                <button onClick={addCategory} className="btn btn-primary" style={{ width: '100%' }}>
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backup Modal */}
        {showBackupModal && (
          <div className="stats-modal-overlay" onClick={() => setShowBackupModal(false)}>
            <div className="stats-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="stats-modal-header">
                <div className="stats-modal-title">Backup & Restore</div>
                <button className="stats-modal-close" onClick={() => setShowBackupModal(false)}>
                  <IconX />
                </button>
              </div>
              <div className="stats-modal-content">
                <button onClick={exportBackup} className="btn btn-primary" style={{ width: '100%', marginBottom: '8px', gap: '6px' }}>
                  <IconCloud size={16} /> Export Backup
                </button>
                <label className="btn btn-ghost" style={{ width: '100%', cursor: 'pointer', gap: '6px' }}>
                  <IconCloud size={16} /> Import Backup
                  <input
                    type="file"
                    accept=".json"
                    onChange={importBackup}
                    style={{ display: 'none' }}
                  />
                </label>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                  Backup includes all notes, favorites, and archived status.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============================================================
  //  RENDER: EDITOR VIEW
  // ============================================================

  return (
    <div style={{
      maxWidth: focusMode ? '100%' : '900px',
      margin: '0 auto',
      padding: focusMode ? '0' : '0'
    }}>
      {/* Editor Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px',
        position: focusMode ? 'fixed' : 'relative',
        top: focusMode ? 0 : 'auto',
        left: focusMode ? 0 : 'auto',
        right: focusMode ? 0 : 'auto',
        zIndex: focusMode ? 100 : 1,
        padding: focusMode ? '12px 20px' : '0',
        background: focusMode ? 'var(--bg-secondary)' : 'transparent',
        borderBottom: focusMode ? '1px solid var(--glass-border)' : 'none'
      }}>
        <button onClick={handleBack} className="btn btn-ghost" style={{ gap: '6px' }}>
          <IconBack /> <span>Back</span>
        </button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFocusMode(!focusMode)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px 10px', fontSize: '12px', gap: '4px' }}
          >
            {focusMode ? 'Exit Focus' : 'Focus'}
          </button>

          {autoSave && (
            <span className="tiny-label" style={{ color: 'var(--brand-blue)' }}>Saving...</span>
          )}
          {saveStatus && (
            <span className="tiny-label" style={{ color: 'var(--brand-blue)' }}>{saveStatus}</span>
          )}

          <button onClick={saveNote} disabled={isSaving} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <IconSave /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div style={{
        padding: focusMode ? '60px 20px 20px' : '0',
        maxWidth: focusMode ? '800px' : '100%',
        margin: '0 auto'
      }}>
        {/* Title */}
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true) }}
          placeholder="Note title..."
          className="input"
          style={{
            fontSize: '28px',
            fontWeight: 700,
            fontFamily: titleFont.includes(' ') ? `'${titleFont}', serif` : titleFont,
            marginBottom: '12px',
            border: 'none',
            padding: '8px 0',
            background: 'transparent'
          }}
        />

        {/* Category & Favorites */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={category}
            onChange={(e) => { setCategory(e.target.value); setHasUnsavedChanges(true) }}
            placeholder="Add a category"
            className="input"
            style={{ fontSize: '14px', padding: '4px 12px', width: '200px' }}
          />
          <button
            onClick={() => editingNote && toggleFavorite(editingNote.id)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 10px' }}
          >
            <IconStar size={18} filled={editingNote ? favorites.includes(editingNote.id) : false} />
          </button>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            Templates
          </button>
          {/* Font Settings */}
          <select
            value={fontFamily}
            onChange={(e) => { setFontFamily(e.target.value); setHasUnsavedChanges(true) }}
            className="select"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '11px', height: '28px' }}
          >
            {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select
            value={fontSize}
            onChange={(e) => { setFontSize(e.target.value); setHasUnsavedChanges(true) }}
            className="select"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '11px', height: '28px' }}
          >
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
          <select
            value={titleFont}
            onChange={(e) => { setTitleFont(e.target.value); setHasUnsavedChanges(true) }}
            className="select"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '11px', height: '28px' }}
          >
            {TITLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* Main Text Area */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={noteText}
            onChange={(e) => { setNoteText(e.target.value); setHasUnsavedChanges(true) }}
            placeholder="Start writing... (Supports **bold**, *italic*, [links](url), # headings)"
            className="note-textarea"
            style={{
              minHeight: focusMode ? '60vh' : '300px',
              width: '100%',
              padding: '16px',
              fontFamily: fontFamily.includes(' ') ? `'${fontFamily}', serif` : fontFamily,
              fontSize: fontSize + 'px',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-primary)',
              outline: 'none',
              resize: 'vertical',
              lineHeight: '1.8'
            }}
          />

          {/* Word Count */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            right: '12px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            background: 'var(--glass-bg)',
            padding: '2px 8px',
            borderRadius: '4px'
          }}>
            {getWordCount(noteText)} words • {getReadingTime(noteText)} min
          </div>
        </div>

        {/* ===== TOOLBAR — Only 4 buttons ===== */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          flexWrap: 'wrap',
          padding: '12px',
          background: 'var(--glass-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border)',
          justifyContent: 'center'
        }}>
          {/* Voice to Text */}
          <button
            onClick={toggleVoiceToText}
            className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 14px',
              minWidth: '70px',
              gap: '4px',
              fontSize: '11px',
              borderRadius: 'var(--radius-md)',
              background: isListening ? '#EF4444' : 'var(--gradient-primary)',
              color: '#fff',
              border: 'none'
            }}
          >
            {isListening ? <IconMicOff size={20} /> : <IconMic size={20} />}
            <span style={{ fontSize: '10px', fontWeight: 500 }}>
              {isListening ? 'Stop' : 'Voice to Text'}
            </span>
          </button>

          {/* Image to Text */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className="btn btn-ghost"
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 14px',
              minWidth: '70px',
              gap: '4px',
              fontSize: '11px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <IconImage size={20} />
            <span style={{ fontSize: '10px', fontWeight: 500 }}>Image to Text</span>
          </button>

          {/* Grammar */}
          <button
            onClick={checkGrammar}
            className="btn btn-ghost"
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 14px',
              minWidth: '70px',
              gap: '4px',
              fontSize: '11px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <IconSparkle size={20} />
            <span style={{ fontSize: '10px', fontWeight: 500 }}>Grammar</span>
          </button>

          {/* More */}
          <button
            onClick={() => setShowToolbarModal(true)}
            className="btn btn-ghost"
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              padding: '10px 14px',
              minWidth: '70px',
              gap: '4px',
              fontSize: '11px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <IconMenuDots size={20} />
            <span style={{ fontSize: '10px', fontWeight: 500 }}>More</span>
          </button>
        </div>

        {/* ===== FILE ATTACHMENTS DISPLAY ===== */}
        {fileData.length > 0 && (
          <div style={{ marginTop: '12px', padding: '12px', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>📎 Attachments</div>
            {fileData.map((file) => {
              const fileUrl = getFileDisplayUrl(file)
              const isAudio = file.type?.startsWith('audio/')
              const isImage = file.type?.startsWith('image/')
              return (
                <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '150px' }}>
                    {isImage ? (
                      <img src={fileUrl} alt={file.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : isAudio ? (
                      <audio controls src={fileUrl} style={{ width: '150px', height: '36px' }} />
                    ) : (
                      <span>📎 {file.name}</span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      Local Only
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      await deleteFileById(file.id)
                      showToast('File removed', 'success')
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ padding: '2px 6px' }}
                  >
                    <IconX size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileAttachment}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          accept="audio/*"
          ref={audioInputRef}
          onChange={handleAudioUpload}
          style={{ display: 'none' }}
        />
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleOCRImage}
          style={{ display: 'none' }}
        />

        {/* ============================================================
            CODE BLOCKS
            ============================================================ */}
        {codeBlocks.map((block) => (
          <div key={block.id} style={{
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            marginTop: '12px',
            overflow: 'hidden',
            background: 'var(--glass-bg)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderBottom: block.expanded ? '1px solid var(--glass-border)' : 'none',
              cursor: 'pointer',
              flexWrap: 'wrap'
            }} onClick={() => toggleCodeBlock(block.id)}>
              <IconCodeBlock size={14} />
              <input
                value={block.title}
                onChange={(e) => updateCodeBlock(block.id, 'title', e.target.value)}
                placeholder="Block title (optional)"
                style={{
                  flex: 1,
                  minWidth: '100px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <select
                value={block.language}
                onChange={(e) => updateCodeBlock(block.id, 'language', e.target.value)}
                style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  outline: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {CODE_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {block.expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeCodeBlock(block.id) }}
                style={{
                  padding: '2px 6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <IconX size={14} />
              </button>
            </div>

            {block.expanded && (
              <div style={{ padding: '12px' }}>
                <textarea
                  value={block.code}
                  onChange={(e) => updateCodeBlock(block.id, 'code', e.target.value)}
                  placeholder={`// ${block.language} code here...`}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px',
                    lineHeight: '1.7',
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <button
                    onClick={() => formatCodeBlock(block.id)}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', height: '28px', gap: '4px' }}
                  >
                    <IconSparkle size={14} /> Format
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(block.code)
                      showToast('Copied!', 'success')
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '11px', height: '28px', gap: '4px' }}
                  >
                    <IconCopy size={14} /> Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addCodeBlock}
          className="btn btn-ghost"
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '12px',
            border: '1px dashed var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            gap: '6px',
            color: 'var(--text-muted)'
          }}
        >
          <IconPlus /> Add Code Block
        </button>

        {/* ============================================================
            MODALS
            ============================================================ */}

        {/* Toolbar Modal */}
        {showToolbarModal && (
          <div className="stats-modal-overlay" onClick={() => setShowToolbarModal(false)}>
            <div className="stats-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="stats-modal-header">
                <div className="stats-modal-title">All Tools</div>
                <button className="stats-modal-close" onClick={() => setShowToolbarModal(false)}>
                  <IconX />
                </button>
              </div>
              <div className="stats-modal-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button onClick={insertBold} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconBold size={20} /> Bold
                </button>
                <button onClick={insertItalic} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconItalic size={20} /> Italic
                </button>
                <button onClick={insertLink} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconLink size={20} /> Link
                </button>
                <button onClick={insertH1} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconH1 size={20} /> Heading 1
                </button>
                <button onClick={insertH2} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconH2 size={20} /> Heading 2
                </button>
                <button onClick={insertH3} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconH3 size={20} /> Heading 3
                </button>
                <button onClick={addCodeBlock} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconCodeBlock size={20} /> Code Block
                </button>
                <button onClick={() => audioInputRef.current?.click()} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconMic size={20} /> Add Audio
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconAttach size={20} /> Attach
                </button>
                <button onClick={() => setShowTemplateModal(true)} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconCopy size={20} /> Templates
                </button>
                <button onClick={() => setShowTranslationModal(true)} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconTranslate size={20} /> Translate
                </button>
                <button onClick={() => setFocusMode(!focusMode)} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  {focusMode ? <IconX size={20} /> : <IconRefresh size={20} />}
                  {focusMode ? 'Exit Focus' : 'Focus'}
                </button>
                <button onClick={() => {
                  exportNoteAsMarkdown({ title: title || 'Untitled', content: noteText })
                  setShowToolbarModal(false)
                }} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconSave size={20} /> Export MD
                </button>
                <button onClick={() => setShowHelpModal(true)} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconHelp size={20} /> Help
                </button>
                <button onClick={() => setShowToolbarModal(false)} className="btn btn-ghost" style={{ flexDirection: 'column', padding: '12px', fontSize: '12px', gap: '4px' }}>
                  <IconX size={20} /> Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== LINK MODAL ===== */}
        {showLinkModal && (
          <div className="stats-modal-overlay" onClick={() => setShowLinkModal(false)}>
            <div className="stats-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
              <div className="stats-modal-header">
                <div className="stats-modal-title">Insert Link</div>
                <button className="stats-modal-close" onClick={() => setShowLinkModal(false)}>
                  <IconX />
                </button>
              </div>
              <div className="stats-modal-content">
                <div style={{ marginBottom: '12px' }}>
                  <div className="tiny-label" style={{ marginBottom: '4px' }}>Text</div>
                  <input
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Link text..."
                    className="input"
                    style={{ fontSize: '14px' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div className="tiny-label" style={{ marginBottom: '4px' }}>URL</div>
                  <input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="input"
                    style={{ fontSize: '14px' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && linkUrl.trim()) {
                        handleLinkInsert()
                      }
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleLinkInsert} className="btn btn-primary" style={{ flex: 1 }}>
                    Insert Link
                  </button>
                  <button onClick={() => setShowLinkModal(false)} className="btn btn-ghost">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Translation Modal */}
        {showTranslationModal && (
          <div className="stats-modal-overlay" onClick={() => setShowTranslationModal(false)}>
            <div className="stats-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="stats-modal-header">
                <div className="stats-modal-title">Translate Note</div>
                <button className="stats-modal-close" onClick={() => setShowTranslationModal(false)}>
                  <IconX />
                </button>
              </div>
              <div className="stats-modal-content">
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="select"
                    style={{ flex: 1 }}
                  >
                    {ALL_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                  <button onClick={handleTranslate} disabled={translating} className="btn btn-primary">
                    {translating ? 'Translating...' : 'Translate'}
                  </button>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div className="tiny-label" style={{ marginBottom: '4px' }}>Original</div>
                  <div style={{
                    padding: '12px',
                    background: 'var(--glass-bg)',
                    borderRadius: 'var(--radius-lg)',
                    maxHeight: '150px',
                    overflow: 'auto',
                    fontSize: '14px'
                  }}>
                    {noteText || 'Nothing to translate'}
                  </div>
                </div>

                {translatedText && (
                  <div style={{ marginBottom: '12px' }}>
                    <div className="tiny-label" style={{ marginBottom: '4px' }}>Translation</div>
                    <div style={{
                      padding: '12px',
                      background: 'var(--glass-bg)',
                      borderRadius: 'var(--radius-lg)',
                      maxHeight: '150px',
                      overflow: 'auto',
                      fontSize: '14px'
                    }}>
                      {translatedText}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={insertTranslation} className="btn btn-primary btn-sm">Insert Below</button>
                      <button onClick={replaceWithTranslation} className="btn btn-ghost btn-sm">Replace</button>
                      <button onClick={copyTranslation} className="btn btn-ghost btn-sm">Copy</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplateModal && (
          <div className="stats-modal-overlay" onClick={() => setShowTemplateModal(false)}>
            <div className="stats-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="stats-modal-header">
                <div className="stats-modal-title">Templates</div>
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
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Help Modal */}
        {showHelpModal && (
          <div className="stats-modal-overlay" onClick={() => setShowHelpModal(false)}>
            <div className="stats-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div className="stats-modal-header">
                <div className="stats-modal-title">Help & Guide</div>
                <button className="stats-modal-close" onClick={() => setShowHelpModal(false)}>
                  <IconX />
                </button>
              </div>
              <div className="stats-modal-content" style={{ maxHeight: '60vh', overflow: 'auto' }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Getting Started</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    • Tap + New to create a note<br />
                    • Tap any note card to edit it<br />
                    • Auto-saves drafts every 5 seconds<br />
                    • Tap Save to store permanently
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Writing Tools</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    • Bold, Italic, Link, Headings (H1, H2, H3)<br />
                    • Code Blocks with syntax highlighting<br />
                    • Format and copy code
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Media & Input</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    • Voice to Text – Speak and it types (Chrome/Edge only)<br />
                    • Add Audio – Upload or record audio (saved locally)<br />
                    • Image to Text – Extract text from images (image discarded)<br />
                    • Attach File – Upload any file (saved locally)
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Storage Notes</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    • Text content is stored in the cloud (Supabase)<br />
                    • Audio files and attachments are stored locally (IndexedDB)<br />
                    • Local files will NOT sync to other devices<br />
                    • Export your notes regularly to back up local files
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Organize</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    • Categories – Group notes by topic<br />
                    • Favorites (⭐) – Star important notes<br />
                    • Archive (📦) – Hide notes without deleting<br />
                    • Search – Find notes by title or content<br />
                    • Fuzzy Search – Find notes even with typos
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Mobile Gestures</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    • Swipe Left on a note → Delete<br />
                    • Swipe Right on a note → Favorite<br />
                    • Long Press on a note → Select multiple<br />
                    • Pull Down → Refresh notes list
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Keyboard Shortcuts</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    • Ctrl+S – Save note<br />
                    • Ctrl+B – Bold selected text<br />
                    • Ctrl+I – Italic selected text<br />
                    • Ctrl+K – Insert link<br />
                    • Esc – Close modal / Exit focus
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}