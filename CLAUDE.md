# CLAUDE.md - Build & Run Instructions

Commands for development, building, and testing.

## Build & Run Commands
* **Start local dev servers**:
  * Backend: `npm --prefix backend run dev` (Runs Fastify on port 5001)
  * Frontend: `npm --prefix frontend run dev` (Runs Vite on port 5173)
* **Build production bundles**:
  * Backend: `npm --prefix backend run build`
  * Frontend: `npm --prefix frontend run build`

## Lint & Formatting
* **Format code**: `npm run format` (runs Prettier)
* **Lint code**: `npm run lint` (runs ESLint)

## Testing Commands
* **Run tests**:
  * Backend: `npm --prefix backend test` (runs Tap / Jest)
  * Frontend: `npm --prefix frontend test` (runs Vitest)
