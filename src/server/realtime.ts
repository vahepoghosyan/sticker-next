import type { WebSocket } from "ws";
import type { Note } from "@/types/sticker";

type Connection = { ws: WebSocket; clientId: string };

// server.ts (run directly by tsx) and this module as loaded through
// Next.js's own bundled route handlers end up as two separate module
// instantiations - each would get its own independent Map otherwise, since
// they don't share a module cache. globalThis is the one thing that's
// actually a single process-wide object regardless of which loader pulled
// this file in, so the registry lives there instead of a plain module-level
// const.
const registryKey = Symbol.for("sticker-next.realtime.connectionsByUser");
type Registry = typeof globalThis & {
    [registryKey]?: Map<string, Set<Connection>>;
};
const registryHost = globalThis as Registry;
const connectionsByUser =
    registryHost[registryKey] ?? (registryHost[registryKey] = new Map<string, Set<Connection>>());

export function registerConnection(userId: string, ws: WebSocket, clientId: string) {
    const connection: Connection = { ws, clientId };
    const existing = connectionsByUser.get(userId);
    if (existing) {
        existing.add(connection);
    } else {
        connectionsByUser.set(userId, new Set([connection]));
    }

    return () => {
        const set = connectionsByUser.get(userId);
        if (!set) return;
        set.delete(connection);
        if (set.size === 0) connectionsByUser.delete(userId);
    };
}

function broadcast(userId: string, message: Record<string, unknown>, excludeClientId?: string) {
    const set = connectionsByUser.get(userId);
    if (!set) return;

    const payload = JSON.stringify(message);

    for (const connection of set) {
        if (connection.clientId === excludeClientId) continue;
        if (connection.ws.readyState === connection.ws.OPEN) {
            connection.ws.send(payload);
        }
    }
}

export function broadcastUpdate(
    userId: string,
    payload: { id: string } & Partial<Omit<Note, "id">>,
    excludeClientId?: string
) {
    broadcast(userId, { type: "update", ...payload }, excludeClientId);
}

export function broadcastCreate(userId: string, note: Note, excludeClientId?: string) {
    broadcast(userId, { type: "create", ...note }, excludeClientId);
}

export function broadcastRemove(userId: string, id: string, excludeClientId?: string) {
    broadcast(userId, { type: "remove", id }, excludeClientId);
}
