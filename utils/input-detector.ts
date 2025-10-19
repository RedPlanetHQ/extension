export interface FocusedInputInfo {
  value: string
  element: HTMLElement | null
}

export function getFocusedInputInfo(): FocusedInputInfo {
  const activeElement = document.activeElement as HTMLElement

  if (!activeElement) {
    return { value: "", element: null }
  }

  // Check for input elements
  if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
    const inputElement = activeElement as HTMLInputElement | HTMLTextAreaElement
    return {
      value: inputElement.value,
      element: activeElement
    }
  }

  // Check for contenteditable elements
  if (activeElement.isContentEditable || activeElement.getAttribute("contenteditable") === "true") {
    return {
      value: activeElement.textContent || activeElement.innerText || "",
      element: activeElement
    }
  }

  // Check for elements with specific roles or classes that might be input-like
  if (activeElement.getAttribute("role") === "textbox" || 
      activeElement.classList.contains("input") ||
      activeElement.classList.contains("editor")) {
    return {
      value: activeElement.textContent || activeElement.innerText || "",
      element: activeElement
    }
  }

  return { value: "", element: null }
}

export function insertTextIntoFocusedElement(text: string, element: HTMLElement) {
  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    const inputElement = element as HTMLInputElement | HTMLTextAreaElement
    const startPos = inputElement.selectionStart || 0
    const endPos = inputElement.selectionEnd || 0
    const currentValue = inputElement.value
    
    inputElement.value = currentValue.substring(0, startPos) + text + currentValue.substring(endPos)
    inputElement.selectionStart = inputElement.selectionEnd = startPos + text.length
    inputElement.focus()
    
    // Trigger input event
    inputElement.dispatchEvent(new Event('input', { bubbles: true }))
  } else if (element.isContentEditable || element.getAttribute("contenteditable") === "true") {
    // For contenteditable elements
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      
      const textNode = document.createTextNode(text)
      range.insertNode(textNode)
      range.setStartAfter(textNode)
      range.setEndAfter(textNode)
      
      selection.removeAllRanges()
      selection.addRange(range)
      
      element.focus()
      
      // Trigger input event
      element.dispatchEvent(new Event('input', { bubbles: true }))
    } else {
      // Fallback: append to the end
      element.textContent = (element.textContent || "") + text
      element.focus()
      element.dispatchEvent(new Event('input', { bubbles: true }))
    }
  }
}