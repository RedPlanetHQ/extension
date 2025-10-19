import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

import PlatformDot from "~components/platform-dot"
import { cn } from "~components/utils"
import { Platform } from "~types"
import * as geminiUtils from "~utils/gemini"
import { syncFunction } from "~utils/gemini"
import {
  getAutoSyncEnabled,
  getIsSyncing,
  setAutoSyncEnabled
} from "~utils/storage"

export const config: PlasmoCSConfig = {
  matches: ["https://gemini.google.com/*"]
}

// Mount the dot inside .leading-actions-wrapper as the last child
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  const waitForContainer = () => {
    return new Promise<Element>((resolve) => {
      const checkContainer = () => {
        const container = document.querySelector(".leading-actions-wrapper")

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
    insertPosition: "beforeend" // Insert as last child
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

  // Initialize auto-sync state from chrome storage
  useEffect(() => {
    const initialize = async () => {
      const enabled = await getAutoSyncEnabled()
      setIsAutoSyncEnabled(enabled)

      if (enabled) {
        // Initial sync
        await geminiUtils.syncFunction()

        // Start interval to run sync every 5 seconds
        syncIntervalRef.current = setInterval(() => {
          geminiUtils.syncFunction()
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
      await geminiUtils.syncFunction()

      // Start interval to run sync every 5 seconds
      syncIntervalRef.current = setInterval(() => {
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
