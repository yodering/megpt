import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Bot,
  Clock3,
  ExternalLink,
  Fingerprint,
  MessageSquareReply,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react"
import { appPath } from "@/lib/paths"

const infoTabs = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "About", href: "/about" },
]

const processSections = [
  {
    number: "01",
    title: "Idea",
    kicker: "Chatbot, almost",
    paragraphs: [
      "I started with a familiar interface: a blank chat window, a blinking cursor, and the expectation that a machine will answer immediately. MeGPT keeps that shape but changes the contract. The person typing into the site is not only talking to software; they are entering a small human-operated system.",
      "That friction is the point. The project asks what people assume when an interface looks automated, and what changes when the answer is delayed, routed, read, and written by a person who is deliberately visible in the project description.",
    ],
    caption: "The first decision was not visual. It was choosing to make the chatbot expectation wobble.",
  },
  {
    number: "02",
    title: "Interface",
    kicker: "Borrowed calm",
    paragraphs: [
      "The site borrows the quiet language of contemporary AI tools: a centered prompt, a left rail for conversations, compact controls, and a composer that invites a question before it explains itself. I wanted the surface to feel boring in the useful way. The surprise should come from how the system behaves, not from decoration.",
      "Guest access matters here. Someone can arrive, ask a question, and experience the project without creating a whole account first. Google sign-in is there for continuity, but the first encounter stays lightweight.",
    ],
    caption: "The visual design stays close to chat conventions so the conceptual shift has room to land.",
  },
  {
    number: "03",
    title: "Build",
    kicker: "A real little system",
    paragraphs: [
      "Under the interface, MeGPT is a Next.js app with conversation storage, guest sessions, optional Google authentication, image uploads, and a human reply workflow. Messages go into the site, then the operator side can see them, manage the queue, and send a response back to the original conversation.",
      "The project had to be more than a mockup because the timing and uncertainty are part of the piece. A static prototype would show the idea; a working system lets someone feel it.",
    ],
    caption: "The build treats the human operator as part of the software architecture, not an exception to it.",
  },
  {
    number: "04",
    title: "Operator Loop",
    kicker: "The hidden part",
    paragraphs: [
      "When a user sends a message, the conversation can wait in an awaiting-operator state. That pause is small, but it changes the mood of the exchange. It makes the chat feel less like a vending machine and more like a mediated conversation.",
      "I added limits, status handling, conversation history, and notifications because the project still has to behave responsibly as a tool. The uncanny part only works if the ordinary parts work too.",
    ],
    caption: "The delay is not just latency. It is evidence that another person might be in the loop.",
  },
  {
    number: "05",
    title: "Transparency",
    kicker: "Saying the quiet part",
    paragraphs: [
      "Because the project plays with expectation, the about, privacy, and terms pages have to be unusually plain. MeGPT says that a human may read and reply to messages. It also tells users that guest conversations are temporary and that sensitive information does not belong here.",
      "That plainness is part of the design. A project about the social texture of software should not hide its own social arrangement.",
    ],
    caption: "The policy pages are not paperwork bolted on afterward; they are part of the piece.",
  },
]

