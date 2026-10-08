import { ArrowUp, ArrowUpRight, Plus } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <main className="flex h-dvh flex-col overflow-y-auto bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-5 sm:px-8">
        <a href="https://yoder.ing/megpt" className="text-lg font-medium tracking-tight">MeGPT</a>
        <ThemeToggle />
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-12 sm:px-8">
        <p className="mb-5 text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Project archive
        </p>
        <h1 className="text-center text-4xl font-medium tracking-tight sm:text-5xl">MeGPT has concluded.</h1>
        <section aria-label="Project status" className="mt-7 text-center">
          <p className="mx-auto max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            This was an experimental project exploring AI interfaces and human authorship. New conversations and replies are no longer available.
          </p>
          <a
            href="https://yoder.ing/megpt/about"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            About the project <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </section>

        <div className="mt-12 rounded-3xl border border-border bg-card p-5" aria-label="Messaging is no longer available">
          <label htmlFor="archived-composer" className="sr-only">Messaging is no longer available</label>
          <textarea id="archived-composer" disabled rows={1} placeholder="This conversation has ended." className="w-full resize-none bg-transparent text-base text-muted-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed" />
          <div className="mt-4 flex items-center justify-between text-muted-foreground">
            <Plus aria-hidden="true" className="h-5 w-5 opacity-50" />
            <span className="rounded-full bg-muted p-2"><ArrowUp aria-hidden="true" className="h-4 w-4 opacity-50" /></span>
          </div>
        </div>
      </div>

      <footer className="px-6 pb-6 text-center text-xs leading-6 text-muted-foreground">
        A project by <a href="https://yoder.ing" className="underline underline-offset-4 hover:text-foreground">David Yoder</a> for Radical Software.
      </footer>
    </main>
  )
}
