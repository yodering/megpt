import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { UmamiAnalytics } from "@/components/umami-analytics"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

const themeScript = `
(() => {
  try {
    const storageKey = "megpt-theme";
    const storedTheme = window.localStorage.getItem(storageKey);
    const themePreference =
      storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
        ? storedTheme
        : "system";
    const resolvedTheme =
      themePreference === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : themePreference;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  } catch {}
})();
`

export const metadata: Metadata = {
  title: "MeGPT",
  description: "ChatGPT but a little different",
  openGraph: {
    title: "MeGPT",
    description: "ChatGPT but a little different",
    url: "https://megpt.boo",
    siteName: "MeGPT",
  },
  twitter: {
    card: "summary",
    title: "MeGPT",
    description: "ChatGPT but a little different",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body suppressHydrationWarning className="min-h-dvh font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>{children}</Providers>
        <UmamiAnalytics />
      </body>
    </html>
  )
}
