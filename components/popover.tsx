import * as PopoverPrimitive from "@radix-ui/react-popover"
import React from "react"

import { cn } from "./utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor
const PopoverPortal = PopoverPrimitive.Portal

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "ce-z-50 ce-w-72 ce-shadow-1 !ce-font-sans ce-rounded-md ce-bg-background-3 ce-text-popover-foreground ce-outline-none data-[state=open]:ce-animate-in data-[state=closed]:ce-animate-out data-[state=closed]:ce-fade-out-0 data-[state=open]:ce-fade-in-0 data-[state=closed]:ce-zoom-out-95 data-[state=open]:ce-zoom-in-95 data-[side=bottom]:ce-slide-in-from-top-2 data-[side=left]:ce-slide-in-from-right-2 data-[side=right]:ce-slide-in-from-left-2 data-[side=top]:ce-slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverPortal }
