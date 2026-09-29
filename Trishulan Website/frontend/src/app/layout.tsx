import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Trishulan Industrial Connect",
  description: "India's trusted industrial marketplace — connecting verified buyers and sellers across the country.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alata&family=Inter:wght@400;500;600;700&family=Luxurious+Script&family=Manrope:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--body)] text-[14px]">
        <Header />
        <main id="view" className="flex-1 animate-[fadeIn_0.22s_ease]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
