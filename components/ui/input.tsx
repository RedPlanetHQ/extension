import * as React from "react"

import { cn } from "~components/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "dark:ce-bg-background-2 ce-border-input aria-invalid:ce-ring-destructive/20 dark:aria-invalid:ce-ring-destructive/40 aria-invalid:ce-border-destructive dark:aria-invalid:ce-border-destructive/50 disabled:ce-bg-input/50 dark:disabled:ce-bg-input/80 focus-visible:ce-ring-3 aria-invalid:ce-ring-3 file:ce-text-foreground placeholder:ce-text-muted-foreground ce-bg-background ce-h-8 ce-min-h-8 ce-w-full ce-min-w-0 ce-rounded-lg ce-border ce-px-2.5 ce-py-1 ce-text-base ce-outline-none ce-transition-colors file:ce-inline-flex file:ce-h-6 file:ce-border-0 file:ce-bg-transparent file:ce-text-sm file:ce-font-medium disabled:ce-pointer-events-none disabled:ce-cursor-not-allowed disabled:ce-opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
