import { useChat } from "@ai-sdk/react"
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithApprovalResponses
} from "ai"
import type { UIMessage } from "ai"
import { ChevronLeft, Loader2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { Button } from "~/components/ui/button"
import {
  getConversationHistory,
  type ConversationWithHistory
} from "~/utils/api"

import { ConversationInput } from "./conversation-input"
import { ConversationItem } from "./conversation-item"
import { hasNeedsApprovalDeep } from "./conversation-utils"

const DEFAULT_API_BASE_URL = "https://app.getcore.me/api/v1"

// ── Inner component: only mounts after history is loaded ─────────────────────
function ConversationChat({
  conversation,
  onBack
}: {
  conversation: ConversationWithHistory
  onBack: () => void
}) {
  const [apiKey] = useStorage<string>("core_api_key")
  const [apiBaseUrl] = useStorage<string>("core_api_base_url")
  const apiKeyRef = useRef(apiKey)
  useEffect(() => {
    apiKeyRef.current = apiKey
  }, [apiKey])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${apiBaseUrl || DEFAULT_API_BASE_URL}/conversation`,
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        prepareSendMessagesRequest({ messages, id }) {
          const lastAssistant = [...messages]
            .reverse()
            .find((m) => m.role === "assistant") as UIMessage | undefined
          const needsApproval = !!lastAssistant?.parts.find(
            (p: any) => p.state === "approval-responded"
          )
          if (needsApproval)
            return { body: { messages, needsApproval: true, id } }
          return { body: { message: messages[messages.length - 1], id } }
        }
      }),
    [apiKey, apiBaseUrl]
  )

  const {
    sendMessage,
    messages,
    status,
    stop,
    regenerate,
    addToolApprovalResponse
  } = useChat({
    id: conversation.id,
    messages: conversation.ConversationHistory.map((h: any) => {
      return {
        id: h.id,
        role: h.role,
        parts: h.parts ?? [{ type: "text" as const, text: h.message }]
      }
    }),
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses
  })

  // Auto-regenerate if only the initial user message exists
  const hasRegeneratedRef = useRef(false)
  useEffect(() => {
    if (
      conversation.ConversationHistory.length === 1 &&
      apiKey &&
      !hasRegeneratedRef.current
    ) {
      hasRegeneratedRef.current = true
      regenerate()
    }
  }, [apiKey])

  // Auto-scroll to bottom on new messages
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const lastAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.role === "assistant") as UIMessage | undefined
  const needsApproval = lastAssistantMsg?.parts
    ? hasNeedsApprovalDeep(lastAssistantMsg.parts)
    : false

  const isLoading = status === "streaming" || status === "submitted"

  return (
    <div className="ce-flex ce-flex-col ce-h-full">
      {/* Header */}
      <div className="ce-flex ce-items-center ce-gap-2 ce-px-2 ce-py-2 ce-h-[40px] ce-border-b ce-border-gray-300 ce-shrink-0">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft size={16} />
        </Button>
        <span className="ce-text-sm ce-font-medium ce-truncate ce-flex-1">
          {conversation.title || "Untitled"}
        </span>
      </div>

      {/* Messages */}
      <div className="ce-flex-1 ce-overflow-y-auto ce-py-2">
        {messages.map((message, index) => (
          <ConversationItem
            key={index}
            message={message as UIMessage}
            addToolApprovalResponse={addToolApprovalResponse}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ConversationInput
        onSubmit={async (msg) => {
          if (!needsApproval) sendMessage({ text: msg })
        }}
        loading={isLoading}
      />
    </div>
  )
}

// ── Outer component: fetches history, then renders ConversationChat ───────────
export function ConversationView({
  conversationId,
  onBack
}: {
  conversationId: string
  onBack: () => void
}) {
  const [conversation, setConversation] =
    useState<ConversationWithHistory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConversationHistory(conversationId)
      .then(setConversation)
      .finally(() => setLoading(false))
  }, [conversationId])

  if (loading) {
    return (
      <div className="ce-flex ce-flex-col ce-h-full ce-items-center ce-justify-center ce-gap-2 ce-text-muted-foreground">
        <Loader2 size={20} className="ce-animate-spin" />
        <span className="ce-text-sm">Loading...</span>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="ce-flex ce-flex-col ce-h-full ce-items-center ce-justify-center">
        <div className="ce-flex ce-items-center ce-gap-1 ce-px-2 ce-py-2 ce-border-b ce-border-gray-300 ce-w-full ce-shrink-0">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft size={16} />
          </Button>
        </div>
        <p className="ce-text-sm ce-text-muted-foreground ce-mt-4">
          Conversation not found
        </p>
      </div>
    )
  }

  return <ConversationChat conversation={conversation} onBack={onBack} />
}
