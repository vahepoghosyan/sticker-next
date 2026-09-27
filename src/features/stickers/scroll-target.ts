import { create } from "zustand";

type ScrollTargetStore = {
    pendingId: string | null;
    requestScroll: (id: string) => void;
    clearScroll: () => void;
};

export const useScrollTargetStore = create<ScrollTargetStore>((set) => ({
    pendingId: null,
    requestScroll: (id) => set({ pendingId: id }),
    clearScroll: () => set({ pendingId: null }),
}));
