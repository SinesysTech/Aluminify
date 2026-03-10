"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { TipoDocumentoLegal } from "@/app/shared/types/entities/termos";

interface DocumentoTab {
  tipo: TipoDocumentoLegal;
  label: string;
  content: ReactNode;
}

interface TermosTabsProps {
  documentos: DocumentoTab[];
}

export function TermosTabs({ documentos }: TermosTabsProps) {
  const [activeTab, setActiveTab] = useState<TipoDocumentoLegal>(
    documentos[0]?.tipo ?? "termos_uso",
  );

  return (
    <div>
      <div className="flex border-b border-border mb-6 overflow-x-auto">
        {documentos.map(({ tipo, label }) => (
          <button
            key={tipo}
            onClick={() => setActiveTab(tipo)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tipo
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {documentos.map(({ tipo, content }) => (
        <div key={tipo} className={activeTab === tipo ? "block" : "hidden"}>
          {content}
        </div>
      ))}
    </div>
  );
}
