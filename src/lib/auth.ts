import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [Google],
    callbacks: {
        jwt({ token, account }) {
            if (account) token.sub = account.providerAccountId;
            return token;
        },
        session({ session, token }) {
            if (token.sub) session.user.id = token.sub;
            return session;
        },
    },
});
