import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/features/dashboard/dashboard-page";
import { colaboradoresQuery } from "@/lib/colaboradores-db";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TalentAnalytics" },
      { name: "description", content: "KPIs de rotación, riesgo de renuncia y alertas tempranas de Partner Service S.A.C." },
      { property: "og:title", content: "Dashboard — TalentAnalytics" },
      { property: "og:description", content: "KPIs de rotación, riesgo de renuncia y alertas tempranas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(colaboradoresQuery),
  component: Dashboard,
});
