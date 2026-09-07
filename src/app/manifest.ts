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
                sizes: "any",
                type: "image/svg+xml",
                purpose: "maskable",
            },
            {
                // Android's WebAPK minting needs a raster icon for maskable;
                // the SVG above alone wasn't picked up reliably.
                src: "/icon-maskable.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icon-monochrome.svg",
                sizes: "any",
                type: "image/svg+xml",
                purpose: "monochrome",
            },
        ],
    };
}
