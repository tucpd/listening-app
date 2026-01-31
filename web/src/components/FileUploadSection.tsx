'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { FileUploadEvent } from '@/types/audio';

interface FileUploadSectionProps {
  isLoading: boolean;
  onUpload: (event: FileUploadEvent) => void;
}

export interface FileUploadSectionHandle {
  reset: () => void;
}

const FileUploadSection = forwardRef<FileUploadSectionHandle, FileUploadSectionProps>(
  ({ isLoading, onUpload }, ref) => {
    const fileUploadRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (fileUploadRef.current) {
          fileUploadRef.current.clear();
        }
      }
    }));

    return (
      <Card className="mb-3 shadow-lg" >
        <div className="flex flex-col items-center gap-4" style={{ margin: '-1.25rem' }}>
          <FileUpload
            ref={fileUploadRef}
            mode="advanced"
            multiple
            accept="audio/*,.wma"
            maxFileSize={50000000}
            customUpload
            uploadHandler={onUpload}
            chooseLabel="Select Audio Files"
            uploadLabel="Send"
            disabled={isLoading}
            emptyTemplate={<p className="text-gray-500 text-center">Drag and drop audio files here to begin</p>}
          />
          {isLoading && (
            <div className="flex items-center gap-3">
              <span className="text-gray-600">Processing audio files...</span>
              <ProgressBar mode="indeterminate" style={{ height: '8px' }} />
            </div>
          )}
        </div>
      </Card>
    );
  }
);

FileUploadSection.displayName = 'FileUploadSection';

export default FileUploadSection;