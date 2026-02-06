
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { VoiceName } from "../types";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const OLLAMA_BASE_URL = (typeof process !== 'undefined' && process.env?.OLLAMA_BASE_URL) || 'http://localhost:11434';
const PIPER_BASE_URL = (typeof process !== 'undefined' && process.env?.PIPER_BASE_URL) || 'http://localhost:5000';

export class LocalService {

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
   * Extracts text from a specific PDF page using Ollama vision model.
   * The PDF page is first rendered to PNG, then sent to llama3.2-vision.
   */
  async extractSinglePage(pdfArrayBuffer: ArrayBuffer, pageNum: number): Promise<string> {
    const base64Png = await this.renderPageToImage(pdfArrayBuffer, pageNum);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2-vision',
        prompt: `Kérlek, másold ki a képen látható szöveget pontosan, szóról szóra.

KÜLÖNLEGES UTASÍTÁSOK HASÁBOS/MAGAZIN ELRENDEZÉSHEZ:
- A szöveget HASÁBRÓL HASÁBRA haladva (függőlegesen) másold ki.
- A képaláírásokat és a hirdetések szövegeit is tartsd meg, de különítsd el őket üres sorokkal.

SZABÁLYOK:
1. NE fogalmazd át! NE készíts összefoglalót!
2. Csak a képen található eredeti szöveget add vissza bevezető nélkül.`,
        images: [base64Png],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama hiba: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.response || "";
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
   * Generates audio from text using the local Piper TTS server.
   * Returns a WAV Blob directly.
   */
  async textToSpeech(text: string, voice: VoiceName, onProgress?: (current: number, total: number) => void): Promise<Blob> {
    const chunks = this.splitTextIntoChunks(text);
    const wavBuffers: ArrayBuffer[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (onProgress) onProgress(i + 1, chunks.length);

      const response = await fetch(`${PIPER_BASE_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chunks[i], voice }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Piper TTS hiba: ${response.status} - ${errorText}`);
      }

      const buffer = await response.arrayBuffer();
      wavBuffers.push(buffer);
    }

    if (wavBuffers.length === 0) {
      throw new Error("A hanggenerálás nem sikerült.");
    }

    // Single chunk — return as-is
    if (wavBuffers.length === 1) {
      return new Blob([wavBuffers[0]], { type: 'audio/wav' });
    }

    // Multiple chunks — concatenate WAV data (strip 44-byte headers from subsequent chunks)
    const firstHeader = wavBuffers[0].slice(0, 44);
    let totalDataLength = 0;
    const dataChunks: ArrayBuffer[] = [];

    for (let i = 0; i < wavBuffers.length; i++) {
      const dataStart = i === 0 ? 44 : 44;
      const data = wavBuffers[i].slice(dataStart);
      dataChunks.push(data);
      totalDataLength += data.byteLength;
    }

    // Build final WAV: header + all PCM data
    const finalBuffer = new ArrayBuffer(44 + totalDataLength);
    const finalView = new DataView(finalBuffer);
    const headerView = new DataView(firstHeader);

    // Copy header from first chunk
    for (let i = 0; i < 44; i++) {
      finalView.setUint8(i, headerView.getUint8(i));
    }

    // Update RIFF chunk size (offset 4): total file size - 8
    finalView.setUint32(4, 44 + totalDataLength - 8, true);
    // Update data chunk size (offset 40): total PCM data length
    finalView.setUint32(40, totalDataLength, true);

    // Copy all PCM data
    let offset = 44;
    for (const chunk of dataChunks) {
      const src = new Uint8Array(chunk);
      new Uint8Array(finalBuffer, offset, src.length).set(src);
      offset += src.length;
    }

    return new Blob([finalBuffer], { type: 'audio/wav' });
  }
}

export const localService = new LocalService();
