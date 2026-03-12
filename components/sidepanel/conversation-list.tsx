import { Loader2, MessageSquare, Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { Conversation } from "~/utils/api"
import { fetchConversations } from "~/utils/api"
import { Button } from "~components/button"
import { Input } from "~components/ui/input"

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface ConversationListProps {
  onSelect: (id: string) => void
  refreshKey?: number
}

export function ConversationList({
  onSelect,
  refreshKey
}: ConversationListProps) {
  const [query, setQuery] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const result = await fetchConversations(query, 5)
      setConversations(result)
      setLoading(false)
    }, 300)
  }, [query, refreshKey])

  return (
    <div className="ce-px-3 ce-py-2 ce-shrink-0">
      <div className="ce-flex ce-items-center ce-justify-between ce-mb-2">
        <span className="ce-text-xs ce-font-medium ce-text-muted-foreground ce-uppercase ce-tracking-wide">
          Chats
        </span>
        <div className="ce-relative">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="ce-h-9"
          />
        </div>
      </div>

      <div className="ce-space-y-0.5">
        {loading ? (
          <div className="ce-flex ce-gap-1 ce-items-center ce-justify-center ce-py-4">
            <Loader2 className="ce-text-muted-foreground ce-h-4 ce-w-4 ce-animate-spin" />
            Loading...
          </div>
        ) : conversations.length === 0 ? (
          <p className="ce-text-xs ce-text-muted-foreground ce-py-2 ce-text-center">
            No conversations yet
          </p>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id}>
              <Button
                onClick={() => onSelect(conv.id)}
                variant="ghost"
                size="2xl"
                className="ce-w-full ce-gap-2 ce-pl-2 ce-pr-2 ce-justify-center">
                <MessageSquare
                  size={14}
                  className="ce-text-muted-foreground ce-shrink-0"
                />
                <span className="ce-flex-1 ce-text-left ce-text-sm ce-truncate ce-text-foreground">
                  {conv.title || "Untitled"}
                </span>
                <span className="ce-text-xs ce-text-muted-foreground ce-shrink-0">
                  {timeAgo(conv.updatedAt || conv.createdAt)}
                </span>
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
