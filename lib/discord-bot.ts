import {
  ChannelType,
  Client,
  ForumChannel,
  GatewayIntentBits,
  type MessageCreateOptions,
  type TextChannel,
  type ThreadChannel,
} from "discord.js"
import { sendToClient } from "@/app/api/sse/route"
import { createMessage, getConversationById, type ConversationMessage } from "@/lib/conversations"
import {
  getDiscordThreadByConversationId,
  getDiscordThreadByThreadId,
  upsertDiscordThread,
} from "@/lib/discord-threads"

declare global {
  var discordClient: Client | undefined
  var discordClientReady: Promise<Client | null> | undefined
  var discordHandlersBound: boolean | undefined
}

type ConversationIdentity = {
  id: number
  userEmail: string
  userName: string | null
  status?: string
}

function getDiscordConfig() {
  const token = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.DISCORD_GUILD_ID
  const parentChannelId = process.env.DISCORD_PARENT_CHANNEL_ID

  if (!token || !guildId || !parentChannelId) {
    return null
  }

  return { token, guildId, parentChannelId }
}

function getThreadStatusLabel(status?: string) {
  if (status === "awaiting_admin") return "needs-reply"
  if (status === "awaiting_user") return "waiting-on-user"
  return "active"
}

function buildThreadName(conversation: ConversationIdentity) {
  const identity = conversation.userName?.trim() || conversation.userEmail.trim()
  const collapsed = identity.replace(/\s+/g, "-").toLowerCase().slice(0, 64)
  return `${getThreadStatusLabel(conversation.status)} • ${collapsed} • #${conversation.id}`
}

function formatUserMessage(
  conversation: ConversationIdentity,
  message: ConversationMessage
): MessageCreateOptions {
  const header = [
    `New user message`,
    `Conversation: #${conversation.id}`,
    `User: ${conversation.userName || "Unknown"} <${conversation.userEmail}>`,
  ].join("\n")

  return {
    content: `${header}\n\n${message.body}`,
    allowedMentions: { parse: [] },
  }
}

function formatOperatorMirror(message: ConversationMessage): MessageCreateOptions {
  return {
    content: `Operator reply sent to user:\n\n${message.body}`,
    allowedMentions: { parse: [] },
  }
}

function formatForumPostMessage(
  conversation: ConversationIdentity,
  message: ConversationMessage
): MessageCreateOptions {
  return {
    content: [
      `Conversation: #${conversation.id}`,
      `User: ${conversation.userName || "Unknown"} <${conversation.userEmail}>`,
      "",
      message.body,
    ].join("\n"),
    allowedMentions: { parse: [] },
  }
}

function formatThreadOpenedMessage(conversation: ConversationIdentity): MessageCreateOptions {
  return {
    content: [
      `Thread opened for conversation #${conversation.id}.`,
      `User: ${conversation.userName || "Unknown"} <${conversation.userEmail}>`,
    ].join("\n"),
    allowedMentions: { parse: [] },
  }
}

async function getParentChannel(client: Client, parentChannelId: string) {
  const channel = await client.channels.fetch(parentChannelId)

  if (!channel) {
    throw new Error("DISCORD_PARENT_CHANNEL_ID does not exist")
  }

  if (
    channel.type !== ChannelType.GuildText &&
    channel.type !== ChannelType.GuildForum
  ) {
    throw new Error(
      "DISCORD_PARENT_CHANNEL_ID must point to a text or forum channel"
    )
  }

  return channel as TextChannel | ForumChannel
}

async function findOrCreateThread(
  client: Client,
  conversation: ConversationIdentity,
  initialMessage?: ConversationMessage
) {
  const config = getDiscordConfig()
  if (!config) return null

  const existing = await getDiscordThreadByConversationId(conversation.id)
  if (existing) {
    const channel = await client.channels.fetch(existing.threadId).catch(() => null)
    if (channel?.isThread()) {
      const expectedName = buildThreadName(conversation)
      if (channel.name !== expectedName) {
        await channel.setName(expectedName, "Conversation status updated")
      }
      return channel
    }
  }

  const parentChannel = await getParentChannel(client, config.parentChannelId)
  const thread =
    parentChannel.type === ChannelType.GuildForum
      ? await parentChannel.threads.create({
          name: buildThreadName(conversation),
          autoArchiveDuration: 1440,
          reason: `Conversation #${conversation.id}`,
          message: initialMessage
            ? formatForumPostMessage(conversation, initialMessage)
            : formatThreadOpenedMessage(conversation),
        })
      : await parentChannel.threads.create({
          name: buildThreadName(conversation),
          autoArchiveDuration: 1440,
          reason: `Conversation #${conversation.id}`,
        })

  await upsertDiscordThread({
    conversationId: conversation.id,
    threadId: thread.id,
    guildId: config.guildId,
    channelId: parentChannel.id,
  })

  if (parentChannel.type !== ChannelType.GuildForum) {
    await thread.send(formatThreadOpenedMessage(conversation))
  }

  return thread
}

