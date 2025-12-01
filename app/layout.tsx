import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Área do Aluno",
    template: "%s · Área do Aluno",
  },
  description: "Portal do aluno com chat assistido por IA e recursos acadêmicos",
  applicationName: "Área do Aluno",
  keywords: ["aluno", "educação", "chat", "IA", "portal"],
  authors: [{ name: "Área do Aluno" }],
  creator: "Área do Aluno",
  publisher: "Área do Aluno",
  category: "education",
  openGraph: {
    title: "Área do Aluno",
    description: "Portal do aluno com chat assistido por IA e recursos acadêmicos",
    url: "https://localhost/",
    siteName: "Área do Aluno",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Área do Aluno",
    description: "Portal do aluno com chat assistido por IA e recursos acadêmicos",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
