import { expect, test } from 'claude-code/testing'

const BAND = (bodyColumns: number) => ({
  plugin: 'usage-band',
  component: 'AbovePrompt',
  surface: 'terminal',
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns, scroll: { offset: 0, bodyRows: 9 }, view: {} },
} as const)

const seed = {
  model: 'claude-opus-5-5',
  effort: 'medium',
  tokens: 120_000,
  window: 1_000_000,
  percent: 12,
  week: { percentUsed: 45, resetsAtMs: 1_000 + 3.5 * 24 * 3600 * 1000 },
  nowMs: 1_000,
}

test('the band shows model, effort, context and weekly landing', async ($, on) => {
  on('state.get', () => ({ value: { value: seed, version: 1 } }))

  const ui = await $.ui.mount(BAND(120))

  const line = await ui.find({ type: 'Text', text: /Opus 5\.5/ })
  expect(line?.text).toContain('Opus 5.5 · medium')
  expect(line?.text).toContain('120k/1M 12%')
  expect(line?.text).toContain('7j')
  expect(line?.text).toContain('45% ↻ 3j12h →90%')
  await ui.unmount()
})

test('a narrow band stacks weekly usage on a second row', async ($, on) => {
  on('state.get', () => ({ value: { value: seed, version: 1 } }))

  const ui = await $.ui.mount(BAND(70))

  const first = await ui.find({ type: 'Text', text: /Opus/ })
  expect(first?.text).not.toContain('→90%')
  expect((await ui.find({ type: 'Text', text: /^7j/ }))?.text).toContain('→90%')
  await ui.unmount()
})

test('a band without a reading yet omits weekly usage', async ($, on) => {
  on('state.get', () => ({ value: { value: { ...seed, week: null }, version: 1 } }))

  const ui = await $.ui.mount(BAND(120))

  const line = await ui.find({ type: 'Text', text: /Opus/ })
  expect(line?.text).not.toContain('7j')
  await ui.unmount()
})
