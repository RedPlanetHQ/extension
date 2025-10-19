import React from "react"

import { cn } from "./utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "ce-flex ce-h-8 ce-w-full ce-rounded ce-bg-input ce-px-3 ce-py-1 ce-transition-colors file:ce-border-0 file:ce-bg-transparent file:ce-text-sm file:ce-font-medium placeholder:ce-text-muted-foreground focus-visible:ce-outline-none focus-visible:ce-ring-1 focus-visible:ce-ring-ring disabled:ce-cursor-not-allowed disabled:ce-opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
