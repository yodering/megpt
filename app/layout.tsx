import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
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
  icons: {
    icon: "/icon.svg",
  },
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
  viewportFit: "cover",
}

const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
const umamiDomains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS
const umamiHostUrl = process.env.NEXT_PUBLIC_UMAMI_HOST_URL

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
      <head>
        {process.env.NODE_ENV === "production" && umamiScriptUrl && umamiWebsiteId ? (
          <script
            defer
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            data-domains={umamiDomains}
            data-host-url={umamiHostUrl}
          />
        ) : null}
      </head>
      <body suppressHydrationWarning className="h-dvh overflow-hidden font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
