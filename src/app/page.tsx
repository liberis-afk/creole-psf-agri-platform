import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-3xl font-semibold">CREOLE PSF Agri Platform</h1>
      <p className="max-w-md opacity-70">
        Plateforme numérique de gestion agricole multi-exploitations.
      </p>
      <Link
        href="/login"
        className="rounded bg-foreground px-5 py-3 text-background"
      >
        Se connecter
      </Link>
    </div>
  );
}
