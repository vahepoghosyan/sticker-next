const CLIENT_ID = typeof window !== "undefined" ? crypto.randomUUID() : "";

type TextUpdatePayload = { id: string; title?: string; content?: string };
type TextUpdateHandler = (payload: TextUpdatePayload) => void;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let handler: TextUpdateHandler | null = null;

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
            if (message?.type === "text-update" && handler) {
                handler({ id: message.id, title: message.title, content: message.content });
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

export function initRealtimeSync(onTextUpdate: TextUpdateHandler): () => void {
    if (typeof window === "undefined") return () => {};

    handler = onTextUpdate;
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
