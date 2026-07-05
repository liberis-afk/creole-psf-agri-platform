import Link from "next/link";

const modules = [
  { href: "/fermes", label: "Fermes" },
  { href: "/parcelles", label: "Parcelles" },
  { href: "/cultures", label: "Cultures" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/inventaire", label: "Inventaire" },
  { href: "/comptabilite", label: "Comptabilité" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <nav className="w-56 shrink-0 border-r border-black/10 p-4 dark:border-white/10">
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
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
