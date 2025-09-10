import type { Metadata, Viewport } from "next";
import { Ubuntu_Sans_Mono } from "next/font/google";
import { Toaster } from "sonner"
import "./globals.css";

const ubuntuSansMono = Ubuntu_Sans_Mono({
  weight: "400",
  subsets: ["latin"],
  style: ["normal"],
  display: "swap",
  variable: "--font-ubuntu-sans-mono",
  preload: true,
  adjustFontFallback: true
})

export const metadata: Metadata = {
  title: 'Text2Image - AI Image Generator',
  description: 'A simple and powerful AI Text-to-Image Generator. This tool allows users to generate high-quality images from text prompts with support for multiple models and versions.'
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark royutz idc0_350 ${ubuntuSansMono.className}`} style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <body className={`antialiased font-ubuntuSansMono`} suppressHydrationWarning>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
