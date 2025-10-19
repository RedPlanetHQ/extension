import { EditorContent, useEditor } from "@tiptap/react"
import { Copy, CornerDownLeft } from "lucide-react"
import React from "react"

import { Button } from "./button"
import { extensionsForConversation } from "./editor-extensions"
import { useTriggerStream } from "./use-trigger-stream"

interface StreamingSearchProps {
  runId: string
  token: string
  afterStreaming: () => void
  onInsert?: (content: string) => void
}

export const StreamingSearch = ({
  runId,
  token,
  afterStreaming,
  onInsert
}: StreamingSearchProps) => {
  const { message } = useTriggerStream(runId, token, afterStreaming)
  const [loadingText, setLoadingText] = React.useState("Searching...")
  const [copySuccess, setCopySuccess] = React.useState(false)

  const loadingMessages = [
    "Searching...",
    "Finding relevant information...",
    "Analyzing context...",
    "Gathering results...",
    "Processing matches...",
    "Compiling information...",
    "Almost ready..."
  ]

  const searchEditor = useEditor({
    extensions: [...extensionsForConversation],
    editable: false,
    content: ""
  })

  React.useEffect(() => {
    if (message) {
      searchEditor?.commands.setContent(message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  React.useEffect(() => {
    let currentIndex = 0
    let delay = 2000

    const updateLoadingText = () => {
      if (!message) {
        setLoadingText(loadingMessages[currentIndex])
        currentIndex = (currentIndex + 1) % loadingMessages.length
        delay = Math.min(delay * 1.2, 4000)
        setTimeout(updateLoadingText, delay)
      }
    }

    const timer = setTimeout(updateLoadingText, delay)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  const handleCopy = async () => {
    if (message) {
      try {
        await navigator.clipboard.writeText(message)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (error) {
        console.error("Failed to copy:", error)
      }
    }
  }

  const handleInsert = () => {
    if (message && onInsert) {
      onInsert(message)
    }
  }

  return (
    <div className="ce-flex ce-flex-col ce-gap-2">
      <div className="ce-flex ce-flex-col ce-gap-1 ce-h-[30vh] ce-overflow-y-auto ce-px-3">
        {message ? (
          <>
            <EditorContent
              editor={searchEditor}
              className="ce-text-foreground editor-container ce-rounded-md"
            />
            <div className="ce-flex ce-gap-2 ce-justify-end">
              <Button variant="ghost" onClick={handleCopy} className="ce-gap-1">
                <Copy size={14} />
                {copySuccess ? "Copied!" : "Copy"}
              </Button>
              {onInsert && (
                <Button
                  variant="secondary"
                  onClick={handleInsert}
                  className="ce-gap-1">
                  <CornerDownLeft size={14} />
                  Insert
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="ce-text-foreground ce-italic">{loadingText}</div>
        )}
      </div>
    </div>
  )
}
