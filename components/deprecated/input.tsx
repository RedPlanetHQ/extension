import cssText from "data-text:~style.css"
import { useCallback, useEffect, useState } from "react"

import InputSuggestionsPopup from "~components/deprecated/input-suggestion-popup"
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

const InputContent = () => {
  const [inputInfo, setInputInfo] = useState(null)

  const handleInputFocus = useCallback((event: FocusEvent) => {
    const target = event.target as any

    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.contentEditable === "true"
    ) {
      const rect = target.getBoundingClientRect()
      const top = rect.top + window.scrollY - 30
      const left = Math.min(rect.left + window.scrollX)

      setInputInfo({
        left: left,
        top: top,
        value: target.value || target.textContent || "",
        element: target
      })
    }
  }, [])

  const handleInputChange = useCallback((event: Event) => {
    const target = event.target as any

    setInputInfo((prev) => {
      // If no inputInfo is present, create it for this input
      if (!prev) {
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true"
        ) {
          const rect = target.getBoundingClientRect()
          const top = rect.top + window.scrollY - 30
          const left = Math.min(rect.left + window.scrollX)

          return {
            left: left,
            top: top,
            value: target.value || target.textContent || "",
            element: target
          }
        }
        return prev
      }

      // Only update if this is the currently tracked input
      if (prev.element === target) {
        const rect = target.getBoundingClientRect()
        const top = rect.top + window.scrollY - 10
        const left = Math.min(rect.left + window.scrollX - 16)

        return {
          ...prev,
          left: left,
          top: top,
          value: target.value || target.textContent || ""
        }
      }

      return prev
    })
  }, [])

  const handleFactSelect = useCallback(
    (fact: string) => {
      if (inputInfo && inputInfo.element) {
        const element = inputInfo.element

        // Handle different types of input elements
        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
          const inputEl = element as HTMLInputElement
          const currentValue = inputEl.value
          inputEl.value = currentValue + (currentValue ? " " : "") + fact
          inputEl.dispatchEvent(new Event("input", { bubbles: true }))
        } else if (element.contentEditable === "true") {
          // For contenteditable elements
          const currentText = element.textContent || ""
          element.textContent = currentText + (currentText ? " " : "") + fact
          element.dispatchEvent(new Event("input", { bubbles: true }))
        }

        // Update the tracked value
        setInputInfo((prev) =>
          prev
            ? {
                ...prev,
                value: prev.element.value || prev.element.textContent || ""
              }
            : null
        )
      }
    },
    [inputInfo]
  )

  useEffect(() => {
    document.addEventListener("focusin", handleInputFocus)
    document.addEventListener("input", handleInputChange)

    return () => {
      document.removeEventListener("focusin", handleInputFocus)
      document.removeEventListener("input", handleInputChange)
    }
  }, [handleInputFocus, handleInputChange])

  return inputInfo ? (
    <div className={cn("ce-main-container")}>
      <InputSuggestionsPopup
        position={{ top: inputInfo.top, left: inputInfo.left }}
        inputValue={inputInfo.value}
        onClose={() => setInputInfo(null)}
        onFactSelect={handleFactSelect}
      />
    </div>
  ) : null
}

export default InputContent
