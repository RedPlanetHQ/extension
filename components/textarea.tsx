import React from "react"

import { useAutoSizeTextArea } from "./use-autosize-textarea"
import { cn } from "./utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, value, ...props }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const textAreaRef = React.useRef<any>(ref)
    const id = React.useMemo(() => {
      return `id${Math.random().toString(16).slice(2)}`
    }, [])

    useAutoSizeTextArea(id, textAreaRef.current, value)

    return (
      <textarea
        className={cn(
          "ce-min-h-[30px] ce-w-full ce-rounded ce-bg-input ce-px-3 ce-h-auto ce-py-2 placeholder:ce-text-muted-foreground focus-visible:ce-outline-none focus-visible:ce-ring-1 focus-visible:ce-ring-ring disabled:ce-cursor-not-allowed disabled:ce-opacity-50",
          className
        )}
        id={id}
        ref={textAreaRef}
        contentEditable
        value={value}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
