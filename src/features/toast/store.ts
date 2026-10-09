import { create } from "zustand";

export type ToastType = "info" | "success" | "error";
export type Toast = { id: string; message: string; type: ToastType };

const DEFAULT_DURATION_MS = 4000;

type ToastStore = {
    toasts: Toast[];
    show: (message: string, type?: ToastType, durationMs?: number) => void;
    dismiss: (id: string) => void;
};

export const useToastStore = create<ToastStore>((set, get) => ({
    toasts: [],

    show: (message, type = "info", durationMs = DEFAULT_DURATION_MS) => {
        const id = crypto.randomUUID();
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => get().dismiss(id), durationMs);
    },

    dismiss: (id) => {
        set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    },
}));
