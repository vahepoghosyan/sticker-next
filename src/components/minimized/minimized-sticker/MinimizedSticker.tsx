import { type Note } from "@/types/sticker";
import { useStickerStore } from "@/features/stickers/store";
import { useShallow } from "zustand/react/shallow";
import { useState, useEffect, type CSSProperties } from "react";

const ANIMATION_DURATION = 100;

function MinimizedNote(sticker: Note & { style?: CSSProperties }) {
    const { id, title, style } = sticker;
    const [isAppearing, setIsAppearing] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => setIsAppearing(false));
        return () => cancelAnimationFrame(frame);
    }, []);

    const { updateSticker, removeSticker } = useStickerStore(
        useShallow((s) => ({
            updateSticker: s.updateSticker,
            removeSticker: s.removeSticker,
        }))
    );

    const handleMaximize = () => {
        setIsClosing(true);
        setTimeout(() => updateSticker(id, { isMinimized: "false" }), ANIMATION_DURATION);
    };

    const handleRemoveNote = (e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        setIsClosing(true);
        setTimeout(() => removeSticker(id), ANIMATION_DURATION);
    };

    return (
        <div
            className={`overflow-hidden flex items-center bg-(--primary) py-1 rounded-t cursor-pointer shadow-[0_0_12px_#301e42] transition-[width] duration-${ANIMATION_DURATION} ${isAppearing || isClosing ? "w-0" : "w-37.5"}`}
            style={style}
            onClick={handleMaximize}
        >
            <div className="shrink-0 panel-buttons relative z-10 pl-2.5 flex items-center font-size-0">
                <button
                    className="mr-1.5 w-3 h-3 bg-(--removeNote) rounded-full cursor-pointer relative before:absolute before:top-1/2 before:-translate-y-1/2 before:left-[50%] before:-translate-x-1/2 before:w-2 before:h-0.5 before:bg-black before:opacity-0 before:transition-opacity before:rotate-45 after:absolute after:top-1/2 after:-translate-y-1/2 after:left-[50%] after:-translate-x-1/2 after:w-0.5 after:h-2 after:bg-black after:opacity-0 after:transition-opacity after:rotate-45 hover:before:opacity-100 hover:after:opacity-100"
                    onClick={handleRemoveNote}
                />
            </div>
            <strong className="truncate">{title}</strong>
        </div>
    );
}

export default MinimizedNote;
