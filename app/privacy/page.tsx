import Link from "next/link"

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          Back to chat
        </Link>
        <p className="mt-8 text-xs uppercase tracking-[0.24em] text-muted-foreground">
          MeGPT
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Privacy Policy</h1>
        <div className="legal-panel mt-8 space-y-5 rounded-[32px] border px-6 py-6 text-base leading-7 text-muted-foreground sm:px-8 sm:py-8">
          <p>
            MeGPT supports guest use without login and also supports optional Google
            Sign-In. If you log in, the app stores the basic account data needed to
            operate the service, including name, email address, and profile image
            when provided by Google.
          </p>
          <p>
            Messages sent through the app may be stored in the application database
            so conversations can be shown in the user interface and operator
            dashboard. Guest conversations are intended to be temporary and expire
            automatically after a short time.
          </p>
          <p>
            Authentication and application data are used only to run MeGPT, support
            messaging workflows, and improve reliability. This data is not sold.
          </p>
          <p>
            If you need your data removed or have privacy questions, contact the app
            operator at the support email listed in the Google consent screen.
          </p>
        </div>
      </div>
    </main>
  )
}
