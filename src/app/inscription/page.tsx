"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "./actions";

export default function SignupPage() {
  const [error, formAction, isPending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form action={formAction} className="flex w-80 flex-col gap-3">
        <h1 className="text-xl font-semibold">Créer un compte</h1>
        <input
          name="name"
          placeholder="Nom"
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe (8 caractères min.)"
          required
          minLength={8}
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-foreground px-3 py-2 text-background disabled:opacity-50"
        >
          {isPending ? "Création..." : "Créer mon compte"}
        </button>
        <p className="text-sm opacity-70">
          Déjà un compte ?{" "}
          <Link href="/login" className="underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
