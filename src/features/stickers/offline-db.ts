import { type Note } from "@/types/sticker";

const DB_NAME = "sticker-offline";
const DB_VERSION = 1;
const STICKERS_STORE = "stickers";
const QUEUE_STORE = "queue";

export type QueueEntry =
    | { id: string; type: "create"; payload: Note }
    | { id: string; type: "update"; payload: Partial<Omit<Note, "id">> }
    | { id: string; type: "delete" };

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STICKERS_STORE)) {
                db.createObjectStore(STICKERS_STORE, { keyPath: "id" });
            }
            if (!db.objectStoreNames.contains(QUEUE_STORE)) {
                db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function tx<T>(
    db: IDBDatabase,
    storeName: string,
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = run(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function withStore<T>(
    storeName: string,
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    const db = await openDb();
    try {
        return await tx(db, storeName, mode, run);
    } finally {
        db.close();
    }
}

export async function getAllStickers(): Promise<Note[]> {
    return withStore<Note[]>(STICKERS_STORE, "readonly", (store) => store.getAll());
}

export async function putSticker(note: Note): Promise<void> {
    await withStore(STICKERS_STORE, "readwrite", (store) => store.put(note));
}

export async function deleteStickerRecord(id: string): Promise<void> {
    await withStore(STICKERS_STORE, "readwrite", (store) => store.delete(id));
}

export async function replaceAllStickers(notes: Note[]): Promise<void> {
    const db = await openDb();
    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(STICKERS_STORE, "readwrite");
            const store = transaction.objectStore(STICKERS_STORE);
            store.clear();
            notes.forEach((note) => store.put(note));
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } finally {
        db.close();
    }
}

export async function getQueue(): Promise<QueueEntry[]> {
    return withStore<QueueEntry[]>(QUEUE_STORE, "readonly", (store) => store.getAll());
}

export async function setQueueEntry(entry: QueueEntry): Promise<void> {
    await withStore(QUEUE_STORE, "readwrite", (store) => store.put(entry));
}

export async function deleteQueueEntry(id: string): Promise<void> {
    await withStore(QUEUE_STORE, "readwrite", (store) => store.delete(id));
}
