import { create } from "zustand";
import { type Note } from "@/types/sticker";

const apiDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export type Stickers = Record<string, Note>;

type StickerStore = {
    stickers: Stickers;
    isLoading: boolean;
    addSticker: (sticker: Note) => void;
    updateSticker: (id: string, updates: Partial<Omit<Note, "id">>) => void;
    removeSticker: (id: string) => Promise<void>;
    fetchStickers: () => Promise<void>;
};

export const useStickerStore = create<StickerStore>((set) => ({
    stickers: {},
    isLoading: true,

    fetchStickers: async () => {
        try {
            const res = await fetch("/api/notes");
            if (!res.ok) return;

            const notes: Note[] = await res.json();
            set({ stickers: Object.fromEntries(notes.map((note) => [note.id, note])) });
        } finally {
            set({ isLoading: false });
        }
    },

    addSticker: (sticker: Note) =>
        set((state) => ({
            stickers: { ...state.stickers, [sticker.id]: sticker },
        })),

    updateSticker: (id: string, updates: Partial<Omit<Note, "id">>) => {
        set((state) => {
            if (!state.stickers[id]) return state;
            return {
                stickers: {
                    ...state.stickers,
                    [id]: { ...state.stickers[id], ...updates },
                },
            };
        });

        const isTextUpdate = "title" in updates || "content" in updates;
        const callApi = () =>
            fetch(`/api/notes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            }).catch(() => {});

        if (isTextUpdate) {
            clearTimeout(apiDebounceTimers[id]);
            apiDebounceTimers[id] = setTimeout(callApi, 500);
        } else {
            callApi();
        }
    },

    removeSticker: async (id: string) => {
        const snapshot = useStickerStore.getState().stickers[id];

        set((state) => {
            const { [id]: _, ...rest } = state.stickers;
            return { stickers: rest };
        });

        const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });

        if (!res.ok && snapshot) {
            set((state) => ({
                stickers: { ...state.stickers, [id]: snapshot },
            }));
        }
    },
}));
