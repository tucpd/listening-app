// src/app/page.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import FileUploadSection from '@/components/FileUploadSection';
import FileSelector from '@/components/FileSelector';
import AudioPlayer from '@/components/AudioPlayer';
import TranscriptPanel from '@/components/TranscriptPanel';
import useEnglishListeningApp from '@/hooks/useEnglishListeningApp';
import { AudioFile, FileUploadEvent } from '@/types/audio';
import { processAudioFile } from '@/services/audioService';
import { downloadTextFile } from '@/utils/helpers';
import { start } from 'repl';


export default function EnglishListeningApp() {
  const {
    // state
    audioFiles, currentFileId, currentFile, isPlaying, setIsPlaying,
    currentTime, duration, playbackSpeed, playbackMode, setPlaybackMode,
    isLoading, highlightedWordIndex, isTranscriptVisible, setIsTranscriptVisible,
    // Refs
    audioRef, toast, fileUploadRef,
    // Handlers
    handleFileUpload, togglePlayPause, skipTime,
    handleTimeUpdate, handleLoadedMetadata, handleSeek, handleAudioEnded,
    handleSpeedChange, changeAudioFile, goToNextFile, goToPreviousFile,
    downloadTranscript,
  } = useEnglishListeningApp();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-6">
      <Toast ref={toast} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">
            English Listening Practice
          </h1>
          <p className="text-gray-600">Upload audio files and practice your listening skills</p>
        </div>

        {/* Upload Section */}
        <FileUploadSection
          ref={fileUploadRef}
          isLoading={isLoading}
          onUpload={handleFileUpload}
        />

        {/* File Selector */}
        <FileSelector
          audioFiles={audioFiles}
          currentFileId={currentFileId}
          onFileChange={changeAudioFile}
        />

        {/* Main Content */}
        {currentFile && (
          <div className={`grid gap-6 ${isTranscriptVisible ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Audio player */}
            <AudioPlayer
              audioFile={currentFile}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlayPause={togglePlayPause}
              onSkip={skipTime}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onSeek={handleSeek}
              onEnded={handleAudioEnded}
              audioRef={audioRef as React.RefObject<HTMLAudioElement>}
              onNext={goToNextFile}
              onPrevious={goToPreviousFile}
              hasNext={audioFiles.length > 1}
              hasPrevious={audioFiles.length > 1}
              playbackSpeed={playbackSpeed}
              onSpeedChange={handleSpeedChange}
              playbackMode={playbackMode}
              onPlaybackModeChange={setPlaybackMode}
            />

            {/* Transcript panel */}
            {isTranscriptVisible && (
              <TranscriptPanel
                audioFile={currentFile}
                highlightedWordIndex={highlightedWordIndex}
                onDownload={downloadTranscript}
                onToggle={() => setIsTranscriptVisible(false)}
                isVisible={true}
                onWordClick={(startTime) => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = startTime;
                    audioRef.current.play();
                    setIsPlaying(true);
                  }
                }}
              />
            )}

            {/* Toggle button khi ẩn transcript */}
            {!isTranscriptVisible && (
              <div className="fixed right-0 top-1/2 transform -translate-y-1/2">
                <Button
                  icon="pi pi-angle-left"
                  rounded
                  severity="info"
                  onClick={() => setIsTranscriptVisible(true)}
                  tooltip="Show Transcript"
                  tooltipOptions={{ position: 'left' }}
                  className="shadow-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {audioFiles.length === 0 && !isLoading && (
          <Card className="shadow-lg">
            <div className="text-center py-12">
              <i className="pi pi-cloud-upload text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No audio files were processed successfully yet.
              </h3>
              <p className="text-gray-500">
                Upload your audio files to start practicing English listening
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}