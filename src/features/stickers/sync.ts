import { type Note } from "@/types/sticker";
import { getClientId } from "@/features/realtime/client";
import {
    deleteQueueEntry,
    getQueue,
    setQueueEntry,
    type QueueEntry,
} from "./offline-db";

let flushInFlight: Promise<void> | null = null;

// queueCreate/queueUpdate/queueDelete each do a read-then-write against the
// same IndexedDB queue record for a given sticker id, with no transaction
// spanning the two - two calls for the same id (e.g. a stray zIndex bump
// racing the actual delete when a click bubbles into both handlers) could
// both read the queue before either writes back, and whichever write lands
// last silently wins, losing the other's intent entirely. Serializing calls
// per id removes that window: each call now waits for the previous one for
// the same id to fully finish before it even reads the queue.
const idLocks = new Map<string, Promise<unknown>>();

function withIdLock<T>(id: string, run: () => Promise<T>): Promise<T> {
    const prior = idLocks.get(id) ?? Promise.resolve();
    const settled = prior.then(run, run);
    idLocks.set(
        id,
        settled.catch(() => undefined)
    );
    return settled;
}

export function queueCreate(note: Note): Promise<void> {
    return withIdLock(note.id, async () => {
        await setQueueEntry({ id: note.id, type: "create", payload: note });
    });
}

export function queueUpdate(id: string, updates: Partial<Omit<Note, "id">>): Promise<void> {
    return withIdLock(id, async () => {
        const queue = await getQueue();
        const existing = queue.find((entry) => entry.id === id);

        if (existing?.type === "create") {
            await setQueueEntry({
                id,
                type: "create",
                payload: { ...existing.payload, ...updates },
            });
            return;
        }

        if (existing?.type === "update") {
            await setQueueEntry({
                id,
                type: "update",
                payload: { ...existing.payload, ...updates },
            });
            return;
        }

        await setQueueEntry({ id, type: "update", payload: updates });
    });
}

export function queueDelete(id: string): Promise<void> {
    return withIdLock(id, async () => {
        const queue = await getQueue();
        const existing = queue.find((entry) => entry.id === id);

        if (existing?.type === "create") {
            await deleteQueueEntry(id);
            return;
        }

        await setQueueEntry({ id, type: "delete" });
    });
}

async function sendEntry(entry: QueueEntry): Promise<boolean> {
    if (entry.type === "create") {
        const res = await fetch("/api/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...entry.payload, clientId: getClientId() }),
        });
        return res.ok || res.status === 409;
    }

    if (entry.type === "update") {
        const res = await fetch(`/api/notes/${entry.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...entry.payload, clientId: getClientId() }),
        });
        return res.ok || res.status === 404;
    }

    const res = await fetch(`/api/notes/${entry.id}?clientId=${encodeURIComponent(getClientId())}`, {
        method: "DELETE",
    });
    return res.ok || res.status === 404;
}

async function flushOnce(): Promise<void> {
    // Loops until the queue is drained (or a send fails) rather than a single
    // pass, so entries queued while this flush is already running - which
    // `flushQueue`'s single-flight dedup would otherwise skip - still go out.
    while (true) {
        if (typeof navigator !== "undefined" && !navigator.onLine) return;

        const queue = await getQueue();
        if (queue.length === 0) return;

        for (const entry of queue) {
            try {
                const ok = await sendEntry(entry);
                if (ok) {
                    await deleteQueueEntry(entry.id);
                } else {
                    return;
                }
            } catch {
                return;
            }
        }
    }
}

export function flushQueue(): Promise<void> {
    if (!flushInFlight) {
        flushInFlight = flushOnce().finally(() => {
            flushInFlight = null;
        });
    }
    return flushInFlight;
}

export async function hasPendingSync(): Promise<boolean> {
    const queue = await getQueue();
    return queue.length > 0;
}
