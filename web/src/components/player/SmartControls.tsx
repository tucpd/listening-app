'use client';

import React from "react";
import { Button } from "primereact/button";

interface SmartControlsProps {
    loopA: number | null;
    loopB: number | null;
    isAbLoopActive: boolean;
    isSentenceLoopActive: boolean;
    onSetLoopA: () => void;
    onSetLoopB: () => void;
    onClearLoop: () => void;
    onToggleSentenceLoop: () => void;
}

export default function SmartControls({
    loopA,
    loopB,
    isAbLoopActive,
    isSentenceLoopActive,
    onSetLoopA,
    onSetLoopB,
    onClearLoop,
    onToggleSentenceLoop,
}: SmartControlsProps) {

    
    return (
        <div className="flex flex-wrap items-center justify-center justify-between gap-4 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-indigo-800">Loop:</span>
                <Button
                    label="A"
                    size="small"
                    className={loopA !== null ? 'p-button-primary' : 'p-button-outlined'}
                    onClick={onSetLoopA}
                    tooltip="Set Start Point (A)"
                />
                <Button
                    label="B"
                    size="small"
                    className={loopB !== null ? 'p-button-primary' : 'p-button-outlined'}
                    disabled={loopA === null}
                    onClick={onSetLoopB}
                    tooltip="Set End Point (B) & Loop"
                />
                {(isAbLoopActive || loopA !== null) && (
                    <Button
                        icon="pi pi-times"
                        rounded
                        text
                        severity="danger"
                        onClick={onClearLoop}
                        tooltip="Clear Loop"
                    />
                )}
                {isAbLoopActive && <span className="text-xs text-indigo-600 font-medium animate-pulse">Looping A-B</span>}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    icon="pi pi-replay"
                    label="Repeat Sentence"
                    size="small"
                    severity={isSentenceLoopActive ? "help" : "secondary"}
                    text={!isSentenceLoopActive}
                    onClick={onToggleSentenceLoop}
                    tooltip="Loop current sentence automatically"
                />
            </div>
        </div>
    );
}