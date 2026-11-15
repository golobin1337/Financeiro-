import { redirect } from "next/navigation";
import { after } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { Sidebar } from "@/components/sidebar";
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
    <div className="relative flex min-h-screen flex-col xl:flex-row">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[480px] opacity-[0.12]"
        style={{
          background:
            "radial-gradient(640px circle at 50% -10%, var(--primary), transparent 70%)",
        }}
      />
      <Sidebar userLabel={userLabel} />
      <main className="mx-auto w-full max-w-[1600px] min-w-0 flex-1 px-4 py-6 sm:px-6 xl:px-8">
        {children}
      </main>
    </div>
  );
}
