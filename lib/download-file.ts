export type DownloadFileOptions = {
  url: string;
  /**
   * Usado quando o servidor não enviar Content-Disposition.
   */
  fallbackFilename: string;
  /**
   * Configuração opcional do fetch (headers, method, etc).
   */
  init?: RequestInit;
};

function sanitizeFilename(value: string): string {
  // Evitar path traversal / caracteres inválidos em Windows
  return value
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
}

export function getFilenameFromContentDisposition(
  contentDisposition: string | null,
): string | null {
  if (!contentDisposition) return null;

  // RFC 5987 / RFC 6266: filename*=UTF-8''...
  const utf8Match = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match?.[1]) {
    try {
      return sanitizeFilename(decodeURIComponent(utf8Match[1]));
    } catch {
      return sanitizeFilename(utf8Match[1]);
    }
  }

  // filename="..."
  const quotedMatch = /filename\s*=\s*"([^"]+)"/i.exec(contentDisposition);
  if (quotedMatch?.[1]) return sanitizeFilename(quotedMatch[1]);

  // filename=...
  const plainMatch = /filename\s*=\s*([^;]+)/i.exec(contentDisposition);
  if (plainMatch?.[1]) return sanitizeFilename(plainMatch[1].trim());

  return null;
}

export function downloadBlob(blob: Blob, filename: string) {
  if (typeof window === "undefined") {
    throw new Error("downloadBlob só pode ser usado no client.");
  }

  const safeFilename = sanitizeFilename(filename) || "download.bin";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function extractErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const data = (await res.json().catch(() => null)) as
      | { error?: unknown; message?: unknown }
      | null;
    const fromError = data?.error != null ? String(data.error) : "";
    const fromMessage = data?.message != null ? String(data.message) : "";
    return (fromError || fromMessage || "").trim();
  }

  return (await res.text().catch(() => "")).slice(0, 300).trim();
}

export async function downloadFile(options: DownloadFileOptions) {
  if (typeof window === "undefined") {
    throw new Error("downloadFile só pode ser usado no client.");
  }

  const res = await fetch(options.url, options.init);
  if (!res.ok) {
    const detail = await extractErrorMessage(res);
    throw new Error(detail || `Erro ao baixar arquivo (HTTP ${res.status})`);
  }

  const blob = await res.blob();
  const filename =
    getFilenameFromContentDisposition(res.headers.get("content-disposition")) ||
    options.fallbackFilename;

  downloadBlob(blob, filename);
}

