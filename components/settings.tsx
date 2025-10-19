import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { Button } from "./button"
import { Input } from "./input"

export const Settings = () => {
  // useStorage returns [value, setValue, { remove }]
  const [apiKey, setApiKey, { remove: removeApiKey }] =
    useStorage<string>("core_api_key")
  const [apiBaseUrl, setApiBaseUrl, { remove: removeApiBaseUrl }] =
    useStorage<string>("core_api_base_url")

  const [apiKeyInput, setApiKeyInput] = useState(apiKey ?? "")
  const [apiBaseUrlInput, setApiBaseUrlInput] = useState(
    apiBaseUrl ?? "https://core.heysol.ai/api/v1"
  )
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Keep inputs in sync with storage if values change externally
  if (apiKey !== undefined && apiKeyInput !== apiKey) {
    setApiKeyInput(apiKey)
  }
  if (apiBaseUrl !== undefined && apiBaseUrlInput !== apiBaseUrl) {
    setApiBaseUrlInput(apiBaseUrl)
  }

  const saveSettings = async () => {
    if (!apiKeyInput.trim()) {
      setMessage("Please enter an API key")
      return
    }
    if (!apiBaseUrlInput.trim()) {
      setMessage("Please enter an API base URL")
      return
    }
    setIsLoading(true)
    try {
      await setApiKey(apiKeyInput.trim())
      await setApiBaseUrl(apiBaseUrlInput.trim())
      setMessage("Settings saved successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Failed to save settings")
      console.error("Save error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSettings = async () => {
    try {
      await removeApiKey()
      await removeApiBaseUrl()
      setApiKeyInput("")
      setApiBaseUrlInput("https://core.heysol.ai/api/v1")
      setMessage("Settings cleared")
      setTimeout(() => setMessage(""), 2000)
    } catch (error) {
      setMessage("Failed to clear settings")
      console.error("Clear error:", error)
    }
  }

  return (
    <div className="ce-p-4">
      <div className="ce-mb-4">
        <label className="ce-text-sm ce-text-muted-foreground ce-block ce-mb-2">
          API Key
        </label>
        <Input
          type="password"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          placeholder="Enter your Core API key"
          className="ce-w-full ce-mb-4"
        />

        <label className="ce-text-sm ce-text-muted-foreground ce-block ce-mb-2">
          API Base URL
        </label>
        <Input
          type="text"
          value={apiBaseUrlInput}
          onChange={(e) => setApiBaseUrlInput(e.target.value)}
          placeholder="https://core.heysol.ai/api/v1"
          className="ce-w-full"
        />

        <div className="ce-flex ce-gap-4 ce-my-4">
          <Button
            onClick={saveSettings}
            disabled={isLoading}
            isLoading={isLoading}
            variant="secondary">
            {isLoading ? "Saving..." : "Save"}
          </Button>

          {apiKey && (
            <Button onClick={clearSettings} variant="ghost">
              Clear
            </Button>
          )}
        </div>

        {message && (
          <div
            className={`ce-p-2 ce-rounded ce-text-sm ce-mb-3 ${
              message.includes("success")
                ? "ce-bg-green-100 ce-text-green-800"
                : "ce-bg-red-100 ce-text-red-800"
            }`}>
            {message}
          </div>
        )}

        {apiKey && (
          <div className="ce-text-sm ce-text-green-600 ce-mb-4">
            ✓ Settings configured
          </div>
        )}
      </div>
    </div>
  )
}
