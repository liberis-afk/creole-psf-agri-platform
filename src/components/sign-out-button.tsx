"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm opacity-70 hover:opacity-100 hover:underline"
    >
      Déconnexion
    </button>
  );
}
