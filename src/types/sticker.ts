export type Note = {
    id: string;
    title: string;
    content: string;
    color: string;
    isMinimized: string;
    positionX: number;
    positionY: number;
    zIndex: number;
};

export type Sticker = {
    id: string;
    title: string;
    content: string;
    color: string;
    isMinimized: string;
    positionX: number;
    positionY: number;
    zIndex: number;
};

export type StickerProps = Sticker & {
    layout: "board" | "stack";
    onActivate: (id: string) => () => void;
    onUpdate: (
        id: string,
        field: "title"
    ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    onContentChange: (id: string) => (content: string) => void;
    onRemove: (id: string) => () => void;
    onMinimize: (id: string) => () => void;
};
