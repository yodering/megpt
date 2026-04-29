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
    const faviconPath = "M14 44V23.5h6.2v3.1c1.4-2.3 3.8-3.6 6.8-3.6 3.3 0 5.8 1.5 7.1 4.2 1.6-2.7 4.4-4.2 7.7-4.2 5.4 0 8.9 3.8 8.9 10.1V44h-6.5v-9.7c0-3.5-1.5-5.3-4.3-5.3-2.9 0-4.6 2.1-4.6 5.7V44h-6.5v-9.7c0-3.5-1.5-5.3-4.2-5.3-2.9 0-4.7 2.1-4.7 5.7V44H14Z";
    const updateFavicon = (theme) => {
      const background = theme === "dark" ? "#ffffff" : "#0d0d0d";
      const foreground = theme === "dark" ? "#0d0d0d" : "#ffffff";
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="' + background + '"/><path d="' + faviconPath + '" fill="' + foreground + '"/></svg>';
      const href = "data:image/svg+xml," + encodeURIComponent(svg);
      let iconLink = document.querySelector('link[rel="icon"]');
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "icon";
        iconLink.type = "image/svg+xml";
        document.head.appendChild(iconLink);
      }
      iconLink.href = href;
    };
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
    updateFavicon(resolvedTheme);
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
