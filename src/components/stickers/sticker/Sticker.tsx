"use client";

import { useDraggable } from "@dnd-kit/react";
import { type StickerProps } from "@/types/sticker";
import { useState, useRef, useEffect, useCallback } from "react";

function Sticker({
    id,
    positionX,
    positionY,
    zIndex,
    title,
    content,
    layout,
    onActivate,
    onUpdate,
    onRemove,
    onMinimize,
}: StickerProps) {
    const isBoard = layout === "board";
    const [isTitleEditEnabled, setIsTitleEditEnabled] = useState<boolean>(false);
    const [isMinimizing, setIsMinimizing] = useState(false);
    const [isAppearing, setIsAppearing] = useState(true);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsAppearing(false));
        return () => cancelAnimationFrame(frame);
    }, []);

    const minimizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMinimizeClick = () => {
        setIsMinimizing(true);
        minimizeTimerRef.current = setTimeout(() => onMinimize(id)(), 300);
    };

    useEffect(() => {
        return () => {
            if (minimizeTimerRef.current) clearTimeout(minimizeTimerRef.current);
        };
    }, []);

    const titleRef = useRef<HTMLInputElement | null>(null);
    const titleWrapperRef = useRef<HTMLDivElement | null>(null);
    const { ref, handleRef, isDragging } = useDraggable({
        id,
        data: { id },
    });

    const toggleEditingTitle = () => {
        setIsTitleEditEnabled((prev) => !prev);
    };

    const handleOutsideClick = useCallback((e: PointerEvent) => {
        if (titleWrapperRef.current && !titleWrapperRef.current.contains(e.target as Node)) {
            setIsTitleEditEnabled(false);
        }
    }, []);

    useEffect(() => {
        if (isTitleEditEnabled) {
            setTimeout(() => titleRef.current?.focus(), 0);
            document.addEventListener("pointerdown", handleOutsideClick);
        } else {
            document.removeEventListener("pointerdown", handleOutsideClick);
        }

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
        };
    }, [isTitleEditEnabled, handleOutsideClick]);

    return (
        <div
            ref={isBoard ? ref : undefined}
            className={`${isBoard ? "absolute z-1 h-100 w-100" : "relative w-full h-64"} overflow-hidden shadow-[0_0_12px_#301e42] transition-[opacity,scale,translate] duration-300 ${isMinimizing || isAppearing ? "scale-75 opacity-0 translate-y-10" : ""}`}
            style={isBoard ? { left: positionX, top: positionY, zIndex } : undefined}
            onPointerDown={isBoard ? onActivate(id) : undefined}
        >
            <div
                className="relative flex items-center bg-(--primary) px-2.5 py-1.25"
                ref={titleWrapperRef}
            >
                <div className="panel-buttons relative z-10 flex items-center font-size-0">
                    <button
                        className="mr-1.5 w-3 h-3 bg-(--removeNote) rounded-full cursor-pointer relative before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[50%] before:-translate-x-1/2 before:w-2 before:h-0.5 before:bg-black before:opacity-0 before:transition-opacity before:rotate-45 after:absolute after:top-1/2 after:-translate-y-1/2 after:left-[50%] after:-translate-x-1/2 after:w-0.5 after:h-2 after:bg-black after:opacity-0 after:transition-opacity after:rotate-45 hover:before:opacity-100 hover:after:opacity-100"
                        onClick={onRemove(id)}
                    />
                    {isBoard && (
                        <button
                            className="mr-1.5 w-3 h-3 bg-(--minimize) rounded-full cursor-pointer relative before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[50%] before:-translate-x-1/2 before:w-2 before:h-0.5 before:bg-black before:opacity-0 before:transition-opacity hover:before:opacity-100"
                            onClick={handleMinimizeClick}
                        />
                    )}
                </div>
                {isBoard && (
                    <div
                        ref={handleRef}
                        className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    />
                )}
                <div
                    className={`relative z-10 grow ${isTitleEditEnabled ? "" : "pointer-events-none"}`}
                >
                    <input
                        ref={titleRef}
                        value={title}
                        disabled={!isTitleEditEnabled}
                        className="bg-transparent w-full px-2 font-sans text-[16px] font-bold text-white outline-none disabled:pointer-events-none"
                        onChange={onUpdate(id, "title")}
                    />
                </div>
                <button
                    type="button"
                    className="relative z-10 h-[24px] w-[24px] flex cursor-pointer justify-center items-center text-white"
                    aria-label="Edit sticker"
                    onClick={toggleEditingTitle}
                >
                    {!isTitleEditEnabled ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z" />
                            <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z" />
                        </svg>
                    )}
                </button>
            </div>

            <textarea
                className="block h-[calc(100%-34px)] w-full resize-none border-2 border-t-0 border-[rgba(70,74,84,0.34)] bg-[#1b1d1d82] p-5 backdrop-blur-[10px] focus:outline-none"
                value={content}
                onChange={onUpdate(id, "content")}
            />

            <button
                type="button"
                className="absolute right-0 bottom-0 h-5 w-5 cursor-nwse-resize"
                aria-label="Resize sticker"
            />

            {isDragging ? (
                <div className="pointer-events-none absolute inset-0 ring-2 ring-white/40" />
            ) : null}
        </div>
    );
}

export default Sticker;
