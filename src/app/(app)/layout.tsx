import { redirect } from "next/navigation";
import { after } from "next/server";
import { getCurrentUser } from "@/lib/supabase/get-user";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { materializeDueRecurring } from "@/lib/recurring/materialize";
import { accountName, readAccountsIndex } from "@/lib/accounts";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // O cliente é criado aqui porque, dentro de after() em layouts, ler cookies dá erro.
  const supabase = await createClient();
  after(() => materializeDueRecurring(supabase, user.id));

  const userLabel = accountName(user);
  const userEmail = user.email ?? "";

  // Lista de contas do seletor. Garante que a conta atual apareça mesmo se ainda
  // não foi salva (logins anteriores a este recurso): ela é salva na próxima ação.
  const indexed = await readAccountsIndex();
  const accounts = indexed.some((a) => a.id === user.id)
    ? indexed
    : [{ id: user.id, email: userEmail, name: userLabel }, ...indexed];

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
      <Sidebar userLabel={userLabel} accounts={accounts} activeId={user.id} />
      <main className="mx-auto w-full max-w-[1600px] min-w-0 flex-1 px-4 py-6 sm:px-6 xl:px-8">
        {children}
      </main>
    </div>
  );
}
