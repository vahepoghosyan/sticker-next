import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export async function PATCH(
    request: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    const body = (await request.json()) as Record<string, unknown>;

    const updates: Partial<typeof notes.$inferInsert> = {};

    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.content === "string") updates.content = body.content;
    if (typeof body.color === "string") updates.color = body.color;
    if (typeof body.positionX === "number") updates.positionX = body.positionX;
    if (typeof body.positionY === "number") updates.positionY = body.positionY;
    if (typeof body.zIndex === "number") updates.zIndex = body.zIndex;

    // `is_minimized` is stored as text in the current schema.
    if (typeof body.isMinimized === "boolean") {
        updates.isMinimized = body.isMinimized ? "true" : "false";
    } else if (typeof body.isMinimized === "string") {
        updates.isMinimized = body.isMinimized;
    }

    if (Object.keys(updates).length === 0) {
        return Response.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await db
        .update(notes)
        .set(updates)
        .where(eq(notes.id, id))
        .returning();

    if (!updated) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json(updated);
}

export async function DELETE(
    _request: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;
    const [deleted] = await db
        .delete(notes)
        .where(eq(notes.id, id))
        .returning();

    if (!deleted) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ success: true });
}
