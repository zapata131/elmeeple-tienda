import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MeeplePrecios 🇲🇽 - Comparador de precios de juegos de mesa en México',
  description:
    'Encuentra los mejores precios de juegos de mesa en México. Compara ofertas de tiendas independientes con costo de envío entregado en Pesos Mexicanos ($ MXN).',
  keywords: ['juegos de mesa', 'precios mexico', 'catan mexico', 'carcassonne', 'devir mexico', 'meeple precios'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-[#F5F0E9] text-[#3A3A3A] antialiased flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
