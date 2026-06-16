import { useStickerStore } from "@/features/stickers/store";
import { useShallow } from "zustand/react/shallow";
import MinimizedSticker from "./minimized-sticker/MinimizedSticker";

function Minimized() {
    const { stickers } = useStickerStore(
        useShallow((s) => ({
            stickers: s.stickers,
        }))
    );

    const minimizedNotes = Object.entries(stickers).filter(([_, sticker]) => sticker.isMinimized === "true");

    return (
        <div className="absolute right-0 bottom-0 left-0 h-[30px] flex">
            {minimizedNotes.map(([id, sticker]) => (
                <MinimizedSticker key={id} {...sticker} style={{ order: -sticker.zIndex }} />
            ))}
        </div>
    );
}

export default Minimized;
