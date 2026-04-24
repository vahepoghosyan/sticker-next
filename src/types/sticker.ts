export type StickerNote = {
  id: string;
  x: number;
  y: number;
  content: string;
  zIndex: number;
};

export type StickerProps = StickerNote & {
  onActivate: (id: string) => () => void;
};
