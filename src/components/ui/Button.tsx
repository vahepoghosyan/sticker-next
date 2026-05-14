import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
    primary: "bg-(--primary) text-white hover:bg-(--primary-hover)",
    secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
};

const sizeStyles: Record<Size, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-11 px-6 text-base",
};

export default function Button({
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    className = "",
    children,
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={cn(
                "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {loading && (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {children}
        </button>
    );
}
