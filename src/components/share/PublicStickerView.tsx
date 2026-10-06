"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

// Renders stored sticker content read-only. This is the public, unauthenticated
// share page, so content must never be rendered via dangerouslySetInnerHTML -
// Tiptap's HTML parsing is schema-constrained to its own node types (no
// script tags etc.), which is the same safety boundary the authenticated
// editor already relies on; this reuses it rather than adding a separate
// HTML sanitizer.
function PublicStickerView({ title, content }: { title: string; content: string }) {
    const editor = useEditor({
        extensions: [StarterKit, TaskList, TaskItem.configure({ nested: true })],
        content,
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "sticker-editor text-left",
            },
        },
    });

    return (
        <div className="mx-auto w-full max-w-lg overflow-hidden rounded-lg shadow-[0_0_12px_#301e42]">
            <div className="bg-(--primary) px-4 py-3">
                <h1 className="truncate font-sans text-lg font-bold text-white">
                    {title || "Untitled"}
                </h1>
            </div>
            <div className="min-h-[200px] border-2 border-t-0 border-[rgba(70,74,84,0.34)] bg-[#1b1d1d82] p-5 backdrop-blur-[10px]">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

export default PublicStickerView;
