import { LegalDocumentPage } from "@/app/shared/components/legal-document-viewer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Aluminify",
  description:
    "Política de Privacidade da plataforma Aluminify - Sinesys Tecnologia Ltda.",
};

export default function PoliticaDePrivacidadePage() {
  return <LegalDocumentPage tipo="politica_privacidade" />;
}
