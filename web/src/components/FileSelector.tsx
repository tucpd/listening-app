
'use client';

import React from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { AudioFile } from '../types/audio';

interface FileSelectorProps {
  audioFiles: AudioFile[];
  currentFileId: string | null;
  onFileChange: (fileId: string) => void;
}

export default function FileSelector({ audioFiles, currentFileId, onFileChange }: FileSelectorProps) {
  const fileOptions = audioFiles.map(file => ({
    label: file.name,
    value: file.id
  }));

  if (audioFiles.length === 0) return null;

  return (
    <Card className="mb-3 shadow-lg">
      <div className="flex items-center gap-4" style={{ marginTop: '-1.25rem', marginBottom: '-1.25rem' }}>
        <label className="font-semibold text-gray-700">Select Audio:</label>
        <Dropdown
          value={currentFileId}
          options={fileOptions}
          onChange={(e) => onFileChange(e.value)}
          placeholder="Choose an audio file"
          className="flex-1"
        />
      </div>
    </Card>
  );
}