import * as SwitchPrimitives from "@radix-ui/react-switch"
import React from "react"

import { cn } from "./utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "ce-peer ce-inline-flex ce-h-4 ce-w-6 ce-shrink-0 ce-cursor-pointer ce-items-center ce-rounded-full ce-border-2 ce-border-transparent ce-shadow-sm ce-transition-colors focus-visible:ce-outline-none focus-visible:ce-ring-2 focus-visible:ce-ring-ring focus-visible:ce-ring-offset-2 focus-visible:ce-ring-offset-background disabled:ce-cursor-not-allowed disabled:ce-opacity-50 data-[state=checked]:ce-bg-primary data-[state=unchecked]:ce-bg-input",
      className
    )}
    {...props}
    ref={ref}>
    <SwitchPrimitives.Thumb
      className={cn(
        "ce-pointer-events-none ce-block ce-h-3 ce-w-3 ce-rounded-full ce-bg-white ce-shadow-lg ce-ring-0 ce-transition-transform data-[state=checked]:ce-translate-x-2 data-[state=unchecked]:ce-translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
