import { AuthGuard } from "@/components/auth-guard";
import { SignOutButton } from "@/components/sign-out-button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <aside className="hidden w-60 flex-col border-r bg-muted/20 p-4 md:flex">
          <div className="mb-6 text-lg font-semibold">Level Up</div>
          <nav className="space-y-1 text-sm">
            <a href="/dashboard" className="block rounded-md px-3 py-2 hover:bg-muted">
              Dashboard
            </a>
            <a href="/teachers" className="block rounded-md px-3 py-2 hover:bg-muted">
              Teachers
            </a>
            <a href="/students" className="block rounded-md px-3 py-2 hover:bg-muted">
              Students
            </a>
            <a href="/lessons" className="block rounded-md px-3 py-2 hover:bg-muted">
              Lessons
            </a>
            <a href="/generation-runs" className="block rounded-md px-3 py-2 hover:bg-muted">
              Generation runs
            </a>
            <a href="/rejections" className="block rounded-md px-3 py-2 hover:bg-muted">
              Rejections
            </a>
            <a href="/content-review" className="block rounded-md px-3 py-2 hover:bg-muted">
              Content review
            </a>
            <a href="/activity" className="block rounded-md px-3 py-2 hover:bg-muted">
              Activity
            </a>
            <a href="/audit-log" className="block rounded-md px-3 py-2 hover:bg-muted">
              Audit log
            </a>
            <a href="/system/health" className="block rounded-md px-3 py-2 hover:bg-muted">
              System health
            </a>
          </nav>
        </aside>
        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b px-6 py-3">
            <h2 className="text-sm font-medium text-muted-foreground">Admin console</h2>
            <SignOutButton />
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}