import type { Metadata } from "next";
import "./globals.css";
import "./options.css";
import "./brand-blue.css";
import "./login-simple.css";
import "./inventory.css";
import "./medicine-images.css";
import "./source-config.css";
import "./brand-accents.css";
import PwaRegister from "./pwa-register";

export const metadata: Metadata = {
  title: "Farmacias ABC | Consulta de medicamentos",
  description: "Buscador flexible y comparador de medicamentos de Farmacias ABC.",
  manifest: "/manifest.webmanifest",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/logo-abc.png",
    shortcut: "/logo-abc.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased"><PwaRegister />{children}</body>
    </html>
  );
}
