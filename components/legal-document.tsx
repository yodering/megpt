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
              className="inline-flex h-10 items-center gap-2 text-sm text-foreground hover:text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to chat
            </Link>
            <div className="hidden h-5 w-px bg-border sm:block" />
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:inline-flex">
              {isPrivacy ? <Shield className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              MeGPT legal
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/privacy"
              className={`inline-flex h-10 items-center border-b text-sm ${
                isPrivacy
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className={`inline-flex h-10 items-center border-b text-sm ${
                !isPrivacy
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Terms
            </Link>
            <ThemeToggle className="h-10 w-10 rounded-full border-0 px-0 hover:bg-accent" />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article className="min-w-0">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {isPrivacy ? "Privacy" : "Terms"} • Last updated {lastUpdated}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
              {description}
            </p>

            <div className="mt-12 border-t border-border" />

            <div className="space-y-0">
              {sections.map((section) => {
                const sectionId = slugify(section.title)

                return (
                  <section
                    key={sectionId}
                    id={sectionId}
                    className="scroll-mt-28 border-b border-border py-10 last:border-b-0"
                  >
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
                      {section.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {section.bullets?.length ? (
                      <ul className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-3">
                            <span className="mt-3 h-px w-4 shrink-0 bg-foreground/45" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                )
              })}
            </div>
          </div>
        </article>

        <aside className="lg:sticky lg:top-[92px] lg:h-fit">
          <div className="border-l border-border pl-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              On this page
            </p>
            <nav className="mt-4 space-y-1">
              {sections.map((section) => {
                const sectionId = slugify(section.title)

                return (
                  <a
                    key={sectionId}
                    href={`#${sectionId}`}
                    className="block py-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {section.title}
                  </a>
                )
              })}
            </nav>

            <div className="mt-8 text-sm leading-6 text-muted-foreground">
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
