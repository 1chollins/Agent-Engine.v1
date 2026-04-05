import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-sage">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-xl font-bold tracking-tight text-black">
            Agent Engine
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/dashboard" className="rounded-md px-3 py-2 text-sm font-medium text-black/70 transition-colors hover:bg-sage-dark hover:text-black">
              Dashboard
            </Link>
            <Link href="/listings" className="rounded-md px-3 py-2 text-sm font-medium text-black/70 transition-colors hover:bg-sage-dark hover:text-black">
              Listings
            </Link>
            <Link href="/content" className="rounded-md px-3 py-2 text-sm font-medium text-black/70 transition-colors hover:bg-sage-dark hover:text-black">
              Content
            </Link>
            <Link href="/settings/brand" className="rounded-md px-3 py-2 text-sm font-medium text-black/70 transition-colors hover:bg-sage-dark hover:text-black">
              Settings
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
