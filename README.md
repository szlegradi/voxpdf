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
   pip install piper-tts flask flask-cors pathvalidate
   ```
6. Nyomj Entert és várd meg, amíg minden települ

**Magyar hangmodellek letöltése (Windows PowerShell):**

Nyiss egy PowerShell ablakot (Start menü → `powershell` → Enter) és futtasd:

```powershell
# Anna hang
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.local\share\piper\hu_HU-anna-medium"
cd "$env:USERPROFILE\.local\share\piper\hu_HU-anna-medium"
Invoke-WebRequest -Uri "https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/anna/medium/hu_HU-anna-medium.onnx" -OutFile "hu_HU-anna-medium.onnx"
Invoke-WebRequest -Uri "https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/anna/medium/hu_HU-anna-medium.onnx.json" -OutFile "hu_HU-anna-medium.onnx.json"

# Berta hang
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.local\share\piper\hu_HU-berta-medium"
cd "$env:USERPROFILE\.local\share\piper\hu_HU-berta-medium"
Invoke-WebRequest -Uri "https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/berta/medium/hu_HU-berta-medium.onnx" -OutFile "hu_HU-berta-medium.onnx"
Invoke-WebRequest -Uri "https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/berta/medium/hu_HU-berta-medium.onnx.json" -OutFile "hu_HU-berta-medium.onnx.json"

# Imre hang
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.local\share\piper\hu_HU-imre-medium"
cd "$env:USERPROFILE\.local\share\piper\hu_HU-imre-medium"
Invoke-WebRequest -Uri "https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/imre/medium/hu_HU-imre-medium.onnx" -OutFile "hu_HU-imre-medium.onnx"
Invoke-WebRequest -Uri "https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/imre/medium/hu_HU-imre-medium.onnx.json" -OutFile "hu_HU-imre-medium.onnx.json"
```

> Minden hangmodell körülbelül 60 MB, összesen ~180 MB letöltés.

#### macOS

```bash
pip install piper-tts flask flask-cors pathvalidate
```

**Magyar hangmodellek letöltése:**

A Piper TTS-hez szükséges magyar hangmodelleket kézzel kell letölteni:

```bash
# Anna hang
mkdir -p ~/.local/share/piper/hu_HU-anna-medium
cd ~/.local/share/piper/hu_HU-anna-medium
curl -L -O https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/anna/medium/hu_HU-anna-medium.onnx
curl -L -O https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/anna/medium/hu_HU-anna-medium.onnx.json

# Berta hang
mkdir -p ~/.local/share/piper/hu_HU-berta-medium
cd ~/.local/share/piper/hu_HU-berta-medium
curl -L -O https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/berta/medium/hu_HU-berta-medium.onnx
curl -L -O https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/berta/medium/hu_HU-berta-medium.onnx.json

# Imre hang
mkdir -p ~/.local/share/piper/hu_HU-imre-medium
cd ~/.local/share/piper/hu_HU-imre-medium
curl -L -O https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/imre/medium/hu_HU-imre-medium.onnx
curl -L -O https://huggingface.co/rhasspy/piper-voices/resolve/main/hu/hu_HU/imre/medium/hu_HU-imre-medium.onnx.json
```

> Minden hangmodell körülbelül 60 MB, összesen ~180 MB letöltés.

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
PIPER_BASE_URL=http://localhost:5001
```

> **Megjegyzés:** A Piper szerver alapértelmezetten az 5001-es portot használja, mert macOS-en az 5000-es portot az AirPlay Receiver foglalja. Ha Windows-on az 5000-es port szabad, módosíthatod a `scripts/piper_server.py` fájl utolsó sorában a portot 5000-re.

---

## Hibaelhárítás

| Probléma | Megoldás |
|----------|---------|
| "Hiba történt az oldalankénti feldolgozás során" | Ellenőrizd, hogy az Ollama fut-e (`ollama serve`). Próbáld meg: `curl http://localhost:11434/api/tags` |
| "Hiba történt a hanggenerálás során" | Ellenőrizd, hogy a Piper szerver fut-e (`python scripts/piper_server.py`) |
| `ModuleNotFoundError: No module named 'pathvalidate'` | Telepítsd: `pip install pathvalidate` |
| `ValueError: Unable to find voice: hu_HU-anna-medium` | A hangmodellek nincsenek letöltve. Kövesd a fenti "Magyar hangmodellek letöltése" részt. |
| `listen tcp 127.0.0.1:11434: bind: address already in use` | Az Ollama már fut. Nem kell újra indítani, használd a futó példányt. |
| `Port 5000 is in use` (macOS) | Az AirPlay Receiver használja. Kapcsold ki a Rendszerbeállításokban (Általános → AirDrop és Handoff → AirPlay vevő), vagy használd az 5001-es portot (alapértelmezett). |
| `ollama: command not found` | Az Ollama nincs telepítve vagy nincs a PATH-ban. Telepítsd újra. |
| `python: command not found` (Windows) | A Python telepítésnél nem volt bepipálva az "Add to PATH". Telepítsd újra és pipáld be. |
| `pip: command not found` | Próbáld `pip3` paranccsal, vagy telepítsd újra a Pythont PATH opcióval. |
| A böngészőben nem töltődik be az oldal | Ellenőrizd, hogy a 3. ablakban fut-e az `npm run dev` és nincs-e hibaüzenet. |
