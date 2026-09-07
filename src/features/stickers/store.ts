import { create } from "zustand";
import { type Note } from "@/types/sticker";
import {
    getAllStickers,
    getQueue,
    putSticker,
    deleteStickerRecord,
    replaceAllStickers,
} from "./offline-db";
import { queueCreate, queueUpdate, queueDelete, flushQueue, hasPendingSync } from "./sync";

const flushDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export type Stickers = Record<string, Note>;

export type NewSticker = Pick<
    Note,
    "title" | "content" | "positionX" | "positionY" | "zIndex"
>;

type StickerStore = {
    stickers: Stickers;
    isLoading: boolean;
    isSyncing: boolean;
    addSticker: (sticker: NewSticker) => void;
    updateSticker: (id: string, updates: Partial<Omit<Note, "id">>) => void;
    removeSticker: (id: string) => void;
    fetchStickers: () => Promise<void>;
    syncNow: () => Promise<void>;
};

async function refreshSyncStatus(set: (partial: Partial<StickerStore>) => void) {
    set({ isSyncing: await hasPendingSync() });
}

function triggerFlush(set: (partial: Partial<StickerStore>) => void) {
    flushQueue().finally(() => refreshSyncStatus(set));
}

export const useStickerStore = create<StickerStore>((set, get) => ({
    stickers: {},
    isLoading: true,
    isSyncing: false,

    fetchStickers: async () => {
        const local = await getAllStickers();
        if (local.length > 0) {
            set({
                stickers: Object.fromEntries(local.map((note) => [note.id, note])),
                isLoading: false,
            });
        }

        if (typeof navigator !== "undefined" && !navigator.onLine) {
            refreshSyncStatus(set);
            return;
        }

        try {
            const res = await fetch("/api/notes");
            if (res.ok) {
                const serverNotes: Note[] = await res.json();
                const pendingIds = new Set((await getQueue()).map((entry) => entry.id));

                const current = get().stickers;
                const merged: Stickers = {};

                for (const note of serverNotes) {
                    if (pendingIds.has(note.id)) {
                        // pending local change (or delete) takes precedence over the server
                        if (current[note.id]) merged[note.id] = current[note.id];
                    } else {
                        merged[note.id] = note;
                    }
                }
                for (const [id, note] of Object.entries(current)) {
                    // offline-created stickers not yet on the server
                    if (pendingIds.has(id) && !(id in merged)) merged[id] = note;
                }

                await replaceAllStickers(Object.values(merged));
                set({ stickers: merged });
            }
        } catch {
            // offline or network error: local snapshot already applied above
        } finally {
            set({ isLoading: false });
        }

        triggerFlush(set);
    },

    addSticker: (sticker: NewSticker) => {
        const id = crypto.randomUUID();
        const note: Note = {
            ...sticker,
            id,
            color: "#ffffff",
            isMinimized: "false",
        };

        set((state) => ({ stickers: { ...state.stickers, [id]: note } }));

        putSticker(note)
            .then(() => queueCreate(note))
            .then(() => triggerFlush(set));
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

        const updated = get().stickers[id];
        if (!updated) return;

        const persisted = putSticker(updated).then(() => queueUpdate(id, updates));

        const isTextUpdate = "title" in updates || "content" in updates;
        if (isTextUpdate) {
            clearTimeout(flushDebounceTimers[id]);
            flushDebounceTimers[id] = setTimeout(() => {
                persisted.then(() => triggerFlush(set));
            }, 500);
        } else {
            persisted.then(() => triggerFlush(set));
        }
    },

    removeSticker: (id: string) => {
        set((state) => {
            const { [id]: _, ...rest } = state.stickers;
            return { stickers: rest };
        });

        clearTimeout(flushDebounceTimers[id]);
        delete flushDebounceTimers[id];

        deleteStickerRecord(id)
            .then(() => queueDelete(id))
            .then(() => triggerFlush(set));
    },

    syncNow: async () => {
        await flushQueue();
        await refreshSyncStatus(set);
    },
}));

if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
        useStickerStore.getState().fetchStickers();
    });
}
