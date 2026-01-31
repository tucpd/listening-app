export interface TranscriptWord {
  word: string;
  start: number;
  end: number;
}

export interface AudioFile {
  id: string;
  name: string;
  url: string;
  transcript: TranscriptWord[];
  fullText: string;
}

export interface FileUploadEvent {
  files: File[];
}