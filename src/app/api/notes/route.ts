import { db } from "@/db";
import { notes } from "@/db/schema";

export async function GET() {
    const all = await db.select().from(notes);
    return Response.json(all);
}

export async function POST(request: Request) {
    const body = await request.json();

    const [note] = await db
        .insert(notes)
        .values({
            title: body.title ?? "New Sticker",
            content: body.content ?? "",
            color: body.color ?? "#ffffff",
            positionX: body.positionX ?? 0,
            positionY: body.positionY ?? 0,
            
        })
        .returning();

    return Response.json(note, { status: 201 });
}
