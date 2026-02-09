<div align="center">
  <img src="public/logo.png" alt="VoxPDF Logo" width="400">
  
  <h1>VoxPDF</h1>
  
  <p>Magyar nyelvű webalkalmazás, amely PDF dokumentumokból oldalanként szöveget nyer ki Gemini vision modellekkel, majd felolvassa a szöveget Gemini TTS-sel.</p>
</div>

## Funkciók

- PDF feltöltése és oldalak kiválasztása
- **Szöveg kinyerése oldalanként Gemini vision modellekkel**: Gemini 2.0 Flash, 1.5 Flash, 1.5 Pro
- **Szöveg felolvasása Gemini TTS-sel**: 5 többnyelvű hang (Kore, Charon, Aoede, Puck, Fenrir)
- Kinyert szöveg letöltése Word (.doc) fájlként
- Hanganyag letöltése PCM fájlként
- Egyetlen API kulcs mindkettőhöz (OCR + TTS)

---

## Telepítés lépésről lépésre

Az alkalmazás használatához csak **Node.js** és egy **Gemini API kulcs** szükséges.

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

### 2. Gemini API kulcs beszerzése

Részletes útmutató: [GEMINI_SETUP.md](GEMINI_SETUP.md)

**Gyors lépések:**

1. Menj a Google AI Studio-ba: https://aistudio.google.com/apikey
2. Jelentkezz be Google fiókkal
3. Kattints a **"Get API key"** gombra
4. Válaszd a **"Create API key"** opciót
5. Másold ki az API kulcsot (pl. `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

> **Ingyenes használat:** A Gemini API ingyenes tier-t biztosít! Részletek: https://ai.google.dev/pricing

---

### 3. API kulcs beállítása

Hozz létre egy `.env.local` fájlt a projekt mappájában az alábbi tartalommal:

```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Cseréld ki az `AIzaSy...` részt a saját Gemini API kulcsodra!

```bash
npm install   # csak első alkalommal
npm run dev
```

---

## Használat

1. Nyisd meg a böngészőt (Chrome ajánlott) és menj erre a címre: **http://localhost:3000**
2. Kattints a feltöltés területre és válassz ki egy PDF fájlt
3. Add meg az oldalszám tartományt (pl. 1-től 5-ig)
4. Válaszd ki a Gemini modellt (Gemini 2.0 Flash ajánlott)
5. Kattints a **"Szekvenciális kinyerés indítása"** gombra
6. Amikor a szöveg megjelenik, válaszd ki a hangot (Kore, Charon, Aoede, Puck, Fenrir)
7. Kattints a **"Szöveg felolvasása"** gombra
8. A hanganyagot lejátszhatod vagy letöltheted
9. A kinyert szöveget Word dokumentumként is letöltheted

---

## Beállítások

A `.env.local` fájlban lehet módosítani az API kulcsot:

```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```


## Hibaelhárítás

| Probléma | Megoldás |
|----------|---------|
| "Gemini API kulcs hiányzik!" | Ellenőrizd, hogy a `.env.local` fájlban helyesen van-e beállítva a `GEMINI_API_KEY`. |
| "Gemini hiba: 401" | Az API kulcs érvénytelen. Szerezz új kulcsot: https://aistudio.google.com/apikey |
| "Gemini hiba: 429" | Rate limit túllépve. Várj néhány másodpercet vagy frissítsd a kvótát. |
| "Gemini TTS hiba: ..." | Ellenőrizd, hogy van-e elég kredit/kvóta a Gemini API-hoz. |
| A böngészőben nem töltődik be az oldal | Ellenőrizd, hogy fut-e az `npm run dev` és nincs-e hibaüzenet. |
