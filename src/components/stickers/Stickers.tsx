"use client";

import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useStickerStore } from "@/features/stickers/store";
import { useShallow } from "zustand/react/shallow";

import { useCallback, useEffect } from "react";
import {
    MIN_STICKER_X,
    MIN_STICKER_Y,
    STICKER_HEIGHT,
    STICKER_WIDTH,
    VIEWPORT_MARGIN,
} from "@/constants/sticker";
import Sticker from "./sticker/Sticker";
import Minimized from "@/components/minimized/Minimized";
import { type Note } from "@/types/sticker";

function Stickers() {
    const { stickers, isLoading, addSticker, updateSticker, removeSticker, fetchStickers } =
        useStickerStore(
            useShallow((s) => ({
                stickers: s.stickers,
                isLoading: s.isLoading,
                addSticker: s.addSticker,
                updateSticker: s.updateSticker,
                removeSticker: s.removeSticker,
                fetchStickers: s.fetchStickers,
            }))
        );

    useEffect(() => {
        fetchStickers();
    }, [fetchStickers]);

    const bringToFront = useCallback(
        (id: string) => () => {
            updateSticker(id, {
                zIndex: Math.max(0, ...Object.values(stickers).map((item) => item.zIndex)) + 1,
            });
        },
        [stickers, updateSticker]
    );

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            if (event.canceled) {
                return;
            }

            const sourceId = String(event.operation.source?.id ?? "");

            if (!sourceId) {
                return;
            }

            const { x, y } = event.operation.transform;
            const maxX = Math.max(
                MIN_STICKER_X,
                window.innerWidth - STICKER_WIDTH - VIEWPORT_MARGIN
            );
            const maxY = Math.max(
                MIN_STICKER_Y,
                window.innerHeight - STICKER_HEIGHT - VIEWPORT_MARGIN
            );
            const sticker = stickers[sourceId];

            updateSticker(sourceId, {
                positionX: Math.min(maxX, Math.max(MIN_STICKER_X, sticker.positionX + x)),
                positionY: Math.min(maxY, Math.max(MIN_STICKER_Y, sticker.positionY + y)),
                zIndex: Math.max(0, ...Object.values(stickers).map((item) => item.zIndex)) + 1,
            });
        },
        [stickers, updateSticker]
    );

    const handleRemove = useCallback(
        (id: string) => () => {
            removeSticker(id);
        },
        [removeSticker]
    );

    const handleUpdate = useCallback(
        (id: string, field: "title" | "content") =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                updateSticker(id, { [field]: e.target.value });
            },
        [updateSticker]
    );

    const handleMinimize = useCallback(
        (id: string) => () => {
            updateSticker(id, { isMinimized: "true" });
        },
        [updateSticker]
    );

    const handleAdd = useCallback(async () => {
        const x = 16;
        const y = 73;
        const highestZIndex = Math.max(0, ...Object.values(stickers).map((item) => item.zIndex));

        const res = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "New Sticker", content: "", positionX: x, positionY: y, zIndex: highestZIndex + 1 }),
        });

        if (!res.ok) return;

        const note: Note = await res.json();

        addSticker({
            id: note.id,
            positionX: x,
            positionY: y,
            zIndex: highestZIndex + 1,
            title: note.title,
            content: note.content,
            color: note.color,
            isMinimized: note.isMinimized,
        });
    }, [addSticker, stickers]);

    return (
        <>
            {!isLoading && Object.values(stickers).length === 0 && (
                <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl">
                    Add your notes here my G <span className='absolute top-[-20] right-[12]'>👑</span>!{" "}
                </h1>
            )}
            <DragDropProvider onDragEnd={handleDragEnd}>
                {Object.values(stickers)
                    .filter((sticker) => sticker.isMinimized !== "true")
                    .map((sticker) => (
                        <Sticker
                            key={sticker.id}
                            id={sticker.id}
                            positionX={sticker.positionX}
                            positionY={sticker.positionY}
                            zIndex={sticker.zIndex}
                            title={sticker.title}
                            content={sticker.content}
                            color={sticker.color}
                            isMinimized={sticker.isMinimized}
                            onActivate={bringToFront}
                            onUpdate={handleUpdate}
                            onRemove={handleRemove}
                            onMinimize={handleMinimize}
                        />
                    ))}
            </DragDropProvider>
            <button
                className="absolute bottom-4 right-4 w-[50px] h-[50px] cursor-pointer hover:opacity-90 before:absolute before:inset-[5px] before:bg-white  before:rounded-full before:-z-1"
                onClick={handleAdd}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                    fill="#6d3b9c"
                    viewBox="0 0 16 16"
                >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
                </svg>
            </button>
            <Minimized />
        </>
    );
}

export default Stickers;
