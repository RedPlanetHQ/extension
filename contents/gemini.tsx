import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

import PlatformDot from "~components/platform-dot"
import { cn } from "~components/utils"
import { Platform } from "~types"
import * as geminiUtils from "~utils/gemini"
import { usePathname } from "~utils/pathname"
import {
  getAutoSyncEnabled,
  getIsSyncing,
  setAutoSyncEnabled
} from "~utils/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

// Mount the dot inside .trailing-actions-wrapper as the last child
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  const waitForContainer = () => {
    return new Promise<Element>((resolve) => {
      const checkContainer = () => {
        const container = document.querySelector(".trailing-actions-wrapper")

        if (container) {
          resolve(container)
        } else {
          setTimeout(checkContainer, 100)
        }
      }
      checkContainer()
    })
  }

  const container = await waitForContainer()

  return {
    element: container,
    insertPosition: "afterbegin" // Insert as last child
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

const GeminiContent = () => {
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const pathname = usePathname()

  // Extract conversation ID from URL
  const getConversationId = () => {
    const url = window.location.href
    const match = url.match(/\/app\/([^/?]+)/)
    return match ? match[1] : null
  }

  // Initialize session ID and auto-sync state
  useEffect(() => {
    console.log("came here")
    const initialize = async () => {
      const conversationId = getConversationId()
      setSessionId(conversationId)

      if (!conversationId) {
        console.warn("No conversation ID found")
        return
      }

      const enabled = await getAutoSyncEnabled(conversationId)
      setIsAutoSyncEnabled(enabled)

      if (enabled) {
        // Initial sync
        await geminiUtils.syncFunction()

        // Start interval to run sync every 5 seconds
        syncIntervalRef.current = setInterval(() => {
          console.log("sync called")
          geminiUtils.syncFunction()
        }, 5000)
      } else {
        console.log("sync disabled")
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
  }, [pathname])

  const handleAutoSyncChange = async (enabled: boolean) => {
    if (!sessionId) {
      console.warn("No session ID available")
      return
    }

    // Update chrome storage with session ID
    await setAutoSyncEnabled(sessionId, enabled)

    // Update local state
    setIsAutoSyncEnabled(enabled)

    if (enabled) {
      // Run initial sync
      await geminiUtils.syncFunction()

      // Start interval to run sync every 5 seconds
      syncIntervalRef.current = setInterval(() => {
        console.log("sync called")
        geminiUtils.syncFunction()
      }, 5000)

      console.log("Gemini auto-sync started (5 second interval)")
    } else {
      // Stop interval
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }

      console.log("Gemini auto-sync stopped")
    }
  }

  const handleImprovePrompt = (improvedText: string) => {
    geminiUtils.addToInput(improvedText)
  }

  return (
    <div className={cn("ce-main-container")}>
      <PlatformDot
        platform={Platform.GEMINI}
        sessionId={sessionId}
        onImprovePrompt={handleImprovePrompt}
        getCurrentInput={geminiUtils.getInputValue}
        onAutoSyncChange={handleAutoSyncChange}
        isAutoSyncActive={isAutoSyncEnabled}
        isSyncing={isSyncing}
      />
    </div>
  )
}

export default GeminiContent
