# Gemini API Beállítási Útmutató

Ez az útmutató végigvezet a Gemini API beállításán az alkalmazásban.

## Mi az a Gemini API?

A Gemini API a Google legújabb mesterséges intelligencia szolgáltatása, amely:
- **Vision (OCR)**: Szöveg kinyerése képekből/PDF-ekből
- **TTS (Text-to-Speech)**: Szöveg felolvasása természetes hangon
- **Többnyelvű**: Támogatja a magyar nyelvet és sok más nyelvet
- **Felhő alapú**: Nem igényel helyi telepítést
- **Kiváló minőség**: Természetes hangzású beszéd és pontos OCR
- **Több hang**: 5 különböző hang közül választhatsz

## 1. Egyszerű API Kulcs létrehozása (Ajánlott)

### Google AI Studio (legegyszerűbb)

1. Menj a Google AI Studio API kulcs oldalra: **https://aistudio.google.com/apikey**
2. Jelentkezz be Google fiókkal
3. Kattints a **"Get API key"** vagy **"Create API key"** gombra
4. Másold ki az API kulcsot (pl. `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

> **Ez a legegyszerűbb módszer!** Azonnal használható API kulcsot kapsz, nincs szükség bonyolult beállításokra.

## 2. Alternatíva: Google Cloud Console (haladó)

Ha több kontrollt szeretnél (pl. költségkorlát, részletes monitoring):

### 2.1. Google Cloud Projekt létrehozása

1. Menj a Google Cloud Console-ra: https://console.cloud.google.com/
2. Jelentkezz be Google fiókkal
3. Hozz létre új projektet vagy válassz egy meglévőt

### 2.2. API Kulcs létrehozása

1. Menj a Credentials oldalra: https://console.cloud.google.com/apis/credentials
2. Kattints a **"Create Credentials"** → **"API key"**
3. Másold ki az API kulcsot

### 2.3. API Kulcs korlátozása (ajánlott)

1. Szerkeszd az API kulcsot
2. **Application restrictions**: HTTP referrers → `http://localhost:3000/*`
3. **API restrictions**: Restrict key → Generative Language API
4. Mentsd el

## 3. API Kulcs beállítása a projektben

### Windows

1. Nyisd meg a projekt mappáját
2. Nyisd meg a `.env.local` fájlt szövegszerkesztővel
3. Add hozzá vagy frissítsd:
   ```
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. Mentsd el a fájlt

### macOS / Linux

```bash
cd /útvonal/a/pdf-hangfelolvaso/mappához
nano .env.local
```

Add hozzá:
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Mentsd el: `Ctrl+O`, `Enter`, `Ctrl+X`

## 4. Elérhető Gemini hangok

Az alkalmazás 5 Gemini TTS hangot támogat:

### Női hangok

1. **Kore** - Semleges, professzionális női hang
2. **Aoede** - Meleg, barátságos női hang

### Férfi hangok

3. **Charon** - Mély, határozott férfi hang
4. **Puck** - Közepes, energikus férfi hang
5. **Fenrir** - Erős, markáns férfi hang

> **Tipp**: Próbáld ki mindegyiket és válaszd ki a számodra legmegfelelőbbet!

## 5. Használat

1. Indítsd el az alkalmazást: `npm run dev`
2. Töltsd fel a PDF-et és nyerd ki a szöveget
3. A **"Hang kiválasztása"** legördülő menüben válaszd ki valamelyik Gemini hangot:
   - Kore (női, Gemini)
   - Charon (férfi, Gemini)
   - Aoede (női, Gemini)
   - Puck (férfi, Gemini)
   - Fenrir (férfi, Gemini)
4. Kattints a **"Szöveg felolvasása"** gombra
5. Várd meg, amíg a hang generálódik (felhő alapú, lassabb lehet)
6. Hallgasd meg vagy töltsd le a hangfájlt

## Költségek és Ingyenes Tier

### Ingyenes Tier (Google AI Studio)

A Gemini API **ingyenes tier-t** biztosít, amely elegendő lehet kisebb projektekhez:
- **Korlátok**: https://ai.google.dev/pricing
- **Napi kvóta**: Korlátozott számú kérés naponta
- **Tökéletes**: Teszteléshez és kisebb használathoz

### Fizetős Tier (Google Cloud)

Ha nagyobb kvótára van szükséged:

**Gemini Vision (OCR):**
- Gemini 2.0 Flash: ~$0.075 / 1M token
- Gemini 1.5 Flash: ~$0.075 / 1M token  
- Gemini 1.5 Pro: ~$1.25 / 1M token

**Gemini TTS:**
- Input: ~$0.30 / 1M karakter
- Output (audio): ~$2.50 / 1M karakter

### Költségbecslés (teljes folyamat)

Egy átlagos PDF oldal (~1000 szó, ~6000 karakter):
- **OCR**: ~$0.0005 (0.05 cent)
- **TTS**: ~$0.015 (1.5 cent)
- **Összesen**: ~$0.0155 (1.55 cent) / oldal

Példa 100 oldal:
- **OCR**: ~$0.05
- **TTS**: ~$1.50
- **Összesen**: ~$1.55

## Hibaelhárítás

### "Gemini API kulcs hiányzik!"

**Megoldás:**
1. Ellenőrizd, hogy létrehoztad-e az API kulcsot
2. Ellenőrizd, hogy a `.env.local` fájlban helyesen van-e beállítva:
   ```
   GEMINI_API_KEY=AIzaSy...
   ```
3. Indítsd újra az alkalmazást: `npm run dev`

### "Gemini hiba: 403 Forbidden"

**Okok:**
- Az API kulcs korlátozva van (rossz referrer)
- Az API nincs engedélyezve

**Megoldás:**
1. Használj Google AI Studio-ból generált kulcsot (egyszerűbb)
2. Vagy ellenőrizd az API kulcs korlátozásait a Google Cloud Console-ban

### "Gemini TTS hiba: 429 Too Many Requests"

**Ok**: Túl sok kérést küldtél rövid időn belül (rate limit).

**Megoldás:**
- Várj néhány másodpercet
- Csökkentsd az oldalak számát
- Használj kisebb szövegdarabokat

### "Gemini hiba: 400 Bad Request"

**Ok**: Érvénytelen kérés (pl. rossz hang név vagy modell).

**Megoldás:**
- Ellenőrizd, hogy a kiválasztott hang támogatott-e
- Ellenőrizd, hogy a modell név helyes-e
- Próbáld újra más hanggal vagy modellel

## Biztonság

### API kulcs védelme

- ❌ **NE** commitold a `.env.local` fájlt git-be!
- ❌ **NE** oszd meg az API kulcsot senkivel!
- ❌ **NE** tedd fel publikus GitHub repo-ba!
- ✅ A `.env.local` már benne van a `.gitignore` fájlban

### Ha véletlenül kiszivárgott a kulcs

1. Menj azonnal a Google Cloud Console-ra
2. Töröld a kiszivárgott API kulcsot
3. Hozz létre egy új kulcsot
4. Frissítsd a `.env.local` fájlt

## Következő lépések

Most, hogy beállítottad a Gemini API-t:
1. Próbáld ki az összes hangot és modellt
2. Válaszd ki a számodra legmegfelelőbbet
3. Élvezd a kiváló OCR és hangminőséget! 🎉

## Hasznos linkek

- Google Cloud Console: https://console.cloud.google.com/
- Generative AI API: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
- API Credentials: https://console.cloud.google.com/apis/credentials
- Billing: https://console.cloud.google.com/billing
- Gemini TTS dokumentáció: https://ai.google.dev/gemini-api/docs/speech-generation
