# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDF Hangfelolvasó AI — a Hungarian-language web app that extracts text from PDF documents page-by-page using a local Ollama vision model (`llama3.2-vision`), then converts the extracted text to speech via Piper TTS. Users can also download the extracted text as a Word (.doc) file. Fully offline — no cloud API keys needed.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on port 3000
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build

No test framework or linter is configured.

## Environment

Set `OLLAMA_BASE_URL` and `PIPER_BASE_URL` in `.env.local` (defaults: `http://localhost:11434` and `http://localhost:5000`). Vite config injects them as `process.env.OLLAMA_BASE_URL` and `process.env.PIPER_BASE_URL` at build time via `define`.

### Required local services

1. **Ollama** — `OLLAMA_ORIGINS="*" ollama serve` (must have `llama3.2-vision` model pulled)
2. **Piper TTS server** — `python scripts/piper_server.py` (Flask wrapper around `piper` CLI)

## Architecture

Single-page React 19 app built with Vite and TypeScript. No routing, no state management library — all state lives in `App.tsx` via `useState`.

### Key files

- **`App.tsx`** — the entire UI and all application logic in one component. Manages a state machine via `ProcessingState.status`: `idle` → `extracting` → `ready_to_speech` → `generating_audio` (and `error`).
- **`services/localService.ts`** — `LocalService` class with three main methods:
  - `renderPageToImage(pdfData, pageNum)` — renders a single PDF page to a base64 PNG via pdf.js offscreen canvas at 2x scale.
  - `extractSinglePage(pdfArrayBuffer, pageNum)` — renders the page to PNG, then POSTs to Ollama's `/api/generate` with `llama3.2-vision` model and the image for OCR.
  - `textToSpeech(text, voice, onProgress)` — chunks text (~1500 chars per chunk at sentence boundaries), sends each chunk to Piper TTS server, then concatenates WAV buffers.
- **`scripts/piper_server.py`** — minimal Flask server wrapping Piper CLI. `POST /api/tts` accepts `{ text, voice }` and returns WAV audio.
- **`types.ts`** — `VoiceName` enum (Anna, Berta, Imre — Hungarian Piper voices), `ProcessingState` interface, `AudioResult` interface.

### External dependencies loaded via CDN (in `index.html`)

- **Tailwind CSS** — loaded via `cdn.tailwindcss.com` script tag (not installed as a package)
- **pdf.js 3.11.174** — loaded via cdnjs; used as global `pdfjsLib` (declared as `any` in App.tsx and localService.ts)

### Data flow

1. User uploads PDF → read as ArrayBuffer → parsed by pdf.js for page count
2. User selects page range → each page rendered to PNG via pdf.js → sent to Ollama vision model for OCR (one API call per page)
3. Extracted text displayed → user can generate audio (TTS) or download as Word
4. TTS: text split into ~1500-char chunks → each chunk sent to Piper TTS server → WAV responses concatenated → played/downloaded directly

## Language

The UI is entirely in Hungarian. All user-facing strings, Ollama prompts, and error messages are in Hungarian.
