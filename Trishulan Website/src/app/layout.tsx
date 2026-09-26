import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
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
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[var(--color-bg)] text-[var(--color-body)] text-[14px]">
        <Header />
        <Navbar />
        <main id="view" className="flex-1 animate-[fadeIn_0.22s_ease]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
