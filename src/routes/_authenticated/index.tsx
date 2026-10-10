import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, TrendingDown, Users, Wallet, ShieldAlert } from "lucide-react";
import { PageHeader, Panel, RiskBadge } from "@/components/app-shell";
import { alertas, colaboradores, rotacionPorCampana } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TalentAnalytics" },
      { name: "description", content: "KPIs de rotación, riesgo de renuncia y alertas tempranas de Partner Service S.A.C." },
      { property: "og:title", content: "Dashboard — TalentAnalytics" },
      { property: "og:description", content: "KPIs de rotación, riesgo de renuncia y alertas tempranas." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const dist = (["Bajo", "Medio", "Alto"] as const).map((r) => ({ name: r, value: colaboradores.filter((c) => c.riesgo === r).length }));
  const altos = dist[2]!.value;
  const kpis = [
    { label: "Tasa de rotación actual", value: "35%", hint: "Anual · meta 20%", icon: TrendingDown, tone: "text-danger" },
    { label: "Colaboradores activos", value: "200", hint: "6 campañas", icon: Users, tone: "text-primary" },
    { label: "Costo anual de reposición", value: "S/ 105,000", hint: "Reclutamiento + capacitación", icon: Wallet, tone: "text-warning" },
    { label: "En riesgo alto", value: String(altos), hint: `${((altos / 200) * 100).toFixed(0)}% de la plantilla`, icon: ShieldAlert, tone: "text-danger" },
  ];
  const colors = ["var(--success)", "var(--warning)", "var(--danger)"];

  return (
    <>
      <PageHeader title="Dashboard General" subtitle="Visión consolidada de rotación y riesgo de renuncia · Octubre 2026" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className="animate-rise rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <k.icon className={`h-5 w-5 ${k.tone}`} />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Rotación por campaña" desc="Porcentaje anual de salidas por área" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={rotacionPorCampana}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis unit="%" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <Tooltip cursor={{ fill: "var(--muted)" }} formatter={(v) => [`${v}%`, "Rotación"]} />
                <Bar dataKey="rotacion" radius={[6, 6, 0, 0]}>
                  {rotacionPorCampana.map((r) => (
                    <Cell key={r.nombre} fill={r.rotacion >= 40 ? "var(--danger)" : r.rotacion >= 33 ? "var(--warning)" : "var(--chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Distribución de riesgo" desc="Predicción actual del modelo">
          <div className="h-52">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={dist} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {dist.map((d, i) => <Cell key={d.name} fill={colors[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {dist.map((d, i) => (
              <div key={d.name}>
                <div className="mx-auto mb-1 h-1.5 w-8 rounded-full" style={{ background: colors[i] }} />
                <p className="font-display text-lg font-semibold">{d.value}</p>
                <p className="text-xs text-muted-foreground">{d.name}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Alertas tempranas priorizadas" desc="Colaboradores que pasaron a riesgo alto · notificación enviada a RR.HH." className="mt-6">
        <ul className="divide-y">
          {alertas.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-4 py-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-danger/15">
                <AlertTriangle className="h-4 w-4 text-danger" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{a.nombre} <span className="text-muted-foreground">· {a.cargo}</span></p>
                <p className="text-xs text-muted-foreground">{a.campana} · Turno {a.turno} · Satisfacción {a.satisfaccion}/10 · Ausentismo {a.ausentismo} días/mes</p>
              </div>
              <span className="font-display text-sm font-semibold text-danger">{(a.probabilidad * 100).toFixed(0)}%</span>
              <RiskBadge riesgo="Alto" />
              <span className="w-20 text-right text-xs text-muted-foreground">{a.hace}</span>
            </li>
          ))}
        </ul>
        <Link to="/colaboradores" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Ver todos los colaboradores →</Link>
      </Panel>
    </>
  );
}
