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
    const response = await fetch(`${apiBaseUrl}/spaces`, {
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
    return result.spaces || []
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
      `${apiBaseUrl}/logs?sessionId=${sessionId}&limit=${limit}`,
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

// Deep search API (for improve prompt feature)
// Uses trigger run pattern similar to extension-search
export async function createDeepSearch(
  query: string,
  url: string,
  title?: string
) {
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
        stream: false
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    return {
      id: result.id,
      token: result.publicAccessToken
    }
  } catch (error) {
    console.error("Failed to create deep search:", error)
    return null
  }
}
