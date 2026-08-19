import { db } from "@/db";
import { notes } from "@/db/schema";

export async function GET() {
    try {
        const all = await db.select().from(notes);
        return Response.json(all);
    } catch {
        return Response.json({ error: "Failed to fetch notes" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const [note] = await db
            .insert(notes)
            .values({
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
