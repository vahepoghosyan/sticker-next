import { db } from "@/db";
import { notes } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
    const session = await auth();

    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const all = await db.select().from(notes).where(eq(notes.userIdn, session.user.id));
        return Response.json(all);
    } catch {
        return Response.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();

        const [note] = await db
            .insert(notes)
            .values({
                userIdn: session.user.id,
                title: body.title ?? "New Sticker",
                content: body.content ?? "",
                color: body.color ?? "#ffffff",
                positionX: body.positionX ?? 0,
                positionY: body.positionY ?? 0,
                zIndex: body.zIndex ?? 0,
            })
            .returning();

        return Response.json(note, { status: 201 });
    } catch {
        return Response.json({ error: "Failed to create note" }, { status: 500 });
    }
}
