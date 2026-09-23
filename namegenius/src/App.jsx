import { useEffect, useState } from 'react'
import Brief from './Brief'
import Results from './Results'
import { Shortlist, Compare, Questions } from './Screens'
import { QUESTIONS } from './data'

const EMPTY_BRIEF = { name: '', description: '', competitors: '', tld: '.com' }
const REGENS_BEFORE_QUESTION = 3

export function playWaterClickSound() {
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext
    if (!AudioCtxClass) return
    const ctx = new AudioCtxClass()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // Crisp bubble pop pitch swoop (bloop!)
    osc.frequency.setValueAtTime(450, now)
    osc.frequency.exponentialRampToValueAtTime(1050, now + 0.02)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.032)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.035)
  } catch {
    // Fail silently if AudioContext is not initialized
  }
}

function App() {
  const [view, setView] = useState('brief')
  const [history, setHistory] = useState([])

  useEffect(() => {
    const handleGlobalClick = (e) => {
      const target = e.target.closest('button, input, select, a, [role="button"], label')
      if (target) {
        playWaterClickSound()
      }
    }
    window.addEventListener('click', handleGlobalClick, true)
    return () => window.removeEventListener('click', handleGlobalClick, true)
  }, [])

  // Automatic scroll-to-top whenever the navigation view changes.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [view])

  const SHORTLIST_STORAGE_KEY = 'namegenius_shortlist'

  // Shared, app-wide state so every screen works off the same data.
  const [brief, setBrief] = useState(EMPTY_BRIEF)
  const [saved, setSaved] = useState(() => {
    try {
      const raw = localStorage.getItem(SHORTLIST_STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }) // name items on the shortlist (persisted across refresh)
  const [compareSel, setCompareSel] = useState([]) // up to 2 name items
  const [answers, setAnswers] = useState({}) // brand-discovery answers by index
  const [generation, setGeneration] = useState(0) // bump to reshuffle results
  const [regenCount, setRegenCount] = useState(0) // regens since last question
  const [pendingQuestion, setPendingQuestion] = useState(null) // index or null

  useEffect(() => {
    try {
      localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // Fail silently if storage is unavailable
    }
  }, [saved])

  // History-aware navigation: Back always returns to the previous screen.
  const navigate = (next) => {
    setHistory((h) => [...h, view])
    setView(next)
  }
  const back = () => {
    setHistory((h) => {
      if (h.length === 0) {
        setView('brief')
        return h
      }
      const copy = h.slice()
      const prev = copy.pop()
      setView(prev)
      return copy
    })
  }

  const startSearch = (values) => {
    setBrief(values)
    setGeneration(0)
    setRegenCount(0)
    setPendingQuestion(null)
    navigate('results')
  }

  const firstUnanswered = () =>
    QUESTIONS.findIndex((_, i) => !(answers[i] || '').trim())

  const regenerate = () => {
    if (pendingQuestion !== null) return // resolve the follow-up first
    setGeneration((g) => g + 1)
    const next = regenCount + 1
    const q = firstUnanswered()
    if (next >= REGENS_BEFORE_QUESTION && q !== -1) {
      setPendingQuestion(q)
      setRegenCount(0)
    } else {
      setRegenCount(next)
    }
  }

  const answerFollowUp = (value) => {
    if (pendingQuestion === null) return
    setAnswers((a) => ({ ...a, [pendingQuestion]: value }))
    setPendingQuestion(null)
    setRegenCount(0)
    setGeneration((g) => g + 1) // regenerate, now shaped by the answer
  }

  const skipFollowUp = () => {
    setPendingQuestion(null)
    setRegenCount(0)
  }

  const toggleSaved = (item) =>
    setSaved((list) =>
      list.some((s) => s.slug === item.slug)
        ? list.filter((s) => s.slug !== item.slug)
        : [...list, item]
    )

  const toggleCompare = (item) =>
    setCompareSel((sel) => {
      if (sel.some((s) => s.slug === item.slug)) {
        return sel.filter((s) => s.slug !== item.slug)
      }
      if (sel.length < 2) return [...sel, item]
      return [sel[1], item] // keep it to two: drop the oldest
    })

  switch (view) {
    case 'results':
      return (
        <Results
          brief={brief}
          answers={answers}
          saved={saved}
          compareSel={compareSel}
          generation={generation}
          pendingQuestion={pendingQuestion}
          onRegenerate={regenerate}
          onAnswerFollowUp={answerFollowUp}
          onSkipFollowUp={skipFollowUp}
          onToggleSaved={toggleSaved}
          onToggleCompare={toggleCompare}
          onNewSearch={() => navigate('brief')}
          onNavigate={navigate}
        />
      )
    case 'shortlist':
      return (
        <Shortlist
          saved={saved}
          onRemove={toggleSaved}
          onBack={back}
          onNavigate={navigate}
        />
      )
    case 'compare':
      return (
        <Compare
          compareSel={compareSel}
          onClear={() => setCompareSel([])}
          onBack={back}
          onNavigate={navigate}
        />
      )
    case 'questions':
      return <Questions answers={answers} onSave={setAnswers} onBack={back} />
    case 'brief':
    default:
      return (
        <Brief
          initial={brief}
          savedCount={saved.length}
          onFindNames={startSearch}
          onQuestions={() => navigate('questions')}
          onNavigate={navigate}
        />
      )
  }
}

export default App
