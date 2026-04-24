export type Sticker = {
  id: string;
  x: number;
  y: number;
  content: string;
  zIndex: number;
};

export type StickerProps = Sticker & {
  onActivate: (id: string) => () => void;
};
