# Changelog

## v4.0.0 - Gemini-Only Architecture (2026-02-09)

### 🎯 Major Changes

Complete architectural simplification - removed all third-party dependencies and unified on Google's Gemini API.

### ✅ Added

- **Single API Solution**: Everything powered by `@google/genai` SDK
- **Gemini Vision Models**: Direct support for Gemini 2.0 Flash, 1.5 Flash, 1.5 Pro
- **Gemini TTS**: 5 multilingual voices (Kore, Charon, Aoede, Puck, Fenrir)
- **Simplified Setup**: Only one API key needed (GEMINI_API_KEY)

### ❌ Removed

- **OpenRouter SDK** (`@openrouter/sdk`) - No longer needed
- **Piper TTS** - Removed local TTS server and Hungarian voices
- **Python dependencies** - No longer needed (flask, piper-tts, etc.)
- **Multiple API keys** - Now only need GEMINI_API_KEY
- **Documentation files**:
  - `OPENROUTER_SETUP.md`
  - `SDK_REFACTOR.md`
  - `MIGRATION.md`
  - `scripts/piper_server.py`

### 🔄 Changed

- **Voice Names**: Simplified from `gemini-Kore` to just `Kore`
- **Model IDs**: Changed from OpenRouter format (`google/gemini-2.0-flash-exp:free`) to direct Gemini format (`gemini-2.0-flash-exp`)
- **Environment**: Removed `OPENROUTER_API_KEY` and `PIPER_BASE_URL`
- **Bundle Size**: Reduced from 1,252 KB to 914 KB (~27% smaller)
- **UI**: Simplified voice selector (no more optgroups)
- **Footer**: "Powered by Gemini API"

### 📦 Dependencies Before → After

**Before:**
```json
{
  "@openrouter/sdk": "^0.8.0",
  "@google/genai": "^1.40.0",
  "pdfjs-dist": "^5.4.624",
  "react": "^19.2.4",
  "react-dom": "^19.2.4"
}
```

**After:**
```json
{
  "@google/genai": "^1.40.0",
  "pdfjs-dist": "^5.4.624",
  "react": "^19.2.4",
  "react-dom": "^19.2.4"
}
```

### 📊 Metrics

- **Lines of Code Removed**: ~200 lines
- **Bundle Size Reduction**: 338 KB (27%)
- **Dependencies Removed**: 1 npm package
- **API Keys Required**: 2 → 1
- **Local Services Required**: 1 → 0

### 🎯 Benefits

1. **Simpler Setup**: No Python, no local servers, just Node.js
2. **Single API Key**: Only GEMINI_API_KEY needed
3. **Smaller Bundle**: 27% reduction in JavaScript bundle size
4. **Unified Provider**: Everything from Google
5. **Official SDK**: Using recommended `@google/genai` package
6. **Easier Maintenance**: Fewer dependencies to manage

### ⚠️ Breaking Changes

- **Removed Models**: No longer supports GPT-4o, Claude, or other non-Gemini models
- **Removed Voices**: No longer supports Hungarian Piper voices (Anna, Berta, Imre)
- **Environment Variables**: `OPENROUTER_API_KEY` and `PIPER_BASE_URL` no longer used
- **Local Server**: `scripts/piper_server.py` removed

### 📝 Migration Guide

If upgrading from v3.x:

1. **Get Gemini API Key**: https://aistudio.google.com/apikey
2. **Update `.env.local`**:
   ```bash
   # Remove these
   OPENROUTER_API_KEY=...
   PIPER_BASE_URL=...
   
   # Keep/add this
   GEMINI_API_KEY=AIzaSy...
   ```
3. **Uninstall old dependencies**:
   ```bash
   npm install  # Will automatically use new package.json
   ```
4. **Stop Piper server** (if running)
5. **Restart app**: `npm run dev`

---

## v3.1.0 - Dual TTS Support (2026-02-09)

### Added
- Gemini TTS support alongside Piper TTS
- 5 Gemini voices (Kore, Charon, Aoede, Puck, Fenrir)
- Voice provider routing (Piper vs Gemini)

---

## v3.0.0 - OpenRouter Integration (2026-02-09)

### Added
- OpenRouter API support for OCR
- Multiple vision model support (Gemini, GPT-4o, Claude)
- Model selection UI

### Removed
- Local Ollama dependency
- `glm-ocr` model (~9 GB)

---

## v2.0.0 - Local Ollama + Piper (2026-02-06)

### Changed
- Replaced Gemini cloud API with local Ollama
- Added Piper TTS for Hungarian voices
- Fully offline operation

---

## v1.0.0 - Initial Release (2026-02-06)

### Features
- PDF upload and page selection
- Gemini vision API for OCR
- Gemini TTS for audio generation
- Word document export
