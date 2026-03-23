# Operator Messaging Decision

## Current dilemma

Right now, the app forwards user messages into a single Telegram chat and expects replies to come back in the format:

```text
conversationId: your message
```

That works for testing, but it breaks down once there are multiple active users.

## Why the Telegram-only approach does not scale well

### 1. All conversations are mixed into one feed

If every user message is sent into the same Telegram bot/chat, you lose conversation boundaries. You are effectively managing support from a noisy event log instead of an inbox.

### 2. Reply routing is fragile

The current implementation depends on manually copying the correct `conversationId` into a Telegram reply. That creates obvious failure modes:

- replying to the wrong user
- replying with the wrong id format
- losing track of which message belongs to which thread
- no clear history per user

### 3. Telegram is not a real operator console

Telegram is good for alerts and lightweight interaction. It is not a good system for:

- tracking multiple user threads
- seeing unread vs replied conversations
- viewing per-user history
- searching conversations reliably
- assigning status like open, pending, resolved

### 4. The current server model is temporary by design

This repo currently keeps active browser connections in memory via SSE, keyed by `conversationId`. That is acceptable for a prototype, but it is not enough for a serious inbox because:

- message history is not persisted
- conversation state is not persisted
- operator state is not persisted
- a restart loses in-memory connection state

## Recommendation

Build a dashboard, not a Telegram-only operator workflow.

Telegram can still be useful, but it should be a notification channel, not the primary place where you manage conversations.

## Recommended product direction

### Primary interface

A web dashboard inside this app where you can:

- see a list of users/conversations on the left
- click one conversation at a time
- read message history in the center
- type replies in a dedicated composer
- mark conversations as unread, active, closed, or pending

This should feel more like Intercom, Telegram Desktop, or a helpdesk inbox than a bot command feed.

### Secondary interface

Use Telegram only for:

- new message alerts
- urgent notifications
- maybe a link that opens the exact conversation in the dashboard

That gives you mobile awareness without forcing Telegram to do a job it is not built for.

## Best architecture for this project

### Phase 1: persist real conversation data

Add Postgres tables for:

- users
- conversations
- messages
- operator_events or conversation_status

Minimum useful schema:

```text
users
  id
  email
  name

conversations
  id
  user_id
  status
  created_at
  updated_at
  last_message_at

messages
  id
  conversation_id
  sender_type     // user or operator
  sender_id       // nullable if needed
  body
  created_at
```

### Phase 2: build the dashboard UI

Core screens:

- conversation list
- active conversation panel
- reply box
- unread/open filters

Core operator actions:

- open conversation
- send reply
- view history
- mark resolved

### Phase 3: treat Telegram as notifications

Instead of sending the full operator workflow into Telegram, send:

- "New message from Jane Doe"
- short preview text
- dashboard link
- maybe conversation id for debugging

## Decision

If you expect more than one or two simultaneous users, a dashboard is the correct choice.

A Telegram-only operator flow is acceptable only for:

- prototype testing
- very low message volume
- one operator
- low risk if replies are misrouted

It is not a good long-term inbox model.

## Recommended final approach

Use this stack:

- Railway-hosted Next.js app
- Railway Postgres for persistent conversations and messages
- NextAuth for operator login
- in-app dashboard for handling threads
- Telegram only for notifications

## Why this is the right tradeoff

It gives you:

- organized per-user conversations
- reliable reply targeting
- searchable history
- room for future features like tags, notes, assignment, and analytics

It also removes the biggest operational risk in the current setup: manually routing replies in a shared Telegram thread.

## What to build next

1. Add Postgres tables for conversations and messages.
2. Replace the hardcoded `conversationId = "test-123"` with real persisted conversations.
3. Save inbound user messages to the database.
4. Build an operator dashboard route for viewing and replying to conversations.
5. Keep Telegram only as an alerting layer.

## Conclusion

The dashboard approach is better.

Telegram should support the workflow, not be the workflow.
