## HACK-NATION-2025

Prototype web app for a HackNation 2025 project. This is an early prototype: many flows are mocked or hard-coded to demonstrate the concept quickly. The showcased videos were actually produced ahead of time using pre-defined prompts, and we used [ElevenLabs](https://elevenlabs.io) to generate voice-over/audio and add background music. The app plays these assets from the `web/public` folder.

The frontend is built with React + TypeScript + Vite. Large media assets are stored with Git LFS. Some client-side media work may use FFmpeg.wasm.

## Project structure

-   `web/`: React + Vite application
    -   `web/public/`: Pre-generated media assets (mp4, mp3, images)
    -   `web/src/`: Source code (React, TypeScript)

## Quick start

### Prerequisites

-   Node.js >= 18
-   npm (or pnpm/yarn)
-   Git
-   Git LFS (required to fetch large media assets)

### 1) Clone and install Git LFS

```bash
git clone <this-repo-url>
cd HACK-NATION-2025

# Install Git LFS (macOS via Homebrew shown; see https://git-lfs.com for other OSes)
brew install git-lfs || true
git lfs install

# Ensure large files are fetched (in case your Git config didn’t auto-pull LFS objects)
git lfs pull
```

### 2) Install dependencies

```bash
cd web
npm install
```

### 3) Run the app

```bash
npm run dev
```

The app will print a local URL (typically `http://localhost:5173`).

### 4) Build and preview (optional)

```bash
npm run build
npm run preview
```

## Git LFS notes

This repository relies on Git LFS to store large media (e.g., `.mp4`, `.mp3`, images). If you see small pointer files instead of real media after cloning, you likely need to:

```bash
git lfs install
git lfs pull
```

If you add new large assets, make sure they are tracked by LFS in your fork/branch:

```bash
git lfs track "*.mp4" "*.mp3" "*.wav" "*.png"
git add .gitattributes
git add path/to/your/asset.mp4
git commit -m "Track media with Git LFS"
```

## Prototype disclaimer

-   Much of the application logic is mocked or wired to pre-defined data for demo purposes.
-   Videos were created with predefined prompts; audio and music were generated with ElevenLabs, then exported into `web/public`.
-   The app does not require API keys for content generation at runtime; assets are bundled as static files.

## Scripts (from `web/package.json`)

-   `npm run dev`: Start Vite dev server
-   `npm run build`: Type-check and build for production
-   `npm run preview`: Preview the production build locally
-   `npm run lint`: Run ESLint

## Dependencies

Runtime:

-   `react`, `react-dom`
-   `@ffmpeg/ffmpeg`, `@ffmpeg/util` (FFmpeg.wasm utilities)

Dev:

-   `vite`
-   `typescript`
-   `eslint` (+ React plugins)
-   `@vitejs/plugin-react`
-   `@types/react`, `@types/react-dom`

## Environment configuration

-   No environment variables are required for local development in this prototype.
-   ElevenLabs was used offline/externally to pre-generate audio and music; there are no runtime API calls or keys used by the app.

## Troubleshooting

-   Media files won’t play or appear missing: verify Git LFS is installed and run `git lfs pull` at the repo root.
-   Build fails on old Node.js: upgrade to Node 18+.
