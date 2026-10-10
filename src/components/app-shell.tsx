import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Users, History, BarChart3, Activity, Bell, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Riesgo, Estado } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

function UserMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["mi-perfil"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data: p } = await supabase.from("profiles").select("nombre, cargo").eq("id", u.user.id).maybeSingle();
      return { nombre: p?.nombre || u.user.email || "Usuario", cargo: p?.cargo || "" };
    },
  });
  const iniciales = (data?.nombre ?? "RH").split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("");

  async function salir() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold leading-tight">{data?.nombre ?? "…"}</p>
        <p className="text-xs text-muted-foreground">{data?.cargo}</p>
      </div>
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{iniciales}</div>
      <button onClick={salir} title="Cerrar sesión" className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

const nav = [
  { to: "/", label: "Dashboard General", icon: LayoutDashboard },
  { to: "/colaboradores", label: "Colaboradores", icon: Users },
  { to: "/historico", label: "Histórico y Acciones", icon: History },
  { to: "/reportes", label: "Reportes y Modelo", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-sidebar-accent-foreground">TalentAnalytics</p>
            <p className="text-xs text-navy-muted">Partner Service S.A.C.</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? path === "/" : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="m-4 rounded-lg bg-sidebar-accent p-4 text-xs text-navy-muted">
          Modelo: Regresión Logística v2.3
          <br />
          Última actualización: 09 oct 2026
        </div>
      </aside>
      <div className="flex-1 md:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/85 px-6 py-4 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto md:hidden">
            {nav.map(({ to, label }) => (
              <Link key={to} to={to} className="whitespace-nowrap rounded-md px-2 py-1 text-xs" activeProps={{ className: "bg-primary text-primary-foreground" }} activeOptions={{ exact: to === "/" }}>
                {label}
              </Link>
            ))}
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">Sistema Predictivo de Renuncia y Retención de Personal</p>
          <div className="flex items-center gap-4">
            <span className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-danger" />
            </span>
            <UserMenu />
          </div>
        </header>
        <main key={path} className="animate-rise p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

const riesgoStyle: Record<Riesgo, string> = {
  Bajo: "bg-success/15 text-success ring-success/30",
  Medio: "bg-warning/20 text-foreground ring-warning/50",
  Alto: "bg-danger/15 text-danger ring-danger/30",
};
const riesgoDot: Record<Riesgo, string> = { Bajo: "bg-success", Medio: "bg-warning", Alto: "bg-danger" };

export function RiskBadge({ riesgo }: { riesgo: Riesgo }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", riesgoStyle[riesgo])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", riesgoDot[riesgo])} />
      {riesgo}
    </span>
  );
}

const estadoStyle: Record<Estado, string> = {
  Pendiente: "bg-muted text-muted-foreground ring-border",
  "En proceso": "bg-warning/20 text-foreground ring-warning/50",
  Exitoso: "bg-success/15 text-success ring-success/30",
};
export function EstadoBadge({ estado }: { estado: Estado }) {
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", estadoStyle[estado])}>{estado}</span>;
}

export function Panel({ title, desc, children, className }: { title: string; desc?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
      <h2 className="text-base font-semibold">{title}</h2>
      {desc && <p className="mb-4 text-xs text-muted-foreground">{desc}</p>}
      <div className={desc ? "" : "mt-4"}>{children}</div>
    </section>
  );
}
