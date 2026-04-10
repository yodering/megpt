const fallback = 2000
const configured = Number(process.env.NEXT_PUBLIC_MESSAGE_MAX_CHARS ?? fallback)

export const MESSAGE_MAX_CHARS =
  Number.isFinite(configured) && configured > 0 ? configured : fallback
