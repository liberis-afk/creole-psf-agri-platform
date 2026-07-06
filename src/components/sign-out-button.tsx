"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-red-600"
    >
      <LogOut className="h-4 w-4" strokeWidth={2} />
      Déconnexion
    </button>
  );
}
