import { useEffect, useState } from "react"

import { getAutoSyncEnabled, setAutoSyncEnabled } from "~utils/storage"

import { Switch } from "./switch"

interface AutoSyncToggleProps {
  onToggle?: (enabled: boolean) => void
}

export default function AutoSyncToggle({ onToggle }: AutoSyncToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial state from chrome.storage
  useEffect(() => {
    const loadState = async () => {
      const enabled = await getAutoSyncEnabled()
      setIsEnabled(enabled)
      setIsLoading(false)
    }
    loadState()
  }, [])

  const handleToggle = async (checked: boolean) => {
    setIsEnabled(checked)
    await setAutoSyncEnabled(checked)

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
