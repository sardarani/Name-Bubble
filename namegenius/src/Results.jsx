import { useEffect, useState } from 'react'
import { QUESTIONS, availableTlds, domainFor, isAvailable, matchesLength, matchesTld } from './data'
import { generateNames, generateNamesAsync } from './generator'

const TLD_FILTERS = ['any TLD', '.com', '.io', '.co']
const LENGTH_FILTERS = ['any', 'short', 'catchy']
const PAGE_SIZE = 5

const CARD_THEMES = [
  { bg: 'bg-[#fff9f6]', border: 'border-[#ffe2d6]', headerBg: 'bg-[#fff0e6]', badgeText: 'text-[#d95d1e]', pinBg: 'bg-[#f97316]' },
  { bg: 'bg-[#f6f9ff]', border: 'border-[#d6e4ff]', headerBg: 'bg-[#e8f0ff]', badgeText: 'text-[#2563eb]', pinBg: 'bg-[#3b82f6]' },
  { bg: 'bg-[#faf6ff]', border: 'border-[#ebd6ff]', headerBg: 'bg-[#f3e6ff]', badgeText: 'text-[#8b5cf6]', pinBg: 'bg-[#a855f7]' },
  { bg: 'bg-[#f6fcf8]', border: 'border-[#d2f3dc]', headerBg: 'bg-[#e4f7eb]', badgeText: 'text-[#16a34a]', pinBg: 'bg-[#22c55e]' },
  { bg: 'bg-[#fff6f8]', border: 'border-[#ffd6e0]', headerBg: 'bg-[#ffe4ea]', badgeText: 'text-[#e11d48]', pinBg: 'bg-[#f43f5e]' },
]

