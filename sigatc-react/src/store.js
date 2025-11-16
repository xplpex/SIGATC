import { configureStore, createSlice } from '@reduxjs/toolkit'

const weatherSlice = createSlice({
  name: 'weather',
  initialState: {
    current: {
      temperature: 21.5,
      precipitation: 0,
      humidity: 91,
      windSpeed: 6.2,
      riskLevel: 'yellow',
      description: 'Risco moderado — instabilidade possível',
      timestamp: '2025-12-01 02:00'
    },
    forecast: [],
    version: Date.now()
  },
  reducers: {
    setCurrent(state, action) { state.current = action.payload; state.version = Date.now() },
    addForecastChunk(state, action) { state.forecast.push(...action.payload); state.version = Date.now() },
    setForecast(state, action) { state.forecast = action.payload; state.version = Date.now() }
  }
})

const uiSlice = createSlice({ 
  name: 'ui', 
  initialState: { 
    trafficIndex: 1,
    zoneLayers: { red: true, yellow: true, green: true }
  }, 
  reducers: { 
    setTrafficIndex(s,a){ s.trafficIndex=a.payload },
    setZoneLayers(s,a){ s.zoneLayers=a.payload }
  } 
})
const syncSlice = createSlice({ name: 'sync', initialState: { status: 'online', conflicts: 0 }, reducers: { setStatus(s,a){ s.status=a.payload }, incConflict(s){ s.conflicts++ } } })

export const store = configureStore({ reducer: { weather: weatherSlice.reducer, ui: uiSlice.reducer, sync: syncSlice.reducer } })
export const actions = { weather: weatherSlice.actions, ui: uiSlice.actions, sync: syncSlice.actions }