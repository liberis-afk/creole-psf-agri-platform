import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isPublicRoute = pathname === "/" || pathname.startsWith("/login");

      if (isPublicRoute) {
        return isLoggedIn && pathname.startsWith("/login")
          ? Response.redirect(new URL("/fermes", request.nextUrl))
          : true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
