import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-3xl font-semibold">CREOLE PSF Agri Platform</h1>
      <p className="max-w-md opacity-70">
        Plateforme numérique de gestion agricole multi-exploitations.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded bg-foreground px-5 py-3 text-background"
        >
          Se connecter
        </Link>
        <Link
          href="/inscription"
          className="rounded border border-black/20 px-5 py-3 dark:border-white/20"
        >
          Créer un compte
        </Link>
      </div>
    </div>
  );
}
