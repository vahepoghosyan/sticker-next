"use client";

import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useState } from "react";
import { type StickerNote } from "@/types/sticker";
import { MIN_STICKER_X, MIN_STICKER_Y, STICKER_HEIGHT, STICKER_WIDTH, VIEWPORT_MARGIN } from "@/constants/sticker";
import Sticker from "./sticker/Sticker";

function Stickers() {
  const [notes, setNotes] = useState<Record<string, StickerNote>>({
    "1": { id: "1", x: MIN_STICKER_X, y: MIN_STICKER_Y, content: "Hello", zIndex: 1 },
  });

  const bringToFront = (id: string) => () => {
    setNotes((prev) => {
      const note = prev[id];

      if (!note) {
        return prev;
      }

      const highestZIndex = Math.max(...Object.values(prev).map((item) => item.zIndex));

      if (note.zIndex === highestZIndex) {
        return prev;
      }

      return {
        ...prev,
        [id]: {
          ...note,
          zIndex: highestZIndex + 1,
        },
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
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

    setNotes((prev) => {
      const note = prev[sourceId];

      if (!note) {
        return prev;
      }

      return {
        ...prev,
        [sourceId]: {
          ...note,
          x: Math.min(maxX, Math.max(MIN_STICKER_X, note.x + x)),
          y: Math.min(maxY, Math.max(MIN_STICKER_Y, note.y + y)),
        },
      };
    });
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      {Object.values(notes).map((note) => (
        <Sticker
          key={note.id}
          id={note.id}
          x={note.x}
          y={note.y}
          zIndex={note.zIndex}
          content={note.content}
          onActivate={bringToFront}
        />
      ))}
    </DragDropProvider>
  );
}

export default Stickers;
