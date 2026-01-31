// src/services/audioService.ts

import { TranscriptWord, AudioFile } from '@/types/audio';
import { generateId } from '@/utils/helpers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Mock transcription function for testing
 * In production, this will call Django backend API
 */
export const mockTranscription = async (file: File): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockWords = [
        'Hello', 'and', 'welcome', 'to', 'this', 'English', 'listening', 'practice.',
        'Today', 'we', 'will', 'learn', 'about', 'pronunciation', 'and', 'comprehension.',
        'Please', 'listen', 'carefully', 'and', 'try', 'to', 'understand', 'each', 'word.',
        'Practicing', 'regularly', 'will', 'help', 'improve', 'your', 'listening', 'skills.',
        'Remember', 'to', 'focus', 'on', 'the', 'sounds', 'and', 'intonation.',
        'Good', 'luck', 'with', 'your', 'studies!'
      ];

      const transcript: TranscriptWord[] = mockWords.map((word, index) => ({
        word,
        start: index * 0.8,
        end: (index + 1) * 0.8
      }));

      const mockData = {
        transcript: transcript,
        text: mockWords.join(' '),
        audio_url: URL.createObjectURL(file),  // Mock dùng blob (dev ok)
        language: 'en'
      };

      resolve(mockData);
    }, 2000);
  });
};

/**
 * Upload audio file and get transcription from Django backend
 */
export const transcribeAudio = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch(`${API_BASE_URL}/transcribe/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    const data = await response.json();

    // Xử lý audio_url từ backend
    let audioUrl = data.audio_url;
    // Nếu audio_url là đường dẫn tương đối, thêm base URL của Django backend
    if (audioUrl && !audioUrl.startsWith('http') && !audioUrl.startsWith('blob:')) {
      const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      audioUrl = `${backendBaseUrl}${audioUrl}`;
    }

    // Backend returns 'words' array, not 'transcript'
    return {
      transcript: data.words,
      text: data.text,
      audio_url: audioUrl,
      language: data.language
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    // Fallback to mock data for development
    return mockTranscription(file);
  }
};

/**
 * Process uploaded audio file
 */
export const processAudioFile = async (file: File): Promise<AudioFile> => {
  const transcript = await transcribeAudio(file);
  const audioUrl = transcript.audio_url || URL.createObjectURL(file);

  return {
    id: generateId(),
    name: file.name,
    url: audioUrl,
    transcript: transcript.transcript || [],
    fullText: (transcript.transcript || []).map((w: any) => w.word).join(' ')
  };
};