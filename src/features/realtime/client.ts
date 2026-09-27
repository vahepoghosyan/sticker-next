import type { Note } from "@/types/sticker";

const CLIENT_ID = typeof window !== "undefined" ? crypto.randomUUID() : "";

type UpdatePayload = { id: string } & Partial<Omit<Note, "id">>;
type RealtimeHandlers = {
    onCreate: (note: Note) => void;
    onUpdate: (payload: UpdatePayload) => void;
    onRemove: (id: string) => void;
};

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let handlers: RealtimeHandlers | null = null;

function connect() {
    if (typeof window === "undefined") return;
    if (!navigator.onLine) return;
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    socket = ws;

    ws.addEventListener("open", () => {
        ws.send(JSON.stringify({ type: "identify", clientId: CLIENT_ID }));
    });

    ws.addEventListener("message", (event) => {
        try {
            const message = JSON.parse(event.data);
            if (!handlers) return;

            if (message?.type === "create") {
                const { type: _type, ...note } = message;
                handlers.onCreate(note as Note);
            } else if (message?.type === "update") {
                const { type: _type, ...update } = message;
                handlers.onUpdate(update as UpdatePayload);
            } else if (message?.type === "remove") {
                handlers.onRemove(message.id);
            }
        } catch {
            // ignore malformed messages
        }
    });

    ws.addEventListener("close", () => {
        if (socket === ws) socket = null;
        if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                connect();
            }, 3000);
        }
    });

    ws.addEventListener("error", () => ws.close());
}

export function getClientId(): string {
    return CLIENT_ID;
}

export function initRealtimeSync(newHandlers: RealtimeHandlers): () => void {
    if (typeof window === "undefined") return () => {};

    handlers = newHandlers;
    connect();

    window.addEventListener("online", connect);
    window.addEventListener("focus", connect);

    return () => {
        window.removeEventListener("online", connect);
        window.removeEventListener("focus", connect);
        if (reconnectTimer) clearTimeout(reconnectTimer);
        socket?.close();
        socket = null;
    };
}
