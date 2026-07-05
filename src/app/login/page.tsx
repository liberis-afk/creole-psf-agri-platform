export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="flex w-80 flex-col gap-3">
        <h1 className="text-xl font-semibold">Connexion</h1>
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          className="rounded border border-black/20 px-3 py-2 dark:border-white/20"
        />
        <button
          type="submit"
          className="rounded bg-foreground px-3 py-2 text-background"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
