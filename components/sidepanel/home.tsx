import { useState } from "react"

import StaticLogo from "~/components/logo"
import { createConversation } from "~/utils/api"

import { ConversationInput } from "./conversation-input"
import { ConversationList } from "./conversation-list"

interface HomeProps {
  onConversationOpen: (id: string, title: string) => void
}

export function Home({ onConversationOpen }: HomeProps) {
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSubmit = async (message: string) => {
    setLoading(true)
    const conv = await createConversation(message, message.slice(0, 80))
    setLoading(false)

    if (conv?.conversationId) {
      setRefreshKey((k) => k + 1)
      onConversationOpen(conv.conversationId, message.slice(0, 60))
    }
  }

  const handleSelectConversation = (id: string) => {
    onConversationOpen(id, "")
  }

  return (
    <div className="ce-flex ce-flex-col ce-h-full">
      {/* Conversation list */}
      <div className="ce-border-b ce-border-gray-300">
        <ConversationList
          onSelect={handleSelectConversation}
          refreshKey={refreshKey}
        />
      </div>

      {/* Centered hero */}
      <div className="ce-flex ce-flex-1 ce-flex-col ce-items-center ce-justify-center ce-gap-2 ce-px-4">
        <StaticLogo width={36} height={36} color="#C15E50" />
        <h1 className="ce-text-lg ce-font-medium ce-tracking-tight ce-text-foreground">
          What can I help with?
        </h1>
      </div>

      {/* Input pinned to bottom */}
      <ConversationInput onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
