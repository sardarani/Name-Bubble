import { useState } from 'react'
import { QUESTIONS, availableTlds, domainFor, styleLabel } from './data'
import { FloatingBubblesBackground } from './Brief'

const CARD_THEMES = [
  { bg: 'bg-[#fff9f6]', border: 'border-[#ffe2d6]', headerBg: 'bg-[#fff0e6]', badgeText: 'text-[#d95d1e]', pinBg: 'bg-[#f97316]' },
  { bg: 'bg-[#f6f9ff]', border: 'border-[#d6e4ff]', headerBg: 'bg-[#e8f0ff]', badgeText: 'text-[#2563eb]', pinBg: 'bg-[#3b82f6]' },
  { bg: 'bg-[#faf6ff]', border: 'border-[#ebd6ff]', headerBg: 'bg-[#f3e6ff]', badgeText: 'text-[#8b5cf6]', pinBg: 'bg-[#a855f7]' },
  { bg: 'bg-[#f6fcf8]', border: 'border-[#d2f3dc]', headerBg: 'bg-[#e4f7eb]', badgeText: 'text-[#16a34a]', pinBg: 'bg-[#22c55e]' },
  { bg: 'bg-[#fff6f8]', border: 'border-[#ffd6e0]', headerBg: 'bg-[#ffe4ea]', badgeText: 'text-[#e11d48]', pinBg: 'bg-[#f43f5e]' },
]

