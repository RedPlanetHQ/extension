import { useEffect, useState } from "react"

import type { Platform, Space } from "~types"
import { createDeepSearch, fetchSpaces } from "~utils/api"

import AutoSyncToggle from "./AutoSyncToggle"
import { Button } from "./button"
import StaticLogo from "./logo"
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger
} from "./popover"
import { StreamingSearch } from "./streaming-search"

interface PlatformDotProps {
  platform: Platform
  onImprovePrompt: (improvedText: string) => void
  getCurrentInput: () => string
  onAutoSyncChange?: (enabled: boolean) => void
  isAutoSyncActive: boolean
  isSyncing?: boolean
}

export default function PlatformDot({
  platform,
  onImprovePrompt,
  getCurrentInput,
  onAutoSyncChange,
  isAutoSyncActive,
  isSyncing = false
}: PlatformDotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showSpaces, setShowSpaces] = useState(false)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [showStreamingSearch, setShowStreamingSearch] = useState(false)
  const [deepSearchData, setDeepSearchData] = useState<{
    runId: string
    token: string
  } | null>(null)

  // Fetch spaces when space selector is opened
  useEffect(() => {
    if (showSpaces && spaces.length === 0) {
      loadSpaces()
    }
  }, [showSpaces])

  const loadSpaces = async () => {
    setIsLoadingSpaces(true)
    try {
      const fetchedSpaces = await fetchSpaces()
      if (fetchedSpaces) {
        setSpaces(fetchedSpaces)
      }
    } catch (error) {
      console.error("Failed to load spaces:", error)
    } finally {
      setIsLoadingSpaces(false)
    }
  }

  const handleSpaceClick = (space: Space) => {
    // Add space summary to input
    const spaceSummary = space.summary || ""
    const currentInput = getCurrentInput()

    // Combine current input with space summary
    const newInput = currentInput
      ? `${spaceSummary}\n\n${currentInput}`
      : spaceSummary

    onImprovePrompt(newInput)
    setShowSpaces(false)
    setIsOpen(false)
  }

  const handleImprovePrompt = async () => {
    const currentPrompt = getCurrentInput()

    // Only proceed if input is not empty
    if (!currentPrompt || !currentPrompt.trim()) {
      console.warn("No prompt to improve")
      return
    }

    setIsImproving(true)

    try {
      const url = window.location.href
      const title = document.title

      // Call createDeepSearch API
      const result = await createDeepSearch(currentPrompt, url, title)

      if (result && result.id && result.token) {
        // Store the run ID and token
        setDeepSearchData({
          runId: result.id,
          token: result.token
        })

        // Show streaming search view
        setShowStreamingSearch(true)
      }
    } catch (error) {
      console.error("Failed to improve prompt:", error)
    } finally {
      setIsImproving(false)
    }
  }

  const handleInsertImprovedPrompt = (content: string) => {
    // Insert the improved content into input
    onImprovePrompt(content)

    // Close popover and reset state
    setShowStreamingSearch(false)
    setDeepSearchData(null)
    setIsOpen(false)
  }

  const handleAfterStreaming = () => {
    // Called when streaming is complete
    console.log("Streaming complete")
  }

  return (
    <div
      className="!ce-font-sans"
      style={{ zIndex: 2147483647 }}
      onClick={(e) => {
        e.stopPropagation()
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
          className="ce-p-2 ce-shadow-1 !ce-bg-background-3 ce-w-full ce-items-start"
          align="end">
          {showStreamingSearch && deepSearchData ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minWidth: "300px",
                maxWidth: "400px"
              }}>
              {/* Back button */}
              <Button
                onClick={() => {
                  setShowStreamingSearch(false)
                  setDeepSearchData(null)
                }}
                variant="ghost"
                className="ce-justify-start">
                ← Back
              </Button>

              {/* Streaming Search Component */}
              <StreamingSearch
                runId={deepSearchData.runId}
                token={deepSearchData.token}
                afterStreaming={handleAfterStreaming}
                onInsert={handleInsertImprovedPrompt}
              />
            </div>
          ) : !showSpaces ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minWidth: "180px"
              }}>
              {/* Auto Sync Toggle */}
              <AutoSyncToggle onToggle={onAutoSyncChange} />

              {/* Space Selector */}
              <Button
                onClick={() => setShowSpaces(true)}
                variant="ghost"
                className="ce-justify-start ce-items-center">
                Add space context
              </Button>

              {/* Improve Prompt */}
              <Button
                onClick={handleImprovePrompt}
                disabled={isImproving}
                variant="ghost">
                {isImproving ? "Improving..." : "Improve Prompt"}
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                minWidth: "180px",
                maxHeight: "300px"
              }}>
              {/* Back button */}
              <Button
                onClick={() => setShowSpaces(false)}
                variant="ghost"
                className="ce-justify-start">
                ← Back
              </Button>

              {/* Spaces list */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  maxHeight: "250px",
                  overflowY: "auto"
                }}>
                {isLoadingSpaces ? (
                  <div style={{ padding: "8px", fontSize: "13px" }}>
                    Loading spaces...
                  </div>
                ) : spaces.length === 0 ? (
                  <div style={{ padding: "8px", fontSize: "13px" }}>
                    No spaces found
                  </div>
                ) : (
                  spaces.map((space) => (
                    <Button
                      key={space.id}
                      onClick={() => handleSpaceClick(space)}
                      variant="ghost"
                      className="ce-justify-start">
                      {space.name}
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Auto-sync indicator */}
      {isAutoSyncActive && (
        <div
          className="ce-flex ce-items-center ce-gap-1 ce-px-2 ce-py-1 ce-rounded-md ce-bg-background-3 ce-text-foreground"
          style={{
            position: "fixed",
            bottom: "16px",
            right: "16px",
            fontSize: "12px",
            zIndex: 2147483646,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
          }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: isSyncing ? "#f59e0b" : "#10b981",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
            }}
          />
          <span>{isSyncing ? "Syncing..." : "Auto-sync active"}</span>
        </div>
      )}
    </div>
  )
}
