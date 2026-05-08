import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"

type InfoPageKind = "about" | "privacy" | "terms"

type LegalSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
  links?: {
    label: string
    href: string
  }[]
}

interface LegalDocumentProps {
  kind: InfoPageKind
  title: string
  summary: string
  intro: string[]
  dateLabel: string
  dateValue: string
  effectiveDate?: string
  sections: LegalSection[]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const infoTabs: { kind: InfoPageKind; label: string; href: string }[] = [
  { kind: "terms", label: "Terms", href: "/terms" },
  { kind: "privacy", label: "Privacy", href: "/privacy" },
  { kind: "about", label: "About", href: "/about" },
]

export function LegalDocument({
  kind,
  title,
  summary,
  intro,
  dateLabel,
  dateValue,
  effectiveDate,
  sections,
}: LegalDocumentProps) {
  return (
    <main className="momentum-scroll h-dvh overflow-y-auto bg-background text-foreground">
      <header className="border-b border-border/80 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to chat
            </Link>
          </div>

          <nav
            aria-label="Information pages"
            className="inline-flex w-full items-center gap-1 rounded-full border border-border/80 bg-card/35 p-1 sm:w-fit"
          >
            {infoTabs.map((tab) =>
              tab.kind === kind ? (
                <span
                  key={tab.kind}
                  className="flex-1 rounded-full px-4 py-2 text-center text-sm font-medium text-foreground sm:flex-none"
                >
                  {tab.label}
                </span>
              ) : (
                <Link
                  key={tab.kind}
                  href={tab.href}
                  className="flex-1 rounded-full px-4 py-2 text-center text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground sm:flex-none"
                >
                  {tab.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-[46rem] px-4 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-24">
        <p className="text-center text-sm text-muted-foreground">
          {dateLabel}: {dateValue}
        </p>
        <h1 className="mt-6 text-center text-[2.8rem] font-medium tracking-tight text-balance sm:mt-8 sm:text-7xl">
          {title}
        </h1>
        {effectiveDate ? (
          <p className="mt-8 text-center text-base text-foreground sm:mt-10 sm:text-lg">
            Effective: {effectiveDate}
          </p>
        ) : null}

        <div className="mt-12 rounded-[1.5rem] border border-border/70 bg-card/30 px-5 py-5 sm:mt-16 sm:rounded-[2rem] sm:px-8 sm:py-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Quick version
          </p>
          <p className="mt-3 text-[0.98rem] leading-7 text-foreground sm:mt-4 sm:text-lg sm:leading-8">
            {summary}
          </p>
        </div>

        <div className="mt-10 space-y-6 text-base leading-8 text-foreground/92 sm:mt-14 sm:space-y-8 sm:text-lg sm:leading-9">
          {intro.map((paragraph, index) => (
            <p key={`${kind}-intro-${index}`}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 space-y-12 sm:mt-16 sm:space-y-16">
          {sections.map((section) => {
            const sectionId = slugify(section.title)

            return (
              <section key={sectionId} id={sectionId} className="scroll-mt-20">
                <h2 className="text-[2rem] font-medium tracking-tight text-balance sm:text-[2.5rem]">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-5 text-[1rem] leading-8 text-foreground/84 sm:mt-6 sm:space-y-6 sm:text-[1.125rem] sm:leading-9">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${sectionId}-paragraph-${index}`}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-5 space-y-3 text-[1rem] leading-8 text-foreground/84 sm:mt-6 sm:space-y-4 sm:text-[1.125rem] sm:leading-9">
                    {section.bullets.map((bullet, index) => (
                      <li key={`${sectionId}-bullet-${index}`} className="flex gap-3 sm:gap-4">
                        <span className="mt-3.5 h-2 w-2 shrink-0 rounded-full bg-foreground/75 sm:mt-4" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.links?.length ? (
                  <div className="mt-7 flex flex-wrap gap-3">
                    {section.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
                      >
                        {link.label}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>

        <div className="mt-12 border-t border-border/80 pt-6 sm:mt-16 sm:pt-8">
          <p className="text-sm leading-7 text-muted-foreground">
            MeGPT is a school project. These pages are meant to describe how the site works in
            everyday language, but they are not a substitute for attorney review if the project
            later becomes a commercial product or handles sensitive regulated data.
          </p>
        </div>
      </article>
    </main>
  )
}
