# SIGATC Visual Updates

## Summary
This update introduces a design-token-based theme, CSS variables, and consistent styling across components to align the application with the design guide. It standardizes colors, radii, shadows, and improves maintainability.

## Before / After

![Before](./screenshots/before.png)
![After](./screenshots/after.png)

## Technical Highlights
- Added `src/theme.js` with color tokens, radii, and shadows
- Wrapped the app with `ThemeProvider` and exposed CSS variables via `createGlobalStyle`
- Replaced hard-coded colors with `var(...)` across components
- Map layers now read colors from CSS variables ensuring brand consistency
- Tests verified and app preview checked

## Capture Instructions
To generate screenshots:
- Start dev server: `npm run dev`
- Open `http://localhost:5173/`
- Capture header + dashboard + map area for before/after comparison
- Save images to `docs/screenshots/before.png` and `docs/screenshots/after.png`