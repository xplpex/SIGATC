import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import App from '../../src/App.jsx'
import { store } from '../../src/store.js'

vi.mock('leaflet', () => ({
  default: {
    map: () => ({
      remove: () => {},
      addLayer: () => {},
      layerGroups: {}
    }),
    tileLayer: () => ({ addTo: () => {} }),
    control: { scale: () => ({ addTo: () => {} }) },
    layerGroup: () => ({ addLayer: () => {} }),
    circle: () => ({
      bindTooltip: () => {},
      on: () => {},
      addTo: () => {}
    })
  }
}))

describe('App UI', () => {
  it('renders header and main sections', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    )
    expect(screen.getByText('SIGATC • Goiânia, GO')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByLabelText('Mapa de Goiânia com zonas de risco')).toBeInTheDocument()
    expect(screen.getByText('Previsão 24h')).toBeInTheDocument()
  })
})