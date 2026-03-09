import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Superadmin | Aluminify",
};

export default function SuperadminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
