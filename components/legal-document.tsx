import Link from "next/link"
import { ArrowLeft, FileText, Shield } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

type LegalSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

interface LegalDocumentProps {
  kind: "privacy" | "terms"
  title: string
  description: string
  lastUpdated: string
  sections: LegalSection[]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function LegalDocument({
  kind,
  title,
  description,
  lastUpdated,
  sections,
}: LegalDocumentProps) {
  const isPrivacy = kind === "privacy"

  return (
    <main className="h-screen overflow-y-auto bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-foreground hover:bg-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to chat
            </Link>
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground sm:inline-flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-[11px] font-semibold text-white">
                M
              </span>
              MeGPT legal
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/privacy"
              className={`inline-flex h-10 items-center rounded-full px-4 text-sm ${
                isPrivacy
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className={`inline-flex h-10 items-center rounded-full px-4 text-sm ${
                !isPrivacy
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              Terms
            </Link>
            <ThemeToggle className="h-10 w-10 rounded-full px-0" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <section className="rounded-[32px] border border-border bg-card px-6 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {isPrivacy ? <Shield className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                MeGPT
              </span>
              <span className="inline-flex rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
                Last updated {lastUpdated}
              </span>
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              {description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-border bg-background px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Applies to
                </p>
                <p className="mt-2 text-sm leading-6">
                  Guest sessions, signed-in accounts, and operator-assisted chat
                  workflows inside MeGPT.
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-background px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Product model
                </p>
                <p className="mt-2 text-sm leading-6">
                  Messages may be reviewed, routed, and answered by a human
                  operator rather than an automated model alone.
                </p>
              </div>
              <div className="rounded-3xl border border-border bg-background px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Questions
                </p>
                <p className="mt-2 text-sm leading-6">
                  Use the support contact listed in the app, deployment, or
                  Google consent configuration for account or policy requests.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-border bg-card px-6 py-6 sm:px-8 sm:py-8">
            <div className="space-y-8">
              {sections.map((section) => {
                const sectionId = slugify(section.title)

                return (
                  <section key={sectionId} id={sectionId} className="scroll-mt-28">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {section.title}
                    </h2>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.bullets?.length ? (
                      <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[88px] lg:h-fit">
          <div className="rounded-[28px] border border-border bg-card px-5 py-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              On this page
            </p>
            <nav className="mt-4 space-y-2">
              {sections.map((section) => {
                const sectionId = slugify(section.title)

                return (
                  <a
                    key={sectionId}
                    href={`#${sectionId}`}
                    className="block rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {section.title}
                  </a>
                )
              })}
            </nav>

            <div className="mt-6 rounded-3xl border border-border bg-background px-4 py-4 text-sm leading-6 text-muted-foreground">
              <p className="font-medium text-foreground">Human-operated replies</p>
              <p className="mt-2">
                MeGPT is designed around operator-assisted messaging. Treat it as a
                managed communication tool, not an unsupervised autonomous system.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
