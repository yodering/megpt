export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] px-6 py-16 text-[#161616]">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs uppercase tracking-[0.24em] text-[#6a6256]">
          MeGPT
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Privacy Policy</h1>
        <div className="mt-8 space-y-5 text-base leading-7 text-[#40382d]">
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
