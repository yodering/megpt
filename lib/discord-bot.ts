import {
  AttachmentBuilder,
  ChannelType,
  Client,
  GatewayIntentBits,
  type MessageCreateOptions,
  type Snowflake,
  type TextChannel,
  type ThreadChannel,
} from "discord.js"
import {
  WAITING_ON_USER_STATUS,
  createMessage,
  getConversationById,
  type ConversationMessage,
} from "@/lib/conversations"
import {
  getDiscordThreadByConversationId,
  getDiscordThreadByThreadId,
  upsertDiscordThread,
} from "@/lib/discord-threads"
import {
  readUploadedImageByUrl,
  resolveSupportedImageMimeType,
  saveRemoteImage,
} from "@/lib/image-uploads"

declare global {
  var discordClient: Client | undefined
  var discordClientReady: Promise<Client | null> | undefined
  var discordHandlersBound: boolean | undefined
}

type ConversationIdentity = {
  id: number
  userEmail: string
  userName: string | null
}

function getDiscordConfig() {
  const token = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.DISCORD_GUILD_ID
  const parentChannelId = process.env.DISCORD_PARENT_CHANNEL_ID
  const notificationChannelId =
    process.env.DISCORD_NOTIFICATION_CHANNEL_ID ?? null
  const notificationUserId = process.env.DISCORD_NOTIFICATION_USER_ID ?? null
  const notificationRoleId = process.env.DISCORD_NOTIFICATION_ROLE_ID ?? null

  if (!token || !guildId || !parentChannelId) {
    return null
  }

  return {
    token,
    guildId,
    parentChannelId,
    notificationChannelId,
    notificationUserId,
    notificationRoleId,
  }
}

function buildThreadName(conversation: ConversationIdentity) {
  const identity = conversation.userName?.trim() || conversation.userEmail.trim()
  const collapsed = identity.replace(/\s+/g, " ").slice(0, 72)
  return `${collapsed} • #${conversation.id}`
}

function getAttachmentNameForMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "upload.jpg"
    case "image/png":
      return "upload.png"
    case "image/gif":
      return "upload.gif"
    case "image/webp":
      return "upload.webp"
    case "image/avif":
      return "upload.avif"
    default:
      return "upload"
  }
}

