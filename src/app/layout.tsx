import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./providers";

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
    default: "MeeplePrecios - Comparador de precios de juegos de mesa en España y Latinoamérica",
    template: "%s | MeeplePrecios",
  },
  description:
    "Compara precios de juegos de mesa y optimiza tus envíos en tiendas de España y toda Latinoamérica (México, Argentina, Colombia, Chile, Perú, Brasil). Compra tu edición favorita al mejor precio y en tu moneda local.",
  keywords: [
    "juegos de mesa",
    "comparador de precios",
    "board games",
    "España",
    "Latinoamérica",
    "México",
    "Argentina",
    "Colombia",
    "Chile",
    "Perú",
    "MeeplePrecios",
  ],
  openGraph: {
    title: "MeeplePrecios - Comparador de precios de juegos de mesa en España y Latinoamérica",
    description:
      "Encuentra y compara precios de juegos de mesa en tiendas de España y toda Latinoamérica. Optimiza tus envíos y compra al mejor precio.",
    url: "https://meepleprecios.com",
    siteName: "MeeplePrecios",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MeeplePrecios - Comparador de precios de juegos de mesa en España y Latinoamérica",
    description:
      "Encuentra y compara precios de juegos de mesa en tiendas de España y toda Latinoamérica.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
