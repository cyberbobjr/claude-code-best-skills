import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionContextUsage, SessionRateLimit } from 'claude-code'

import type { Snapshot, Week } from '../types'
import { cells, COLORS, compactTokens, countdown, landing, landingColor, levelColor, modelName } from './lib'
import type { Cell } from './lib'

const WIDE_LAYOUT_COLUMNS = 92
const REFRESH_MS = 60_000

const snapshot = atom({ plugin: 'usage-band', key: 'snapshot' } as const, null)

function weekOf(rateLimits: SessionRateLimit[]): Week | null {
  const week = rateLimits.find(limit => limit.kind === 'seven_day')
  if (!week) return null
  return {
    percentUsed: week.percentUsed,
    resetsAtMs: week.resetsAt ? Date.parse(week.resetsAt) : null,
  }
}

function contextFields(context: SessionContextUsage) {
  return {
    tokens: context.tokens ?? null,
    window: context.window,
    percent: context.percent ?? null,
  }
}

function patch($: EngineInterface, change: (current: Snapshot) => Snapshot) {
  return update($, snapshot, current => (current ? change(current) : current))
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const [model, usage, settings, nowMs] = await Promise.all([
      $.session.model(),
      $.session.usage(),
      $.settings.read(),
      $.clock.now(),
    ])
    await update($, snapshot, () => ({
      model,
      effort: typeof settings.effortLevel === 'string' ? settings.effortLevel : null,
      ...contextFields(usage.context),
      week: weekOf(usage.rateLimits),
      nowMs,
    }))
    // Landing and countdown move with time, even when the session is idle.
    $.clock.every(REFRESH_MS, () => {
      void $.clock.now().then(now => patch($, current => ({ ...current, nowMs: now })))
    })

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    const nowMs = await $.clock.now()
    await patch($, current => ({
      ...current,
      ...contextFields(e.context),
      week: weekOf(e.rateLimits) ?? current.week,
      nowMs,
    }))

    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    if (e.agentId === undefined) {
      await patch($, current => ({
        ...current,
        model: e.model,
        effort: e.effort === undefined ? current.effort : String(e.effort),
      }))
    }

    return yield* next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const state = await read($, snapshot)
    if (e.props.hasSurvey || state === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)

    const bar = (items: Cell[]) => (
      <Text>
        {items.map(cell => (
          <Text color={cell.color}>{cell.glyph}</Text>
        ))}
      </Text>
    )
    const separator = <Text color={COLORS.empty}> │ </Text>

    const model = (
      <Text>
        <Text color={COLORS.model} weight="semibold">
          {modelName(state.model)}
        </Text>
        {state.effort ? <Text color={COLORS.label}> · {state.effort}</Text> : ''}
      </Text>
    )

    const percent = state.percent ?? 0
    const context = (
      <Text>
        <Text color={COLORS.label}>ctx </Text>
        {bar(cells(percent))}
        <Text color={COLORS.label}>
          {' '}
          {compactTokens(state.tokens)}/{compactTokens(state.window)}{' '}
        </Text>
        <Text color={levelColor(percent)} weight="semibold">
          {Math.round(percent)}%
        </Text>
      </Text>
    )

    const week = state.week
    const projected = week ? landing(week.percentUsed, week.resetsAtMs, state.nowMs) : null
    const usage = week ? (
      <Text>
        <Text color={COLORS.label}>7j </Text>
        {bar(cells(week.percentUsed, projected))}
        <Text color={levelColor(week.percentUsed)} weight="semibold">
          {' '}
          {Math.round(week.percentUsed)}%
        </Text>
        {week.resetsAtMs === null ? (
          ''
        ) : (
          <Text color={COLORS.label}> ↻ {countdown(week.resetsAtMs - state.nowMs)}</Text>
        )}
        {projected === null ? (
          ''
        ) : (
          <Text color={landingColor(projected)} weight="semibold">
            {' '}
            →{projected}%
          </Text>
        )}
      </Text>
    ) : null

    // A tree replaces the mods drawn after this one: keep theirs under it.
    const theirs = await next(e)

    if (e.props.bodyColumns >= WIDE_LAYOUT_COLUMNS) {
      return (
        <Box flexDirection="column">
          <Text wrap="truncate">
            {model}
            {separator}
            {context}
            {usage ? separator : ''}
            {usage ?? ''}
          </Text>
          {theirs}
        </Box>
      )
    }

    return (
      <Box flexDirection="column">
        <Text wrap="truncate">
          {model}
          {separator}
          {context}
        </Text>
        {usage ? <Text wrap="truncate">{usage}</Text> : ''}
        {theirs}
      </Box>
    )
  })
}
