import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'MeeplePrecios 🇲🇽 - Comparador de precios de juegos de mesa en México',
  description:
    'Encuentra los mejores precios de juegos de mesa en tiendas mexicanas con cálculo exacto de costo total entregado y ediciones en español.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-[#F5F0E9] text-[#3A3A3A]">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
