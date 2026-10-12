import { createFileRoute } from "@tanstack/react-router";
import { ResetPassword } from "@/components/features/auth/reset-password-page";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nueva contraseña — TalentAnalytics" },
      { name: "description", content: "Restablece tu contraseña de TalentAnalytics." },
      { property: "og:title", content: "Nueva contraseña — TalentAnalytics" },
      { property: "og:description", content: "Restablece tu contraseña de acceso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});
