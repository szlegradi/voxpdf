
import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

export interface PageRange {
  start: number;
  end: number;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * Extracts text from a specific PDF page. 
   * Processing one by one ensures better reliability for large documents.
   */
  async extractSinglePage(base64Pdf: string, pageNum: number): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Pdf,
              mimeType: 'application/pdf'
            }
          },
          {
            text: `Kérlek, másold ki a PDF szövegét pontosan, szóról szóra a(z) ${pageNum}. oldalról.
            
            KÜLÖNLEGES UTASÍTÁSOK HASÁBOS/MAGAZIN ELRENDEZÉSHEZ:
            - A szöveget HASÁBRÓL HASÁBRA haladva (függőlegesen) másold ki.
            - A képaláírásokat és a hirdetések szövegeit is tartsd meg, de különítsd el őket üres sorokkal.

            SZABÁLYOK:
            1. NE fogalmazd át! NE készíts összefoglalót!
            2. Csak a PDF-ben található eredeti szöveget add vissza bevezető nélkül.`
          }
        ]
      }
    });

    return response.text || "";
  }

  /**
   * Splits text into smaller chunks (approx 1500 chars) for reliable TTS.
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
   * Generates audio from text using Gemini TTS with automatic chunking.
   */
  async textToSpeech(text: string, voice: VoiceName, onProgress?: (current: number, total: number) => void): Promise<string> {
    const chunks = this.splitTextIntoChunks(text);
    const audioBuffers: Uint8Array[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (onProgress) onProgress(i + 1, chunks.length);
      
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Olvasd fel szóról szóra: ${chunks[i]}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });

      const base64Chunk = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Chunk) {
        const binaryString = atob(base64Chunk);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) {
          bytes[j] = binaryString.charCodeAt(j);
        }
        audioBuffers.push(bytes);
      }
    }

    if (audioBuffers.length === 0) throw new Error("A hanggenerálás nem sikerült.");

    const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
    const finalBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      finalBuffer.set(buf, offset);
      offset += buf.length;
    }

    let binary = '';
    const sliceSize = 8192;
    for (let i = 0; i < finalBuffer.length; i += sliceSize) {
      binary += String.fromCharCode.apply(null, Array.from(finalBuffer.subarray(i, i + sliceSize)));
    }
    return btoa(binary);
  }
}

export const geminiService = new GeminiService();
