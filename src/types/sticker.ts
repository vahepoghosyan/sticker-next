export type Sticker = {
  id: string;
  x: number;
  y: number;
  title: string;
  content: string;
  zIndex: number;
};

export type StickerProps = Sticker & {
  onActivate: (id: string) => () => void;
  onUpdate: (id: string, field: "title" | "content") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onRemove: (id: string) => () => void;
};
