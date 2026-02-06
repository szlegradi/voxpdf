# PDF Hangfelolvasó AI

Magyar nyelvű webalkalmazás, amely PDF dokumentumokból oldalanként szöveget nyer ki egy helyi mesterséges intelligencia (Ollama) segítségével, majd felolvassa a szöveget Piper TTS-sel. Teljesen offline működik — nincs szükség felhőszolgáltatásra vagy API kulcsra.

## Funkciók

- PDF feltöltése és oldalak kiválasztása
- Szöveg kinyerése oldalanként AI-val (Ollama + llama3.2-vision)
- Szöveg felolvasása magyar hangokkal (Piper TTS — Anna, Berta, Imre)
- Kinyert szöveg letöltése Word (.doc) fájlként
- Hanganyag letöltése WAV fájlként

---

## Telepítés lépésről lépésre

Az alkalmazás használatához három programra van szükség: **Node.js**, **Ollama** és **Piper TTS**. Az alábbi útmutató végigvezet a teljes telepítésen.

---

### 1. Node.js telepítése

A Node.js futtatja magát a webalkalmazást.

#### Windows

1. Nyisd meg a böngészőt és látogass el ide: https://nodejs.org
2. Kattints a nagy zöld **LTS** gombra — ez letölti a telepítőt
3. Futtasd a letöltött `.msi` fájlt
4. A telepítőben mindenhol kattints a **Next** gombra, majd az **Install** gombra
5. Ha kéri, pipáld be a "Automatically install the necessary tools" opciót
6. Várd meg, amíg befejeződik, majd kattints a **Finish** gombra

#### macOS

```bash
brew install node
```

Vagy töltsd le a telepítőt a https://nodejs.org oldalról.

---

### 2. Ollama telepítése

Az Ollama futtatja a mesterséges intelligenciát a gépeden, amely kiolvassa a szöveget a PDF oldalakból.

#### Windows

1. Látogass el ide a böngészőben: https://ollama.com/download
2. Kattints a **Download for Windows** gombra
3. Futtasd a letöltött telepítőt és kövesd az utasításokat
4. Telepítés után nyiss egy **Parancssort** (Start menü → keress rá: `cmd` → Enter)
5. Írd be az alábbi parancsot és nyomj Entert (ez letölti az AI modellt, ~2 GB):
   ```
   ollama pull llama3.2-vision
   ```
6. Várd meg, amíg a letöltés befejeződik

#### macOS

```bash
brew install ollama
ollama pull llama3.2-vision
```

---

### 3. Python és Piper TTS telepítése

A Piper TTS végzi a szöveg felolvasását magyar hangokkal. Egy kis Python szerver indítja el.

#### Windows

1. Látogass el ide: https://www.python.org/downloads/
2. Kattints a nagy sárga **Download Python** gombra
3. **FONTOS:** A telepítő első ablakában pipáld be az **"Add python.exe to PATH"** opciót!
4. Kattints az **Install Now** gombra és várd meg, amíg befejeződik
5. Nyiss egy **új** Parancssort (Start menü → `cmd` → Enter) és írd be:
   ```
   pip install piper-tts flask flask-cors
   ```
6. Nyomj Entert és várd meg, amíg minden települ

#### macOS

```bash
pip install piper-tts flask flask-cors
```

> A magyar hangok (`hu_HU-anna-medium`, `hu_HU-berta-medium`, `hu_HU-imre-medium`) automatikusan letöltődnek az első használatkor.

---

## Az alkalmazás indítása

Minden indításkor **három programot kell elindítani** — mindegyiket egy külön parancssor/terminál ablakban.

### Windows

Nyiss **három különálló** Parancssor ablakot (Start menü → `cmd` → Enter), és mindegyikben lépj be a projekt mappájába:
```
cd útvonal\a\pdf-hangfelolvaso\mappához
```

**1. ablak — Ollama indítása:**
```
set OLLAMA_ORIGINS=*
ollama serve
```

**2. ablak — Piper TTS szerver indítása:**
```
python scripts/piper_server.py
```

**3. ablak — Webalkalmazás indítása:**

Első alkalommal (vagy ha változott valami):
```
npm install
```

Majd:
```
npm run dev
```

### macOS

Nyiss **három terminál ablakot** és mindegyikben lépj be a projekt mappájába.

**1. ablak — Ollama:**
```bash
OLLAMA_ORIGINS="*" ollama serve
```

**2. ablak — Piper TTS:**
```bash
python scripts/piper_server.py
```

**3. ablak — Webalkalmazás:**
```bash
npm install   # csak első alkalommal
npm run dev
```

---

## Használat

1. Nyisd meg a böngészőt (Chrome ajánlott) és menj erre a címre: **http://localhost:3000**
2. Kattints a feltöltés területre és válassz ki egy PDF fájlt
3. Add meg az oldalszám tartományt (pl. 1-től 5-ig) és kattints a **"Szekvenciális kinyerés indítása"** gombra
4. Amikor a szöveg megjelenik, válaszd ki a hangot (Anna, Berta vagy Imre) és kattints a **"Szöveg felolvasása"** gombra
5. A hanganyagot lejátszhatod vagy letöltheted WAV fájlként
6. A kinyert szöveget Word dokumentumként is letöltheted

---

## Beállítások

A szolgáltatások URL-jeit a `.env.local` fájlban lehet módosítani (alapértelmezetten nem kell változtatni):

```
OLLAMA_BASE_URL=http://localhost:11434
PIPER_BASE_URL=http://localhost:5000
```

---

## Hibaelhárítás

| Probléma | Megoldás |
|----------|---------|
| "Hiba történt az oldalankénti feldolgozás során" | Ellenőrizd, hogy az Ollama fut-e (`ollama serve`). Próbáld meg: `curl http://localhost:11434/api/tags` |
| "Hiba történt a hanggenerálás során" | Ellenőrizd, hogy a Piper szerver fut-e (`python scripts/piper_server.py`) |
| `ollama: command not found` | Az Ollama nincs telepítve vagy nincs a PATH-ban. Telepítsd újra. |
| `python: command not found` (Windows) | A Python telepítésnél nem volt bepipálva az "Add to PATH". Telepítsd újra és pipáld be. |
| `pip: command not found` | Próbáld `pip3` paranccsal, vagy telepítsd újra a Pythont PATH opcióval. |
| A böngészőben nem töltődik be az oldal | Ellenőrizd, hogy a 3. ablakban fut-e az `npm run dev` és nincs-e hibaüzenet. |
