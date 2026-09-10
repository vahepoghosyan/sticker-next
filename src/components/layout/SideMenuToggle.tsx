"use client";

import Button from "@/components/ui/Button";
import { useSideMenuStore } from "@/features/sidemenu/store";

export default function SideMenuToggle() {
    const toggle = useSideMenuStore((s) => s.toggle);

    return (
        <Button
            type="button"
            variant="secondary"
            size="sm"
            aria-label="Toggle notes menu"
            title="Notes menu"
            className="w-8 px-0"
            onClick={toggle}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="size-4"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                />
            </svg>
        </Button>
    );
}
