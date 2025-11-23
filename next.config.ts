import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Otimizações para produção
  reactStrictMode: true,
  // Configuração para Vercel
  output: undefined, // Deixa o Next.js decidir (SSR por padrão)
};

export default nextConfig;
