import { useEffect, useState } from "react"

import { addEpisode } from "~utils/api"

import { Button } from "./button"
import StaticLogo from "./logo"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Textarea } from "./textarea"

interface TextSelectionDotProps {
  selectedText: string
  onClose: () => void
  position: { top: number; left: number }
  onPopupStateChange?: (isOpen: boolean) => void
}

export default function TextSelectionDot({
  selectedText,

  onClose,
  position,
  onPopupStateChange
}: TextSelectionDotProps) {
  const [text, setText] = useState(selectedText)
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error" | "empty"
  >("idle")

  useEffect(() => {
    onPopupStateChange?.(isOpen)
  }, [isOpen, onPopupStateChange])

  const handleSave = async () => {
    const textToSave = text.trim()
    if (!textToSave) {
      setSaveStatus("empty")
      setTimeout(() => setSaveStatus("idle"), 2000)
      return
    }

    setIsSaving(true)
    setSaveStatus("saving")

    try {
      const success = await addEpisode(textToSave)
      if (success) {
        setSaveStatus("success")
        setTimeout(() => {
          setIsOpen(false)
          onClose()
        }, 1500)
      } else {
        setSaveStatus("error")
        setTimeout(() => {
          setSaveStatus("idle")
          setIsSaving(false)
        }, 2000)
      }
    } catch (error) {
      console.error("Error saving episode:", error)
      setSaveStatus("error")
      setTimeout(() => {
        setSaveStatus("idle")
        setIsSaving(false)
      }, 2000)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  const getButtonText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving..."
      case "success":
        return "Saved!"
      case "error":
        return "Error"
      case "empty":
        return "No text to save"
      default:
        return "Add to Memory"
    }
  }

  return (
    <div
      className="ce-absolute !ce-font-sans"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 2147483647
      }}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="ce-flex ce-items-center ce-justify-center"
            style={{
              width: "20px",
              height: "20px",
              background: "#c15e50",
              borderRadius: "6px",
              padding: "4px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1
            }}>
            <StaticLogo width={14} height={14} color="#fff" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="ce-p-2 shadow-1 !ce-bg-background-3"
          align="end">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Textarea */}
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Edit the text you want to save to memory..."
              autoFocus
              style={{
                width: "100%",
                minHeight: "80px",
                maxHeight: "150px",
                resize: "vertical",
                padding: "8px",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: "13px",
                lineHeight: "1.4",
                color: "#333",
                outline: "none"
              }}
              className="ce-bg-transparent"
            />

            {/* Buttons */}
            <div className="ce-flex ce-gap-4 ce-justify-end ce-text-sm">
              <Button onClick={handleClose} variant="ghost">
                Close
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving || !text.trim()}
                variant="secondary">
                {getButtonText()}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
