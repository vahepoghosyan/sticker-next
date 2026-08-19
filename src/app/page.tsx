import Stickers from "../components/stickers/Stickers";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { auth } from "@/lib/auth";

export default async function HomePage() {
    const session = await auth();

    if (!session?.user) {
        return (
            <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
                <h1 className="text-white text-3xl">Sign in to see your stickers</h1>
                <GoogleSignInButton size="lg" />
            </main>
        );
    }

    return (
        <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
            <Stickers />
        </main>
    );
}
