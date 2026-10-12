import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, RiskBadge } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CAMPANAS, CARGOS, COEFICIENTES, TURNOS, formatAntiguedad, soles, type Colaborador } from "@/lib/data";
import { colaboradoresQuery, predecir, useEliminarColaborador, useGuardarColaborador, type ColaboradorInput } from "@/lib/colaboradores-db";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/colaboradores")({
  head: () => ({
    meta: [
      { title: "Colaboradores y riesgo — TalentAnalytics" },
      { name: "description", content: "Gestión de colaboradores con predicción de riesgo de renuncia por regresión logística." },
      { property: "og:title", content: "Colaboradores y riesgo — TalentAnalytics" },
      { property: "og:description", content: "Predicción individual del riesgo de renuncia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(colaboradoresQuery),
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
  const { data: colaboradores } = useSuspenseQuery(colaboradoresQuery);
  const [q, setQ] = useState("");
  const [campana, setCampana] = useState("all");
  const [turno, setTurno] = useState("all");
  const [riesgo, setRiesgo] = useState("all");
  const [selId, setSelId] = useState<number | null>(null);
  const [form, setForm] = useState<{ c?: Colaborador } | null>(null);
  const [borrar, setBorrar] = useState<Colaborador | null>(null);
  const eliminar = useEliminarColaborador();
  const sel = colaboradores.find((c) => c.id === selId) ?? null;

  const rows = useMemo(
    () =>
      colaboradores
        .filter((c) => (campana === "all" || c.campana === campana) && (turno === "all" || c.turno === turno) && (riesgo === "all" || c.riesgo === riesgo))
        .filter((c) => (c.nombre + c.cargo).toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.probabilidad - a.probabilidad),
    [colaboradores, q, campana, turno, riesgo],
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title="Colaboradores y Predicción de Riesgo" subtitle="Registra, edita o elimina colaboradores; el modelo recalcula su riesgo al instante" />
        <Button onClick={() => setForm({})}><Plus className="mr-1 h-4 w-4" />Nuevo colaborador</Button>
      </div>
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
                {["Colaborador", "Cargo", "Antigüedad", "Campaña", "Sueldo base", "Probabilidad", "Riesgo", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((c) => (
                <tr key={c.id} onClick={() => setSelId(c.id)} className="cursor-pointer transition-colors hover:bg-accent/60">
                  <td className="px-4 py-3 font-medium">{c.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.cargo}</td>
                  <td className="px-4 py-3">{formatAntiguedad(c.antiguedadMeses)}</td>
                  <td className="px-4 py-3">{c.campana}</td>
                  <td className="px-4 py-3">{soles(c.sueldo)}</td>
                  <td className="px-4 py-3 font-display font-semibold">{(c.probabilidad * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3"><RiskBadge riesgo={c.riesgo} /></td>
                  <td className="px-2 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => setForm({ c })}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label="Eliminar" onClick={() => setBorrar(c)}><Trash2 className="h-4 w-4 text-danger" /></Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Sin resultados para los filtros aplicados.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">{rows.length} de {colaboradores.length} colaboradores</p>
      </div>
      <Detalle c={sel} onClose={() => setSelId(null)} onEdit={(c) => { setSelId(null); setForm({ c }); }} />
      {form && <Formulario c={form.c} onClose={() => setForm(null)} />}
      <AlertDialog open={!!borrar} onOpenChange={(o) => !o && setBorrar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {borrar?.nombre}?</AlertDialogTitle>
            <AlertDialogDescription>Se quitará del registro y de las predicciones. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-danger text-primary-foreground hover:bg-danger/90"
              onClick={() => borrar && eliminar.mutate(borrar.id, { onSuccess: () => toast.success("Colaborador eliminado"), onError: (e) => toast.error(e.message) })}
            >Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const vacio: ColaboradorInput = {
  nombre: "", cargo: CARGOS[0]!, antiguedadMeses: 1, campana: CAMPANAS[0]!, turno: TURNOS[0]!, sueldo: 1130,
  ausentismo: 0, tardanzas: 0, quejas: 0, penalidades: 0, metas: 100, satisfaccion: 7, horasExtra: 100,
};

const numericos: { key: keyof ColaboradorInput; label: string; min: number; max: number; step: number }[] = [
  { key: "antiguedadMeses", label: "Antigüedad (meses)", min: 0, max: 600, step: 1 },
  { key: "sueldo", label: "Sueldo base (S/)", min: 0, max: 20000, step: 25 },
  { key: "ausentismo", label: "Ausentismo (días/mes)", min: 0, max: 30, step: 0.1 },
  { key: "tardanzas", label: "Tardanzas (por mes)", min: 0, max: 31, step: 1 },
  { key: "quejas", label: "Quejas registradas", min: 0, max: 50, step: 1 },
  { key: "penalidades", label: "Penalidades por calidad", min: 0, max: 50, step: 1 },
  { key: "metas", label: "Cumplimiento de metas (%)", min: 0, max: 200, step: 1 },
  { key: "satisfaccion", label: "Satisfacción laboral (1-10)", min: 1, max: 10, step: 0.1 },
  { key: "horasExtra", label: "Horas extra pagadas (%)", min: 0, max: 100, step: 1 },
];

function Formulario({ c, onClose }: { c?: Colaborador | undefined; onClose: () => void }) {
  const [v, setV] = useState<ColaboradorInput>(c ? { ...c } : vacio);
  const guardar = useGuardarColaborador();
  const pred = predecir(v);
  const set = <K extends keyof ColaboradorInput>(k: K, val: ColaboradorInput[K]) => setV((s) => ({ ...s, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.nombre.trim()) { toast.error("Ingresa el nombre del colaborador"); return; }
    for (const n of numericos) {
      const x = Number(v[n.key]);
      if (Number.isNaN(x) || x < n.min || x > n.max) { toast.error(`${n.label}: valor entre ${n.min} y ${n.max}`); return; }
    }
    guardar.mutate(
      { id: c?.id, input: { ...v, nombre: v.nombre.trim().slice(0, 120) } },
      {
        onSuccess: () => { toast.success(c ? "Colaborador actualizado · predicción recalculada" : "Colaborador registrado"); onClose(); },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{c ? "Editar colaborador" : "Nuevo colaborador"}</DialogTitle>
            <DialogDescription>La probabilidad de renuncia se recalcula con cada cambio.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" value={v.nombre} maxLength={120} onChange={(e) => set("nombre", e.target.value)} />
            </div>
            {([["cargo", "Cargo", CARGOS], ["campana", "Campaña", CAMPANAS], ["turno", "Turno", TURNOS]] as const).map(([k, l, items]) => (
              <div key={k} className="space-y-1.5">
                <Label>{l}</Label>
                <Select value={v[k]} onValueChange={(x) => set(k, x)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{items.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
            {numericos.map((n) => (
              <div key={n.key} className="space-y-1.5">
                <Label htmlFor={n.key}>{n.label}</Label>
                <Input id={n.key} type="number" min={n.min} max={n.max} step={n.step} value={String(v[n.key])} onChange={(e) => set(n.key, Number(e.target.value) as never)} />
              </div>
            ))}
          </div>
          <div className="rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Predicción del modelo</p>
              <RiskBadge riesgo={pred.riesgo} />
            </div>
            <p className="mt-1 font-display text-3xl font-semibold">{(pred.probabilidad * 100).toFixed(1)}%</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-all duration-500", pred.riesgo === "Alto" ? "bg-danger" : pred.riesgo === "Medio" ? "bg-warning" : "bg-success")} style={{ width: `${pred.probabilidad * 100}%` }} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={guardar.isPending}>{guardar.isPending ? "Guardando…" : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Detalle({ c, onClose, onEdit }: { c: Colaborador | null; onClose: () => void; onEdit: (c: Colaborador) => void }) {
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onEdit(c)}><Pencil className="mr-1 h-4 w-4" />Editar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
