"use client";

import { useToastStore, type ToastType } from "@/features/toast/store";
import { useShallow } from "zustand/react/shallow";

const TYPE_STYLES: Record<ToastType, string> = {
    info: "bg-neutral-800",
    success: "bg-(--secondary)",
    error: "bg-(--removeNote)",
};

function ToastContainer() {
    const { toasts, dismiss } = useToastStore(
        useShallow((s) => ({ toasts: s.toasts, dismiss: s.dismiss }))
    );

    if (toasts.length === 0) return null;

    return (
        <div className="fixed z-[10000] bottom-4 left-1/2 flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
            {toasts.map((toast) => (
                <button
                    key={toast.id}
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    className={`w-full cursor-pointer break-words rounded-lg px-4 py-2.5 text-left text-sm font-medium text-white shadow-lg ${TYPE_STYLES[toast.type]}`}
                >
                    {toast.message}
                </button>
            ))}
        </div>
    );
}

export default ToastContainer;
