import { Pencil } from "lucide-react";
import { RiskBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { COEFICIENTES, formatAntiguedad, soles, type Colaborador } from "@/lib/data";
import { cn } from "@/lib/utils";

export function EmployeeProfile({ c, onClose, onEdit }: { c: Colaborador | null; onClose: () => void; onEdit: (c: Colaborador) => void }) {
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
