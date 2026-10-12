import { useState } from "react";
import { EstadoBadge, PageHeader, RiskBadge } from "@/components/app-shell";
import { acciones as inicial, type Estado } from "@/lib/data";
import { cn } from "@/lib/utils";

const ESTADOS: Estado[] = ["Pendiente", "En proceso", "Exitoso"];

export function Historico() {
  const [rows, setRows] = useState(inicial);
  const [filtro, setFiltro] = useState<Estado | "Todos">("Todos");
  const avanzar = (id: number) =>
    setRows((r) => r.map((a) => (a.id === id ? { ...a, estado: ESTADOS[Math.min(2, ESTADOS.indexOf(a.estado) + 1)] ?? a.estado } : a)));
  const vis = rows.filter((a) => filtro === "Todos" || a.estado === filtro);

  return (
    <>
      <PageHeader title="Histórico de Predicciones y Acciones de Retención" subtitle="Cada intervención retroalimenta el modelo predictivo" />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {ESTADOS.map((e) => (
          <div key={e} className="rounded-xl border bg-card p-4 shadow-sm">
            <EstadoBadge estado={e} />
            <p className="mt-2 font-display text-3xl font-semibold">{rows.filter((a) => a.estado === e).length}</p>
          </div>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        {(["Todos", ...ESTADOS] as const).map((e) => (
          <button key={e} onClick={() => setFiltro(e)} className={cn("rounded-full border px-3 py-1 text-sm transition", filtro === e ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
            {e}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>{["Fecha", "Colaborador", "Riesgo detectado", "Acción de retención", "Responsable", "Estado", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {vis.map((a) => (
              <tr key={a.id} className="hover:bg-accent/40">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{a.fecha}</td>
                <td className="px-4 py-3"><p className="font-medium">{a.colaborador}</p><p className="text-xs text-muted-foreground">{a.campana}</p></td>
                <td className="px-4 py-3"><div className="flex items-center gap-2"><RiskBadge riesgo={a.riesgoInicial} /><span className="text-xs">{(a.probabilidad * 100).toFixed(0)}%</span></div></td>
                <td className="px-4 py-3">{a.accion}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.responsable}</td>
                <td className="px-4 py-3"><EstadoBadge estado={a.estado} /></td>
                <td className="px-4 py-3 text-right">
                  {a.estado !== "Exitoso" && (
                    <button onClick={() => avanzar(a.id)} className="text-xs font-medium text-primary hover:underline">
                      {a.estado === "Pendiente" ? "Iniciar" : "Marcar exitoso"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
