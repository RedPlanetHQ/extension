import { Storage } from "@plasmohq/storage"

import { isExtensionContextValid, withValidContext } from "./context"

const storage = new Storage()
const DEFAULT_API_BASE_URL = "https://core.heysol.ai/api/v1"

export interface CoreEpisode {
  episodeBody: string
  referenceTime: Date
  source: string
}

export interface CoreSearchQuery {
  query: string
}

export interface CoreSearchResponse {
  facts: string[]
  episodes: CoreEpisode[]
}

async function getApiKey(): Promise<string | null> {
  if (!isExtensionContextValid()) {
    console.log("Extension context invalid, cannot get API key")
    return null
  }

  return withValidContext(async () => {
    return await storage.get("core_api_key")
  }, null)
}

async function getApiBaseUrl(): Promise<string> {
  if (!isExtensionContextValid()) {
    console.log("Extension context invalid, using default API base URL")
    return DEFAULT_API_BASE_URL
  }

  return withValidContext(async () => {
    const url = await storage.get("core_api_base_url")
    return url || DEFAULT_API_BASE_URL
  }, DEFAULT_API_BASE_URL)
}

export async function addEpisode(
  episodeBody: string,
  sessionId?: string
): Promise<boolean> {
  const apiKey = await getApiKey()
  if (!apiKey) {
    console.error("No API key found")
    return false
  }

  const apiBaseUrl = await getApiBaseUrl()

  try {
    const response = await fetch(`${apiBaseUrl}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        episodeBody,
        referenceTime: new Date(),
        sessionId,
        source: "Core extension"
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Failed to add episode:", error)
    return false
  }
}

// Spaces API
export async function fetchSpaces() {
  const apiKey = await getApiKey()
  if (!apiKey) {
    console.error("No API key found")
    return null
  }

  const apiBaseUrl = await getApiBaseUrl()

  try {
    const response = await fetch(`${apiBaseUrl}/documents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    return result.documents || []
  } catch (error) {
    console.error("Failed to fetch spaces:", error)
    return null
  }
}

// Logs API - fetch logs by session ID
export async function fetchLogs(sessionId: string, limit: number = 1) {
  const apiKey = await getApiKey()
  if (!apiKey) {
    console.error("No API key found")
    return null
  }

  const apiBaseUrl = await getApiBaseUrl()

  try {
    const response = await fetch(
      `${apiBaseUrl}/episodes/session/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Failed to fetch logs:", error)
    return null
  }
}

// Conversations API
export interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface ConversationHistory {
  id: string
  userType: string
  message: string
  parts?: any[]
}

export interface ConversationWithHistory extends Conversation {
  title: string
  ConversationHistory: ConversationHistory[]
}

export async function getConversationHistory(
  conversationId: string
): Promise<ConversationWithHistory | null> {
  const apiKey = await getApiKey()
  if (!apiKey) return null

  const apiBaseUrl = await getApiBaseUrl()

  try {
    const response = await fetch(
      `${apiBaseUrl}/conversation/${conversationId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        }
      }
    )
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error("Failed to fetch conversation history:", error)
    return null
  }
}

export async function fetchConversations(
  search = "",
  limit = 5
): Promise<Conversation[]> {
  const apiKey = await getApiKey()
  if (!apiKey) return []

  const apiBaseUrl = await getApiBaseUrl()
  const params = new URLSearchParams({ limit: String(limit) })
  if (search) params.set("search", search)

  try {
    const response = await fetch(`${apiBaseUrl}/conversations?${params}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const result = await response.json()
    return result.conversations || []
  } catch (error) {
    console.error("Failed to fetch conversations:", error)
    return []
  }
}

export async function createConversation(
  message: string,
  title?: string
): Promise<{ conversationId: string } | null> {
  const apiKey = await getApiKey()
  if (!apiKey) return null

  const apiBaseUrl = await getApiBaseUrl()

  try {
    const response = await fetch(`${apiBaseUrl}/conversation/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ message, title, source: "core-extension" })
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch (error) {
    console.error("Failed to create conversation:", error)
    return null
  }
}

// Deep search API (for improve prompt feature)
// Returns a streaming response directly
export async function createDeepSearch(
  query: string,
  url: string,
  title?: string
): Promise<ReadableStream<Uint8Array> | null> {
  const apiKey = await getApiKey()
  if (!apiKey) {
    console.error("No API key found")
    return null
  }

  const apiBaseUrl = await getApiBaseUrl()

  try {
    const response = await fetch(`${apiBaseUrl}/deep-search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        content: JSON.stringify({ query, url, title }),
        stream: true
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Return the stream directly
    return response.body
  } catch (error) {
    console.error("Failed to create deep search:", error)
    return null
  }
}
