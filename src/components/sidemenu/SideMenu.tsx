"use client";

import { useStickerStore } from "@/features/stickers/store";
import { useSideMenuStore } from "@/features/sidemenu/store";
import { useShallow } from "zustand/react/shallow";

function SideMenu() {
    const { isOpen, close } = useSideMenuStore(
        useShallow((s) => ({ isOpen: s.isOpen, close: s.close }))
    );
    const { stickers, updateSticker, removeSticker } = useStickerStore(
        useShallow((s) => ({
            stickers: s.stickers,
            updateSticker: s.updateSticker,
            removeSticker: s.removeSticker,
        }))
    );

    const sideMenuNotes = Object.values(stickers).filter(
        (sticker) => sticker.isInSideMenu === "true"
    );

    const handleRestore = (id: string) => () => {
        const highestZIndex = Math.max(
            0,
            ...Object.values(stickers).map((sticker) => sticker.zIndex)
        );
        updateSticker(id, { isInSideMenu: "false", zIndex: highestZIndex + 1 });
        close();
    };

    const handleRemove = (id: string) => (e: React.MouseEvent) => {
        e.stopPropagation();
        removeSticker(id);
    };

    return (
        <>
            <div
                className={`fixed inset-0 z-[9998] bg-black/40 transition-opacity duration-200 ${
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={close}
                aria-hidden="true"
            />
            <aside
                className={`fixed inset-y-0 left-0 z-[9999] flex w-72 max-w-[85vw] flex-col border-2 border-t-0 border-[rgba(70,74,84,0.34)] bg-[#1b1d1d82] backdrop-blur-[10px] shadow-xl transition-transform duration-200 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <span className="text-sm font-semibold text-white">Notes</span>
                    <button
                        type="button"
                        className="cursor-pointer rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
                        onClick={close}
                        aria-label="Close side menu"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                        >
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                        </svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {sideMenuNotes.length === 0 ? (
                        <p className="p-4 text-sm text-white/50">
                            Notes you move here will show up as a list.
                        </p>
                    ) : (
                        sideMenuNotes.map((sticker) => (
                            <div
                                key={sticker.id}
                                className="group flex cursor-pointer items-center justify-between gap-2 border-b border-white/5 px-4 py-2.5 hover:bg-white/5"
                                onClick={handleRestore(sticker.id)}
                            >
                                <span className="truncate text-sm text-white">
                                    {sticker.title || "Untitled"}
                                </span>
                                <button
                                    type="button"
                                    className="shrink-0 cursor-pointer rounded p-1 text-white/40 opacity-0 hover:bg-white/10 hover:text-white group-hover:opacity-100"
                                    onClick={handleRemove(sticker.id)}
                                    aria-label="Delete note"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </aside>
        </>
    );
}

export default SideMenu;
