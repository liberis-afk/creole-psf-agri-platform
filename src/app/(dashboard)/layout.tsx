import { Sprout } from "lucide-react";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { SidebarNav } from "@/components/sidebar-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <nav className="flex w-60 shrink-0 flex-col justify-between border-r border-surface-border bg-surface p-4">
        <div>
          <div className="mb-6 flex items-center gap-2 px-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="h-4.5 w-4.5" strokeWidth={2.25} />
            </div>
            <p className="font-semibold tracking-tight">CREOLE PSF Agri</p>
          </div>
          <SidebarNav />
        </div>
        <div className="flex flex-col gap-2 border-t border-surface-border pt-4 text-sm">
          <p className="truncate text-muted">{session?.user?.email}</p>
          <SignOutButton />
        </div>
      </nav>
      <main className="flex-1 bg-background p-8">{children}</main>
    </div>
  );
}
