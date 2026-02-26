export async function register() {
  // Em desenvolvimento, evitar carregar o hook de instrumentation do Sentry.
  // No modo webpack ele pode acabar puxando código "browser" (referência a `self`)
  // para o bundle do server e quebrar o `next dev`.
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export async function onRequestError(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const Sentry = await import("@sentry/nextjs");
  return (Sentry as unknown as { captureRequestError: (...a: unknown[]) => unknown })
    .captureRequestError(...args);
}
