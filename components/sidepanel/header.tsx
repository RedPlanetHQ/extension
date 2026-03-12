import { Home, Settings, SquarePen } from "lucide-react"

import StaticLogo from "~/components/logo"
import { Button } from "~components/ui/button"

interface HeaderProps {
  onNewConversation: () => void
  onSettings: () => void
}

export function Header({ onNewConversation, onSettings }: HeaderProps) {
  return (
    <div className="ce-flex ce-h-[40px] ce-items-center ce-justify-between ce-px-3 ce-border-b ce-border-gray-300 ce-shrink-0">
      <Button
        onClick={() => chrome.tabs.create({ url: "https://app.getcore.me" })}
        variant="ghost"
        size="lg">
        <Home size={16} />
      </Button>

      <div className="ce-flex ce-items-center ce-gap-1">
        <StaticLogo width={16} height={16} color="#C15E50" />
        <span className="ce-text-sm ce-font-medium">CORE</span>
      </div>

      <div className="ce-flex ce-items-center">
        <Button onClick={onSettings} variant="ghost" size="lg">
          <Settings size={16} />
        </Button>
        <Button onClick={onNewConversation} variant="ghost" size="lg">
          <SquarePen size={16} />
        </Button>
      </div>
    </div>
  )
}
