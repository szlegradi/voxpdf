# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoxPDF — a Hungarian-language web app that extracts text from PDF documents page-by-page using Gemini vision models, then converts the extracted text to speech via Gemini TTS. Users can also download the extracted text as a Word (.doc) file. Powered entirely by Google's Gemini API.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on port 3000
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build

No test framework or linter is configured.

## Environment

Set `GEMINI_API_KEY` in `.env.local`. Vite config injects it as an environment variable at build time via `define`.

### Required services

1. **Gemini API** — Get API key from https://aistudio.google.com/apikey - Required for both OCR and TTS

## Architecture

Single-page React 19 app built with Vite and TypeScript. No routing, no state management library — all state lives in `App.tsx` via `useState`.

### Key files

- **`App.tsx`** — the entire UI and all application logic in one component. Manages a state machine via `ProcessingState.status`: `idle` → `extracting` → `ready_to_speech` → `generating_audio` (and `error`). Includes model selection UI.
- **`services/localService.ts`** — `LocalService` class with main methods:
 - `renderPageToImage(pdfData, pageNum)` — renders a single PDF page to a base64 PNG via pdf.js offscreen canvas at 2x scale.
 - `extractSinglePage(pdfArrayBuffer, pageNum, model, signal?)` — renders the page to PNG, then uses `@google/genai` SDK to send the image to the selected Gemini vision model for OCR via `models.generateContent()`.
 - `textToSpeech(text, voice, onProgress)` — chunks text (~1500 chars per chunk at sentence boundaries), sends to Gemini TTS API via `@google/genai` SDK, concatenates PCM audio.
- **`types.ts`** — `VoiceName` enum (5 Gemini TTS voices), `VisionModel` enum (3 Gemini vision models), `ProcessingState` interface, `AudioResult` interface.

### External dependencies loaded via CDN (in `index.html`)

- **Tailwind CSS** — loaded via `cdn.tailwindcss.com` script tag (not installed as a package)
- **pdf.js 3.11.174** — loaded via cdnjs; used as global `pdfjsLib` (declared as `any` in App.tsx and localService.ts)

### Data flow

1. User uploads PDF → read as ArrayBuffer → parsed by pdf.js for page count
2. User selects page range and Gemini model → each page rendered to PNG via pdf.js → sent to Gemini vision model via `@google/genai` SDK for OCR (one API call per page)
3. Extracted text displayed → user can generate audio (TTS) or download as Word
4. TTS: text split into ~1500-char chunks → each chunk sent to Gemini TTS API → PCM audio responses concatenated → played/downloaded

### Available Gemini models

- `gemini-2.0-flash-exp` — Gemini 2.0 Flash (fast, cost-effective)
- `gemini-1.5-flash` — Gemini 1.5 Flash (reliable)
- `gemini-1.5-pro` — Gemini 1.5 Pro (best quality)

### Dependencies

- **`@google/genai`** — Google Generative AI SDK (both OCR and TTS)
- **`pdfjs-dist`** — PDF.js for client-side PDF rendering
- **`react`** / **`react-dom`** — React 19
- **`vite`** — Build tool


## Language

The UI is entirely in Hungarian. All user-facing strings, Gemini prompts, and error messages are in Hungarian.
