import { TranscriptWord } from '../types/audio';

export interface TranscriptSentence {
    text: string;
    start: number;
    end: number;
    words: TranscriptWord[];
}

/**
 * Group individual transcript words into sentences based on punctuation.
 */
export const groupWordsToSentences = (words: TranscriptWord[]): TranscriptSentence[] => {
    if (!words || words.length === 0) return [];

    const sentences: TranscriptSentence[] = [];
    let currentWords: TranscriptWord[] = [];

    words.forEach((wordObj, index) => {
        currentWords.push(wordObj);

        // Check if word ends with sentence-ending punctuation
        const isEndOfSentence = /[.!?]$/.test(wordObj.word) || index === words.length - 1;

        if (isEndOfSentence) {
            if (currentWords.length > 0) {
                const start = currentWords[0].start;
                const end = currentWords[currentWords.length - 1].end;
                const text = currentWords.map(w => w.word).join(' ');

                sentences.push({
                    text,
                    start,
                    end,
                    words: [...currentWords]
                });
                currentWords = [];
            }
        }
    });

    return sentences;
};