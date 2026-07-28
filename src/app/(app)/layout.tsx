import { redirect } from "next/navigation";
import { after } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { Navbar } from "@/components/navbar";
import { materializeDueRecurring } from "@/lib/actions/recurring";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  after(() => materializeDueRecurring());

  const userLabel =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "usuário";

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[480px] opacity-[0.12]"
        style={{
          background:
            "radial-gradient(640px circle at 50% -10%, var(--primary), transparent 70%)",
        }}
      />
      <Navbar userLabel={userLabel} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
