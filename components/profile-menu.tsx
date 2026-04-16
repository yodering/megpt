"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { createPortal } from "react-dom"
import {
  Bell,
  Blocks,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  FileText,
  LogIn,
  LogOut,
  Monitor,
  Moon,
  Plus,
  Settings2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Sun,
  UserCircle2,
  Users,
  Volume2,
  X,
  type LucideIcon,
} from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProfileMenuProps {
  variant?: "header" | "sidebar"
}

type MenuView = "main" | "help"
type ThemePreference = "light" | "dark" | "system"
type SettingsSectionId =
  | "general"
  | "notifications"
  | "personalization"
  | "apps"
  | "schedules"
  | "orders"
  | "data-controls"
  | "security"
  | "parental-controls"
  | "account"

const SETTINGS_SECTIONS: Array<{
  id: SettingsSectionId
  label: string
  icon: LucideIcon
}> = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "personalization", label: "Personalization", icon: SlidersHorizontal },
  { id: "apps", label: "Apps", icon: Blocks },
  { id: "schedules", label: "Schedules", icon: Clock3 },
  { id: "orders", label: "Orders", icon: FileText },
  { id: "data-controls", label: "Data controls", icon: Database },
  { id: "security", label: "Security", icon: Shield },
  { id: "parental-controls", label: "Parental controls", icon: Users },
  { id: "account", label: "Account", icon: UserCircle2 },
]

