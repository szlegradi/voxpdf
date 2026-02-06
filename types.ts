
export enum VoiceName {
  Anna = 'hu_HU-anna-medium',
  Berta = 'hu_HU-berta-medium',
  Imre = 'hu_HU-imre-medium',
}

export interface ProcessingState {
  status: 'idle' | 'extracting' | 'ready_to_speech' | 'generating_audio' | 'error';
  message: string;
}

export interface AudioResult {
  url: string;
  blob: Blob;
}
