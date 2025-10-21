import { useEffect, useState } from "react"

import { getAutoSyncEnabled, setAutoSyncEnabled } from "~utils/storage"

import { Switch } from "./switch"

interface AutoSyncToggleProps {
  sessionId: string
  onToggle?: (enabled: boolean) => void
}

export default function AutoSyncToggle({
  sessionId,
  onToggle
}: AutoSyncToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial state from chrome.storage (session-specific)
  useEffect(() => {
    const loadState = async () => {
      if (!sessionId) {
        setIsLoading(false)
        return
      }
      const enabled = await getAutoSyncEnabled(sessionId)
      setIsEnabled(enabled)
      setIsLoading(false)
    }
    loadState()
  }, [sessionId])

  const handleToggle = async (checked: boolean) => {
    if (!sessionId) return

    setIsEnabled(checked)
    await setAutoSyncEnabled(sessionId, checked)

    // Bubble event to parent
    onToggle?.(checked)
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px",
          fontSize: "13px"
        }}>
        <span>Auto Sync</span>
        <span style={{ fontSize: "11px", color: "#999" }}>Loading...</span>
      </div>
    )
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px",
        fontSize: "13px"
      }}>
      <span>Auto Sync</span>
      <Switch checked={isEnabled} onCheckedChange={handleToggle} />
    </div>
  )
}
