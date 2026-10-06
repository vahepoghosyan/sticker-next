import { db } from "@/db";
import { notes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import PublicStickerView from "@/components/share/PublicStickerView";
import type { Metadata } from "next";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

async function getSharedNote(id: string) {
    const [note] = await db
        .select()
        .from(notes)
        .where(and(eq(notes.id, id), eq(notes.isShared, "true")));
    return note ?? null;
}

export default async function SharePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const note = await getSharedNote(id);

    if (!note) {
        return (
            <main className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
                <h1 className="text-3xl text-white">Not found</h1>
                <p className="text-white/60">
                    This sticker doesn&apos;t exist or is no longer shared.
                </p>
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
            <PublicStickerView title={note.title} content={note.content} />
        </main>
    );
}
