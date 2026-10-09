import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * SOC-sys Dashboard — smoke test.
 *
 * Verifies the Vite config still binds the right port and exposes the
 * hub-facing /api/health middleware. Runs in CI on every PR.
 */

describe('SOC-sys vite config', () => {
  const configPath = resolve(process.cwd(), 'vite.config.ts')
  const config = readFileSync(configPath, 'utf-8')

  it('binds port 3003 with strictPort', () => {
    expect(config).toMatch(/port:\s*3003/)
    expect(config).toMatch(/strictPort:\s*true/)
  })

  it('binds on 0.0.0.0 so the hub iframe can reach it', () => {
    expect(config).toMatch(/host:\s*['"]0\.0\.0\.0['"]/)
  })

  it('exposes a /api/health middleware plugin', () => {
    expect(config).toMatch(/\/api\/health/)
    expect(config).toMatch(/Access-Control-Allow-Origin/)
    expect(config).toMatch(/soc-sys/)
  })
})
