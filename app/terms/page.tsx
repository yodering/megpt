export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] px-6 py-16 text-[#161616]">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[#6a6256]">
          MeGPT
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Terms of Service</h1>
        <div className="mt-8 space-y-5 text-base leading-7 text-[#40382d]">
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
