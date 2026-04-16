import Script from "next/script"

const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
const domains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS
const hostUrl = process.env.NEXT_PUBLIC_UMAMI_HOST_URL

export function UmamiAnalytics() {
  if (process.env.NODE_ENV !== "production" || !scriptUrl || !websiteId) {
    return null
  }

  return (
    <Script
      id="umami-analytics"
      src={scriptUrl}
      strategy="afterInteractive"
      data-website-id={websiteId}
      data-domains={domains}
      data-host-url={hostUrl}
      data-do-not-track="true"
      data-exclude-search="true"
    />
  )
}
