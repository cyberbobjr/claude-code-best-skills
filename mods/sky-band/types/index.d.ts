export type Sky = { nowMs: number; offsetMinutes: number; commits: number }

declare module 'claude-code' {
  interface PluginState {
    'sky-band': { sky: Sky | null }
  }
}
