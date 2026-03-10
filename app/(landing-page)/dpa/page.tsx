import { LegalDocumentPage } from "@/app/shared/components/legal-document-viewer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acordo de Processamento de Dados (DPA) | Aluminify",
  description:
    "DPA da plataforma Aluminify - Sinesys Tecnologia Ltda.",
};

export default function DpaPage() {
  return <LegalDocumentPage tipo="dpa" />;
}
