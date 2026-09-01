import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Navigation from "@/components/layout/Navbar";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Sticker",
    description:
        "Sticker — a minimal sticky notes app to capture, organize, and drag-and-drop your ideas in one place.",
    icons: {
        icon: "/favicon.svg",
        apple: "/favicon.svg",
    },
    appleWebApp: {
        title: "Sticker",
        statusBarStyle: "black-translucent",
    },
};

export const viewport: Viewport = {
    themeColor: "#6d3b9c",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col">
                <Navigation />
                {children}
            </body>
        </html>
    );
}
