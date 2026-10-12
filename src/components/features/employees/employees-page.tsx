import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, RiskBadge } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CAMPANAS, TURNOS, formatAntiguedad, soles, type Colaborador } from "@/lib/data";
import { colaboradoresQuery, useEliminarColaborador } from "@/lib/colaboradores-db";
import { EmployeeFilter } from "./employee-filter";
import { EmployeeForm } from "./employee-form";
import { EmployeeProfile } from "./employee-profile";

export function Colaboradores() {
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
        <EmployeeFilter value={campana} onChange={setCampana} items={CAMPANAS} label="Campaña" />
        <EmployeeFilter value={turno} onChange={setTurno} items={TURNOS} label="Turno" />
        <EmployeeFilter value={riesgo} onChange={setRiesgo} items={["Bajo", "Medio", "Alto"]} label="Riesgo" />
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
      <EmployeeProfile c={sel} onClose={() => setSelId(null)} onEdit={(c) => { setSelId(null); setForm({ c }); }} />
      {form && <EmployeeForm c={form.c} onClose={() => setForm(null)} />}
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