// Shared shell: back link + heading.
function Shell({ title, meta, badge, onBack, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f6f9] text-[#1d1b20]">
      <FloatingBubblesBackground />
      <div className="relative z-10 mx-auto w-full max-w-[1000px] px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="text-lg font-extrabold tracking-tight text-[#1d1b20]">Domain bubble</div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#cac4d0] bg-white px-4 py-1.5 text-[13px] font-semibold text-[#1d1b20] shadow-sm transition-all hover:bg-[#fef7ff]"
          >
            ← Back
          </button>
        </div>
        {badge && (
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#cac4d0] bg-[#fef7ff] px-4 py-1.5 text-[12px] font-semibold leading-none tracking-[0.05em] text-[#1d1b20]">
            <span className="size-2 rounded-full bg-[#1d1b20]" />
            {badge}
          </div>
        )}
        <div className={`${badge ? 'mt-4' : 'mt-10'} flex flex-wrap items-baseline gap-5`}>
          <h1 className="font-serif text-[48px] font-normal leading-[0.95] tracking-[-0.02em] text-[#1d1b20] sm:text-[64px]">
            {title}
          </h1>
          {meta && (
            <span className="text-[12px] font-semibold uppercase leading-none tracking-[0.05em] text-[#8a8a8a]">
              {meta}
            </span>
          )}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

function PrimaryButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-[#1d1b20] px-7 py-3 text-[15px] font-semibold text-[#fef7ff] shadow-md transition-all hover:bg-[#333] active:scale-[0.99]"
    >
      {children}
    </button>
  )
}

function TldStrip({ item }) {
  return (
    <div className="flex items-center gap-3.5 font-mono text-[13px]">
      {['.com', '.io', '.co'].map((t) =>
        item.tlds[t] ? (
          <span key={t} className="font-bold text-[#1d1b20]">
            {t}
          </span>
        ) : (
          <span key={t} className="text-[#8a8a8a] line-through">
            {t}
          </span>
        )
      )}
    </div>
  )
}

// S4 — Favorites / Shortlist
export function Shortlist({ saved, onRemove, onBack, onNavigate }) {
  return (
    <Shell
      title="Favorites"
      meta={saved.length > 0 ? `${saved.length} ${saved.length === 1 ? 'favorite' : 'favorites'}` : null}
      onBack={onBack}
    >
      {saved.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#cac4d0] bg-[#fef7ff] py-24 text-center">
          <p className="text-[18px] font-semibold leading-[1.4] text-[#1d1b20]">No favorite names saved yet.</p>
          <p className="mt-2 text-[14px] font-normal leading-[1.5] text-[#8a8a8a]">
            Click the heart button on any domain card to save your favorite names here.
          </p>
          <div className="mt-6">
            <PrimaryButton onClick={() => onNavigate('results')}>
              Browse results
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {saved.map((item, i) => {
            const theme = CARD_THEMES[i % CARD_THEMES.length]
            const domainStr = domainFor(item, 'any TLD')
            return (
              <div
                key={item.slug}
                className={`overflow-hidden rounded-[24px] border ${theme.border} ${theme.bg} p-6 shadow-sm transition-all hover:shadow-md`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-baseline gap-5">
                    <span className="text-[24px] font-semibold text-[#1d1b20]">
                      {item.name}
                    </span>
                    <span className="font-mono text-[15px] font-semibold text-[#8a8a8a]">
                      {domainStr}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <TldStrip item={item} />
                    <button
                      type="button"
                      aria-label={`Remove ${item.name} from favorites`}
                      title="Remove from favorites"
                      onClick={() => onRemove(item)}
                      className="flex size-8 items-center justify-center rounded-full bg-[#1d1b20] text-[16px] leading-none text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          <div className="mt-4 flex items-center gap-6">
            <button
              type="button"
              onClick={() => onNavigate('results')}
              className="text-[14px] font-semibold text-[#8a8a8a] underline decoration-[#cac4d0] underline-offset-4 transition-colors hover:text-[#1d1b20]"
            >
              Back to results
            </button>
          </div>
        </div>
      )}
    </Shell>
  )
}

// S5 — Compare
export function Compare({ compareSel, onClear, onBack, onNavigate }) {
  const rows = [
    {
      label: 'Available TLDs',
      get: (i) => {
        const t = availableTlds(i)
        return t.length ? t.join('  ') : 'none'
      },
      mono: true,
    },
    { label: 'Length', get: (i) => `${i.slug.length} characters` },
    { label: 'Style', get: (i) => styleLabel(i) },
  ]

  if (compareSel.length === 0) {
    return (
      <Shell title="Compare" onBack={onBack}>
        <div className="rounded-[24px] border border-dashed border-[#cac4d0] bg-[#fef7ff] py-24 text-center">
          <p className="text-[17px] font-normal leading-[1.5] text-[#8a8a8a]">
            No names selected for comparison yet.
          </p>
          <p className="mt-2 text-[14px] font-normal text-[#8a8a8a]">
            Select 2 names from the results deck to compare them side-by-side.
          </p>
          <div className="mt-6">
            <PrimaryButton onClick={() => onNavigate('results')}>
              Browse results
            </PrimaryButton>
          </div>
        </div>
      </Shell>
    )
  }

  return (
    <Shell title="Compare" onBack={onBack}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {compareSel.map((item, col) => {
          const theme = CARD_THEMES[col % CARD_THEMES.length]
          return (
            <div
              key={item.slug}
              className={`overflow-hidden rounded-[24px] border ${theme.border} ${theme.bg} p-8 shadow-sm`}
            >
              <div className="text-[28px] font-semibold text-[#1d1b20]">
                {item.name}
              </div>
              <div className="mt-1.5 font-mono text-[15px] font-semibold text-[#8a8a8a]">
                {domainFor(item, 'any TLD')}
              </div>
              <dl className="mt-6 flex flex-col gap-5 border-t border-[#ffe2d6] pt-5">
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-[12px] font-semibold uppercase leading-none tracking-[0.05em] text-[#8a8a8a]">
                      {row.label}
                    </dt>
                    <dd
                      className={
                        'mt-1.5 text-[17px] font-semibold text-[#1d1b20] ' + (row.mono ? 'font-mono' : '')
                      }
                    >
                      {row.get(item)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}

        {compareSel.length === 1 && (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[#cac4d0] bg-[#fef7ff] p-8 text-center min-h-[300px]">
            <p className="text-[16px] font-semibold text-[#1d1b20]">
              Select 1 more name
            </p>
            <p className="mt-1 text-[14px] font-normal text-[#8a8a8a]">
              Choose a second name from the results deck to complete side-by-side comparison.
            </p>
            <div className="mt-5">
              <PrimaryButton onClick={() => onNavigate('results')}>
                Pick second name
              </PrimaryButton>
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 flex items-center gap-6">
        <button
          type="button"
          onClick={onClear}
          className="text-[14px] font-semibold text-[#8a8a8a] underline decoration-[#cac4d0] underline-offset-4 transition-colors hover:text-[#1d1b20]"
        >
          Clear selection
        </button>
        <button
          type="button"
          onClick={() => onNavigate('results')}
          className="text-[14px] font-semibold text-[#8a8a8a] underline decoration-[#cac4d0] underline-offset-4 transition-colors hover:text-[#1d1b20]"
        >
          Back to results
        </button>
      </div>
    </Shell>
  )
}

// S6 — Brand Discovery Questions (Skale Pinned Note Deck Style)
export function Questions({ answers, onSave, onBack }) {
  const [draft, setDraft] = useState(answers ?? {})
  const [savedFlash, setSavedFlash] = useState(false)

  const update = (i, value) => setDraft((d) => ({ ...d, [i]: value }))
  const handleSave = () => {
    onSave(draft)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1400)
  }
  const answeredCount = QUESTIONS.filter((_, i) => (draft[i] || '').trim()).length

  return (
    <Shell title="Questions to Sharpen Results" badge="BRAND ALGORITHM" onBack={onBack}>
      <p className="-mt-4 mb-10 text-[17px] font-normal leading-[1.5] text-[#8a8a8a]">
        Optional — answers here sharpen the brand algorithm and guide domain recommendations.
      </p>

      <div className="flex flex-col gap-8">
        {QUESTIONS.map((q, i) => {
          const theme = CARD_THEMES[i % CARD_THEMES.length]
          const formattedIndex = String(i + 1).padStart(2, '0')
          const isAnswered = Boolean((draft[i] || '').trim())

          return (
            <div key={i} className="relative w-full">
              {/* Top Pushpin Accent Dot */}
              <div className="absolute -top-3.5 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center">
                <span className={`size-4 rounded-full ${theme.pinBg} border-2 border-white shadow-md`} />
              </div>

              {/* Skale Card Container */}
              <div className={`overflow-hidden rounded-[24px] border ${theme.border} ${theme.bg} shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_18px_45px_rgba(0,0,0,0.1)]`}>
                {/* Soft Pastel Header Strip - without question pill */}
                <div className={`${theme.headerBg} flex items-center justify-between px-7 py-3.5`}>
                  <span className={`font-mono text-[20px] font-bold tracking-tight ${theme.badgeText}`}>
                    {formattedIndex}
                  </span>
                  {isAnswered && (
                    <span className="font-mono text-[11px] font-semibold tracking-wide text-[#16a34a]">
                      ✓ ANSWERED
                    </span>
                  )}
                </div>

                {/* Card Body Input Row */}
                <div className="flex flex-col gap-3 p-7 sm:p-8">
                  <label className="text-[18px] font-semibold leading-[1.3] text-[#1d1b20]">
                    {q}
                  </label>
                  <input
                    type="text"
                    value={draft[i] ?? ''}
                    onChange={(e) => update(i, e.target.value)}
                    placeholder="Type your answer here..."
                    className="h-[56px] w-full rounded-2xl border border-[#ffe2d6] bg-white px-6 text-[16px] font-medium text-[#1d1b20] outline-none transition-all placeholder:font-normal placeholder:text-[#a09e9c] focus:border-[#1d1b20] focus:ring-2 focus:ring-[#1d1b20]"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={handleSave}
          className="flex h-[56px] items-center justify-center rounded-full bg-[#1d1b20] px-8 text-[15px] font-semibold text-[#fef7ff] shadow-md transition-all hover:bg-[#333] active:scale-[0.99]"
        >
          Save Answers
        </button>
        <span className="text-[15px] font-semibold text-[#8a8a8a]">
          {savedFlash ? '✓ Answers Saved!' : `${answeredCount} of ${QUESTIONS.length} answered`}
        </span>
      </div>
    </Shell>
  )
}

