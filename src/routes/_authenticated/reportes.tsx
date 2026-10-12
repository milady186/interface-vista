import { createFileRoute } from "@tanstack/react-router";
import { Reportes } from "@/components/features/reports/reports-page";

export const Route = createFileRoute("/_authenticated/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes y modelo — TalentAnalytics" },
      { name: "description", content: "Impacto de las intervenciones preventivas y efectividad del modelo predictivo." },
      { property: "og:title", content: "Reportes y modelo — TalentAnalytics" },
      { property: "og:description", content: "Efectividad del modelo y arquitectura del sistema." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reportes,
});
