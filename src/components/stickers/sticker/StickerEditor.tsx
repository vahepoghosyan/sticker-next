"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

const TOOLBAR_BUTTON_CLASS =
    "cursor-pointer rounded px-1.5 py-0.5 text-xs text-white hover:bg-white/10";

function StickerEditor({
    content,
    onChange,
}: {
    content: string;
    onChange: (html: string) => void;
}) {
    const editor = useEditor({
        extensions: [StarterKit, TaskList, TaskItem.configure({ nested: true })],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "sticker-editor h-full w-full p-5 text-left focus:outline-none",
            },
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    return (
        <div className="flex h-[calc(100%-34px)] flex-col border-2 border-t-0 border-[rgba(70,74,84,0.34)] bg-[#1b1d1d82] backdrop-blur-[10px]">
            <div className="flex items-center gap-1 border-b border-[rgba(70,74,84,0.34)] px-2 py-1">
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().setParagraph().run()}
                    className={`${TOOLBAR_BUTTON_CLASS} ${editor?.isActive("paragraph") ? "bg-white/20" : ""}`}
                >
                    Paragraph
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`${TOOLBAR_BUTTON_CLASS} font-bold ${editor?.isActive("bold") ? "bg-white/20" : ""}`}
                >
                    B
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`${TOOLBAR_BUTTON_CLASS} ${editor?.isActive("bulletList") ? "bg-white/20" : ""}`}
                >
                    • List
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleTaskList().run()}
                    className={`${TOOLBAR_BUTTON_CLASS} ${editor?.isActive("taskList") ? "bg-white/20" : ""}`}
                >
                    Checklist
                </button>
            </div>
            <EditorContent editor={editor} className="min-h-0 flex-1 overflow-y-auto" />
        </div>
    );
}

export default StickerEditor;
