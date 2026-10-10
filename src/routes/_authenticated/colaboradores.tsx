import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, RiskBadge } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CAMPANAS, COEFICIENTES, TURNOS, colaboradores, formatAntiguedad, soles, type Colaborador } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/colaboradores")({
  head: () => ({
    meta: [
      { title: "Colaboradores y riesgo — TalentAnalytics" },
      { name: "description", content: "Listado de colaboradores con predicción de riesgo de renuncia por regresión logística." },
      { property: "og:title", content: "Colaboradores y riesgo — TalentAnalytics" },
      { property: "og:description", content: "Predicción individual del riesgo de renuncia." },
    ],
  }),
  component: Colaboradores,
});

function Filtro({ value, onChange, items, label }: { value: string; onChange: (v: string) => void; items: string[]; label: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-card sm:w-48"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: todos</SelectItem>
        {items.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function Colaboradores() {
  const [q, setQ] = useState("");
  const [campana, setCampana] = useState("all");
  const [turno, setTurno] = useState("all");
  const [riesgo, setRiesgo] = useState("all");
  const [sel, setSel] = useState<Colaborador | null>(null);

  const rows = useMemo(
    () =>
      colaboradores
        .filter((c) => (campana === "all" || c.campana === campana) && (turno === "all" || c.turno === turno) && (riesgo === "all" || c.riesgo === riesgo))
        .filter((c) => (c.nombre + c.cargo).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.probabilidad - a.probabilidad),
    [q, campana, turno, riesgo],
  );

  return (
    <>
      <PageHeader title="Colaboradores y Predicción de Riesgo" subtitle="Haz clic en un colaborador para ver su perfil laboral y las variables del modelo" />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative flex-1 sm:min-w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre o cargo…" className="bg-card pl-9" />
        </div>
        <Filtro value={campana} onChange={setCampana} items={CAMPANAS} label="Campaña" />
        <Filtro value={turno} onChange={setTurno} items={TURNOS} label="Turno" />
        <Filtro value={riesgo} onChange={setRiesgo} items={["Bajo", "Medio", "Alto"]} label="Riesgo" />
      </div>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Colaborador", "Cargo", "Antigüedad", "Campaña", "Sueldo base", "Probabilidad", "Riesgo"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((c) => (
                <tr key={c.id} onClick={() => setSel(c)} className="cursor-pointer transition-colors hover:bg-accent/60">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.cargo}</td>
                  <td className="px-4 py-3">{formatAntiguedad(c.antiguedadMeses)}</td>
                  <td className="px-4 py-3">{c.campana}</td>
                  <td className="px-4 py-3">{soles(c.sueldo)}</td>
                  <td className="px-4 py-3 font-display font-semibold">{(c.probabilidad * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3"><RiskBadge riesgo={c.riesgo} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Sin resultados para los filtros aplicados.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">{rows.length} de {colaboradores.length} colaboradores</p>
      </div>
      <Detalle c={sel} onClose={() => setSel(null)} />
    </>
  );
}

function Detalle({ c, onClose }: { c: Colaborador | null; onClose: () => void }) {
  if (!c) return null;
  const vars: { label: string; value: string; bad: boolean; pct: number; coef: number }[] = [
    { label: "Ausentismo", value: `${c.ausentismo} días/mes`, bad: c.ausentismo > 3, pct: c.ausentismo / 5, coef: COEFICIENTES[0].coef },
    { label: "Tardanzas", value: `${c.tardanzas} / mes`, bad: c.tardanzas > 6, pct: c.tardanzas / 11, coef: COEFICIENTES[1].coef },
    { label: "Quejas registradas", value: String(c.quejas), bad: c.quejas > 2, pct: c.quejas / 4, coef: COEFICIENTES[2].coef },
    { label: "Penalidades por calidad", value: String(c.penalidades), bad: c.penalidades > 2, pct: c.penalidades / 4, coef: COEFICIENTES[3].coef },
    { label: "Cumplimiento de metas", value: `${c.metas}%`, bad: c.metas < 80, pct: c.metas / 110, coef: COEFICIENTES[4].coef },
    { label: "Satisfacción laboral", value: `${c.satisfaccion}/10`, bad: c.satisfaccion < 5, pct: c.satisfaccion / 10, coef: COEFICIENTES[5].coef },
    { label: "Horas extra pagadas", value: `${c.horasExtra}%`, bad: c.horasExtra < 70, pct: c.horasExtra / 100, coef: COEFICIENTES[6].coef },
  ];
  const p = c.probabilidad * 100;
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{c.nombre}</DialogTitle>
          <DialogDescription>Perfil laboral · ID PS-{String(c.id).padStart(4, "0")}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {[["Cargo", c.cargo], ["Campaña", c.campana], ["Turno", c.turno], ["Antigüedad", formatAntiguedad(c.antiguedadMeses)], ["Sueldo base", soles(c.sueldo)], ["Sede", "Lima - Cercado"]].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">{k}</p><p className="font-medium">{v}</p></div>
          ))}
        </div>
        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Probabilidad de renuncia (90 días)</p>
            <RiskBadge riesgo={c.riesgo} />
          </div>
          <p className="mt-1 font-display text-4xl font-semibold">{p.toFixed(1)}%</p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-all duration-700", c.riesgo === "Alto" ? "bg-danger" : c.riesgo === "Medio" ? "bg-warning" : "bg-success")} style={{ width: `${p}%` }} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Variables evaluadas · Regresión Logística</p>
          <div className="space-y-2.5">
            {vars.map((v) => (
              <div key={v.label} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 text-sm">
                <span>{v.label} <span className="text-xs text-muted-foreground">(β = {v.coef})</span></span>
                <span className={cn("font-medium", v.bad ? "text-danger" : "text-success")}>{v.value}</span>
                <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full", v.bad ? "bg-danger" : "bg-chart-2")} style={{ width: `${Math.min(100, v.pct * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
