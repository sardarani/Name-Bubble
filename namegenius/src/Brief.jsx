import { useState } from 'react'

const TLDS = ['.com', '.io', '.co', 'any TLD']

function Brief({ initial, onFindNames, onQuestions }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [competitors, setCompetitors] = useState(initial?.competitors ?? '')
  const [tld, setTld] = useState(initial?.tld ?? '.com')
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)

  // Validation lives in one place so inline fields and submit agree.
  const errors = {}
  if (name.trim().length === 0) {
    errors.name = 'Enter a name or keyword to check.'
  } else if (name.trim().length < 2) {
    errors.name = 'That’s a little short — try at least 2 characters.'
  }
  const isValid = Object.keys(errors).length === 0
  const showError = (field) => (touched[field] || submitted) && errors[field]

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (!isValid) return
    onFindNames({
      name: name.trim(),
      description: description.trim(),
      competitors: competitors.trim(),
      tld,
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f6f9] text-[#1d1b20]">
      {/* Continuous Background Floating Bubbles Animation */}
      <FloatingBubblesBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 py-8 sm:px-12">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-extrabold tracking-tight text-[#1d1b20]">Domain bubble</div>
        </div>

        {/* hero section */}
        <div className="mx-auto mt-10 max-w-[750px] text-center sm:mt-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cac4d0] bg-[#fef7ff] px-4 py-1.5 text-[12px] font-semibold leading-none tracking-[0.05em] text-[#1d1b20]">
            <span className="size-2 rounded-full bg-[#1d1b20]" />
            AI-POWERED DOMAIN SEARCH
          </div>

          <h1 className="mt-5 text-center font-serif text-[72px] font-normal leading-[0.92] tracking-[-0.02em] text-[#1d1b20] sm:text-[90px]">
            Find a name
            <br />
            you can <span className="font-serif italic font-normal underline decoration-[#1d1b20] decoration-wavy underline-offset-8">own</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-[480px] text-center text-[17px] font-normal leading-[1.5] text-[#8a8a8a]">
            Type a name or keyword. We check the domains you can actually get.
          </p>

          {/* Skale Pinned Note Deck Form Container */}
          <div className="relative mx-auto mt-10 max-w-[660px] text-left">
            {/* Top Pushpin Accent Dot */}
            <div className="absolute -top-3.5 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center">
              <span className="size-4 rounded-full border-2 border-white bg-[#f97316] shadow-md" />
            </div>

            {submitted && !isValid && (
              <div
                role="alert"
                className="mb-6 rounded-2xl border border-[#1d1b20] bg-[#1d1b20] px-6 py-4 text-[14px] font-bold text-white shadow-sm"
              >
                Please complete the required field below to continue.
              </div>
            )}

            <div className="overflow-hidden rounded-[24px] border border-[#ffe2d6] bg-[#fff9f6] shadow-[0_12px_35px_rgba(0,0,0,0.06)] transition-all hover:shadow-[0_18px_45px_rgba(0,0,0,0.1)]">
              {/* Soft Peach Header Strip */}
              <div className="flex items-center justify-between bg-[#fff0e6] px-8 py-4">
                <span className="font-mono text-[20px] sm:text-[22px] font-bold tracking-tight text-[#d95d1e]">
                  ⚡︎ START HERE
                </span>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 p-8 sm:p-10">
                {/* Section 1: Primary Search Field */}
                <div>
                  <label className="mb-2.5 flex items-center justify-between">
                    <span className="text-[12px] font-semibold uppercase leading-none tracking-[0.05em] text-[#1d1b20]">
                      Primary Keyword or Name
                    </span>
                    <span className="text-[11px] font-semibold leading-none text-[#d95d1e]">REQUIRED</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                      placeholder="e.g. Fieldnote, Northwind, or keyword to check..."
                      aria-invalid={showError('name') ? 'true' : undefined}
                      className={
                        'h-[62px] w-full rounded-full border bg-white px-7 text-[18px] font-semibold text-[#1d1b20] tracking-[-0.01em] outline-none transition-all placeholder:font-normal placeholder:text-[#a09e9c] ' +
                        (showError('name')
                          ? 'border-[#1d1b20] ring-2 ring-[#1d1b20]'
                          : 'border-[#ffe2d6] focus:border-[#1d1b20] focus:ring-2 focus:ring-[#1d1b20]')
                      }
                    />
                  </div>
                  {showError('name') && (
                    <span className="mt-2.5 block px-3 text-[14px] font-semibold text-[#1d1b20]">
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Inset Divider */}
                <div className="border-t border-[#ffe2d6]" />

                {/* Section 2: Secondary Fields */}
                <div className="flex flex-col gap-5">
                  <DeckTextareaRow
                    label="Description"
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe your product or idea in a sentence or paragraph (e.g. An AI-powered research workspace for solo founders that organizes voice clips and raw notes into project briefs)..."
                    maxLength={1000}
                  />
                  <DeckInputRow
                    label="Competitors & Keywords"
                    value={competitors}
                    onChange={setCompetitors}
                    placeholder="Names or words to steer toward or away from (e.g. Notion, Obsidian, Craft, Roam)..."
                  />
                </div>

                {/* Inset Divider */}
                <div className="border-t border-[#ffe2d6]" />

                {/* Section 3: TLD Preference Pill Toggles */}
                <div>
                  <span className="mb-3 block text-[12px] font-semibold uppercase leading-none tracking-[0.05em] text-[#1d1b20]">
                    TLD Preference
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {TLDS.map((option) => {
                      const active = tld === option
                      const isMono = option !== 'any TLD'
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setTld(option)}
                          aria-pressed={active}
                          className={
                            'rounded-full px-5 py-2.5 text-[14px] font-semibold leading-none transition-all ' +
                            (isMono ? 'font-mono ' : '') +
                            (active
                              ? 'bg-[#1d1b20] text-white shadow-sm'
                              : 'border border-[#ffe2d6] bg-white text-[#8a8a8a] hover:border-[#1d1b20] hover:text-[#1d1b20]')
                          }
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Section 4: Primary Action CTA */}
                <button
                  type="submit"
                  className="mt-2 flex h-[62px] w-full items-center justify-center gap-3 rounded-full bg-[#1d1b20] text-[15px] font-semibold leading-none tracking-[0.02em] text-[#fef7ff] shadow-md transition-all hover:bg-[#333] active:scale-[0.99]"
                >
                  Find Names
                  <svg className="size-[20px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            </div>

            <div className="mt-7 text-center">
              <button
                type="button"
                onClick={onQuestions}
                className="text-[14px] font-semibold text-[#8a8a8a] underline decoration-[#cac4d0] underline-offset-4 transition-colors hover:text-[#1d1b20] hover:decoration-[#1d1b20]"
              >
                Questions to sharpen results →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeckTextareaRow({ label, value, onChange, placeholder, maxLength = 1000 }) {
  const isNearLimit = value.length >= maxLength * 0.9
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase leading-none tracking-[0.05em] text-[#1d1b20]">
            {label}
          </span>
          <span className="text-[11px] font-normal leading-none text-[#8a8a8a]">(OPTIONAL)</span>
        </label>
        <span className={'font-mono text-[11px] font-semibold ' + (isNearLimit ? 'text-[#d95d1e] font-bold' : 'text-[#8a8a8a]')}>
          {value.length} / {maxLength.toLocaleString()}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-[#ffe2d6] bg-white p-5 text-[15px] font-normal leading-[1.5] text-[#1d1b20] outline-none transition-all placeholder:font-normal placeholder:text-[#a09e9c] focus:border-[#1d1b20] focus:ring-1 focus:ring-[#1d1b20]"
      />
    </div>
  )
}

function DeckInputRow({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2">
        <span className="text-[12px] font-semibold uppercase leading-none tracking-[0.05em] text-[#1d1b20]">
          {label}
        </span>
        <span className="text-[11px] font-normal leading-none text-[#8a8a8a]">(OPTIONAL)</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[52px] w-full rounded-2xl border border-[#ffe2d6] bg-white px-5 text-[15px] font-normal text-[#1d1b20] outline-none transition-all placeholder:font-normal placeholder:text-[#a09e9c] focus:border-[#1d1b20] focus:ring-1 focus:ring-[#1d1b20]"
      />
    </div>
  )
}

export function FloatingBubblesBackground() {
  const BUBBLES = [
    { id: 1, size: 'size-[48px]', left: 'left-[6%]', duration: '14s', delay: '-1s', color: 'border-[#f97316]/30 bg-gradient-to-br from-[#ffe2d6]/40 via-[#f97316]/10 to-transparent shadow-[0_6px_18px_rgba(249,115,22,0.1)]' },
    { id: 2, size: 'size-[80px]', left: 'left-[16%]', duration: '18s', delay: '-6s', color: 'border-[#3b82f6]/30 bg-gradient-to-br from-[#e8f0ff]/40 via-[#3b82f6]/10 to-transparent shadow-[0_8px_22px_rgba(59,130,246,0.1)]' },
    { id: 3, size: 'size-[38px]', left: 'left-[26%]', duration: '13s', delay: '-3s', color: 'border-[#a855f7]/30 bg-gradient-to-br from-[#f3e6ff]/40 via-[#a855f7]/10 to-transparent shadow-[0_6px_18px_rgba(168,85,247,0.1)]' },
    { id: 4, size: 'size-[104px]', left: 'left-[36%]', duration: '22s', delay: '-10s', color: 'border-[#10b981]/30 bg-gradient-to-br from-[#e4f7eb]/40 via-[#10b981]/10 to-transparent shadow-[0_10px_24px_rgba(16,185,129,0.1)]' },
    { id: 5, size: 'size-[54px]', left: 'left-[48%]', duration: '15s', delay: '-2s', color: 'border-[#ec4899]/30 bg-gradient-to-br from-[#ffe4e6]/40 via-[#ec4899]/10 to-transparent shadow-[0_6px_18px_rgba(236,72,153,0.1)]' },
    { id: 6, size: 'size-[76px]', left: 'left-[60%]', duration: '19s', delay: '-8s', color: 'border-[#06b6d4]/30 bg-gradient-to-br from-[#e0f2fe]/40 via-[#06b6d4]/10 to-transparent shadow-[0_8px_22px_rgba(6,182,212,0.1)]' },
    { id: 7, size: 'size-[44px]', left: 'left-[70%]', duration: '14s', delay: '-4s', color: 'border-[#f59e0b]/30 bg-gradient-to-br from-[#fef3c7]/40 via-[#f59e0b]/10 to-transparent shadow-[0_6px_18px_rgba(245,158,11,0.1)]' },
    { id: 8, size: 'size-[114px]', left: 'left-[80%]', duration: '25s', delay: '-14s', color: 'border-[#8b5cf6]/30 bg-gradient-to-br from-[#ede9fe]/40 via-[#8b5cf6]/10 to-transparent shadow-[0_10px_26px_rgba(139,92,246,0.1)]' },
    { id: 9, size: 'size-[58px]', left: 'left-[90%]', duration: '16s', delay: '-7s', color: 'border-[#f97316]/30 bg-gradient-to-br from-[#ffe2d6]/40 via-[#f97316]/10 to-transparent shadow-[0_6px_18px_rgba(249,115,22,0.1)]' },
    { id: 10, size: 'size-[68px]', left: 'left-[30%]', duration: '17s', delay: '-12s', color: 'border-[#6366f1]/30 bg-gradient-to-br from-[#e0e7ff]/40 via-[#6366f1]/10 to-transparent shadow-[0_8px_22px_rgba(99,102,241,0.1)]' },
    { id: 11, size: 'size-[42px]', left: 'left-[55%]', duration: '14.5s', delay: '-9s', color: 'border-[#14b8a6]/30 bg-gradient-to-br from-[#ccfbf1]/40 via-[#14b8a6]/10 to-transparent shadow-[0_6px_18px_rgba(20,184,166,0.1)]' },
    { id: 12, size: 'size-[90px]', left: 'left-[74%]', duration: '21s', delay: '-15s', color: 'border-[#ff6b6b]/30 bg-gradient-to-br from-[#ffe3e3]/40 via-[#ff6b6b]/10 to-transparent shadow-[0_10px_24px_rgba(255,107,107,0.1)]' },
  ]

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes bubbleFloatUp {
          0% {
            transform: translate3d(0, 105vh, 0) scale(0.5) rotate(0deg);
            opacity: 0;
          }
          12% {
            opacity: 0.5;
          }
          50% {
            transform: translate3d(32px, 50vh, 0) scale(1.05) rotate(180deg);
            opacity: 0.6;
          }
          85% {
            opacity: 0.35;
          }
          100% {
            transform: translate3d(-24px, -160px, 0) scale(1.2) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes softOrbPulse {
          0%, 100% {
            transform: translate3d(-50%, -50%, 0) scale(0.95);
            opacity: 0.25;
          }
          50% {
            transform: translate3d(-50%, -50%, 0) scale(1.15);
            opacity: 0.4;
          }
        }
        .bubble-element {
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          animation-name: bubbleFloatUp;
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          animation-iteration-count: infinite;
        }
        .soft-orb-glow {
          will-change: transform, opacity;
          animation: softOrbPulse 14s ease-in-out infinite;
        }
      `}</style>

      {/* Large Soft Ambient Glowing Backdrop Orbs */}
      <div className="absolute top-[30%] left-[20%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="soft-orb-glow size-[500px] rounded-full bg-gradient-to-tr from-[#ffe2d6]/30 via-[#f3e6ff]/20 to-transparent blur-[90px]" />
      </div>
      <div className="absolute top-[70%] right-[15%] translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="soft-orb-glow size-[550px] rounded-full bg-gradient-to-br from-[#e8f0ff]/30 via-[#e4f7eb]/20 to-transparent blur-[90px]" />
      </div>

      {/* Floating Glassmorphic Bubbles */}
      {BUBBLES.map((b) => (
        <div
          key={b.id}
          className={`bubble-element absolute top-0 ${b.left} ${b.size} rounded-full border-[1.5px] ${b.color} backdrop-blur-[2px]`}
          style={{
            animationDuration: b.duration,
            animationDelay: b.delay,
          }}
        >
          {/* 3D Specular Highlight Spot on Top Left of Bubble */}
          <div className="absolute top-[16%] left-[18%] size-[28%] rounded-full bg-white/55 blur-[0.5px]" />
        </div>
      ))}
    </div>
  )
}

export default Brief








