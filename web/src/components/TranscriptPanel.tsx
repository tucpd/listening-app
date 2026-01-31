'use client';

import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { AudioFile } from '@/types/audio';

interface TranscriptPanelProps {
  audioFile: AudioFile;
  highlightedWordIndex: number;
  onDownload: () => void;
  onToggle: () => void;
  isVisible: boolean;
  onWordClick: (startTime: number) => void;
}

export default function TranscriptPanel({
  audioFile,
  highlightedWordIndex,
  onDownload,
  onToggle,
  isVisible,
  onWordClick,
}: TranscriptPanelProps) {
  return (
    <Card className="shadow-lg relative">
      {/* Toggle Button */}
      <div className="flex flex-col gap-4 h-[calc(100vh-200px)]" style={{ marginTop: '-0.75rem' }}>
        <div className="flex justify-between items-center border-b pb-3 transform -translate-y-2.25">
          <Button
            icon="pi pi-angle-right"
            rounded
            text
            raised
            severity="warning"
            onClick={onToggle}
            tooltip="Hide Transcript"
            tooltipOptions={{ position: 'left' }}
            className="absolute transform z-10 shadow-md"
          />
          <h2 className="text-2xl font-bold text-indigo-900">Transcript</h2>
          <Button
            icon="pi pi-download"
            label="Save as TXT"
            severity="success"
            onClick={onDownload}
            size="small"
          />
        </div>

        {/* Transcript Text with Highlighting */}
        <div className="flex-1 overflow-y-auto bg-white p-6 rounded-lg border border-gray-200 leading-relaxed text-lg min-h-[400px] max-h-[600px]">
          {audioFile.transcript.map((wordObj, index) => (
            <span
              key={index}
              onDoubleClick={() => onWordClick(wordObj.start)}
              className={`mr-1 px-2 py-1 rounded cursor-pointer transition-all duration-200 inline-block ${index === highlightedWordIndex
                ? 'bg-yellow-300 font-bold text-indigo-900 px-1 rounded shadow-md scale-105'
                : 'hover:bg-gray-200 text-gray-800'
                }`}
            >
              {wordObj.word}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}