export default function AboutPage() {
  return (
    <main className="momentum-scroll h-dvh overflow-y-auto bg-background text-foreground">
      <header className="border-b border-border/80 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </Link>

          <nav
            aria-label="Information pages"
            className="inline-flex w-full items-center gap-1 rounded-full border border-border/80 bg-card/35 p-1 sm:w-fit"
          >
            {infoTabs.map((tab) =>
              tab.href === "/about" ? (
                <span
                  key={tab.href}
                  className="flex-1 rounded-full px-4 py-2 text-center text-sm font-medium text-foreground sm:flex-none"
                >
                  {tab.label}
                </span>
              ) : (
                <Link
                  key={tab.href}
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

      <article className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
        <section className="grid gap-10 border-b border-border/80 pb-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1fr)] lg:items-end lg:gap-16 lg:pb-16">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
              Radical Software / Davidson College
            </p>
            <h1 className="mt-5 max-w-3xl text-[clamp(3rem,10vw,8.25rem)] font-medium leading-[0.9] tracking-normal text-balance">
              About MeGPT
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-foreground/84 sm:text-xl sm:leading-9">
              MeGPT is a student-built chat site by David Yoder. It looks like a
              familiar AI assistant, but the reply workflow is intentionally
              human-assisted.
            </p>
          </div>

          <HeroArtifact />
        </section>

        <section className="grid gap-8 border-b border-border/80 py-10 md:grid-cols-3 md:py-12">
          <ProjectStat label="Class" value="Radical Software" />
          <ProjectStat label="Medium" value="Web app + live performance" />
          <ProjectStat label="Question" value="What if the bot admits the person?" />
        </section>

        <div className="space-y-20 pt-14 sm:space-y-24 sm:pt-20">
          {processSections.map((section, index) => (
            <ProcessSection key={section.number} section={section} index={index} />
          ))}
        </div>

        <section className="mt-20 border-t border-border/80 pt-10 sm:mt-24 sm:pt-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <p className="font-mono text-sm text-muted-foreground">06</p>
              <h2 className="mt-3 text-4xl font-medium tracking-normal sm:text-5xl">
                Links
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-foreground/84">
              <p>
                You can keep exploring the live project, read the policy pages, or
                find more of my work elsewhere.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <ProjectLink href="/" label="Open MeGPT" internal />
                <ProjectLink href="https://yoder.ing" label="yoder.ing" />
                <ProjectLink href="https://www.linkedin.com/in/yodering" label="LinkedIn" />
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-14 border-t border-border/80 pt-6 text-sm leading-7 text-muted-foreground">
          Made by David Yoder for Radical Software at Davidson College. This page
          is a project note, not an official OpenAI or ChatGPT page.
        </footer>
      </article>
    </main>
  )
}

function HeroArtifact() {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card/45 p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
      <div className="rounded-[1.1rem] border border-border/80 bg-background p-4 sm:rounded-[1.5rem] sm:p-5">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div className="flex items-center gap-3">
            <Image
              src={appPath("/icon.svg")}
              alt="MeGPT app icon"
              width={44}
              height={44}
              className="h-11 w-11 rounded-2xl"
            />
            <div>
              <p className="text-sm font-medium">MeGPT</p>
              <p className="text-xs text-muted-foreground">Human-assisted chat</p>
            </div>
          </div>
          <div className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            awaiting reply
          </div>
        </div>

        <div className="space-y-4 py-5">
          <div className="flex items-start gap-3">
            <UserRound className="mt-1 h-5 w-5 shrink-0 text-sky-500" />
            <p className="max-w-[19rem] rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm leading-6">
              Are you actually an AI, or is someone answering this?
            </p>
          </div>
          <div className="flex items-start justify-end gap-3">
            <p className="max-w-[20rem] rounded-2xl rounded-tr-sm bg-foreground px-4 py-3 text-sm leading-6 text-background">
              A person is part of the system. That is the project.
            </p>
            <Bot className="mt-1 h-5 w-5 shrink-0 text-emerald-500" />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ArtifactChip icon={Send} label="message sent" tone="sky" />
          <ArtifactChip icon={Clock3} label="operator pause" tone="amber" />
          <ArtifactChip icon={MessageSquareReply} label="reply returns" tone="emerald" />
        </div>
      </div>
      <p className="px-1 pt-4 text-sm leading-6 text-muted-foreground">
        The live site is both the interface and the artifact: a chatbot-shaped
        system with a person in the middle.
      </p>
    </div>
  )
}

function ArtifactChip({
  icon: Icon,
  label,
  tone,
}: {
  icon: typeof Send
  label: string
  tone: "sky" | "amber" | "emerald"
}) {
  const toneClass = {
    sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  }[tone]

  return (
    <div className={`flex min-h-20 flex-col justify-between rounded-xl p-3 ${toneClass}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium leading-5">{label}</span>
    </div>
  )
}

function ProjectStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-medium leading-tight tracking-normal text-balance">
        {value}
      </p>
    </div>
  )
}

function ProcessSection({
  section,
  index,
}: {
  section: (typeof processSections)[number]
  index: number
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-16">
      <div className="lg:sticky lg:top-8 lg:self-start">
        <p className="font-mono text-sm text-muted-foreground">{section.number}</p>
        <h2 className="mt-3 text-4xl font-medium tracking-normal sm:text-5xl">
          {section.title}
        </h2>
        <p className="mt-4 text-sm uppercase tracking-[0.16em] text-muted-foreground">
          {section.kicker}
        </p>
      </div>

      <div>
        <div className="space-y-5 text-lg leading-8 text-foreground/84">
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ProcessFigure index={index} caption={section.caption} />
      </div>
    </section>
  )
}

function ProcessFigure({ index, caption }: { index: number; caption: string }) {
  const figures = [
    <IdeaFigure key="idea" />,
    <InterfaceFigure key="interface" />,
    <BuildFigure key="build" />,
    <LoopFigure key="loop" />,
    <TransparencyFigure key="transparency" />,
  ]

  return (
    <figure className="mt-8">
      <div className="overflow-hidden rounded-[1.25rem] border border-border bg-card/35 p-4 sm:rounded-[1.5rem] sm:p-5">
        {figures[index]}
      </div>
      <figcaption className="mt-3 text-sm leading-6 text-muted-foreground">
        {caption}
      </figcaption>
    </figure>
  )
}

function IdeaFigure() {
  return (
    <div className="grid min-h-64 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className="rounded-2xl border border-border bg-background p-4">
        <Sparkles className="h-5 w-5 text-violet-500" />
        <p className="mt-12 text-2xl font-medium leading-tight">AI expectation</p>
      </div>
      <div className="hidden h-px w-12 bg-border sm:block" />
      <div className="rounded-2xl border border-border bg-background p-4">
        <UserRound className="h-5 w-5 text-emerald-500" />
        <p className="mt-12 text-2xl font-medium leading-tight">Human answer</p>
      </div>
    </div>
  )
}

function InterfaceFigure() {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="mx-auto max-w-md space-y-5 py-5">
        <p className="text-center text-3xl font-medium tracking-normal">What can I help with?</p>
        <div className="rounded-2xl border border-border bg-card/55 p-3">
          <div className="flex items-center justify-between rounded-xl bg-background px-4 py-3 text-sm text-muted-foreground">
            <span>Message MeGPT</span>
            <Send className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function BuildFigure() {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <SystemBlock label="Next.js site" value="chat UI" />
      <SystemBlock label="Database" value="history" />
      <SystemBlock label="Discord" value="operator" />
      <SystemBlock label="Browser" value="reply" />
    </div>
  )
}

function LoopFigure() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <LoopStep icon={Send} label="User sends" />
      <LoopStep icon={Clock3} label="Conversation waits" />
      <LoopStep icon={MessageSquareReply} label="Operator replies" />
    </div>
  )
}

function TransparencyFigure() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SystemBlock icon={ShieldCheck} label="Privacy" value="human review is disclosed" />
      <SystemBlock icon={Fingerprint} label="Guest mode" value="temporary identity" />
    </div>
  )
}

function SystemBlock({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof ShieldCheck
  label: string
  value: string
}) {
  return (
    <div className="min-h-40 rounded-2xl border border-border bg-background p-4">
      {Icon ? <Icon className="h-5 w-5 text-emerald-500" /> : null}
      <p className="mt-10 text-sm uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-xl font-medium leading-tight">{value}</p>
    </div>
  )
}

function LoopStep({ icon: Icon, label }: { icon: typeof Send; label: string }) {
  return (
    <div className="flex min-h-40 flex-col justify-between rounded-2xl border border-border bg-background p-4">
      <Icon className="h-5 w-5 text-sky-500" />
      <p className="text-xl font-medium leading-tight">{label}</p>
    </div>
  )
}

function ProjectLink({
  href,
  label,
  internal = false,
}: {
  href: string
  label: string
  internal?: boolean
}) {
  const className =
    "inline-flex items-center gap-2 rounded-full border border-border/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"

  if (internal) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  )
}
