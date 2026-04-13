import Link from "next/link"

export default function TermsPage() {
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
        <h1 className="mt-3 text-4xl font-semibold">Terms of Service</h1>
        <div className="legal-panel mt-8 space-y-5 rounded-[32px] border px-6 py-6 text-base leading-7 text-muted-foreground sm:px-8 sm:py-8">
          <p>
            MeGPT is provided as-is for messaging and conversation management.
            Availability, features, and access may change without notice.
          </p>
          <p>
            You agree not to misuse the service, attempt unauthorized access, or use
            the app in ways that could disrupt other users or the underlying
            infrastructure.
          </p>
          <p>
            You remain responsible for the content you submit through the app.
          </p>
          <p>
            The operator may suspend access or remove content when necessary for
            safety, abuse prevention, or maintenance.
          </p>
        </div>
      </div>
    </main>
  )
}
