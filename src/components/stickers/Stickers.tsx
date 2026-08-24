"use client";

import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useStickerStore } from "@/features/stickers/store";
import { useShallow } from "zustand/react/shallow";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
    DRAG_MOVE_THRESHOLD,
    MIN_STICKER_X,
    MIN_STICKER_Y,
    MOBILE_MEDIA_QUERY,
    STICKER_HEIGHT,
    STICKER_WIDTH,
    VIEWPORT_MARGIN,
} from "@/constants/sticker";
import Sticker from "./sticker/Sticker";
import Minimized from "@/components/minimized/Minimized";

function getMaxPosition() {
    if (typeof window === "undefined") {
        return { maxX: MIN_STICKER_X, maxY: MIN_STICKER_Y };
    }

    return {
        maxX: Math.max(MIN_STICKER_X, window.innerWidth - STICKER_WIDTH - VIEWPORT_MARGIN),
        maxY: Math.max(MIN_STICKER_Y, window.innerHeight - STICKER_HEIGHT - VIEWPORT_MARGIN),
    };
}

function clampPosition(
    positionX: number,
    positionY: number,
    bounds: { maxX: number; maxY: number }
) {
    return {
        positionX: Math.min(bounds.maxX, Math.max(MIN_STICKER_X, positionX)),
        positionY: Math.min(bounds.maxY, Math.max(MIN_STICKER_Y, positionY)),
    };
}

function subscribeToResize(callback: () => void) {
    let frame: number;

    const handleResize = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(callback);
    };

    window.addEventListener("resize", handleResize);
    return () => {
        window.removeEventListener("resize", handleResize);
        cancelAnimationFrame(frame);
    };
}

function getWindowSizeSnapshot() {
    return `${window.innerWidth}x${window.innerHeight}`;
}

function getWindowSizeServerSnapshot() {
    return "0x0";
}

function useWindowSize() {
    return useSyncExternalStore(
        subscribeToResize,
        getWindowSizeSnapshot,
        getWindowSizeServerSnapshot
    );
}

function subscribeToMobileQuery(callback: () => void) {
    const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
}

function getIsMobileSnapshot() {
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getIsMobileServerSnapshot() {
    return false;
}

function useIsMobile() {
    return useSyncExternalStore(
        subscribeToMobileQuery,
        getIsMobileSnapshot,
        getIsMobileServerSnapshot
    );
}

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

    const isMobile = useIsMobile();
    useWindowSize();

    useEffect(() => {
        fetchStickers();
    }, [fetchStickers]);

    const bringToFront = useCallback(
        (id: string) => () => {
            console.log(123123)
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
console.log(321321)
            const sourceId = String(event.operation.source?.id ?? "");

            if (!sourceId) {
                return;
            }

            const { x, y } = event.operation.transform;

            if (Math.abs(x) < DRAG_MOVE_THRESHOLD && Math.abs(y) < DRAG_MOVE_THRESHOLD) {
                return;
            }

            const bounds = getMaxPosition();
            const sticker = stickers[sourceId];
            const display = clampPosition(sticker.positionX, sticker.positionY, bounds);

            updateSticker(sourceId, {
                ...clampPosition(display.positionX + x, display.positionY + y, bounds),
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

    const handleAdd = useCallback(() => {
        const x = 16;
        const y = 73;
        const highestZIndex = Math.max(0, ...Object.values(stickers).map((item) => item.zIndex));

        addSticker({
            title: "New Sticker",
            content: "",
            positionX: x,
            positionY: y,
            zIndex: highestZIndex + 1,
        });
    }, [addSticker, stickers]);

    const visibleStickers = Object.values(stickers).filter(
        (sticker) => sticker.isMinimized !== "true"
    );
    const allStickers = Object.values(stickers);
    const bounds = getMaxPosition();

    return (
        <>
            {!isLoading && Object.values(stickers).length === 0 && (
                <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl">
                    Add your notes here my G <span className='absolute top-[-20] right-[12]'>👑</span>!{" "}
                </h1>
            )}
            {isMobile ? (
                <div className="flex w-full flex-col gap-4 p-4">
                    {allStickers.map((sticker) => (
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
                            layout="stack"
                            onActivate={bringToFront}
                            onUpdate={handleUpdate}
                            onRemove={handleRemove}
                            onMinimize={handleMinimize}
                        />
                    ))}
                </div>
            ) : (
                <DragDropProvider onDragEnd={handleDragEnd}>
                    {visibleStickers.map((sticker) => {
                        const display = clampPosition(sticker.positionX, sticker.positionY, bounds);

                        return (
                            <Sticker
                                key={sticker.id}
                                id={sticker.id}
                                positionX={display.positionX}
                                positionY={display.positionY}
                                zIndex={sticker.zIndex}
                                title={sticker.title}
                                content={sticker.content}
                                color={sticker.color}
                                isMinimized={sticker.isMinimized}
                                layout="board"
                                onActivate={bringToFront}
                                onUpdate={handleUpdate}
                                onRemove={handleRemove}
                                onMinimize={handleMinimize}
                            />
                        );
                    })}
                </DragDropProvider>
            )}
            <button
                className={`${isMobile ? "fixed" : "absolute"} z-100 bottom-4 right-4 w-[50px] h-[50px] cursor-pointer hover:opacity-90 before:absolute before:inset-[5px] before:bg-white before:rounded-full before:-z-1`}
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
            {!isMobile && <Minimized />}
        </>
    );
}

export default Stickers;
