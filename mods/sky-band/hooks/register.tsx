import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import { minuteOfDay, parseOffset, SKY_ROWS, skyCells } from './sky'

const REFRESH_MS = 60_000
const RECOVERY_MS = 2_000

// toBase64 exists at runtime, but the contract file cannot declare it.
const encode = (words: Uint32Array) => (new Uint8Array(words.buffer) as Uint8Array & { toBase64(): string }).toBase64()

const sky = atom({ plugin: 'sky-band', key: 'sky' } as const, null)

async function commitsToday($: EngineInterface): Promise<number> {
  try {
    const { exitCode, stdout } = await $.process.run(['git', 'rev-list', '--count', '--since=midnight', 'HEAD'])
    return exitCode === 0 ? Number(stdout.trim()) || 0 : 0
  } catch {
    return 0
  }
}

async function utcOffset($: EngineInterface): Promise<number> {
  try {
    return parseOffset((await $.process.run(['date', '+%z'])).stdout)
  } catch {
    return 0
  }
}

async function load($: EngineInterface) {
  const [offsetMinutes, commits, nowMs] = await Promise.all([utcOffset($), commitsToday($), $.clock.now()])
  await update($, sky, () => ({ nowMs, offsetMinutes, commits }))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await load($)
    // /clear empties session state and raises no session.start.
    $.clock.every(RECOVERY_MS, () => {
      void read($, sky).then(state => (state === null ? load($) : undefined))
    })
    $.clock.every(REFRESH_MS, () => {
      void $.clock.now().then(now => update($, sky, current => (current ? { ...current, nowMs: now } : current)))
    })

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const commits = await commitsToday($)
    await update($, sky, current => (current ? { ...current, commits } : current))

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const state = await read($, sky)
    if (e.props.hasSurvey || e.surface !== 'terminal' || state === null) {
      return next(e)
    }

    const { Box, Raster } = $.ui.resolve(e)
    const columns = e.props.bodyColumns
    const words = skyCells(columns, minuteOfDay(state.nowMs, state.offsetMinutes), state.commits)
    const theirs = await next(e)

    return (
      <Box flexDirection="column">
        <Raster key="sky" columns={columns} rows={SKY_ROWS} cells={encode(words)} />
        {theirs}
      </Box>
    )
  })
}
