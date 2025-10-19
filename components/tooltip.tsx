import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import React from "react"

import { cn } from "./utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "ce-z-50 ce-overflow-hidden ce-border ce-rounded ce-bg-background-3 ce-px-3 ce-py-1.5 ce-text-xs ce-text-foreground ce-animate-in ce-fade-in-0 ce-zoom-in-95 data-[state=closed]:ce-animate-out data-[state=closed]:ce-fade-out-0 data-[state=closed]:ce-zoom-out-95 data-[side=bottom]:ce-slide-in-from-top-2 data-[side=left]:ce-slide-in-from-right-2 data-[side=right]:ce-slide-in-from-left-2 data-[side=top]:ce-slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
