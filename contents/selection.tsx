import cssText from "data-text:~style.css"
import { useCallback, useEffect, useState } from "react"

import TextSelectionDot from "~components/text-selection-dot"
import { cn } from "~components/utils"

export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize

    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")

  styleElement.textContent = updatedCssText

  return styleElement
}

const Content = () => {
  const [selectionInfo, setSelectionInfo] = useState(null)
  const [isPopupOpen, setIsPopupOpen] = useState(false)

  const handleSelection = useCallback(() => {
    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) {
      const selectedText = selection?.toString().trim()
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const top = rect.bottom + window.scrollY + 5
      const left = Math.min(
        rect.right + window.scrollX - 16,
        window.innerWidth - 40
      )
      // Adjust position relative to scroll, viewport, etc.
      setSelectionInfo({
        left: left,
        top: top,
        text: selectedText
      })
    } else {
      setSelectionInfo(null)
    }
  }, [])

  useEffect(() => {
    // Only add selection listeners when popup is not open
    if (!isPopupOpen) {
      document.addEventListener("mouseup", handleSelection)
    } else {
      document.removeEventListener("mouseup", handleSelection)
    }
  }, [isPopupOpen, handleSelection])

  return selectionInfo ? (
    <div className={cn("ce-main-container")}>
      <TextSelectionDot
        position={{ top: selectionInfo.top, left: selectionInfo.left }}
        selectedText={selectionInfo.text}
        onClose={() => setSelectionInfo(null)}
        onPopupStateChange={setIsPopupOpen}
      />
    </div>
  ) : null
}

export default Content
