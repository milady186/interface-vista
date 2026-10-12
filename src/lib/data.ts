export type Riesgo = "Bajo" | "Medio" | "Alto";

export interface Colaborador {
  id: number;
  nombre: string;
  cargo: string;
  antiguedadMeses: number;
  campana: string;
  turno: string;
  sueldo: number;
  ausentismo: number; // días/mes
  tardanzas: number; // por mes
  quejas: number;
  penalidades: number;
  metas: number; // % cumplimiento
  satisfaccion: number; // 1-10
  horasExtra: number; // % pagadas
  probabilidad: number; // 0-1
  riesgo: Riesgo;
}

let seed = 42;
const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};
const pick = <T,>(a: T[]): T => a[Math.floor(rand() * a.length)]!;

const nombres = ["Lucía", "Carlos", "María", "José", "Ana", "Luis", "Rosa", "Jorge", "Carmen", "Miguel", "Diana", "Pedro", "Valeria", "Diego", "Fiorella", "Renzo", "Milagros", "Kevin", "Andrea", "Bryan", "Gabriela", "Jhon", "Katherine", "Alonso", "Sofía", "Junior", "Melissa", "Franco", "Yesenia", "Paolo"];
const apellidos = ["Quispe", "Flores", "Rodríguez", "Huamán", "Sánchez", "García", "Mamani", "Torres", "Ramírez", "Chávez", "Vargas", "Mendoza", "Rojas", "Castillo", "Gutiérrez", "Salazar", "Paredes", "Espinoza", "Cárdenas", "Ríos"];
export const CAMPANAS = ["Claro Ventas", "Claro Soporte", "Movistar Ventas", "Movistar Retención", "Entel Atención", "Bitel Cobranzas"];
export const TURNOS = ["Mañana", "Tarde", "Noche", "Rotativo"];
const cargos: [string, number][] = [["Teleoperador", 1130], ["Asesor de Ventas", 1250], ["Asesor de Retención", 1350], ["Agente de Soporte", 1300], ["Supervisor", 2400], ["Analista de Calidad", 2100]];

// Coeficientes del modelo de Regresión Logística
export const COEFICIENTES = [
  { variable: "Ausentismo", key: "ausentismo", coef: 0.42 },
  { variable: "Tardanzas", key: "tardanzas", coef: 0.18 },
  { variable: "Quejas registradas", key: "quejas", coef: 0.35 },
  { variable: "Penalidades calidad", key: "penalidades", coef: 0.3 },
  { variable: "Cumplimiento de metas", key: "metas", coef: -0.035 },
  { variable: "Satisfacción laboral", key: "satisfaccion", coef: -0.48 },
  { variable: "Horas extra pagadas", key: "horasExtra", coef: -0.015 },
] as const;
export const INTERCEPTO = 2.6;
export const CARGOS = cargos.map(([c]) => c);

function generar(): Colaborador[] {
  const out: Colaborador[] = [];
  for (let i = 1; i <= 200; i++) {
    const [cargo, base] = rand() < 0.9 ? pick(cargos.slice(0, 4)) : pick(cargos.slice(4));
    const stress = rand();
    const c = {
      ausentismo: +(stress * 4 + rand()).toFixed(1),
      tardanzas: Math.round(stress * 8 + rand() * 3),
      quejas: Math.round(stress * 3 * rand() + rand()),
      penalidades: Math.round(stress * 4 * rand()),
      metas: Math.round(110 - stress * 45 - rand() * 15),
      satisfaccion: +Math.max(1, Math.min(10, 9 - stress * 6 + rand() * 2)).toFixed(1),
      horasExtra: Math.round(100 - stress * 70 * rand()),
    };
    let z = INTERCEPTO;
    for (const k of COEFICIENTES) z += k.coef * c[k.key];
    const p = 1 / (1 + Math.exp(-z));
    out.push({
      id: i,
      nombre: `${pick(nombres)} ${pick(apellidos)} ${pick(apellidos)}`,
      cargo,
      antiguedadMeses: Math.max(1, Math.round(rand() * rand() * 48)),
      campana: pick(CAMPANAS),
      turno: pick(TURNOS),
      sueldo: base + Math.round(rand() * 8) * 25,
      ...c,
      probabilidad: p,
      riesgo: p >= 0.65 ? "Alto" : p >= 0.35 ? "Medio" : "Bajo",
    });
  }
  return out;
}

export const colaboradores = generar();

export const formatAntiguedad = (m: number) =>
  m < 12 ? `${m} meses` : `${Math.floor(m / 12)} año${m >= 24 ? "s" : ""}${m % 12 ? ` ${m % 12} m` : ""}`;
export const soles = (n: number) => `S/ ${n.toLocaleString("es-PE")}`;

export const rotacionPorCampana = CAMPANAS.map((c, i) => ({
  campana: c.replace(" ", "\n"),
  nombre: c,
  rotacion: [42, 31, 38, 27, 33, 45][i]!,
}));

export const tendenciaMensual = [
  { mes: "Ene", rotacion: 4.1, prevista: 4.0 },
  { mes: "Feb", rotacion: 3.8, prevista: 3.9 },
  { mes: "Mar", rotacion: 3.5, prevista: 3.4 },
  { mes: "Abr", rotacion: 3.2, prevista: 3.3 },
  { mes: "May", rotacion: 2.9, prevista: 2.8 },
  { mes: "Jun", rotacion: 2.7, prevista: 2.6 },
  { mes: "Jul", rotacion: 2.4, prevista: 2.5 },
  { mes: "Ago", rotacion: 2.2, prevista: 2.2 },
  { mes: "Sep", rotacion: 2.0, prevista: 2.1 },
];

export type Estado = "Pendiente" | "En proceso" | "Exitoso";
export interface Accion {
  id: number;
  fecha: string;
  colaborador: string;
  campana: string;
  riesgoInicial: Riesgo;
  probabilidad: number;
  accion: string;
  responsable: string;
  estado: Estado;
}
const tiposAccion = ["Renegociación de comisiones", "Ajuste de turno", "Sesión de retroalimentación con supervisor", "Plan de capacitación", "Reconocimiento por desempeño", "Revisión de carga de horas extra", "Coaching de calidad"];
const responsables = ["Patricia León (RR.HH.)", "Raúl Medina (RR.HH.)", "Sandra Ponce (Bienestar)", "Óscar Villanueva (Operaciones)"];

const enRiesgo = colaboradores.filter((c) => c.riesgo !== "Bajo");
export const acciones: Accion[] = enRiesgo.slice(0, 28).map((c, i) => {
  const d = new Date(2026, 9, 8 - i * 3);
  const estado: Estado = i < 6 ? "Pendiente" : i < 13 ? "En proceso" : rand() < 0.78 ? "Exitoso" : "En proceso";
  return {
    id: i + 1,
    fecha: d.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }),
    colaborador: c.nombre,
    campana: c.campana,
    riesgoInicial: c.riesgo,
    probabilidad: c.probabilidad,
    accion: pick(tiposAccion),
    responsable: pick(responsables),
    estado,
  };
});

export const alertas = colaboradores
  .filter((c) => c.riesgo === "Alto")
  .sort((a, b) => b.probabilidad - a.probabilidad)
  .slice(0, 6)
  .map((c, i) => ({ ...c, hace: ["hace 12 min", "hace 48 min", "hace 2 h", "hace 5 h", "ayer", "ayer"][i]! }));
