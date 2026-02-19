export enum VoiceName {
  Kore = "Kore",
  Charon = "Charon",
  Aoede = "Aoede",
  Puck = "Puck",
  Fenrir = "Fenrir",
}

export enum VisionModel {
  Gemini31ProPreview = "gemini-3.1-pro-preview",
  Gemini3ProPreview = "gemini-3-pro-preview",
  Gemini3FlashPreview = "gemini-3-flash-preview",
  Gemini25Pro = "gemini-2.5-pro",
  Gemini25Flash = "gemini-2.5-flash",
  Gemini25FlashLite = "gemini-2.5-flash-lite",
}

export interface ProcessingState {
  status:
    | "idle"
    | "extracting"
    | "ready_to_speech"
    | "generating_audio"
    | "error";
  message: string;
}

export interface AudioResult {
  url: string;
  blob: Blob;
}
