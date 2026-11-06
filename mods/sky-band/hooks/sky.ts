export const SKY_ROWS = 2

type Rgb = readonly [number, number, number]
type Stop = { minute: number; top: Rgb; bottom: Rgb }

const DAY_MINUTES = 1440
const PIXEL_ROWS = SKY_ROWS * 2
const SUNRISE = 420
const SUNSET = 1170
const NIGHT_START = 1200
const NIGHT_END = 360

const UPPER_HALF_BLOCK = 0x2580
const DOT = 0xb7
const STAR = 0x2726

const GLOW_RADIUS = 4
const SUN: Rgb = [255, 209, 102]
const MOON: Rgb = [232, 236, 248]
const FAINT_STAR = 0x8892b0
const BRIGHT_STAR = 0xfff7c2

const SKY_STOPS: readonly Stop[] = [
  { minute: 0, top: [11, 16, 38], bottom: [27, 31, 74] },
  { minute: 300, top: [11, 16, 38], bottom: [42, 35, 87] },
  { minute: 390, top: [59, 42, 107], bottom: [240, 138, 93] },
  { minute: 480, top: [74, 163, 223], bottom: [191, 227, 245] },
  { minute: 1020, top: [63, 149, 214], bottom: [191, 227, 245] },
  { minute: 1140, top: [91, 42, 134], bottom: [255, 126, 95] },
  { minute: 1230, top: [20, 18, 56], bottom: [58, 36, 88] },
  { minute: DAY_MINUTES, top: [11, 16, 38], bottom: [27, 31, 74] },
]

const mix = (from: Rgb, to: Rgb, share: number): Rgb =>
  [0, 1, 2].map(index => Math.round((from[index] ?? 0) + ((to[index] ?? 0) - (from[index] ?? 0)) * share)) as unknown as Rgb

const toInt = ([red, green, blue]: Rgb) => (red << 16) | (green << 8) | blue

// Scatters positions: stable from one redraw to the next.
const scatter = (seed: number, range: number) => ((seed * 2654435761) >>> 0) % range

export function minuteOfDay(nowMs: number, offsetMinutes: number): number {
  const minutes = Math.floor(nowMs / 60_000) + offsetMinutes
  return ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
}

// "+0100" from `date +%z`, as minutes.
export function parseOffset(text: string): number {
  const match = /^([+-])(\d{2})(\d{2})/.exec(text.trim())
  if (!match) return 0
  const minutes = Number(match[2]) * 60 + Number(match[3])
  return match[1] === '-' ? -minutes : minutes
}

export function isNight(minute: number): boolean {
  return minute >= NIGHT_START || minute < NIGHT_END
}

function skyAt(minute: number): { top: Rgb; bottom: Rgb } {
  const after = SKY_STOPS.findIndex(stop => stop.minute > minute)
  const to = SKY_STOPS[after] ?? SKY_STOPS[0]
  const from = SKY_STOPS[after - 1] ?? SKY_STOPS[0]
  if (!from || !to) throw new Error('sky stops are empty')
  const share = (minute - from.minute) / (to.minute - from.minute)
  return { top: mix(from.top, to.top, share), bottom: mix(from.bottom, to.bottom, share) }
}

// Sun by day, moon by night: each rises left, peaks, and sets right.
// The centre stays on whole pixels, one away from every edge, so the disc is never cut.
function bodyAt(minute: number, columns: number) {
  const isDay = minute >= SUNRISE && minute < SUNSET
  const nightLength = DAY_MINUTES - (SUNSET - SUNRISE)
  const progress = isDay
    ? (minute - SUNRISE) / (SUNSET - SUNRISE)
    : ((minute - SUNSET + DAY_MINUTES) % DAY_MINUTES) / nightLength
  return {
    x: 1 + Math.round(progress * (columns - 3)),
    y: 1 + Math.round(1 - Math.sin(Math.PI * progress)),
    color: isDay ? SUN : MOON,
  }
}

// One Raster: half blocks give two pixels a cell, then glyphs go on top.
export function skyCells(columns: number, minute: number, commits: number): Uint32Array {
  const sky = skyAt(minute)
  const body = bodyAt(minute, columns)

  const pixel = (column: number, row: number): Rgb => {
    const base = mix(sky.top, sky.bottom, row / (PIXEL_ROWS - 1))
    const distance = Math.hypot(column - body.x, row - body.y)
    if (distance <= 1) return body.color
    if (distance < 1.5) return mix(base, body.color, 0.55)
    return distance < GLOW_RADIUS ? mix(base, body.color, 0.3 * (1 - distance / GLOW_RADIUS)) : base
  }

  const words = new Uint32Array(columns * SKY_ROWS * 3)
  const setCell = (column: number, row: number, code: number, foreground: number, background: number) => {
    words.set([code, foreground, background], (row * columns + column) * 3)
  }
  const setGlyph = (column: number, code: number, foreground: number) => {
    if (Math.abs(column - body.x) <= 1) return
    setCell(column, 0, code, foreground, toInt(pixel(column, 0)))
  }

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < SKY_ROWS; row += 1) {
      setCell(column, row, UPPER_HALF_BLOCK, toInt(pixel(column, row * 2)), toInt(pixel(column, row * 2 + 1)))
    }
  }

  if (isNight(minute)) {
    for (let index = 1; index <= columns / 14; index += 1) setGlyph(scatter(index * 7, columns), DOT, FAINT_STAR)
    for (let index = 1; index <= commits; index += 1) setGlyph(scatter(index, columns), STAR, BRIGHT_STAR)
  }

  return words
}
