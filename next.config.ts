import type { NextConfig } from "next";
import path from "path";
import "./app/shared/core/env";

const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  // Otimizações para produção
  reactStrictMode: true,

  // Evita warning de cross-origin em desenvolvimento ao acessar via IP da rede
  // (ex.: http://192.168.1.100:3000)
  allowedDevOrigins: ["192.168.1.100"],

  // Configuração de output
  // Para Docker: usar 'standalone' para build otimizado
  // Para Vercel: usar undefined (SSR por padrão)
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,

  // Otimizações de imagens
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // Compressão e otimizações
  compress: true,

  // Configurações de produção
  poweredByHeader: false,

  // Otimizações de bundle
  experimental: {
    optimizePackageImports: [
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "lucide-react",
    ],
  },

  // Configuração do Turbopack para tratar dependências opcionais
  turbopack: {
    resolveAlias: {
      // Stub vazio para dependências opcionais não utilizadas
      "@aws-sdk/client-s3": "@/lib/stubs/empty.js",
    },
  },

  // Configuração do Webpack para produção
  webpack: (config) => {
    // Garantir resolução a partir da raiz do projeto (evita bug com caminhos no Windows)
    config.resolve.modules = [
      path.join(projectRoot, "node_modules"),
      ...(config.resolve.modules || []),
    ];
    // Ignorar dependências opcionais do unzipper
    // Alias: Mastra/anthropic-v5 precisa de provider-utils 3.x (createProviderDefinedToolFactory);
    // o root tem 4.x (de @ai-sdk/openai). Webpack resolve o root primeiro, então forçamos 3.x.
    const providerUtilsV3 = path.join(
      projectRoot,
      "node_modules/@ai-sdk/anthropic-v5/node_modules/@ai-sdk/provider-utils"
    );
    config.resolve.alias = {
      ...config.resolve.alias,
      "@aws-sdk/client-s3": false,
      "@ai-sdk/provider-utils": providerUtilsV3,
    };

    // Ignorar módulos opcionais
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /node_modules\/unzipper/ },
    ];

    return config;
  },
};

export default nextConfig;
