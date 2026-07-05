import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

const modules = [
  { href: "/fermes", label: "Fermes" },
  { href: "/parcelles", label: "Parcelles" },
  { href: "/cultures", label: "Cultures" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/inventaire", label: "Inventaire" },
  { href: "/comptabilite", label: "Comptabilité" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <nav className="flex w-56 shrink-0 flex-col justify-between border-r border-black/10 p-4 dark:border-white/10">
        <div>
          <p className="mb-4 font-semibold">CREOLE PSF Agri</p>
          <ul className="flex flex-col gap-2">
            {modules.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="hover:underline">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="truncate opacity-70">{session?.user?.email}</p>
          <SignOutButton />
        </div>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
