import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { auth, signIn, signOut } from "@/lib/auth";

export default async function Navbar() {
    const session = await auth();

    return (
        <header className="w-full bg-(--panel)">
            <div className="mx-auto flex h-14 items-center justify-between px-4">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
                >
                    <Image
                        src="/favicon.svg"
                        alt="Sticker logo"
                        width={24}
                        height={24}
                        style={{ width: "auto" }}
                    />
                    Sticker
                </Link>

                <nav className="flex items-center gap-4 text-sm text-neutral-600">
                    {session?.user ? (
                        <form
                            action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/" });
                            }}
                        >
                            <Button type="submit" variant="secondary" size="sm">
                                Sign out
                            </Button>
                        </form>
                    ) : (
                        <form
                            action={async () => {
                                "use server";
                                await signIn("google");
                            }}
                        >
                            <Button type="submit" variant="primary" size="sm">
                                Continue with Google
                            </Button>
                        </form>
                    )}
                </nav>
            </div>
        </header>
    );
}
