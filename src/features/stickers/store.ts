import { create } from "zustand";
import { Sticker } from "@/types/sticker";

export interface Stickers {
  [key: string]: Sticker;
}

type StickerStore = {
  stickers: Stickers;
  addSticker: (sticker: Sticker) => void;
  updateSticker: (id: string, updates: Partial<Omit<Sticker, "id">>) => void;
  removeSticker: (id: string) => void;
};

export const useStickerStore = create<StickerStore>((set) => ({
  stickers: {},
  addSticker: (sticker: Sticker) =>
    set((state) => ({
      stickers: {
        ...state.stickers,
        [sticker.id]: sticker,
      },
    })),
  updateSticker: (id: string, updates: Partial<Omit<Sticker, "id">>) =>
    set((state) => ({
      stickers: {
        ...state.stickers,
        [id]: {
          ...state.stickers[id],
          ...updates,
        },
      },
    })),
  removeSticker: (id: string) =>
    set((state) => {
      const { [id]: _, ...rest } = state.stickers;
      return { stickers: rest };
    }),
}));
