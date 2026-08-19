import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-white">
            <h1 className="text-2xl font-semibold">Welcome, {session.user.name}</h1>
            <p className="text-neutral-400">{session.user.email}</p>
            <form
                action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                }}
            >
                <Button type="submit" variant="secondary" size="md">
                    Sign out
                </Button>
            </form>
        </div>
    );
}
