'use client';

import React from "react";
import { Button } from "primereact/button";

interface MainControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onSkip: (seconds: number) => void;
    onNext: () => void;
    onPrevious: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
}

export default function MainControls({
    isPlaying,
    onPlayPause,
    onSkip,
    onNext,
    onPrevious,
    hasNext,
    hasPrevious,
}: MainControlsProps) {
    return (
        <div className="flex justify-between items-center gap-4">
            {/* Previous File */}
            <Button
                icon='pi pi-step-backward'
                rounded
                text
                severity="secondary"
                onClick={onPrevious}
                disabled={!hasPrevious}
                tooltip="Previous file"
                tooltipOptions={{ position: 'top' }}
            />

            {/* Backward 5s */}
            <Button
                icon='pi pi-backward'
                rounded
                text
                severity="secondary"
                onClick={() => onSkip(-5)}
                tooltip="Backward 5s (← or J)"
                tooltipOptions={{ position: 'top' }}
            />

            {/* Play/Pause */}
            <Button
                icon={isPlaying ? 'pi pi-pause' : 'pi pi-play'}
                rounded
                severity="info"
                onClick={onPlayPause}
                className="w-16 h-16"
                tooltip="Play/Pause (Space or K)"
                tooltipOptions={{ position: 'top' }}
            />

            {/* Forward 5s */}
            <Button
                icon="pi pi-forward"
                rounded
                text
                severity="secondary"
                onClick={() => onSkip(5)}
                tooltip="Forward 5s (→ or L)"
                tooltipOptions={{ position: 'top' }}
            />

            {/* Next File */}
            <Button
                icon="pi pi-step-forward"
                rounded
                text
                severity="secondary"
                onClick={onNext}
                disabled={!hasNext}
                tooltip="Next File"
                tooltipOptions={{ position: 'top' }}
            />
        </div>
    );
}