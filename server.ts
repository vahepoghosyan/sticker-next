import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, type WebSocket } from "ws";
import { getToken } from "next-auth/jwt";
import { registerConnection } from "./src/server/realtime";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

// Created upfront (not inside a request handler) and handed to Next via
// `httpServer` so Next can attach its own "upgrade" listener - for HMR's
// /_next/webpack-hmr socket - on the same server as ours. Node invokes every
// listener registered for "upgrade", so ours must never destroy the socket
// for a path it doesn't own; it just has to return and let Next's listener
// handle it.
const server = createServer();
const app = next({ dev, turbopack: dev, httpServer: server });
const handle = app.getRequestHandler();

const IDENTIFY_TIMEOUT_MS = 5000;

app.prepare().then(() => {
    server.on("request", (req, res) => {
        const parsedUrl = parse(req.url ?? "/", true);
        handle(req, res, parsedUrl);
    });

    const wss = new WebSocketServer({ noServer: true });

    server.on("upgrade", async (request, socket, head) => {
        if (parse(request.url ?? "").pathname !== "/ws") {
            return;
        }

        const secret = process.env.AUTH_SECRET;
        if (!secret) {
            console.error("[ws] rejecting connection: AUTH_SECRET is not set");
            socket.destroy();
            return;
        }

        // getToken() picks the session cookie's name based on this - NextAuth
        // issues it as __Secure-authjs.session-token over HTTPS and plain
        // authjs.session-token over HTTP. Left unset it defaults to false,
        // which only happens to be correct in local dev (plain HTTP);
        // in production (HTTPS, behind Cloudflare/a reverse proxy) it would
        // look up the wrong cookie name and silently reject every real
        // session. x-forwarded-proto reflects the original client-facing
        // protocol when proxied; !dev is the fallback for a direct request.
        const forwardedProto = request.headers["x-forwarded-proto"];
        const secureCookie =
            (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) === "https" || !dev;

        const token = await getToken({
            req: { headers: request.headers as Record<string, string> },
            secret,
            secureCookie,
        }).catch((err) => {
            console.error("[ws] getToken failed:", err);
            return null;
        });

        const userId = token?.sub;
        if (!userId) {
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, userId);
        });
    });

    wss.on("connection", (ws: WebSocket, userId: string) => {
        let unregister: (() => void) | null = null;

        const identifyTimer = setTimeout(() => {
            if (!unregister) ws.close();
        }, IDENTIFY_TIMEOUT_MS);

        ws.on("message", (raw) => {
            if (unregister) return;

            let message: unknown;
            try {
                message = JSON.parse(raw.toString());
            } catch {
                return;
            }

            if (
                typeof message === "object" &&
                message !== null &&
                "type" in message &&
                message.type === "identify" &&
                "clientId" in message &&
                typeof message.clientId === "string"
            ) {
                clearTimeout(identifyTimer);
                unregister = registerConnection(userId, ws, message.clientId);
            }
        });

        ws.on("close", () => {
            clearTimeout(identifyTimer);
            unregister?.();
        });
    });

    server.listen(port, () => {
        console.log(`> Server listening at http://localhost:${port} as ${dev ? "development" : process.env.NODE_ENV}`);
    });
});
