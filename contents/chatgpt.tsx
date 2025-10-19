import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

import PlatformDot from "~components/platform-dot"
import { cn } from "~components/utils"
import { Platform } from "~types"
import * as chatgptUtils from "~utils/chatgpt"
import { syncFunction } from "~utils/chatgpt"
import {
  getAutoSyncEnabled,
  getIsSyncing,
  setAutoSyncEnabled
} from "~utils/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://chat.openai.com/*", "https://chatgpt.com/*"]
}

// Mount the dot as the first sibling before the composer button container
// Tries speech button first, falls back to submit button
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  // Wait for either button container to be available
  const waitForContainer = () => {
    return new Promise<Element>((resolve) => {
      const checkContainer = () => {
        // Try speech button container first
        let buttonContainer = document.querySelector(
          '[data-testid="composer-speech-button-container"]'
        )

        // Fallback to submit button if speech button not found
        if (!buttonContainer) {
          buttonContainer = document.querySelector(
            '[id="composer-submit-button"]'
          )
        }

        if (buttonContainer && buttonContainer.parentElement) {
          // Return the parent element
          resolve(buttonContainer.parentElement)
        } else {
          setTimeout(checkContainer, 100)
        }
      }
      checkContainer()
    })
  }

  const parentContainer = await waitForContainer()

  // Return configuration to insert as first child
  return {
    element: parentContainer,
    insertPosition: "beforebegin"
  }
}

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

const ChatGPTContent = () => {
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Initialize auto-sync state from chrome storage
  useEffect(() => {
    const initialize = async () => {
      const enabled = await getAutoSyncEnabled()
      setIsAutoSyncEnabled(enabled)

      if (enabled) {
        // Initial sync
        await chatgptUtils.syncFunction()

        // Start interval to run sync every 5 seconds
        syncIntervalRef.current = setInterval(() => {
          chatgptUtils.syncFunction()
        }, 5000)
      }

      // Poll sync status from chrome storage every second
      statusCheckIntervalRef.current = setInterval(async () => {
        const syncing = await getIsSyncing()
        setIsSyncing(syncing)
      }, 1000)
    }

    initialize()

    return () => {
      // Cleanup on unmount
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
        statusCheckIntervalRef.current = null
      }
    }
  }, [])

  const handleAutoSyncChange = async (enabled: boolean) => {
    // Update chrome storage
    await setAutoSyncEnabled(enabled)

    // Update local state
    setIsAutoSyncEnabled(enabled)

    if (enabled) {
      // Run initial sync
      await chatgptUtils.syncFunction()

      // Start interval to run sync every 5 seconds
      syncIntervalRef.current = setInterval(() => {
        chatgptUtils.syncFunction()
      }, 5000)

      console.log("ChatGPT auto-sync started (5 second interval)")
    } else {
      // Stop interval
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }

      console.log("ChatGPT auto-sync stopped")
    }
  }

  const handleImprovePrompt = (improvedText: string) => {
    chatgptUtils.addToInput(improvedText)
  }

  return (
    <div className={cn("ce-main-container")}>
      <PlatformDot
        platform={Platform.CHATGPT}
        onImprovePrompt={handleImprovePrompt}
        getCurrentInput={chatgptUtils.getInputValue}
        onAutoSyncChange={handleAutoSyncChange}
        isAutoSyncActive={isAutoSyncEnabled}
        isSyncing={isSyncing}
      />
    </div>
  )
}

export default ChatGPTContent
