export type Week = { percentUsed: number; resetsAtMs: number | null }

export type Snapshot = {
  model: string
  effort: string | null
  tokens: number | null
  window: number | null
  percent: number | null
  week: Week | null
  nowMs: number
}

declare module 'claude-code' {
  interface PluginState {
    'usage-band': { snapshot: Snapshot | null }
  }
}
