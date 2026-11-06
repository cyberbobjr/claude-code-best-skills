import { expect, test } from 'claude-code/testing'

const BAND = (surface: 'terminal' | 'desktop') => ({
  plugin: 'sky-band',
  component: 'AbovePrompt',
  surface,
  props: { hasSurvey: false, isWorking: false, maxRows: 10, bodyColumns: 80, scroll: { offset: 0, bodyRows: 9 }, view: {} },
} as const)

const seed = { nowMs: 0, offsetMinutes: 60, commits: 2 }

test('the band draws the sky and keeps what other mods draw', async ($, on) => {
  on('state.get', () => ({ value: { value: seed, version: 1 } }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>other mod</Text>
  })

  const ui = await $.ui.mount(BAND('terminal'))

  expect(await ui.find({ type: 'Raster' })).toBeTruthy()
  expect((await ui.find({ type: 'Text', text: /other mod/ }))?.text).toBe('other mod')
  await ui.unmount()
})

test('a surface without Raster passes', async ($, on) => {
  on('state.get', () => ({ value: { value: seed, version: 1 } }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>other mod</Text>
  })

  const ui = await $.ui.mount(BAND('desktop'))

  expect(await ui.find({ type: 'Raster' })).toBeFalsy()
  await ui.unmount()
})
