# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDF Hangfelolvasó AI — a Hungarian-language web app that extracts text from PDF documents page-by-page using Gemini AI, then converts the extracted text to speech. Users can also download the extracted text as a Word (.doc) file. Originally created via Google AI Studio.

## Commands

- `npm install` — install dependencies
- `npm run dev` — start Vite dev server on port 3000
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build

No test framework or linter is configured.

## Environment

Set `GEMINI_API_KEY` in `.env.local`. Vite config injects it as `process.env.API_KEY` at build time via `define`.

## Architecture

Single-page React 19 app built with Vite and TypeScript. No routing, no state management library — all state lives in `App.tsx` via `useState`.

### Key files

- **`App.tsx`** — the entire UI and all application logic in one component. Manages a state machine via `ProcessingState.status`: `idle` → `extracting` → `ready_to_speech` → `generating_audio` (and `error`).
- **`services/geminiService.ts`** — `GeminiService` class wrapping `@google/genai`. Two main methods:
  - `extractSinglePage(base64Pdf, pageNum)` — sends the full PDF as base64 inline data to `gemini-3-pro-preview`, asking it to extract text from a specific page number.
  - `textToSpeech(text, voice, onProgress)` — chunks text (~1500 chars per chunk at sentence boundaries), sends each chunk to `gemini-2.5-flash-preview-tts` for audio generation, then concatenates the raw PCM buffers.
- **`utils/audioUtils.ts`** — base64 encode/decode, PCM Int16 → AudioBuffer conversion, and AudioBuffer → WAV blob conversion (manual WAV header construction).
- **`types.ts`** — `VoiceName` enum (Kore, Puck, Charon, Fenrir, Zephyr), `ProcessingState` interface, `AudioResult` interface.

### External dependencies loaded via CDN (in `index.html`)

- **Tailwind CSS** — loaded via `cdn.tailwindcss.com` script tag (not installed as a package)
- **pdf.js 3.11.174** — loaded via cdnjs; used as global `pdfjsLib` (declared as `any` in App.tsx)

### Data flow

1. User uploads PDF → read as ArrayBuffer → converted to base64 + parsed by pdf.js for page count
2. User selects page range → each page extracted sequentially via Gemini API (one API call per page)
3. Extracted text displayed → user can generate audio (TTS) or download as Word
4. TTS: text split into ~1500-char chunks → each chunk sent to Gemini TTS → raw PCM concatenated → decoded to AudioBuffer → encoded as WAV blob

## Language

The UI is entirely in Hungarian. All user-facing strings, Gemini prompts, and error messages are in Hungarian.