function Results({
  brief,
  answers,
  saved,
  compareSel,
  generation,
  pendingQuestion,
  onRegenerate,
  onAnswerFollowUp,
  onSkipFollowUp,
  onToggleSaved,
  onToggleCompare,
  onNewSearch,
  onNavigate,
}) {
  const [tldFilter, setTldFilter] = useState('any TLD')
  const [lengthFilter, setLengthFilter] = useState('any')
  const [items, setItems] = useState(() => (brief?.name?.trim() ? generateNames(brief, generation, answers) : []))
  const [isLiveLoading, setIsLiveLoading] = useState(false)
  const [errorState, setErrorState] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const hasQuery = Boolean(brief?.name?.trim())

  useEffect(() => {
    let active = true
    setErrorState(null)

    // Situation 1: Nothing typed in yet - results stay empty, zero background requests executed
    if (!hasQuery) {
      setItems([])
      setIsLiveLoading(false)
      return
    }

    // Situation 2 & 4: Search or single-field input in progress
    setIsLiveLoading(true)

    // Render initial instant candidate pool for zero-delay UX
    setItems(generateNames(brief, generation, answers))

    // Fetch real Gemini ideas + live RDAP/DNS domain availability
    generateNamesAsync(brief, generation, answers)
      .then((liveItems) => {
        if (active && liveItems && liveItems.length > 0) {
          setItems(liveItems)
          setErrorState(null)
        }
      })
      .catch((err) => {
        // Situation 3: Something goes wrong - capture error, offer retry, never crash
        if (active) {
          console.warn('Failed async name generation:', err)
          setErrorState(err.message || 'Unable to connect to live domain services.')
        }
      })
      .finally(() => {
        if (active) {
          setIsLiveLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [brief, generation, answers, retryCount, hasQuery])

  const handleRetry = () => {
    setErrorState(null)
    setRetryCount((c) => c + 1)
  }

  const filtered = items.filter(
    (i) => matchesTld(i, tldFilter) && matchesLength(i, lengthFilter)
  )
  const shown = filtered.slice(0, PAGE_SIZE)
  // Strongest first: the name available on the most TLDs leads as the top pick.
  const sorted = [...shown].sort(
    (a, b) => availableTlds(b).length - availableTlds(a).length
  )
  const topPick = sorted[0]
  const rest = sorted.slice(1)

  const isSaved = (item) => saved.some((s) => s.slug === item.slug)
  const isComparing = (item) => compareSel.some((s) => s.slug === item.slug)
  const canCompare = compareSel.length === 2

  return (
    <div className="min-h-screen bg-[#f8f6f9] text-[#1d1b20]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8 sm:px-12">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-extrabold tracking-tight text-[#1d1b20]">Domain bubble</div>
          {onNavigate && saved?.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('shortlist')}
              className="inline-flex items-center gap-2 rounded-full border border-[#ffe2d6] bg-[#fff0e6] px-4 py-1.5 text-[13px] font-semibold text-[#d95d1e] shadow-sm transition-all hover:bg-[#ffe2d6] active:scale-[0.98]"
            >
              <span className="text-[14px]">♥</span> Favorites
              <span className="rounded-full bg-[#d95d1e] px-2 py-0.5 text-[10px] font-extrabold leading-none text-white">
                {saved.length}
              </span>
            </button>
          )}
        </div>

        {/* back + hero header */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={onNewSearch}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#cac4d0] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#1d1b20] shadow-sm transition-all hover:bg-[#fef7ff]"
            >
              ← New search
            </button>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span className="text-[12px] font-semibold uppercase leading-none tracking-[0.05em] text-[#8a8a8a]">
                Ideas for
              </span>
              <h1 className="font-serif text-[48px] sm:text-[64px] font-normal leading-[0.95] tracking-[-0.02em] text-[#1d1b20]">
                {brief?.name || 'your idea'}
              </h1>
            </div>
          </div>
        </div>

        {/* Situation 1: Nothing typed in yet */}
        {!hasQuery ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[#ffe2d6] bg-[#fff9f6] p-12 text-center shadow-sm">
            <span className="text-[40px]">⚡︎</span>
            <h2 className="mt-3 text-[24px] font-extrabold tracking-tight text-[#1d1b20]">
              Nothing typed in yet
            </h2>
            <p className="mt-2 max-w-[440px] text-[15px] font-normal leading-[1.5] text-[#8a8a8a]">
              Type a name or keyword on the search screen to find live Gemini AI ideas and domain availability. No requests are sent until you search.
            </p>
            <button
              type="button"
              onClick={onNewSearch}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1d1b20] px-7 py-3 text-[14px] font-extrabold text-white shadow-md transition-all hover:bg-[#333]"
            >
              ← Start a search
            </button>
          </div>
        ) : (
          <>
            {/* Situation 3: Error & Retry Alert Banner */}
            {errorState && (
              <div role="alert" className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#1d1b20] bg-[#1d1b20] p-7 text-[#fef7ff] shadow-md">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#ffe2d6]">
                    Connection Status
                  </div>
                  <h3 className="mt-1 text-[18px] font-bold text-white">
                    {errorState}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-[#cac4d0]">
                    Showing local name candidates. Click retry to attempt live Gemini & domain lookups again.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 rounded-full bg-[#fef7ff] px-6 py-2.5 text-[14px] font-extrabold text-[#1d1b20] transition-all hover:bg-[#cac4d0]"
                >
                  <RegenerateIcon /> Retry Search
                </button>
              </div>
            )}

            {/* follow-up question band (after 3 regenerations) */}
            {pendingQuestion !== null ? (
              <FollowUpBand
                question={QUESTIONS[pendingQuestion]}
                onSubmit={onAnswerFollowUp}
                onSkip={onSkipFollowUp}
              />
            ) : (
              <>
                {/* Situation 2: Top selection filter bar showing screen-wide request in progress indicator */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-full border border-[#ffe2d6] bg-[#fff9f6] px-7 py-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <FilterTabs
                      label="TLD"
                      options={TLD_FILTERS}
                      value={tldFilter}
                      onChange={setTldFilter}
                      short={{ 'any TLD': 'any' }}
                      monoFor={['.com', '.io', '.co']}
                    />
                    <div className="hidden h-5 w-px bg-[#ffe2d6] sm:block" />
                    <FilterTabs
                      label="Length"
                      options={LENGTH_FILTERS}
                      value={lengthFilter}
                      onChange={setLengthFilter}
                    />
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ffe2d6] bg-white px-4 py-1.5 text-[12px] font-semibold text-[#1d1b20] shadow-sm">
                    <span className={`size-2 rounded-full ${isLiveLoading ? 'bg-[#2563eb] animate-pulse' : 'bg-[#16a34a]'}`} />
                    {isLiveLoading ? 'Checking live availability…' : `${filtered.length} names available`}
                  </div>
                </div>

                {shown.length === 0 ? (
                  <div className="mt-8 rounded-[24px] border border-dashed border-[#cac4d0] bg-[#fef7ff] py-24 text-center text-[17px] text-[#8a8a8a]">
                    No names match this filter. Try “any” length or Regenerate.
                  </div>
                ) : (
                  <div className="relative mt-8">
                    {/* Dashed Guideline connecting cards */}
                    <div className="absolute inset-y-0 left-1/2 hidden -translate-x-1/2 border-l-2 border-dashed border-[#dcdad8] sm:block" />

                    <div className="relative flex flex-col gap-8">
                      {/* 1. Inline Card Control: Dedicated Regenerate Button Bar on Top */}
                      <div className="relative z-10 mx-auto w-full max-w-[680px]">
                        <div className="flex flex-wrap items-center justify-between gap-4 rounded-full border border-[#cac4d0] bg-white px-7 py-3.5 shadow-md transition-all hover:border-[#1d1b20]">
                          <div className="flex items-center gap-3">
                            <span className={`size-2.5 rounded-full ${isLiveLoading ? 'bg-[#2563eb] animate-pulse' : 'bg-[#1d1b20]'}`} />
                            <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#1d1b20]">
                              {isLiveLoading ? 'Fetching Live AI Ideas' : 'Generate Fresh Ideas'}
                            </span>
                            <span className="hidden text-[12px] font-semibold text-[#8a8a8a] sm:inline">
                              — {isLiveLoading ? 'Gemini 1.5 + Real RDAP lookups' : 'Reshuffle batch algorithm'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={onRegenerate}
                            disabled={pendingQuestion !== null || isLiveLoading}
                            className={
                              'flex items-center gap-2.5 rounded-full px-6 py-2 text-[14px] font-extrabold text-[#fef7ff] transition-all ' +
                              (isLiveLoading || pendingQuestion !== null
                                ? 'cursor-not-allowed bg-[#8a8a8a]'
                                : 'bg-[#1d1b20] hover:bg-[#333] active:scale-[0.98]')
                            }
                          >
                            <RegenerateIcon />
                            {isLiveLoading ? 'Generating…' : 'Regenerate'}
                          </button>
                        </div>
                      </div>

                      {/* 2. Skale Pinned Top Pick Card (Index 01) */}
                      {topPick && (
                        <SkaleCard
                          key={`top-${topPick.slug}-${generation}-${tldFilter}`}
                          item={topPick}
                          index={1}
                          tldFilter={tldFilter}
                          isSaved={isSaved(topPick)}
                          isComparing={isComparing(topPick)}
                          onToggleSaved={() => onToggleSaved(topPick)}
                          onToggleCompare={() => onToggleCompare(topPick)}
                          isTopPick
                          isLiveLoading={isLiveLoading}
                        />
                      )}

                      {/* 3. Skale Staggered Note Deck Rows (Index 02 to 05) */}
                      {rest.map((item, i) => (
                        <SkaleCard
                          key={`row-${item.slug}-${generation}-${tldFilter}-${i}`}
                          item={item}
                          index={i + 2}
                          tldFilter={tldFilter}
                          isSaved={isSaved(item)}
                          isComparing={isComparing(item)}
                          onToggleSaved={() => onToggleSaved(item)}
                          onToggleCompare={() => onToggleCompare(item)}
                          isLiveLoading={isLiveLoading}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* compare action bar */}
        {compareSel.length > 0 && pendingQuestion === null && (
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-full border border-[#1d1b20] bg-[#1d1b20] px-8 py-4 text-[#fef7ff] shadow-md">
            <span className="text-[15px] font-semibold">
              {compareSel.length === 1
                ? 'Select one more name to compare.'
                : 'Two names selected.'}
            </span>
            <button
              type="button"
              disabled={!canCompare}
              onClick={() => onNavigate('compare')}
              className={
                'rounded-full px-6 py-2.5 text-[14px] font-extrabold transition-colors ' +
                (canCompare
                  ? 'bg-[#fef7ff] text-[#1d1b20] hover:bg-[#cac4d0]'
                  : 'cursor-not-allowed bg-[#8a8a8a] text-white')
              }
            >
              Compare selected
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function SkaleCard({
  item,
  name: propName,
  domain: propDomain,
  available: propAvailable,
  tlds: propTlds,
  index = 1,
  tldFilter = 'any TLD',
  isSaved = false,
  onToggleSaved = () => {},
  isComparing = false,
  onToggleCompare = () => {},
  isTopPick = false,
  isLiveLoading = false,
}) {
  const cardName = propName || item?.name || ''
  const cardDomain = propDomain || (item ? domainFor(item, tldFilter) : '')
  const isCardAvailable = propAvailable !== undefined ? propAvailable : (item ? isAvailable(item, tldFilter) : true)

  const theme = CARD_THEMES[(index - 1) % CARD_THEMES.length]
  const formattedIndex = String(index).padStart(2, '0')
  const isEven = index % 2 === 0
  const staggerDelay = (index - 1) * 150

  useEffect(() => {
    const timer = setTimeout(() => {
      playBubblePopSound(index)
    }, staggerDelay)
    return () => clearTimeout(timer)
  }, [index, staggerDelay])

  return (
    <div
      style={{ animationDelay: `${staggerDelay}ms` }}
      className={
        'relative z-10 w-full animate-card-pop opacity-0 transition-all sm:max-w-[680px] ' +
        (isTopPick
          ? 'mx-auto'
          : isEven
            ? 'mx-auto sm:ml-auto sm:mr-4 sm:translate-x-4'
            : 'mx-auto sm:ml-4 sm:mr-auto sm:-translate-x-4')
      }
    >
      {/* Top Pushpin Accent Dot */}
      <div className="absolute -top-3.5 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center">
        <span className={`size-4 rounded-full ${theme.pinBg} border-2 border-white shadow-md`} />
      </div>

      {/* Note Card Body */}
      <div className={`overflow-hidden rounded-[24px] border ${theme.border} ${theme.bg} shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_18px_45px_rgba(0,0,0,0.1)]`}>
        {/* Soft Pastel Header Strip */}
        <div className={`${theme.headerBg} flex items-center justify-between px-7 py-3.5`}>
          <span className={`font-mono text-[22px] font-bold tracking-tight ${theme.badgeText}`}>
            {formattedIndex}
          </span>
          {isTopPick && (
            <span className="rounded-full bg-[#1d1b20] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-sm">
              ★ TOP PICK
            </span>
          )}
        </div>

        {/* Card Content Row */}
        <div className="flex flex-wrap items-center justify-between gap-6 px-8 py-6">
          <div>
            <h3 className="text-[20px] font-semibold leading-[1.2] text-[#1d1b20]">
              {cardName}
            </h3>
            <p className="mt-1.5 font-mono text-[15px] font-semibold text-[#8a8a8a]">
              {cardDomain}
            </p>
          </div>

          <div className="flex items-center gap-5">
            <StatusTag available={isCardAvailable} checking={isLiveLoading} />
            <Actions
              domain={cardDomain}
              isSaved={isSaved}
              onToggleSaved={onToggleSaved}
              isComparing={isComparing}
              onToggleCompare={onToggleCompare}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function FollowUpBand({ question, onSubmit, onSkip }) {
  const [value, setValue] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit(value.trim())
  }
  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-4 rounded-[24px] border border-[#cac4d0] bg-[#fef7ff] p-8 shadow-sm">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8a8a8a]">
        One quick question to sharpen results
      </div>
      <h2 className="text-[24px] font-extrabold tracking-[-0.02em] text-[#1d1b20]">{question}</h2>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your answer"
          className="h-[56px] flex-1 rounded-full border border-[#cac4d0] bg-white px-6 text-[16px] font-semibold text-[#1d1b20] outline-none transition-all placeholder:font-normal placeholder:text-[#8a8a8a] focus:border-[#1d1b20] focus:ring-2 focus:ring-[#1d1b20]"
        />
        <button
          type="submit"
          className="h-[56px] rounded-full bg-[#1d1b20] px-8 text-[15px] font-extrabold text-[#fef7ff] transition-all hover:bg-[#333]"
        >
          Refine names
        </button>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-1 self-start text-[14px] font-semibold text-[#8a8a8a] underline decoration-[#cac4d0] underline-offset-4 transition-colors hover:text-[#1d1b20]"
      >
        Skip for now
      </button>
    </form>
  )
}

function FilterTabs({ label, options, value, onChange, short = {}, monoFor = [] }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full border border-[#ffe2d6] bg-[#fff0e6] px-2.5 py-1 text-[11px] font-semibold uppercase leading-none tracking-[0.08em] text-[#d95d1e]">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {options.map((option) => {
          const active = value === option
          const isMono = monoFor.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={active}
              className={
                'rounded-full px-3.5 py-1.5 text-[13px] font-semibold leading-none transition-all ' +
                (isMono ? 'font-mono ' : '') +
                (active
                  ? 'bg-[#1d1b20] text-white shadow-sm ring-1 ring-[#1d1b20]'
                  : 'border border-[#ffe2d6] bg-white text-[#8a8a8a] hover:border-[#1d1b20] hover:text-[#1d1b20]')
              }
            >
              {short[option] || option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StatusTag({ available, checking }) {
  if (checking || available === 'checking') {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[#2563eb]/60 bg-[#eff6ff] px-4 py-1.5 text-[11px] font-semibold tracking-[0.05em] text-[#1d4ed8]">
        <span className="size-2 rounded-full bg-[#2563eb] animate-pulse" />
        CHECKING...
      </div>
    )
  }
  return available ? (
    <div className="flex items-center gap-2 rounded-full border border-[#16a34a]/60 bg-[#f0fdf4] px-4 py-1.5 text-[11px] font-semibold tracking-[0.05em] text-[#15803d]">
      <span className="size-2 rounded-full bg-[#16a34a]" />
      AVAILABLE
    </div>
  ) : (
    <div className="flex items-center gap-2 rounded-full border border-[#cac4d0] bg-transparent px-4 py-1.5 text-[11px] font-semibold tracking-[0.05em] text-[#8a8a8a]">
      <span className="size-2 rounded-full bg-[#8a8a8a]" />
      TAKEN
    </div>
  )
}

function useCopy(domain) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(domain)
    } catch {
      // Clipboard may be unavailable (insecure context) — fail silently.
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }
  return [copied, copy]
}

function Actions({ domain, isSaved, onToggleSaved, isComparing, onToggleCompare }) {
  const [copied, copy] = useCopy(domain)
  return (
    <div className="flex items-center gap-2 text-[#8a8a8a]">
      <div className="relative flex flex-col items-center">
        <IconBtn label="Copy domain" onClick={copy}>
          <CopyIcon />
        </IconBtn>
        {copied && (
          <span className="pointer-events-none absolute top-full left-1/2 z-30 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1d1b20] px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
            Copied!
          </span>
        )}
      </div>
      <IconBtn
        label={isSaved ? 'Remove from shortlist' : 'Save to shortlist'}
        active={isSaved}
        onClick={onToggleSaved}
      >
        <HeartIcon filled={isSaved} />
      </IconBtn>
      {onToggleCompare && (
        <IconBtn
          label={isComparing ? 'Remove from comparison' : 'Add to compare'}
          active={isComparing}
          onClick={onToggleCompare}
        >
          <CompareIcon active={isComparing} />
        </IconBtn>
      )}
    </div>
  )
}

function IconBtn({ label, children, onClick, active, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={
        'rounded-full p-2 transition-colors ' +
        (disabled
          ? 'cursor-not-allowed opacity-40'
          : active
            ? 'bg-[#1d1b20] text-[#fef7ff]'
            : 'hover:bg-[#cac4d0]/40 hover:text-[#1d1b20]')
      }
    >
      {children}
    </button>
  )
}

const iconProps = {
  width: 19,
  height: 19,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function CopyIcon() {
  return (
    <svg {...iconProps}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg {...iconProps} fill={filled ? 'currentColor' : 'none'}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

function CompareIcon({ active }) {
  return (
    <svg {...iconProps} fill={active ? 'currentColor' : 'none'}>
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}

function RegenerateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  )
}

function playBubblePopSound(index = 1) {
  try {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext
    if (!AudioCtxClass) return
    const ctx = new AudioCtxClass()
    const now = ctx.currentTime

    // Authentic bubble pop sound pitch sweep (bloop!)
    const baseFreq = 420 + (index - 1) * 65
    const peakFreq = baseFreq + 580

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(baseFreq, now)
    osc.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.022)

    gain.gain.setValueAtTime(0.16, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.04)
  } catch {
    // Fail silently if AudioContext is not initialized
  }
}

export default Results
