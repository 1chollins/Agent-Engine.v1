import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-sage/20 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-lg font-semibold text-cream">
              Agent Engine
            </Link>
            <nav className="hidden items-center gap-6 sm:flex">
              <Link href="/dashboard" className="text-sm text-sage hover:text-cream">
                Dashboard
              </Link>
              <Link href="/listings" className="text-sm text-sage hover:text-cream">
                Listings
              </Link>
              <Link href="/content" className="text-sm text-sage hover:text-cream">
                Content
              </Link>
              <Link href="/settings/brand" className="text-sm text-sage hover:text-cream">
                Settings
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
