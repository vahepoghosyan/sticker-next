import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
    // eslint-disable-next-line no-var
    var db: ReturnType<typeof drizzle> | undefined;
    // eslint-disable-next-line no-var
    var pgClient: ReturnType<typeof postgres> | undefined;
}

const client = globalThis.pgClient ?? postgres(process.env.DATABASE_URL!);

export const db = globalThis.db ?? drizzle(client, { schema });

if (process.env.NODE_ENV !== "production") {
    globalThis.pgClient = client;
    globalThis.db = db;
}
