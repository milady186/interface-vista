import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { COEFICIENTES, INTERCEPTO, type Colaborador, type Riesgo } from "@/lib/data";

export type Variables = Pick<Colaborador, "ausentismo" | "tardanzas" | "quejas" | "penalidades" | "metas" | "satisfaccion" | "horasExtra">;
export type ColaboradorInput = Omit<Colaborador, "id" | "probabilidad" | "riesgo">;

/** Regresión logística: p = 1 / (1 + e^-(β0 + Σ βi·xi)) */
export function predecir(v: Variables): { probabilidad: number; riesgo: Riesgo } {
  let z = INTERCEPTO;
  for (const k of COEFICIENTES) z += k.coef * Number(v[k.key]);
  const p = 1 / (1 + Math.exp(-z));
  return { probabilidad: p, riesgo: p >= 0.65 ? "Alto" : p >= 0.35 ? "Medio" : "Bajo" };
}

type Row = {
  id: number; nombre: string; cargo: string; antiguedad_meses: number; campana: string; turno: string;
  sueldo: number; ausentismo: number; tardanzas: number; quejas: number; penalidades: number;
  metas: number; satisfaccion: number; horas_extra: number;
};

const fromRow = (r: Row): Colaborador => {
  const base = {
    id: r.id, nombre: r.nombre, cargo: r.cargo, antiguedadMeses: r.antiguedad_meses, campana: r.campana, turno: r.turno,
    sueldo: Number(r.sueldo), ausentismo: Number(r.ausentismo), tardanzas: r.tardanzas, quejas: r.quejas,
    penalidades: r.penalidades, metas: r.metas, satisfaccion: Number(r.satisfaccion), horasExtra: r.horas_extra,
  };
  return { ...base, ...predecir(base) };
};

const toRow = (c: ColaboradorInput) => ({
  nombre: c.nombre, cargo: c.cargo, antiguedad_meses: c.antiguedadMeses, campana: c.campana, turno: c.turno,
  sueldo: c.sueldo, ausentismo: c.ausentismo, tardanzas: c.tardanzas, quejas: c.quejas, penalidades: c.penalidades,
  metas: c.metas, satisfaccion: c.satisfaccion, horas_extra: c.horasExtra,
});

export const colaboradoresQuery = queryOptions({
  queryKey: ["colaboradores"],
  queryFn: async () => {
    const { data, error } = await supabase.from("colaboradores").select("*").order("id");
    if (error) throw error;
    return (data as Row[]).map(fromRow);
  },
});

export function useGuardarColaborador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: number | undefined; input: ColaboradorInput }) => {
      const row = toRow(input);
      const { error } = id
        ? await supabase.from("colaboradores").update({ ...row, updated_at: new Date().toISOString() }).eq("id", id)
        : await supabase.from("colaboradores").insert(row);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colaboradores"] }),
  });
}

export function useEliminarColaborador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("colaboradores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["colaboradores"] }),
  });
}
