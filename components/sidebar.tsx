import { ChevronDown, ChevronRight } from "lucide-react"
import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "~/components/ui/collapsible"
import { cn } from "~/components/utils"

interface SidebarSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function SidebarSection({
  title,
  children,
  defaultOpen = true
}: SidebarSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="ce-flex ce-w-full ce-items-center ce-justify-between ce-px-3 ce-py-2 ce-text-sm ce-font-medium ce-text-muted-foreground hover:ce-text-foreground ce-transition-colors">
        <span>{title}</span>
        {open ? (
          <ChevronDown className="ce-h-4 ce-w-4" />
        ) : (
          <ChevronRight className="ce-h-4 ce-w-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="ce-space-y-1 ce-px-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface SidebarItemProps {
  label: string
  active?: boolean
  onClick?: () => void
}

function SidebarItem({ label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "ce-w-full ce-text-left ce-rounded ce-px-3 ce-py-1.5 ce-text-sm ce-transition-colors",
        active
          ? "ce-bg-accent ce-text-accent-foreground"
          : "ce-text-foreground/70 hover:ce-bg-accent/50 hover:ce-text-foreground"
      )}>
      {label}
    </button>
  )
}

export function Sidebar() {
  return (
    <div className="ce-flex ce-h-full ce-w-full ce-flex-col ce-bg-background ce-border-r ce-border-border">
      <div className="ce-flex ce-h-12 ce-items-center ce-px-4 ce-border-b ce-border-border">
        <span className="ce-text-sm ce-font-semibold">Core Memory</span>
      </div>

      <div className="ce-flex-1 ce-overflow-y-auto ce-py-2">
        <SidebarSection title="Recent">
          <SidebarItem label="Conversation 1" active />
          <SidebarItem label="Conversation 2" />
          <SidebarItem label="Conversation 3" />
        </SidebarSection>

        <SidebarSection title="Saved" defaultOpen={false}>
          <SidebarItem label="Saved item 1" />
          <SidebarItem label="Saved item 2" />
        </SidebarSection>
      </div>
    </div>
  )
}
