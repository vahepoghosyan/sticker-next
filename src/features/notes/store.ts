import { create } from 'zustand';
import { Sticker } from "@/types/sticker";

export interface Stickers {
    [key: string]: Sticker;
}

type AppStore = {
    stickers: Stickers;
};

export const useAppStore = create<AppStore>(() => ({
    stickers: {},
}));
