import { create } from "zustand";
import { type Note } from "@/types/sticker";

export type Stickers = Record<string, Note>;

type StickerStore = {
    stickers: Stickers;
    isLoading: boolean;
    addSticker: (sticker: Note) => void;
    updateSticker: (id: string, updates: Partial<Omit<Note, "id">>) => Promise<void>;
    updateStickerLocal: (id: string, updates: Partial<Omit<Note, "id">>) => void;
    removeSticker: (id: string) => void;
    fetchStickers: () => Promise<void>;
};

export const useStickerStore = create<StickerStore>((set) => ({
    stickers: {},
    isLoading: true,

    fetchStickers: async () => {
        const res = await fetch("/api/notes");
        const notes: Note[] = await res.json();
        set({ stickers: Object.fromEntries(notes.map((note) => [note.id, note])), isLoading: false });
    },

    addSticker: (sticker: Note) =>
        set((state) => ({
            stickers: { ...state.stickers, [sticker.id]: sticker },
        })),

    updateStickerLocal: (id: string, updates: Partial<Omit<Note, "id">>) =>
        set((state) => ({
            stickers: {
                ...state.stickers,
                [id]: { ...state.stickers[id], ...updates },
            },
        })),

    updateSticker: async (id: string, updates: Partial<Omit<Note, "id">>) => {
        set((state) => ({
            stickers: {
                ...state.stickers,
                [id]: { ...state.stickers[id], ...updates },
            },
        }));
        await fetch(`/api/notes/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        });
    },

    removeSticker: async (id: string) => {
        set((state) => {
            const { [id]: _, ...rest } = state.stickers;
            return { stickers: rest };
        });
        await fetch(`/api/notes/${id}`, { method: "DELETE" });
    },
}));
