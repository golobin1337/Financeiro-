import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { materializeDueRecurring } from "@/lib/actions/recurring";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await materializeDueRecurring();

  const userLabel =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "usuário";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar userLabel={userLabel} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
