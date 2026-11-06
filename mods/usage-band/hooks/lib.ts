export const COLORS = {
  green: '#4ade80',
  yellow: '#facc15',
  orange: '#fb923c',
  red: '#f87171',
  empty: '#4b5563',
  model: '#e0a3d0',
  label: '#9ca3af',
} as const

export const BAR_CELLS = 10

const WEEK_MS = 7 * 24 * 3600 * 1000
const MIN_ELAPSED_SHARE = 0.1

export type Cell = { glyph: string; color: string }

// Usage expected at reset if the average pace so far holds. Elapsed time is
// floored because the first hours of a window say little about the pace.
export function landing(percentUsed: number, resetsAtMs: number | null, nowMs: number): number | null {
  if (resetsAtMs === null || resetsAtMs <= nowMs) return null
  const elapsedShare = (WEEK_MS - (resetsAtMs - nowMs)) / WEEK_MS
  return Math.round(percentUsed / Math.max(elapsedShare, MIN_ELAPSED_SHARE))
}

export function landingColor(percent: number): string {
  if (percent >= 100) return COLORS.red
  return percent >= 80 ? COLORS.yellow : COLORS.green
}

// Color of a fill level, for the bar cells and the context percentage.
export function levelColor(percent: number): string {
  if (percent >= 90) return COLORS.red
  if (percent >= 80) return COLORS.orange
  return percent >= 60 ? COLORS.yellow : COLORS.green
}

// Filled cells, then cells the projection will fill, then empty cells.
export function cells(percent: number, projected: number | null = null): Cell[] {
  const toCount = (value: number) =>
    Math.min(BAR_CELLS, value > 0 ? Math.max(1, Math.round(value / BAR_CELLS)) : 0)
  const filled = toCount(percent)
  const ghosts = projected === null ? filled : Math.max(filled, toCount(projected))
  return Array.from({ length: BAR_CELLS }, (_, index): Cell => {
    if (index < filled) return { glyph: '■', color: levelColor(((index + 1) / BAR_CELLS) * 100) }
    if (index < ghosts) return { glyph: '□', color: landingColor(projected ?? 0) }
    return { glyph: '■', color: COLORS.empty }
  })
}

export function compactTokens(tokens: number | null): string {
  if (tokens === null) return '--'
  if (tokens >= 1_000_000) return `${Math.round(tokens / 100_000) / 10}M`
  return tokens >= 1000 ? `${Math.round(tokens / 1000)}k` : String(tokens)
}

export function countdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  if (days > 0) return `${days}j${hours}h`
  return hours > 0 ? `${hours}h${String(totalMinutes % 60).padStart(2, '0')}` : `${totalMinutes}m`
}

export function modelName(model: string): string {
  const match = /^claude-([a-z]+)-(\d+)(?:-(\d+))?/.exec(model)
  const family = match?.[1]
  if (!match || !family) return model
  const version = match[3] ? `${match[2]}.${match[3]}` : match[2]
  return `${family[0]?.toUpperCase()}${family.slice(1)} ${version}`
}
