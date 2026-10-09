import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Database, Monitor, Server } from "lucide-react";
import { PageHeader, Panel } from "@/components/app-shell";
import { COEFICIENTES, acciones, tendenciaMensual } from "@/lib/data";

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes y modelo — TalentAnalytics" },
      { name: "description", content: "Impacto de las intervenciones preventivas y efectividad del modelo predictivo." },
      { property: "og:title", content: "Reportes y modelo — TalentAnalytics" },
      { property: "og:description", content: "Efectividad del modelo y arquitectura del sistema." },
    ],
  }),
  component: Reportes,
});

function Reportes() {
  const exitos = acciones.filter((a) => a.estado === "Exitoso").length;
  const cerradas = acciones.filter((a) => a.estado !== "Pendiente").length;
  const metricas = [
    ["Exactitud (Accuracy)", "86.4%"], ["Precisión", "82.1%"], ["Sensibilidad (Recall)", "79.5%"], ["AUC-ROC", "0.89"],
    ["Retenciones exitosas", `${Math.round((exitos / cerradas) * 100)}%`], ["Ahorro estimado", "S/ 38,400"],
  ];
  const impacto = [
    { tipo: "Comisiones", antes: 68, despues: 31 },
    { tipo: "Ajuste turno", antes: 61, despues: 28 },
    { tipo: "Feedback", antes: 57, despues: 34 },
    { tipo: "Capacitación", antes: 54, despues: 36 },
    { tipo: "Reconocimiento", antes: 52, despues: 29 },
  ];
  const coefs = COEFICIENTES.map((c) => ({ variable: c.variable, peso: Math.abs(c.coef) * (c.key === "metas" || c.key === "horasExtra" ? 10 : 1) }));

  return (
    <>
      <PageHeader title="Reportes y Configuración del Modelo" subtitle="Impacto de las intervenciones preventivas y desempeño del modelo predictivo" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {metricas.map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Rotación mensual: real vs. predicha" desc="% mensual desde la implementación del modelo">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={tendenciaMensual}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip /><Legend />
                <Line type="monotone" dataKey="rotacion" name="Real" stroke="var(--chart-1)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="prevista" name="Predicha" stroke="var(--warning)" strokeWidth={2} strokeDasharray="5 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Impacto de intervenciones" desc="Probabilidad media de renuncia antes y después (%)">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={impacto}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip /><Legend />
                <Bar dataKey="antes" name="Antes" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despues" name="Después" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Importancia de variables" desc="Peso relativo de los coeficientes (|β| normalizado)">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={coefs} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="variable" width={130} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="peso" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Configuración del modelo" desc="Parámetros del entrenamiento vigente">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[["Algoritmo", "Regresión Logística"], ["Regularización", "L2 (C = 1.0)"], ["Registros de entrenamiento", "1,240 históricos"], ["Umbral riesgo alto", "p ≥ 0.65"], ["Umbral riesgo medio", "0.35 ≤ p < 0.65"], ["Reentrenamiento", "Mensual"]].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-muted p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
          </dl>
        </Panel>
      </div>

      <section className="mt-6 rounded-xl bg-navy p-6 text-navy-foreground shadow-md">
        <h2 className="text-lg font-semibold">Arquitectura de 3 capas</h2>
        <p className="mt-1 text-sm text-navy-muted">El sistema opera con un modelo basado en variables laborales para pasar de una gestión 100% reactiva a una gestión preventiva.</p>
        <div className="mt-5 flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          {[
            { icon: Monitor, t: "Presentación", s: "React" },
            { icon: Server, t: "Lógica y ML", s: "FastAPI + scikit-learn" },
            { icon: Database, t: "Datos", s: "PostgreSQL" },
          ].map((l, i) => (
            <div key={l.t} className="flex flex-1 items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-lg bg-sidebar-accent p-4">
                <l.icon className="h-6 w-6 text-sidebar-primary" />
                <div><p className="text-xs text-navy-muted">Capa {i + 1} · {l.t}</p><p className="font-semibold">{l.s}</p></div>
              </div>
              {i < 2 && <ArrowRight className="hidden h-5 w-5 text-navy-muted md:block" />}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
