import { describe, it, expect } from 'vitest'
import { store, actions } from '../../src/store.js'

describe('store reducers', () => {
  it('updates current weather metrics and risk level', () => {
    const payload = {
      temperature: 25.5,
      precipitation: 0.4,
      humidity: 72,
      windSpeed: 4.1,
      riskLevel: 'green',
      description: 'Baixo risco — tempo relativamente estável',
      timestamp: '2025-12-01 03:00'
    }
    store.dispatch(actions.weather.setCurrent(payload))
    const s = store.getState()
    expect(s.weather.current.temperature).toBe(25.5)
    expect(s.weather.current.riskLevel).toBe('green')
  })

  it('adds forecast chunks', () => {
    const chunk = [
      { time: '2025-12-01 04:00', temp: 22.1, precip: 0.0, risk: 'green' },
      { time: '2025-12-01 05:00', temp: 21.7, precip: 0.1, risk: 'yellow' }
    ]
    store.dispatch(actions.weather.addForecastChunk(chunk))
    const s = store.getState()
    expect(s.weather.forecast.length).toBeGreaterThan(0)
  })

  it('toggles zone layer visibility', () => {
    const visibility = { red: false, yellow: true, green: true }
    store.dispatch(actions.ui.setZoneLayers(visibility))
    const s = store.getState()
    expect(s.ui.zoneLayers.red).toBe(false)
    expect(s.ui.zoneLayers.yellow).toBe(true)
    expect(s.ui.zoneLayers.green).toBe(true)
  })
})