/**
 * app/dashboard/layout.tsx
 * Shared shell for all /dashboard routes: sidebar + toast provider + the
 * content area offset for the fixed sidebar. Auth is enforced by middleware;
 * here we load the profile once for the sidebar.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user.id)
    .single();

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Sidebar
          name={profile?.full_name || user.email || "Teacher"}
          plan={profile?.plan ?? "trial"}
        />
        <div className="ml-60">{children}</div>
      </div>
    </ToastProvider>
  );
}
