import Footer from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GameDB",
  description: "Discover, track, and review your favorite games.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        manrope.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className='min-h-full flex flex-col font-sans'>
        <ThemeProvider>
          <SessionProvider>
            <Navbar />
            <div className="grow w-full">{children}</div>
            <Footer />
            <Toaster theme='dark' position='bottom-center' />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