async function formatUserMessage(
  config: NonNullable<ReturnType<typeof getDiscordConfig>>,
  conversation: ConversationIdentity,
  message: ConversationMessage
): Promise<MessageCreateOptions> {
  const mentions = buildNotificationMentions(config)
  const header = [
    mentions.contentPrefix,
    `New user message`,
    `Conversation: #${conversation.id}`,
    `User: ${conversation.userName || "Unknown"} <${conversation.userEmail}>`,
  ].join("\n")
  const bodyLines =
    message.contentType === "image"
      ? [
          message.imageUrl ? "Image upload" : `Image upload: ${message.imageUrl ?? ""}`,
          message.body,
        ].filter(Boolean)
      : [message.body]

  const uploadedImage = message.imageUrl
    ? await readUploadedImageByUrl(message.imageUrl)
    : null
  const imageAttachment = uploadedImage
    ? new AttachmentBuilder(uploadedImage.buffer, {
        name: getAttachmentNameForMimeType(uploadedImage.mimeType),
      })
    : undefined

  return {
    content: [header, "", ...bodyLines].join("\n"),
    files: imageAttachment ? [imageAttachment] : undefined,
    allowedMentions: mentions.allowedMentions,
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

function buildThreadUrl(guildId: string, threadId: string) {
  return `https://discord.com/channels/${guildId}/${threadId}`
}

function buildNotificationMentions(config: NonNullable<ReturnType<typeof getDiscordConfig>>) {
  const mentions: string[] = []
  const notificationUserId =
    config.notificationUserId && /^\d+$/.test(config.notificationUserId)
      ? config.notificationUserId
      : null
  const notificationRoleId =
    config.notificationRoleId && /^\d+$/.test(config.notificationRoleId)
      ? config.notificationRoleId
      : null

  if (notificationUserId) {
    mentions.push(`<@${notificationUserId}>`)
  }

  if (notificationRoleId) {
    mentions.push(`<@&${notificationRoleId}>`)
  }

  return {
    contentPrefix: mentions.join(" "),
    allowedMentions: {
      parse: [],
      users: notificationUserId
        ? [notificationUserId as Snowflake]
        : undefined,
      roles: notificationRoleId
        ? [notificationRoleId as Snowflake]
        : undefined,
    },
  }
}

function withoutMentions(message: MessageCreateOptions): MessageCreateOptions {
  const content = message.content
    ?.replace(/<@&?\d+>/g, "")
    .replace(/^\s*\n/, "")
    .trim()

  return {
    ...message,
    content,
    allowedMentions: { parse: [] },
  }
}

function isSupportedDiscordImageAttachment(attachment: {
  contentType?: string | null
  name?: string | null
  url: string
}) {
  return Boolean(
    resolveSupportedImageMimeType({
      mimeType: attachment.contentType,
      fileName: attachment.name,
      imageUrl: attachment.url,
    })
  )
}

function formatNewThreadNotification(
  config: NonNullable<ReturnType<typeof getDiscordConfig>>,
  conversation: ConversationIdentity,
  thread: ThreadChannel
): MessageCreateOptions {
  const mentions = buildNotificationMentions(config)
  const lines = [
    mentions.contentPrefix,
    `New chat request: conversation #${conversation.id}`,
    `User: ${conversation.userName || "Unknown"} <${conversation.userEmail}>`,
    `Thread: ${thread.toString()}`,
    buildThreadUrl(config.guildId, thread.id),
  ].filter(Boolean)

  return {
    content: lines.join("\n"),
    allowedMentions: mentions.allowedMentions,
  }
}

async function getParentChannel(client: Client, parentChannelId: string) {
  const channel = await client.channels.fetch(parentChannelId)

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("DISCORD_PARENT_CHANNEL_ID must point to a text channel")
  }

  return channel as TextChannel
}

async function sendNewThreadNotification(
  client: Client,
  config: NonNullable<ReturnType<typeof getDiscordConfig>>,
  conversation: ConversationIdentity,
  thread: ThreadChannel
) {
  if (!config.notificationChannelId) return

  const channel = await client.channels
    .fetch(config.notificationChannelId)
    .catch(() => null)

  if (!channel || channel.type !== ChannelType.GuildText) {
    console.warn(
      "DISCORD_NOTIFICATION_CHANNEL_ID must point to a text channel"
    )
    return
  }

  await (channel as TextChannel).send(
    formatNewThreadNotification(config, conversation, thread)
  )
}

async function findOrCreateThread(
  client: Client,
  conversation: ConversationIdentity
) {
  const config = getDiscordConfig()
  if (!config) return null

  const existing = await getDiscordThreadByConversationId(conversation.id)
  if (existing) {
    const channel = await client.channels.fetch(existing.threadId).catch(() => null)
    if (channel?.isThread()) {
      return channel
    }
  }

  const parentChannel = await getParentChannel(client, config.parentChannelId)
  const thread = await parentChannel.threads.create({
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

  await thread.send(formatThreadOpenedMessage(conversation))

  if (config.notificationChannelId) {
    await sendNewThreadNotification(client, config, conversation, thread)
  }

  return thread
}

async function syncThreadPresentation(
  thread: ThreadChannel,
  conversation: ConversationIdentity & { status?: string },
  options?: { unarchiveReason?: string }
) {
  if (conversation.status === WAITING_ON_USER_STATUS) {
    if (!thread.archived) {
      await thread.setArchived(true, "Waiting for the user to reply")
    }

    if (!thread.locked) {
      await thread.setLocked(true, "Waiting for the user to reply")
    }

    return
  }

  if (thread.locked) {
    await thread.setLocked(false, options?.unarchiveReason ?? "Conversation reopened")
  }

  if (thread.archived) {
    await thread.setArchived(false, options?.unarchiveReason ?? "Conversation reopened")
  }
}

async function promoteQueuedConversationAfterCapacityChange() {
  try {
    const { promoteNextQueuedConversation } = await import("@/lib/conversation-queue")
    await promoteNextQueuedConversation()
  } catch (error) {
    console.error("Failed to promote queued conversation", error)
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
    const imageAttachments = [...message.attachments.values()].filter(
      isSupportedDiscordImageAttachment
    )
    if (!content && imageAttachments.length === 0) return

    const conversation = await getConversationById(mapping.conversationId)
    if (!conversation) return
    if (conversation.status === WAITING_ON_USER_STATUS) return

    if (content) {
      await createMessage(conversation.id, "operator", content)
    }

    for (const attachment of imageAttachments) {
      let imageUrl = attachment.url

      try {
        const savedImage = await saveRemoteImage(
          attachment.url,
          attachment.contentType ?? undefined,
          attachment.name
        )
        imageUrl = savedImage.publicUrl
      } catch (error) {
        console.error("Failed to store Discord image attachment locally", error)
      }

      await createMessage(conversation.id, "operator", "", {
        contentType: "image",
        imageUrl,
      })
    }

    const updatedConversation = await getConversationById(conversation.id)
    await syncThreadPresentation(message.channel, updatedConversation ?? conversation)

    await promoteQueuedConversationAfterCapacityChange()
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
  const config = getDiscordConfig()
  if (!config) return

  const thread = await findOrCreateThread(client, conversation)
  if (!thread) return

  await syncThreadPresentation(thread, conversation, {
    unarchiveReason: "New user message",
  })

  const discordMessage = await formatUserMessage(config, conversation, message)

  try {
    await thread.send(discordMessage)
  } catch (error) {
    console.error("Failed to send Discord user message with mentions", error)
    await thread.send(withoutMentions(discordMessage))
  }
}

export async function deleteDiscordThreadForConversation(conversationId: number) {
  const client = await ensureDiscordBot()
  if (!client) return

  const mapping = await getDiscordThreadByConversationId(conversationId)
  if (!mapping) return

  const channel = await client.channels.fetch(mapping.threadId).catch(() => null)
  if (!channel?.isThread()) return

  await channel
    .delete(`Conversation #${conversationId} deleted from MeGPT`)
    .catch((error) => {
      console.warn(
        `Failed to delete Discord thread for conversation ${conversationId}`,
        error
      )
    })
}
