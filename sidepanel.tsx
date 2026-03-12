import "~/style.css"

import { ChevronLeft } from "lucide-react"
import { useState } from "react"

import { Settings } from "~/components/settings"
import { ConversationView } from "~/components/sidepanel/conversation-view"
import { Header } from "~/components/sidepanel/header"
import { Home } from "~/components/sidepanel/home"
import { Button } from "~/components/ui/button"

type View =
  | { type: "home" }
  | { type: "conversation"; id: string; title: string }
  | { type: "settings" }

export default function SidePanel() {
  const [view, setView] = useState<View>({ type: "home" })

  return (
    <div className="ce-flex ce-flex-col ce-h-screen ce-bg-background-2 ce-text-foreground ce-overflow-hidden">
      {view.type === "home" && (
        <>
          <Header
            onNewConversation={() =>
              document.querySelector<HTMLElement>(".ProseMirror")?.focus()
            }
            onSettings={() => setView({ type: "settings" })}
          />
          <div className="ce-flex-1 ce-overflow-hidden ce-flex ce-flex-col">
            <Home
              onConversationOpen={(id, title) =>
                setView({ type: "conversation", id, title })
              }
            />
          </div>
        </>
      )}

      {view.type === "conversation" && (
        <div className="ce-flex-1 ce-overflow-hidden ce-flex ce-flex-col">
          <ConversationView
            conversationId={view.id}
            onBack={() => setView({ type: "home" })}
          />
        </div>
      )}

      {view.type === "settings" && (
        <>
          <div className="ce-flex ce-h-11 ce-items-center ce-gap-2 ce-px-3 ce-border-b ce-border-gray-300 ce-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView({ type: "home" })}>
              <ChevronLeft size={16} />
            </Button>
            <span className="ce-text-sm ce-font-medium">Settings</span>
          </div>
          <div className="ce-flex-1 ce-overflow-y-auto">
            <Settings />
          </div>
        </>
      )}
    </div>
  )
}
