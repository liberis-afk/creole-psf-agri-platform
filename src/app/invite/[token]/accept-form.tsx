"use client";

import { useActionState } from "react";
import { Sprout } from "lucide-react";
import { acceptInvitation } from "./actions";

export function AcceptInvitationForm({
  token,
  email,
  farmName,
  roleLabel,
  isNewUser,
}: {
  token: string;
  email: string;
  farmName: string;
  roleLabel: string;
  isNewUser: boolean;
}) {
  const [error, formAction, isPending] = useActionState(
    acceptInvitation.bind(null, token),
    undefined,
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-8 shadow-lg shadow-stone-900/[0.04]">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sprout className="h-5.5 w-5.5" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Rejoindre {farmName}</h1>
            <p className="text-sm text-muted">
              Invitation en tant que <strong>{roleLabel}</strong>
            </p>
          </div>
        </div>

        <form action={formAction} className="flex flex-col gap-3">
          <input
            value={email}
            disabled
            className="rounded-lg border border-surface-border bg-stone-100 px-3 py-2 text-sm text-muted dark:bg-stone-800"
          />
          {isNewUser && (
            <input
              name="name"
              placeholder="Nom"
              className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          )}
          <input
            name="password"
            type="password"
            placeholder={isNewUser ? "Choisissez un mot de passe (8 caractères min.)" : "Mot de passe"}
            required
            minLength={8}
            className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-emerald-900/10 transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "..." : isNewUser ? "Créer mon compte et rejoindre" : "Se connecter et rejoindre"}
          </button>
        </form>
      </div>
    </div>
  );
}