async function syncThreadPresentation(
  thread: ThreadChannel,
  conversation: ConversationIdentity,
  options?: { unarchiveReason?: string }
) {
  const expectedName = buildThreadName(conversation)

  if (thread.name !== expectedName) {
    await thread.setName(expectedName, "Conversation status updated")
  }

  if (thread.archived) {
    await thread.setArchived(false, options?.unarchiveReason ?? "Conversation reopened")
  }
}

async function bindDiscordHandlers(client: Client) {
  if (globalThis.discordHandlersBound) return

  client.on("messageCreate", async (message) => {
    const config = getDiscordConfig()
    if (!config) return
    if (message.author.bot) return
    if (!message.inGuild()) return
    if (message.guildId !== config.guildId) return
    if (!message.channel.isThread()) return
    if (message.channel.parentId !== config.parentChannelId) return

    const mapping = await getDiscordThreadByThreadId(message.channel.id)
    if (!mapping) return

    const content = message.content.trim()
    if (!content) return

    const conversation = await getConversationById(mapping.conversationId)
    if (!conversation) return

    const savedMessage = await createMessage(conversation.id, "operator", content)
    const updatedConversation = await getConversationById(conversation.id)
    await syncThreadPresentation(message.channel, updatedConversation ?? conversation)
    sendToClient(String(conversation.id), savedMessage.body)
  })

  globalThis.discordHandlersBound = true
}

export async function ensureDiscordBot() {
  const config = getDiscordConfig()
  if (!config) return null

  if (globalThis.discordClient?.isReady()) {
    return globalThis.discordClient
  }

  if (!globalThis.discordClientReady) {
    globalThis.discordClientReady = (async () => {
      const client =
        globalThis.discordClient ??
        new Client({
          intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
          ],
        })

      await bindDiscordHandlers(client)

      if (!client.isReady()) {
        await client.login(config.token)
        await new Promise<void>((resolve) => {
          if (client.isReady()) {
            resolve()
            return
          }

          client.once("clientReady", () => resolve())
        })
      }

      globalThis.discordClient = client
      return client
    })().catch((error) => {
      globalThis.discordClientReady = undefined
      throw error
    })
  }

  return globalThis.discordClientReady
}

export async function syncUserMessageToDiscord(
  conversation: ConversationIdentity,
  message: ConversationMessage
) {
  const client = await ensureDiscordBot()
  if (!client) return

  const thread = await findOrCreateThread(
    client,
    {
      ...conversation,
      status: "awaiting_admin",
    },
    message
  )
  if (!thread) return

  await syncThreadPresentation(thread, {
    ...conversation,
    status: "awaiting_admin",
  }, {
    unarchiveReason: "New user message",
  })

  if (
    thread.parent?.type !== ChannelType.GuildForum ||
    (thread.totalMessageSent ?? 0) > 1
  ) {
    await thread.send(formatUserMessage(conversation, message))
  }
}

export async function syncOperatorMessageToDiscord(
  conversationId: number,
  message: ConversationMessage
) {
  const client = await ensureDiscordBot()
  if (!client) return

  const mapping = await getDiscordThreadByConversationId(conversationId)
  if (!mapping) return

  const channel = await client.channels.fetch(mapping.threadId).catch(() => null)
  if (!channel?.isThread()) return

  const thread = channel as ThreadChannel
  const conversation = await getConversationById(conversationId)
  if (!conversation) return

  await syncThreadPresentation(thread, conversation)

  await thread.send(formatOperatorMirror(message))
}

export async function deleteDiscordThreadForConversation(conversationId: number) {
  const client = await ensureDiscordBot()
  if (!client) return

  const mapping = await getDiscordThreadByConversationId(conversationId)
  if (!mapping) return

  const channel = await client.channels.fetch(mapping.threadId).catch(() => null)
  if (!channel?.isThread()) return

  await channel.delete(`Conversation #${conversationId} deleted from MeGPT`)
}
