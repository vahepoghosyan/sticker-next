import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function PATCH(
    request: NextRequest,
    ctx: RouteContext<"/api/notes/[id]">
) {
    const { id } = await ctx.params;
    const body = await request.json();

    const [updated] = await db
        .update(notes)
        .set(body)
        .where(eq(notes.id, id))
        .returning();

    if (!updated) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(updated);
}

export async function DELETE(
    _request: NextRequest,
    ctx: { params: { id: string } }
) {
    const { id } = ctx.params;
    const [deleted] = await db
        .delete(notes)
        .where(eq(notes.id, id))
        .returning();

    if (!deleted) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true });
}
