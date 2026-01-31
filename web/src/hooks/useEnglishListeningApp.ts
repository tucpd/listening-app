import React, { useState, useRef, useEffect } from 'react';
import { FileUploadSectionHandle } from '@/components/FileUploadSection';
import { AudioFile, FileUploadEvent } from '@/types/audio';
import { processAudioFile } from '@/services/audioService';
import { downloadTextFile } from '@/utils/helpers';

export default function useEnglishListeningApp() {
    // 1. Setup State & Refs
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
    const [currentFileId, setCurrentFileId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    type PlaybackMode = 'normal' | 'repeat-one' | 'repeat-all' | 'shuffle';
    const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('normal');
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
    const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);

    const audioRef = useRef<HTMLAudioElement>(null);
    const toast = useRef<any>(null);
    const fileUploadRef = useRef<FileUploadSectionHandle>(null);

    const currentFile = audioFiles.find(f => f.id === currentFileId);

    // 2. Effects
    // Update highlighted word based on current time
    useEffect(() => {
        if (currentFile && currentFile.transcript.length > 0) {
            const index = currentFile.transcript.findIndex(
                word => currentTime >= word.start && currentTime <= word.end
            );
            setHighlightedWordIndex(index);
        }
    }, [currentTime, currentFile]);

    // keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Tránh trigger khi đang focus vào input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (!audioRef.current) return;

            switch (e.key.toLowerCase()) {
                case 'arrowleft':
                case 'j':
                    e.preventDefault();
                    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
                    break;
                case 'arrowright':
                case 'l':
                    e.preventDefault();
                    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5);
                    break;
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlayPause();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying, duration]);

    // 3. Handlers
    const handleFileUpload = async (event: FileUploadEvent) => {
        const files = event.files;
        setIsLoading(true);

        try {
            for (const file of files) {
                const newAudioFile = await processAudioFile(file);
                setAudioFiles(prev => [...prev, newAudioFile]);

                // Set first file as current
                if (!currentFileId) {
                    setCurrentFileId(newAudioFile.id);
                }
            }

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Files uploaded and processed successfully',
                life: 3000
            });

            // Reset file upload section
            fileUploadRef.current?.reset();
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to process audio files',
                life: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const skipTime = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(
                0,
                Math.min(duration, audioRef.current.currentTime + seconds)
            );
        }
    };

    const changeAudioFile = (fileId: string, autoPlay: boolean = false) => {
        setCurrentFileId(fileId);
        setCurrentTime(0);
        setHighlightedWordIndex(-1);
        // Không set isPlaying = false, để người dùng quyết định
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const goToNextFile = () => {
        if (audioFiles.length === 0) return;
        const currentIndex = audioFiles.findIndex(f => f.id === currentFileId);
        const nextIndex = (currentIndex + 1) % audioFiles.length;
        changeAudioFile(audioFiles[nextIndex].id, true);
    };

    const goToPreviousFile = () => {
        if (audioFiles.length === 0) return;
        const currentIndex = audioFiles.findIndex(f => f.id === currentFileId);
        const prevIndex = currentIndex === 0 ? audioFiles.length - 1 : currentIndex - 1;
        changeAudioFile(audioFiles[prevIndex].id);
    };

    const getRandomFileId = (excludeCurrentId?: string): string => {
        const availableFiles = excludeCurrentId
            ? audioFiles.filter(f => f.id !== excludeCurrentId)
            : audioFiles;

        if (availableFiles.length === 0) return audioFiles[0].id;

        const randomIndex = Math.floor(Math.random() * availableFiles.length);
        return availableFiles[randomIndex].id;
    };

    const handleAudioEnded = () => {
        switch (playbackMode) {
            case 'repeat-one':
                // Phát lại file hiện tại
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                    setIsPlaying(true);
                }
                break;

            case 'repeat-all':
                // Chuyển sang file tiếp theo, loop lại danh sách
                goToNextFile();
                setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.play();
                        setIsPlaying(true);
                    }
                }, 100);
                break;

            case 'shuffle':
                // Chọn file ngẫu nhiên
                const randomId = getRandomFileId(currentFileId || undefined);
                changeAudioFile(randomId);
                setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.play();
                        setIsPlaying(true);
                    }
                }, 100);
                break;

            default:
                // Normal: dừng lại
                setIsPlaying(false);
                break;
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            // Chỉ update state nếu thay đổi đủ lớn (>100ms) để avoid excessive re-renders
            const newTime = audioRef.current.currentTime;
            setCurrentTime(prev => {
                if (Math.abs(newTime - prev) > 0.1) {
                    return newTime;
                }
                return prev;
            });
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            // Không set state here, để timeupdate event xử lý
        }
    };

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    };

    const downloadTranscript = () => {
        if (currentFile) {
            const filename = `${currentFile.name.replace(/\.[^/.]+$/, '')}_transcript.txt`;
            downloadTextFile(currentFile.fullText, filename);

            toast.current?.show({
                severity: 'success',
                summary: 'Downloaded',
                detail: 'Transcript saved successfully',
                life: 3000
            });
        }
    };

    // 4. Return
    return {
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
    };
}