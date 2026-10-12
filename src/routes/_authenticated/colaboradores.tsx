import { createFileRoute } from "@tanstack/react-router";
import { Colaboradores } from "@/components/features/employees/employees-page";
import { colaboradoresQuery } from "@/lib/colaboradores-db";

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
