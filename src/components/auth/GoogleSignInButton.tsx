import { signIn } from "@/lib/auth";
import Button from "@/components/ui/Button";
import type { ComponentProps } from "react";

export default function GoogleSignInButton(props: Pick<ComponentProps<typeof Button>, "size">) {
    return (
        <form
            action={async () => {
                "use server";
                await signIn("google");
            }}
        >
            <Button type="submit" variant="primary" {...props}>
                Continue with Google
            </Button>
        </form>
    );
}
