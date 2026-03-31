import type { Metadata } from "next";
import { Poiret_One, Montserrat } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const poiretOne = Poiret_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poiret",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "RRSS Objetivo — Cerebro de Contenidos",
  description: "Panel de orquestación multi-plataforma para César Reyes / ActivaQR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${poiretOne.variable} ${montserrat.variable} antialiased bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-300 font-montserrat`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--toast-bg, #1c1c1e)",
                color: "var(--toast-color, #f5f5f5)",
                border: "1px solid var(--toast-border, #2e2e2e)",
                borderRadius: "12px",
                fontSize: "13px",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "var(--toast-bg, #1c1c1e)" } },
              error:   { iconTheme: { primary: "#ef4444", secondary: "var(--toast-bg, #1c1c1e)" } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}

