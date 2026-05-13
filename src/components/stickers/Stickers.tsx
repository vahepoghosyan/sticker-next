"use client";

import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useStickerStore } from "@/features/stickers/store";
import { useShallow } from "zustand/react/shallow";

import { useCallback } from "react";
import { type Sticker as StickerType } from "@/types/sticker";
import {
  MIN_STICKER_X,
  MIN_STICKER_Y,
  STICKER_HEIGHT,
  STICKER_WIDTH,
  VIEWPORT_MARGIN,
} from "@/constants/sticker";
import Sticker from "./sticker/Sticker";

function Stickers() {
  const { stickers, addSticker, updateSticker, removeSticker } = useStickerStore(
    useShallow((s) => ({
      stickers: s.stickers,
      addSticker: s.addSticker,
      updateSticker: s.updateSticker,
      removeSticker: s.removeSticker,
    }))
  );
  
  const bringToFront = useCallback(
    (id: string) => () => {
      updateSticker(id, {
        zIndex: Math.max(...Object.values(stickers).map((item) => item.zIndex)) + 1,
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
      const maxX = Math.max(MIN_STICKER_X, window.innerWidth - STICKER_WIDTH - VIEWPORT_MARGIN);
      const maxY = Math.max(MIN_STICKER_Y, window.innerHeight - STICKER_HEIGHT - VIEWPORT_MARGIN);
      const sticker = stickers[sourceId];

      updateSticker(sourceId, {
        x: Math.min(maxX, Math.max(MIN_STICKER_X, sticker.x + x)),
        y: Math.min(maxY, Math.max(MIN_STICKER_Y, sticker.y + y)),
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
    (id: string, field: "title" | "content") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateSticker(id, { [field]: e.target.value });
    },
    [updateSticker]
  );

  const handleAdd = useCallback(() => {
    const newId = Date.now().toString();
    const highestZIndex = Math.max(0, ...Object.values(stickers).map((item) => item.zIndex));
    addSticker({
      id: newId,
      x: window.innerWidth / 2 - STICKER_WIDTH / 2,
      y: window.innerHeight / 2 - STICKER_HEIGHT / 2,
      zIndex: highestZIndex + 1,
      title: "New Sticker",
      content: "",
    });
  }, [addSticker, stickers]);

  return (
    <>
      <DragDropProvider onDragEnd={handleDragEnd}>
        {Object.values(stickers).map((sticker) => (
          <Sticker
            key={sticker.id}
            id={sticker.id}
            x={sticker.x}
            y={sticker.y}
            zIndex={sticker.zIndex}
            title={sticker.title}
            content={sticker.content}
            onActivate={bringToFront}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
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
    </>
  );
}

export default Stickers;
