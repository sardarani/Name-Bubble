import { TLD_ORDER } from './data.js'
import { fetchGeminiNameIdeas } from './services/gemini.js'
import { checkAllTlds, sanitizeSlug } from './services/domainChecker.js'

// Improved name generator with real Gemini API integration + real domain lookups + local fallback.

const STOP = new Set([
  'the', 'and', 'for', 'with', 'your', 'you', 'our', 'from', 'into', 'that',
  'this', 'are', 'app', 'name', 'names', 'like', 'want', 'need', 'make',
])
const PREFIXES = ['get', 'try', 'use', 'go', 'join', 'hey']
const SUFFIXES = [
  'ly', 'labs', 'hq', 'base', 'kit', 'hub', 'flow', 'wave', 'forge', 'craft',
  'loop', 'works', 'peak', 'stack', 'sync', 'yard', 'pilot', 'scout', 'space', 'link',
]
const ABSTRACT = [
  'nova', 'lumen', 'atlas', 'ferra', 'quill', 'orbit', 'nimbus', 'cadence',
  'harbor', 'verve', 'onyx', 'sable', 'mira', 'vela', 'luma', 'riva', 'fable',
  'juno', 'halo', 'wren',
]
const VOWELS = 'aeiou'

function hashStr(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(arr, rnd) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

function tokens(str) {
  return (str || '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w))
}

// Deterministic per-TLD availability fallback with realistic scarcity (.com rare).
export function tldAvailability(slug) {
  const thresh = { '.com': 22, '.io': 55, '.co': 62 }
  const map = {}
  for (const t of TLD_ORDER) map[t] = hashStr(slug + t) % 100 < thresh[t]
  return map
}

export function tagsFor(slug, roots = []) {
  const tags = []
  if (slug.length <= 6) tags.push('short')
  const last = slug[slug.length - 1]
  if (slug.length <= 8 && (VOWELS.includes(last) || /(.)\1/.test(slug))) {
    tags.push('catchy')
  }
  if (roots.some((r) => r.length >= 3 && slug.includes(r))) tags.push('descriptive')
  if (tags.length === 0) tags.push('descriptive')
  return tags
}

function buildCandidates(seed, mods) {
  const set = new Map() // slug -> display name
  const add = (nameParts) => {
    const name = nameParts
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (slug.length >= 3 && slug.length <= 15 && !set.has(slug)) set.set(slug, name)
  }

  if (seed) {
    add(cap(seed))
    for (const suf of SUFFIXES) add(cap(seed) + suf)
    for (const pre of PREFIXES) add(cap(pre) + cap(seed))
  }
  for (const m of mods) {
    add(cap(m))
    for (const suf of SUFFIXES.slice(0, 10)) add(cap(m) + suf)
  }
  if (seed) {
    for (const m of mods) add(cap(seed) + cap(m).slice(0, 4))
  }
  for (const ab of ABSTRACT) {
    add(cap(ab))
    if (seed) add(cap(ab) + cap(seed).slice(0, 4))
  }
  return set
}

/**
 * Synchronous local name generator (offline fallback & instant initial render).
 */
export function generateNames(brief, generation = 0, answers = {}) {
  if (!brief?.name?.trim()) return []
  const seedTokens = tokens(brief?.name)
  const seed = seedTokens[0] || 'brand'
  const baseMods = [
    ...seedTokens.slice(1),
    ...tokens(brief?.description),
    ...tokens(brief?.competitors),
  ]
  const answerTokens = Object.values(answers || {}).flatMap((v) => tokens(v))
  const mods = Array.from(new Set([...baseMods, ...answerTokens]))
  const roots = [seed, ...mods]

  const set = buildCandidates(seed, mods)
  let items = Array.from(set, ([slug, name]) => ({
    name,
    slug,
    tlds: tldAvailability(slug),
    tags: tagsFor(slug, roots),
  }))

  const rnd = mulberry32(
    hashStr(`${brief?.name || ''}|${generation}|${answerTokens.length}`)
  )
  items = shuffle(items, rnd)

  if (answerTokens.length) {
    items.sort((a, b) => {
      const aw = answerTokens.some((t) => a.slug.includes(t)) ? 0 : 1
      const bw = answerTokens.some((t) => b.slug.includes(t)) ? 0 : 1
      return aw - bw
    })
  }

  return items.slice(0, 45)
}

/**
 * Async name generator using Gemini API for ideas + real domain lookups for availability.
 * Pads with local candidates if Gemini is slow, missing key, or returns too few items.
 */
export async function generateNamesAsync(brief, generation = 0, answers = {}) {
  if (!brief?.name?.trim()) return []
  const seedTokens = tokens(brief?.name)
  const seed = seedTokens[0] || 'brand'
  const baseMods = [
    ...seedTokens.slice(1),
    ...tokens(brief?.description),
    ...tokens(brief?.competitors),
  ]
  const answerTokens = Object.values(answers || {}).flatMap((v) => tokens(v))
  const mods = Array.from(new Set([...baseMods, ...answerTokens]))
  const roots = [seed, ...mods]

  let geminiNames = []
  try {
    geminiNames = await fetchGeminiNameIdeas(brief, generation, answers)
  } catch (err) {
    console.warn('Gemini API fetch failed/skipped, using local fallback:', err.message)
  }

  // Create name objects map (slug -> { name, slug })
  const candidatesMap = new Map()

  // Add Gemini names first
  for (const name of geminiNames) {
    const slug = sanitizeSlug(name)
    if (slug && slug.length >= 3 && !candidatesMap.has(slug)) {
      candidatesMap.set(slug, { name: name.trim(), slug })
    }
  }

  // Always supplement with local generator names to ensure robust candidates deck
  const localItems = generateNames(brief, generation, answers)
  for (const item of localItems) {
    if (!candidatesMap.has(item.slug)) {
      candidatesMap.set(item.slug, { name: item.name, slug: item.slug })
    }
  }

  const combinedList = Array.from(candidatesMap.values()).slice(0, 30)

  // Perform concurrent real domain availability checks for the top candidates
  const itemsWithDomains = await Promise.all(
    combinedList.map(async (item) => {
      let tldsMap = {}
      try {
        tldsMap = await checkAllTlds(item.slug)
      } catch {
        tldsMap = tldAvailability(item.slug)
      }
      return {
        ...item,
        tlds: tldsMap,
        tags: tagsFor(item.slug, roots),
      }
    })
  )

  return itemsWithDomains
}