export function ProfileMenu({ variant = "header" }: ProfileMenuProps) {
  const { data: session } = useSession()
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuView, setMenuView] = useState<MenuView>("main")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeSettingsSection, setActiveSettingsSection] =
    useState<SettingsSectionId>("general")
  const [desktopNotificationsEnabled, setDesktopNotificationsEnabled] =
    useState(false)
  const [replySoundsEnabled, setReplySoundsEnabled] = useState(true)
  const [emailSummariesEnabled, setEmailSummariesEnabled] = useState(false)
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [separateVoiceEnabled, setSeparateVoiceEnabled] = useState(false)
  const [chatHistoryEnabled, setChatHistoryEnabled] = useState(true)
  const [familyModeEnabled, setFamilyModeEnabled] = useState(false)
  const [guardrailsEnabled, setGuardrailsEnabled] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)
  const userLabel = session?.user?.name || session?.user?.email || "Guest"
  const userInitial = userLabel[0]?.toUpperCase() || "G"
  const planLabel = session ? "Plus" : "Guest"

  function openMenu() {
    setMenuView("main")
    setIsMenuOpen(true)
  }

  function closeMenu() {
    setMenuView("main")
    setIsMenuOpen(false)
  }

  function openSettings(section: SettingsSectionId) {
    setActiveSettingsSection(section)
    setIsSettingsOpen(true)
    closeMenu()
  }

  function blurActiveElement() {
    const activeElement = document.activeElement
    if (activeElement instanceof HTMLElement) {
      activeElement.blur()
    }
  }

  function startGoogleSignIn() {
    blurActiveElement()
    void signIn("google", { callbackUrl: "/" })
  }

  function startSignOut() {
    blurActiveElement()
    void signOut({ callbackUrl: "/" })
  }

  useEffect(() => {
    if (!isMenuOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu()
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen && !isSettingsOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return

      if (isSettingsOpen) {
        setIsSettingsOpen(false)
        return
      }

      closeMenu()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMenuOpen, isSettingsOpen])

  return (
    <div
      ref={rootRef}
      className={cn("relative", variant === "sidebar" ? "w-full" : "")}
    >
      {variant === "header" ? (
        <button
          type="button"
          onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-blue-500 to-fuchsia-500 text-sm font-medium text-white shadow-sm"
          title="Open account menu"
        >
          {userInitial}
        </button>
      ) : (
        <Button
          variant="ghost"
          onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
          className="h-auto w-full justify-between rounded-lg border-0 bg-transparent px-3 py-2.5 text-sidebar-foreground shadow-none hover:bg-sidebar-accent"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#bc9650] text-sm font-medium text-white">
              {userInitial}
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-medium">{userLabel}</span>
              <span className="block text-sm text-muted-foreground">{planLabel}</span>
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isMenuOpen ? "rotate-180" : ""
            )}
          />
        </Button>
      )}

      {isMenuOpen ? (
        <div
          className={cn(
            "absolute z-30 overflow-hidden rounded-[1.9rem] border border-border bg-popover p-2 shadow-[0_24px_70px_rgba(0,0,0,0.22)]",
            variant === "header"
              ? "right-0 top-11 w-[min(24rem,calc(100vw-1.5rem))]"
              : "bottom-15 left-0 right-0 w-auto"
          )}
        >
          {menuView === "main" ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#bc9650] text-base font-medium text-white">
                  {userInitial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-medium text-foreground">
                    {userLabel}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{planLabel}</p>
                </div>
              </div>

              {session ? (
                <MenuButton
                  icon={Plus}
                  label="Add another account"
                  badge="Soon"
                />
              ) : (
                <MenuButton
                  icon={LogIn}
                  label="Sign in with Google"
                  onClick={() => {
                    closeMenu()
                    startGoogleSignIn()
                  }}
                />
              )}

              <Divider />

              {session ? (
                <MenuButton icon={Sparkles} label="Upgrade plan" badge="Soon" />
              ) : null}
              <MenuButton
                icon={SlidersHorizontal}
                label="Personalization"
                onClick={() => openSettings("personalization")}
              />
              <MenuButton
                icon={UserCircle2}
                label="Profile"
                onClick={() => openSettings("account")}
              />
              <MenuButton
                icon={Settings2}
                label="Settings"
                onClick={() => openSettings("general")}
              />

              <Divider />

              <MenuButton
                icon={CircleHelp}
                label="Help"
                trailing={<ChevronRight className="h-5 w-5 text-muted-foreground" />}
                onClick={() => setMenuView("help")}
              />
              {session ? (
                <MenuButton
                  icon={LogOut}
                  label="Log out"
                  onClick={() => {
                    closeMenu()
                    startSignOut()
                  }}
                />
              ) : (
                <MenuButton
                  icon={LogIn}
                  label="Log in"
                  onClick={() => {
                    closeMenu()
                    startGoogleSignIn()
                  }}
                />
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-1 py-1">
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => setMenuView("main")}
                  title="Back to menu"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-[17px] font-medium text-foreground">Help</p>
                  <p className="text-sm text-muted-foreground">
                    Support links and placeholders
                  </p>
                </div>
              </div>

              <Divider />

              <MenuButton
                icon={CircleHelp}
                label="Help center"
                badge="Soon"
              />
              <MenuLink icon={Shield} href="/privacy" onNavigate={closeMenu}>
                Privacy Policy
              </MenuLink>
              <MenuLink icon={FileText} href="/terms" onNavigate={closeMenu}>
                Terms of Service
              </MenuLink>
            </>
          )}
        </div>
      ) : null}

      {typeof document !== "undefined" && isSettingsOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/32 p-2 backdrop-blur-[3px] sm:p-6"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setIsSettingsOpen(false)
                }
              }}
            >
              <div className="flex h-[min(48rem,calc(100dvh-1rem))] w-[min(70rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-[2rem] border border-border bg-popover shadow-[0_30px_100px_rgba(0,0,0,0.24)] md:h-[min(52rem,calc(100dvh-3rem))] md:flex-row">
                <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card/45 px-3 py-3 md:w-[20rem] md:border-b-0 md:border-r md:px-4 md:py-5">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                      onClick={() => setIsSettingsOpen(false)}
                      title="Close settings"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="momentum-scroll mt-3 flex-1 overflow-y-auto pr-1">
                    <div className="space-y-1">
                      {SETTINGS_SECTIONS.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          className={cn(
                            "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] transition-colors",
                            activeSettingsSection === section.id
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                          )}
                          onClick={() => setActiveSettingsSection(section.id)}
                        >
                          <section.icon className="h-5 w-5 shrink-0" />
                          {section.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>

                <section className="momentum-scroll min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-7">
                  <div className="mx-auto max-w-3xl">
                    <SettingsSectionTitle
                      title={SETTINGS_SECTIONS.find(
                        (section) => section.id === activeSettingsSection
                      )?.label ?? "Settings"}
                    />

                    {activeSettingsSection === "general" ? (
                      <>
                        <SettingsRow
                          label="Appearance"
                          trailing={
                            <ThemePreferenceControl
                              theme={theme}
                              setTheme={setTheme}
                            />
                          }
                        />
                        <SettingsRow
                          label="Contrast"
                          trailing={<SettingsValue>System</SettingsValue>}
                        />
                        <SettingsRow
                          label="Accent color"
                          trailing={
                            <SettingsValue>
                              <span className="inline-flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
                                Purple
                              </span>
                            </SettingsValue>
                          }
                        />
                        <SettingsRow
                          label="Language"
                          trailing={<SettingsValue>Auto-detect</SettingsValue>}
                        />
                        <SettingsRow
                          label="Spoken language"
                          description="For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection."
                          trailing={<SettingsValue>Auto-detect</SettingsValue>}
                        />
                        <SettingsRow
                          label="Voice"
                          trailing={
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent"
                              >
                                Play
                              </button>
                              <SettingsValue>
                                <span className="inline-flex items-center gap-2">
                                  <Volume2 className="h-4 w-4" />
                                  Sol
                                </span>
                              </SettingsValue>
                            </div>
                          }
                        />
                        <SettingsRow
                          label="Separate Voice"
                          description="Keep MeGPT Voice in a separate full screen, without real time transcripts and visuals."
                          trailing={
                            <Toggle
                              checked={separateVoiceEnabled}
                              onClick={() =>
                                setSeparateVoiceEnabled((current) => !current)
                              }
                            />
                          }
                        />
                      </>
                    ) : null}

                    {activeSettingsSection === "notifications" ? (
                      <>
                        <SettingsRow
                          label="Push notifications"
                          description="Notify you when MeGPT has a reply waiting."
                          trailing={
                            <Toggle
                              checked={desktopNotificationsEnabled}
                              onClick={() =>
                                setDesktopNotificationsEnabled((current) => !current)
                              }
                            />
                          }
                        />
                        <SettingsRow
                          label="Reply sounds"
                          description="Play a small chime when new replies arrive."
                          trailing={
                            <Toggle
                              checked={replySoundsEnabled}
                              onClick={() => setReplySoundsEnabled((current) => !current)}
                            />
                          }
                        />
                        <SettingsRow
                          label="Email summaries"
                          description="Placeholder surface for digest emails and reminders."
                          trailing={
                            <Toggle
                              checked={emailSummariesEnabled}
                              onClick={() =>
                                setEmailSummariesEnabled((current) => !current)
                              }
                            />
                          }
                        />
                      </>
                    ) : null}

                    {activeSettingsSection === "personalization" ? (
                      <>
                        <SettingsRow
                          label="Custom instructions"
                          description="Tell MeGPT how you like it to respond. This is a placeholder for a fuller instruction editor."
                          trailing={<SettingsValue>Soon</SettingsValue>}
                        />
                        <SettingsRow
                          label="Memory"
                          description="Remember preferences and recurring details across conversations."
                          trailing={
                            <Toggle
                              checked={memoryEnabled}
                              onClick={() => setMemoryEnabled((current) => !current)}
                            />
                          }
                        />
                        <SettingsRow
                          label="Interface density"
                          trailing={<SettingsValue>Comfortable</SettingsValue>}
                        />
                      </>
                    ) : null}

                    {activeSettingsSection === "apps" ? (
                      <>
                        <SettingsRow
                          label="Connected tools"
                          description="Surface for installed capabilities and future integrations."
                          trailing={<SettingsValue>1 active</SettingsValue>}
                        />
                        <SettingsRow
                          label="File attachments"
                          description="Images can already be attached in chat. Additional app actions can land here later."
                          trailing={<SettingsValue>Enabled</SettingsValue>}
                        />
                      </>
                    ) : null}

                    {activeSettingsSection === "schedules" ? (
                      <>
                        <SettingsRow
                          label="Daily brief"
                          description="Placeholder for scheduled summaries and reminders."
                          trailing={<SettingsValue>Off</SettingsValue>}
                        />
                        <SettingsRow
                          label="Timezone"
                          trailing={<SettingsValue>Local</SettingsValue>}
                        />
                      </>
                    ) : null}

                    {activeSettingsSection === "orders" ? (
                      <>
                        <SettingsRow
                          label="Purchases"
                          description="No billing or purchase history is available in MeGPT yet."
                          trailing={<SettingsValue>None</SettingsValue>}
                        />
                      </>
                    ) : null}

                    {activeSettingsSection === "data-controls" ? (
                      <>
                        <SettingsRow
                          label="Chat history"
                          description="Keep recent conversations available in the sidebar."
                          trailing={
                            <Toggle
                              checked={chatHistoryEnabled}
                              onClick={() => setChatHistoryEnabled((current) => !current)}
                            />
                          }
                        />
                        <SettingsRow
                          label="Export data"
                          description="Placeholder for downloading your MeGPT data."
                          trailing={<SettingsValue>Soon</SettingsValue>}
                        />
                        <SettingsRow
                          label="Archive all chats"
                          description="Placeholder for bulk conversation management."
                          trailing={<SettingsValue>Soon</SettingsValue>}
                        />
                      </>
                    ) : null}

                    {activeSettingsSection === "security" ? (
                      <>
                        <SettingsRow
                          label="Login method"
                          trailing={
                            <SettingsValue>{session ? "Google" : "Guest mode"}</SettingsValue>
                          }
                        />
                        <SettingsRow
                          label="Two-factor authentication"
                          description="Reserved for stronger account security controls."
                          trailing={<SettingsValue>Soon</SettingsValue>}
                        />
                        <SettingsRow
                          label="Active sessions"
                          description="Manage signed-in devices and browsers."
                          trailing={<SettingsValue>1 session</SettingsValue>}
                        />
                      </>
                    ) : null}

                    {activeSettingsSection === "parental-controls" ? (
                      <>
                        <SettingsRow
                          label="Family mode"
                          description="A placeholder for age-sensitive defaults and family controls."
                          trailing={
                            <Toggle
                              checked={familyModeEnabled}
                              onClick={() => setFamilyModeEnabled((current) => !current)}
                            />
                          }
                        />
                        <SettingsRow
                          label="Content guardrails"
                          description="Use more conservative defaults for open-ended conversations."
                          trailing={
                            <Toggle
                              checked={guardrailsEnabled}
                              onClick={() => setGuardrailsEnabled((current) => !current)}
                            />
                          }
                        />
                      </>
                    ) : null}

                    {activeSettingsSection === "account" ? (
                      <>
                        <SettingsRow label="Plan" trailing={<SettingsValue>{planLabel}</SettingsValue>} />
                        <SettingsRow label="Name" trailing={<SettingsValue>{userLabel}</SettingsValue>} />
                        <SettingsRow
                          label="Email"
                          trailing={
                            <SettingsValue>
                              {session?.user?.email ?? "Guest mode"}
                            </SettingsValue>
                          }
                        />
                        <SettingsRow
                          label="Resolved theme"
                          trailing={<SettingsValue>{capitalize(resolvedTheme)}</SettingsValue>}
                        />
                        <div className="pt-5">
                          {session ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
                              onClick={() => {
                                setIsSettingsOpen(false)
                                startSignOut()
                              }}
                            >
                              <LogOut className="h-4 w-4" />
                              Sign out
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90"
                              onClick={() => {
                                setIsSettingsOpen(false)
                                startGoogleSignIn()
                              }}
                            >
                              <LogIn className="h-4 w-4" />
                              Sign in with Google
                            </button>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                </section>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}

function MenuButton({
  icon: Icon,
  label,
  badge,
  trailing,
  onClick,
}: {
  icon: LucideIcon
  label: string
  badge?: string
  trailing?: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] text-foreground transition-colors hover:bg-accent"
      onClick={onClick}
    >
      <Icon className="h-5 w-5 shrink-0 text-foreground" />
      <span className="min-w-0 flex-1">{label}</span>
      {badge ? (
        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-muted-foreground">
          {badge}
        </span>
      ) : null}
      {trailing}
    </button>
  )
}

function MenuLink({
  icon: Icon,
  href,
  children,
  onNavigate,
}: {
  icon: LucideIcon
  href: string
  children: ReactNode
  onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] text-foreground transition-colors hover:bg-accent"
      onClick={onNavigate}
    >
      <Icon className="h-5 w-5 shrink-0 text-foreground" />
      {children}
    </Link>
  )
}

function Divider() {
  return <div className="my-2 h-px bg-border" />
}

function SettingsSectionTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-border pb-5">
      <h2 className="text-[2rem] font-medium tracking-[-0.03em] text-foreground">
        {title}
      </h2>
    </div>
  )
}

function SettingsRow({
  label,
  description,
  trailing,
}: {
  label: string
  description?: string
  trailing?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        <p className="text-[1.05rem] text-foreground">{label}</p>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}

function SettingsValue({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground">
      {children}
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

function Toggle({
  checked,
  onClick,
}: {
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
        checked ? "bg-foreground" : "bg-muted"
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "inline-block h-6 w-6 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-7" : "translate-x-1"
        )}
      />
    </button>
  )
}

function ThemePreferenceControl({
  theme,
  setTheme,
}: {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ThemeChip
        label="System"
        icon={Monitor}
        active={theme === "system"}
        onClick={() => setTheme("system")}
      />
      <ThemeChip
        label="Light"
        icon={Sun}
        active={theme === "light"}
        onClick={() => setTheme("light")}
      />
      <ThemeChip
        label="Dark"
        icon={Moon}
        active={theme === "dark"}
        onClick={() => setTheme("dark")}
      />
    </div>
  )
}

function ThemeChip({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon: LucideIcon
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active
          ? "border-foreground bg-accent text-foreground"
          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {label}
      {active ? <Check className="h-4 w-4" /> : null}
    </button>
  )
}

function capitalize(value: string) {
  return value[0]?.toUpperCase() + value.slice(1)
}
