import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Activity, Lock, Mail, ShieldCheck, TrendingDown, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — TalentAnalytics" },
      { name: "description", content: "Acceso para el personal de RR.HH. de Partner Service S.A.C." },
      { property: "og:title", content: "Iniciar sesión — TalentAnalytics" },
      { property: "og:description", content: "Acceso al sistema predictivo de retención de personal." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setError("Correo o contraseña incorrectos.");
      navigate({ to: "/", replace: true });
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) return setError("No se pudo enviar el correo. Inténtalo de nuevo.");
      setInfo("Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-sidebar-accent-foreground">TalentAnalytics</p>
            <p className="text-xs text-navy-muted">Partner Service S.A.C.</p>
          </div>
        </div>
        <div className="space-y-6">
          <h1 className="max-w-md text-4xl font-semibold leading-tight text-sidebar-accent-foreground">
            Anticipa la renuncia. <span className="text-sidebar-primary">Retén el talento.</span>
          </h1>
          <p className="max-w-md text-sm text-navy-muted">
            Sistema predictivo de renuncia y retención de personal basado en regresión logística.
          </p>
          <div className="grid max-w-md grid-cols-3 gap-3">
            {[
              { icon: TrendingDown, v: "35%", l: "Rotación actual" },
              { icon: Users, v: "200", l: "Colaboradores" },
              { icon: ShieldCheck, v: "6", l: "Campañas" },
            ].map(({ icon: Icon, v, l }) => (
              <div key={l} className="rounded-lg bg-sidebar-accent p-3">
                <Icon className="mb-2 h-4 w-4 text-sidebar-primary" />
                <p className="font-display text-lg font-semibold text-sidebar-accent-foreground">{v}</p>
                <p className="text-[11px] text-navy-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-navy-muted">Acceso exclusivo para personal autorizado de RR.HH.</p>
      </aside>

      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-rise">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <p className="font-display text-lg font-semibold">TalentAnalytics</p>
          </div>
          <h2 className="text-2xl font-semibold">{mode === "login" ? "Iniciar sesión" : "Recuperar contraseña"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Ingresa con tu cuenta corporativa." : "Te enviaremos un enlace a tu correo."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Correo electrónico</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nombre@partnerservice.pe" className="h-11 pl-9" autoComplete="email" />
              </div>
            </label>
            {mode === "login" && (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Contraseña</span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11 pl-9" autoComplete="current-password" />
                </div>
              </label>
            )}
            {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
            {info && <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{info}</p>}
            <button type="submit" disabled={loading} className="h-11 w-full rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60">
              {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Enviar enlace"}
            </button>
          </form>
          <button type="button" onClick={() => { setMode(mode === "login" ? "reset" : "login"); setError(null); setInfo(null); }} className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground">
            {mode === "login" ? "¿Olvidaste tu contraseña?" : "Volver a iniciar sesión"}
          </button>
          <p className="mt-10 text-center text-xs text-muted-foreground">¿No tienes cuenta? Solicítala al administrador de RR.HH.</p>
        </div>
      </main>
    </div>
  );
}
