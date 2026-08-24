import { create } from "zustand";
import { type Note } from "@/types/sticker";

const apiDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export type Stickers = Record<string, Note>;

export type NewSticker = Pick<
    Note,
    "title" | "content" | "positionX" | "positionY" | "zIndex"
>;

type StickerStore = {
    stickers: Stickers;
    isLoading: boolean;
    addSticker: (sticker: NewSticker) => void;
    updateSticker: (id: string, updates: Partial<Omit<Note, "id">>) => void;
    removeSticker: (id: string) => void;
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

    addSticker: (sticker: NewSticker) => {
        const tempId = crypto.randomUUID();
        const optimistic: Note = {
            ...sticker,
            id: tempId,
            color: "#ffffff",
            isMinimized: "false",
        };

        set((state) => ({
            stickers: { ...state.stickers, [tempId]: optimistic },
        }));

        fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sticker),
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to create note");
                const note: Note = await res.json();

                set((state) => {
                    if (!(tempId in state.stickers)) return state;
                    const { [tempId]: _, ...rest } = state.stickers;
                    return { stickers: { ...rest, [note.id]: note } };
                });
            })
            .catch((error) => console.error("Failed to create note", error));
    },

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
            })
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to update note");
                })
                .catch((error) => console.error("Failed to update note", error));

        if (isTextUpdate) {
            clearTimeout(apiDebounceTimers[id]);
            apiDebounceTimers[id] = setTimeout(callApi, 500);
        } else {
            callApi();
        }
    },

    removeSticker: (id: string) => {
        set((state) => {
            const { [id]: _, ...rest } = state.stickers;
            return { stickers: rest };
        });

        fetch(`/api/notes/${id}`, { method: "DELETE" })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to delete note");
            })
            .catch((error) => console.error("Failed to delete note", error));
    },
}));
