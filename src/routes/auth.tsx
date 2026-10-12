import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "@/components/features/auth/auth-page";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — TalentAnalytics" },
      { name: "description", content: "Acceso para el personal de RR.HH. de Partner Service S.A.C." },
      { property: "og:title", content: "Iniciar sesión — TalentAnalytics" },
      { property: "og:description", content: "Acceso al sistema predictivo de retención de personal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});
