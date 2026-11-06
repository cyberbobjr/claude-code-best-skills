import { describe, expect, test } from 'claude-code/testing'

import { cells, COLORS, compactTokens, countdown, landing, landingColor, modelName } from './lib'

const WEEK = 7 * 24 * 3600 * 1000
const NOW = 1_000_000_000_000

describe('landing', () => {
  test('projects usage at reset from the average pace', () => {
    expect(landing(45, NOW + WEEK / 2, NOW)).toBe(90)
  })
  test('floors elapsed time at 10% of the window', () => {
    expect(landing(8, NOW + WEEK - 1000, NOW)).toBe(80)
  })
  test('gives no landing for an expired window or an unknown reset', () => {
    expect(landing(50, NOW - 1, NOW)).toBe(null)
    expect(landing(50, null, NOW)).toBe(null)
  })
})

test('landing color: green under 80, yellow up to 99, red from 100', () => {
  expect(landingColor(79)).toBe(COLORS.green)
  expect(landingColor(80)).toBe(COLORS.yellow)
  expect(landingColor(99)).toBe(COLORS.yellow)
  expect(landingColor(100)).toBe(COLORS.red)
})

test('cells show used, then projected in landing color, then empty', () => {
  const row = cells(40, 120)
  expect(row.map(cell => cell.glyph).join('')).toBe('■■■■□□□□□□')
  expect(row[9]?.color).toBe(COLORS.red)
  expect(cells(0).every(cell => cell.color === COLORS.empty)).toBe(true)
})

test('formats tokens, countdowns and model ids', () => {
  expect(compactTokens(120_000)).toBe('120k')
  expect(compactTokens(1_000_000)).toBe('1M')
  expect(compactTokens(null)).toBe('--')
  expect(countdown((2 * 1440 + 23 * 60 + 5) * 60_000)).toBe('2j23h')
  expect(countdown(65 * 60_000)).toBe('1h05')
  expect(countdown(9 * 60_000)).toBe('9m')
  expect(modelName('claude-opus-5-5')).toBe('Opus 5.5')
  expect(modelName('claude-fable-5-1[1m]')).toBe('Fable 5.1')
  expect(modelName('opus')).toBe('opus')
})
