// Platform enum - Add new platforms here
export enum Platform {
  CHATGPT = "chatgpt",
  GEMINI = "gemini"
}

// Space interface (from API)
export interface Space {
  id: string
  name: string
  description?: string
  summary?: string
}

// Extension state stored in chrome.storage.local
export interface ExtensionState {
  autoSyncEnabled: boolean
  syncIntervalMs: number
  lastSyncTimestamp?: number
}

// Platform-specific sync data stored in chrome.storage
export interface PlatformSyncData {
  platform: Platform
  prompt: string
  timestamp: number
}

// Deep search request (for improve prompt feature)
export interface DeepSearchRequest {
  query: string
  url: string
  title?: string
  outputType?: string
}

// Deep search response (trigger run pattern)
export interface DeepSearchResponse {
  id: string
  token: string // publicAccessToken
}

// Spaces API response
export interface SpacesResponse {
  spaces: Space[]
}

// Storage keys (platform-agnostic)
export const STORAGE_KEYS = {
  AUTO_SYNC_ENABLED: "autoSyncEnabled",
  SYNC_INTERVAL_MS: "syncIntervalMs",
  LAST_SYNC_TIMESTAMP: "lastSyncTimestamp"
} as const

// Helper to generate platform-specific storage key
export const getPlatformStorageKey = (platform: Platform): string => {
  return `${platform}_sync_data`
}
