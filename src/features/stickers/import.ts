export type ImportEntry = {
    title: string;
    content: string;
    positionX?: number;
    positionY?: number;
    zIndex?: number;
};

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textToParagraphs(text: string): string {
    return text
        .split("\n")
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("");
}

function checklistToHtml(items: Record<string, unknown>[]): string {
    const rows = items
        .map((item) => {
            const text = typeof item.text === "string" ? escapeHtml(item.text) : "";
            const checked = item.isChecked === true;
            return `<li data-type="taskItem" data-checked="${checked}"><label><input type="checkbox"${checked ? " checked" : ""}><span></span></label><div><p>${text}</p></div></li>`;
        })
        .join("");
    return `<ul data-type="taskList">${rows}</ul>`;
}

// Google Keep's Takeout export ships one JSON object per note (title,
// textContent/listContent, isTrashed, ...) rather than a combined array,
// so a "note" here is either a single object or an array of them.
function parseImportEntry(item: Record<string, unknown>): ImportEntry | null {
    if (item.isTrashed === true) return null;

    const title = typeof item.title === "string" && item.title.trim() ? item.title : "Imported Sticker";

    if (Array.isArray(item.listContent)) {
        const checklistItems = item.listContent.filter(
            (entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null
        );
        return { title, content: checklistToHtml(checklistItems) };
    }

    if (typeof item.textContent === "string") {
        return { title, content: textToParagraphs(item.textContent) };
    }

    return {
        title,
        content: typeof item.content === "string" ? item.content : "",
        positionX: typeof item.positionX === "number" ? item.positionX : undefined,
        positionY: typeof item.positionY === "number" ? item.positionY : undefined,
        zIndex: typeof item.zIndex === "number" ? item.zIndex : undefined,
    };
}

export function parseImportValue(value: unknown): ImportEntry[] {
    const items = Array.isArray(value) ? value : [value];

    return items
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map(parseImportEntry)
        .filter((entry): entry is ImportEntry => entry !== null);
}
