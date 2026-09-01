import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Sticker",
        short_name: "Sticker",
        description:
            "Sticker — a minimal sticky notes app to capture, organize, and drag-and-drop your ideas in one place.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#6d3b9c",
        icons: [
            {
                src: "/favicon.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "any",
            },
            {
                src: "/icon-maskable.svg",
                sizes: "512x512",
                type: "image/svg+xml",
                purpose: "maskable",
            },
            {
                src: "/icon-monochrome.svg",
                sizes: "512x512",
                type: "image/svg+xml",
                purpose: "monochrome",
            },
        ],
    };
}
