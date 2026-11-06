import { expect, test } from 'claude-code/testing'

import { isNight, minuteOfDay, parseOffset, SKY_ROWS, skyCells } from './sky'

const COLUMNS = 80
const STAR = 0x2726
const count = (words: Uint32Array, code: number) => words.filter((_, index) => index % 3 === 0 && words[index] === code).length

test('reads local time from UTC and the offset', () => {
  expect(minuteOfDay(3_600_000, 60)).toBe(120)
  expect(minuteOfDay(0, -60)).toBe(1380)
  expect(parseOffset('+0130\n')).toBe(90)
  expect(parseOffset('-0500')).toBe(-300)
  expect(parseOffset('garbage')).toBe(0)
})

test('night runs from 20:00 to 06:00', () => {
  expect(isNight(1200)).toBe(true)
  expect(isNight(359)).toBe(true)
  expect(isNight(360)).toBe(false)
  expect(isNight(1199)).toBe(false)
})

test('fills every cell with three words, at any time of day', () => {
  for (let minute = 0; minute < 1440; minute += 7) {
    const words = skyCells(COLUMNS, minute, 0)
    expect(words.length).toBe(COLUMNS * SKY_ROWS * 3)
    expect(words.every((word, index) => index % 3 !== 0 || word !== 0)).toBe(true)
  }
})

test('noon is brighter than midnight', () => {
  const blueOf = (minute: number) => (skyCells(COLUMNS, minute, 0)[1] ?? 0) & 0xff
  expect(blueOf(720)).toBeGreaterThan(blueOf(0))
})

test('a commit adds a star at night, and no star shows by day', () => {
  expect(count(skyCells(COLUMNS, 0, 3), STAR)).toBe(3)
  expect(count(skyCells(COLUMNS, 720, 3), STAR)).toBe(0)
})

test('the ground line is plain sky, with no dark band', () => {
  const columns = 130
  const words = skyCells(columns, 500, 0)
  const lowest = Array.from({ length: columns - 40 }, (_, index) => words[(columns + index + 40) * 3 + 2])

  expect(new Set(lowest).size).toBe(1)
})

const litPixels = (words: Uint32Array, color: number) =>
  words.filter((word, index) => index % 3 !== 0 && word === color).length

test('the sun stays a whole disc all day', () => {
  for (let minute = 420; minute < 1170; minute += 15) {
    expect(litPixels(skyCells(130, minute, 0), 0xffd166)).toBe(5)
  }
})

test('stars never cut the moon', () => {
  for (const minute of [1200, 1320, 0, 120, 240, 350]) {
    expect(litPixels(skyCells(130, minute, 40), 0xe8ecf8)).toBe(5)
  }
})
