"use client";

import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useStickerStore, type NewSticker } from "@/features/stickers/store";
import { parseImportValue, type ImportEntry } from "@/features/stickers/import";
import { useShallow } from "zustand/react/shallow";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
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

function subscribeToOnlineStatus(callback: () => void) {
    window.addEventListener("online", callback);
    window.addEventListener("offline", callback);
    return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
    };
}

function getOnlineSnapshot() {
    return navigator.onLine;
}

function getOnlineServerSnapshot() {
    return true;
}

function useIsOnline() {
    return useSyncExternalStore(
        subscribeToOnlineStatus,
        getOnlineSnapshot,
        getOnlineServerSnapshot
    );
}

function Stickers() {
    const {
        stickers,
        isLoading,
        isSyncing,
        addSticker,
        updateSticker,
        removeSticker,
        fetchStickers,
    } = useStickerStore(
        useShallow((s) => ({
            stickers: s.stickers,
            isLoading: s.isLoading,
            isSyncing: s.isSyncing,
            addSticker: s.addSticker,
            updateSticker: s.updateSticker,
            removeSticker: s.removeSticker,
            fetchStickers: s.fetchStickers,
        }))
    );

    const isMobile = useIsMobile();
    const isOnline = useIsOnline();
    const fileInputRef = useRef<HTMLInputElement>(null);
    useWindowSize();

    useEffect(() => {
        fetchStickers();
    }, [fetchStickers]);

    const bringToFront = useCallback(
        (id: string) => () => {
            console.log(123123);
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
            console.log(321321);
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
        (id: string, field: "title") => (e: React.ChangeEvent<HTMLInputElement>) => {
            updateSticker(id, { [field]: e.target.value });
        },
        [updateSticker]
    );

    const handleContentChange = useCallback(
        (id: string) => (content: string) => {
            updateSticker(id, { content });
        },
        [updateSticker]
    );

    const handleMinimize = useCallback(
        (id: string) => () => {
            updateSticker(id, { isMinimized: "true" });
        },
        [updateSticker]
    );

    const handleMoveSideMenu = useCallback(
        (id: string) => () => {
            updateSticker(id, { isInSideMenu: "true", isMinimized: "false" });
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

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImportFile = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length === 0) return;

            const entries: ImportEntry[] = [];
            let failedFiles = 0;

            for (const file of files) {
                try {
                    entries.push(...parseImportValue(JSON.parse(await file.text())));
                } catch {
                    failedFiles += 1;
                }
            }

            if (entries.length === 0) {
                window.alert(
                    failedFiles > 0
                        ? `Couldn't read ${failedFiles} file(s) as JSON notes.`
                        : "No notes found in the selected file(s)."
                );
                return;
            }

            const bounds = getMaxPosition();
            let highestZIndex = Math.max(0, ...Object.values(stickers).map((item) => item.zIndex));

            entries.forEach((entry, index) => {
                const offset = index * 24;
                const fallback = clampPosition(
                    MIN_STICKER_X + offset,
                    MIN_STICKER_Y + offset,
                    bounds
                );
                highestZIndex += 1;

                const sticker: NewSticker = {
                    title: entry.title,
                    content: entry.content,
                    positionX: entry.positionX ?? fallback.positionX,
                    positionY: entry.positionY ?? fallback.positionY,
                    zIndex: entry.zIndex ?? highestZIndex,
                };

                addSticker(sticker);
            });

            if (failedFiles > 0) {
                window.alert(
                    `Imported ${entries.length} note(s). ${failedFiles} file(s) couldn't be read.`
                );
            }
        },
        [addSticker, stickers]
    );

    const visibleStickers = Object.values(stickers).filter(
        (sticker) => sticker.isMinimized !== "true" && sticker.isInSideMenu !== "true"
    );
    const allStickers = Object.values(stickers).filter(
        (sticker) => sticker.isInSideMenu !== "true"
    );
    const bounds = getMaxPosition();

    return (
        <>
            {!isLoading && Object.values(stickers).length === 0 && (
                <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl w-full px-7">
                    Add your notes here my{" "}
                    <span className="relative">
                        G <span className="absolute top-[-20] right-[4]">👑</span>
                    </span>
                    !{" "}
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
                            isInSideMenu={sticker.isInSideMenu}
                            layout="stack"
                            onActivate={bringToFront}
                            onUpdate={handleUpdate}
                            onContentChange={handleContentChange}
                            onRemove={handleRemove}
                            onMinimize={handleMinimize}
                            onMoveSideMenu={handleMoveSideMenu}
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
                                isInSideMenu={sticker.isInSideMenu}
                                layout="board"
                                onActivate={bringToFront}
                                onUpdate={handleUpdate}
                                onContentChange={handleContentChange}
                                onRemove={handleRemove}
                                onMinimize={handleMinimize}
                                onMoveSideMenu={handleMoveSideMenu}
                            />
                        );
                    })}
                </DragDropProvider>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                multiple
                className="hidden"
                onChange={handleImportFile}
            />
            <button
                className={`${isMobile ? "fixed" : "absolute"} z-100 bottom-[74px] right-4 w-[50px] h-[50px] cursor-pointer hover:opacity-90 bg-(--primary) rounded-full flex items-center justify-center`}
                onClick={handleImportClick}
                aria-label="Import notes from JSON"
                title="Import notes from JSON"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                    <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
                </svg>
            </button>
            <button
                className={`${isMobile ? "fixed" : "absolute"} z-100 bottom-4 right-4 w-[50px] h-[50px] cursor-pointer hover:opacity-90 bg-(--primary) rounded-full flex items-center justify-center`}
                onClick={handleAdd}
                aria-label="Add sticker"
                title="Add sticker"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                </svg>
            </button>
            {!isMobile && <Minimized />}
            {(!isOnline || isSyncing) && (
                <div className="fixed z-100 bottom-4 left-4 flex items-center gap-2 rounded-full bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                    <span
                        className={`h-2 w-2 rounded-full ${
                            isOnline ? "bg-yellow-300 animate-pulse" : "bg-red-400"
                        }`}
                    />
                    {isOnline ? "Syncing…" : "Offline — changes saved locally"}
                </div>
            )}
        </>
    );
}

export default Stickers;
