
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName, VisionModel } from "../types";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const LOCAL_STORAGE_KEY = 'voxpdf_gemini_api_key';

export class LocalService {
  private geminiClient: GoogleGenAI | null = null;

  constructor() {
    const savedKey = this.getSavedApiKey();
    if (savedKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: savedKey });
    }
  }

  getSavedApiKey(): string {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  }

  setApiKey(apiKey: string): void {
    try {
      if (apiKey) {
        localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable
    }
    this.geminiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  /**
   * Renders a single PDF page to a base64 PNG using pdf.js offscreen canvas.
   */
  private async renderPageToImage(pdfData: ArrayBuffer, pageNum: number): Promise<string> {
    const pdf = await pdfjsLib.getDocument({ data: pdfData.slice(0) }).promise;
    const page = await pdf.getPage(pageNum);

    const scale = 2.0;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({ canvasContext: ctx, viewport }).promise;

    const dataUrl = canvas.toDataURL('image/png');
    // Strip the "data:image/png;base64," prefix
    return dataUrl.split(',')[1];
  }

  /**
   * Extracts text from a specific PDF page using Gemini vision model.
   * The PDF page is first rendered to PNG, then sent to the selected vision model.
   */
  async extractSinglePage(pdfArrayBuffer: ArrayBuffer, pageNum: number, model: VisionModel, signal?: AbortSignal): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini API kulcs hiányzik! Add meg az API kulcsot a beállításokban.');
    }

    const base64Png = await this.renderPageToImage(pdfArrayBuffer, pageNum);

    const prompt = `Kérlek, másold ki a képen látható szöveget pontosan, szóról szóra.

KÜLÖNLEGES UTASÍTÁSOK HASÁBOS/MAGAZIN ELRENDEZÉSHEZ:
- A szöveget HASÁBRÓL HASÁBRA haladva (függőlegesen) másold ki.
- A képaláírásokat és a hirdetések szövegeit is tartsd meg, de különítsd el őket üres sorokkal.

SZABÁLYOK:
1. NE fogalmazd át! NE készíts összefoglalót!
2. Csak a képen található eredeti szöveget add vissza bevezető nélkül.`;

    try {
      const response = await this.geminiClient.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/png',
                  data: base64Png,
                },
              },
            ],
          },
        ],
      });

      return response.text || "";
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw new Error(`Gemini hiba: ${error.message || 'Ismeretlen hiba történt'}`);
    }
  }

  /**
   * Splits text into smaller chunks (approx 1500 chars) at sentence boundaries.
   */
  private splitTextIntoChunks(text: string, maxChars: number = 1500): string[] {
    const chunks: string[] = [];
    const sentences = text.match(/[^\.!\?]+[\.!\?]+|.+/g) || [text];
    let currentChunk = "";

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChars) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  /**
   * Generates audio from text using Gemini TTS API.
   */
  async textToSpeech(text: string, voice: VoiceName, onProgress?: (current: number, total: number) => void): Promise<Blob> {
    if (!this.geminiClient) {
      throw new Error('Gemini API kulcs hiányzik! Add meg az API kulcsot a beállításokban.');
    }

    const chunks = this.splitTextIntoChunks(text);
    const audioBuffers: Uint8Array[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (onProgress) onProgress(i + 1, chunks.length);

      try {
        const response = await this.geminiClient.models.generateContent({
          model: 'gemini-2.5-flash-preview-tts',
          contents: chunks[i],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voice,
                },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          // Convert base64 to Uint8Array
          const binaryString = atob(base64Audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let j = 0; j < binaryString.length; j++) {
            bytes[j] = binaryString.charCodeAt(j);
          }
          audioBuffers.push(bytes);
        }
      } catch (error: any) {
        throw new Error(`Gemini TTS hiba: ${error.message || 'Ismeretlen hiba történt'}`);
      }
    }

    if (audioBuffers.length === 0) {
      throw new Error("A hanggenerálás nem sikerült.");
    }

    // Concatenate all audio buffers
    const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
    const finalBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      finalBuffer.set(buf, offset);
      offset += buf.length;
    }

    // Gemini returns PCM audio, wrap in a Blob
    return new Blob([finalBuffer], { type: 'audio/pcm' });
  }
}

export const localService = new LocalService();
