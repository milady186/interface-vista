import { createFileRoute } from "@tanstack/react-router";
import { Historico } from "@/components/features/retention/history-page";

export const Route = createFileRoute("/_authenticated/historico")({
  head: () => ({
    meta: [
      { title: "Histórico y acciones de retención — TalentAnalytics" },
      { name: "description", content: "Registro de predicciones y acciones de retención aplicadas por RR.HH." },
      { property: "og:title", content: "Histórico y acciones de retención — TalentAnalytics" },
      { property: "og:description", content: "Seguimiento de intervenciones de retención." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Historico,
});
