import type { WebSocket } from "ws";

type Connection = { ws: WebSocket; clientId: string };

const connectionsByUser = new Map<string, Set<Connection>>();

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

export function broadcastTextUpdate(
    userId: string,
    payload: { id: string; title?: string; content?: string },
    excludeClientId?: string
) {
    const set = connectionsByUser.get(userId);
    if (!set) return;

    const message = JSON.stringify({ type: "text-update", ...payload });

    for (const connection of set) {
        if (connection.clientId === excludeClientId) continue;
        if (connection.ws.readyState === connection.ws.OPEN) {
            connection.ws.send(message);
        }
    }
}
