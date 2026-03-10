import { LegalDocumentPage } from "@/app/shared/components/legal-document-viewer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Aluminify",
  description:
    "Termos de Uso da plataforma Aluminify - Sinesys Tecnologia Ltda.",
};

export default function TermosDeUsoPage() {
  return <LegalDocumentPage tipo="termos_uso" />;
}
