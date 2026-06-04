export type Note = {
    id: string;
    title: string;
    content: string;
    color: string;
    isMinimized: boolean;
    positionX: number;
    positionY: number;
    zIndex: number;
    userIdn: string;
    createdAt: string;
    updatedAt: string;
};

export type Sticker = {
    id: string;
    title: string;
    content: string;
    color: string;
    isMinimized: boolean;
    positionX: number;
    positionY: number;
    zIndex: number;
};

export type StickerProps = Sticker & {
    onActivate: (id: string) => () => void;
    onUpdate: (
        id: string,
        field: "title" | "content"
    ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onRemove: (id: string) => () => void;
};
