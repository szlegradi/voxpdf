
export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr'
}

export interface ProcessingState {
  status: 'idle' | 'extracting' | 'ready_to_speech' | 'generating_audio' | 'error';
  message: string;
}

export interface AudioResult {
  url: string;
  blob: Blob;
}
