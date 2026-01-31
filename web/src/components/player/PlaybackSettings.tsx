'use client';

import React from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";

export type PlaybackMode = 'normal' | 'repeat-one' | 'repeat-all' | 'shuffle';

interface PlaybackSettingsProps {
    playbackSpeed: number;
    onSpeedChange: (speed: number) => void;
    playbackMode: PlaybackMode;
    onPlaybackModeChange: (mode: PlaybackMode) => void;
}

export default function PlaybackSettings({
    playbackSpeed, onSpeedChange,
    playbackMode, onPlaybackModeChange,
}: PlaybackSettingsProps) {

    const speedOptions = [
        { label: '0.5x', value: 0.5 },
        { label: '0.6x', value: 0.6 },
        { label: '0.7x', value: 0.7 },
        { label: '0.8x', value: 0.8 },
        { label: '0.9x', value: 0.9 },
        { label: '1.0x', value: 1.0 },
        { label: '1.1x', value: 1.1 },
        { label: '1.2x', value: 1.2 },
        { label: '1.3x', value: 1.3 },
        { label: '1.4x', value: 1.4 },
        { label: '1.5x', value: 1.5 },
    ];

    // Playback mode icons
    const getPlaybackModeIcon = () => {
        switch (playbackMode) {
            case 'repeat-one':
                return 'pi pi-sync';
            case 'repeat-all':
                return 'pi pi-replay';
            case 'shuffle':
                return 'pi pi-shuffle';
            default:
                return 'pi pi-list';
        }
    };

    const getPlaybackModeTooltip = () => {
        switch (playbackMode) {
            case 'repeat-one':
                return 'Repeat One';
            case 'repeat-all':
                return 'Repeat All';
            case 'shuffle':
                return 'Shuffle';
            default:
                return 'Normal';
        }
    };

    const cyclePlaybackMode = () => {
        const modes: PlaybackMode[] = ['normal', 'repeat-one', 'repeat-all', 'shuffle'];
        const currentIndex = modes.indexOf(playbackMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        onPlaybackModeChange(modes[nextIndex]);
    };

    return (
        <div className="flex items-center justify-between gap-4 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 ml-auto">
                <Dropdown
                    value={playbackSpeed}
                    options={speedOptions}
                    onChange={(e) => onSpeedChange(e.value)}
                    className="w-26"
                />
            </div>
            <div className="flex item-center gap-2">
                <Button 
                    icon={getPlaybackModeIcon()}
                    label={getPlaybackModeTooltip()}
                    onClick={cyclePlaybackMode}
                    size="small"
                    outlined
                    tooltip="Click to cycle modes"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        </div>
    );
}