import { useState } from "react";
import { toast } from "sonner";
import { RiskBadge } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CAMPANAS, CARGOS, TURNOS, type Colaborador } from "@/lib/data";
import { predecir, useGuardarColaborador, type ColaboradorInput } from "@/lib/colaboradores-db";
import { cn } from "@/lib/utils";

const vacio: ColaboradorInput = {
  nombre: "", cargo: CARGOS[0] ?? "", antiguedadMeses: 1, campana: CAMPANAS[0] ?? "", turno: TURNOS[0] ?? "", sueldo: 1130,
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

export function EmployeeForm({ c, onClose }: { c?: Colaborador | undefined; onClose: () => void }) {
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
