"use client";

import Button from "@/components/ui/Button";

export default function RefreshButton() {
    return (
        <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label="Refresh"
            title="Refresh"
            className="w-8 px-0"
            onClick={() => window.location.reload()}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
            >
                <path d="M8 2.5a5.5 5.5 0 1 0 5.163 7.211.75.75 0 0 1 1.412.502A7 7 0 1 1 8 1v-.5a.25.25 0 0 1 .41-.192l2.36 1.97a.25.25 0 0 1 0 .384l-2.36 1.97A.25.25 0 0 1 8 4.5V2.5Z" />
            </svg>
        </Button>
    );
}
