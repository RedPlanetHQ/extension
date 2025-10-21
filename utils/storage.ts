import { Storage } from "@plasmohq/storage"

import type { ExtensionState, Platform, PlatformSyncData } from "../types"
import { getPlatformStorageKey, STORAGE_KEYS } from "../types"

const storage = new Storage()

// Auto-sync state management (per session/conversation)
export async function getAutoSyncEnabled(sessionId: string): Promise<boolean> {
  const key = `auto_sync_${sessionId}`
  const enabled = await storage.get(key)
  // Default to false (off) for new sessions
  return enabled === "true"
}

export async function setAutoSyncEnabled(
  sessionId: string,
  enabled: boolean
): Promise<void> {
  const key = `auto_sync_${sessionId}`
  await storage.set(key, enabled.toString())
}

// Syncing status management
export async function getIsSyncing(): Promise<boolean> {
  const syncing = await storage.get("is_syncing")
  return syncing === "true"
}

export async function setIsSyncing(syncing: boolean): Promise<void> {
  await storage.set("is_syncing", syncing.toString())
}

export async function getSyncInterval(): Promise<number> {
  const interval = await storage.get(STORAGE_KEYS.SYNC_INTERVAL_MS)
  return interval ? parseInt(interval, 10) : 2000 // Default 2 seconds
}

export async function setSyncInterval(intervalMs: number): Promise<void> {
  await storage.set(STORAGE_KEYS.SYNC_INTERVAL_MS, intervalMs.toString())
}

export async function setPlatformSyncData(
  platform: Platform,
  data: PlatformSyncData
): Promise<void> {
  const key = getPlatformStorageKey(platform)
  await storage.set(key, data)
}

export async function clearPlatformSyncData(platform: Platform): Promise<void> {
  const key = getPlatformStorageKey(platform)
  await storage.remove(key)
}

// Get full extension state
export async function getExtensionState(): Promise<ExtensionState> {
  const syncIntervalMs = await getSyncInterval()
  const lastSyncTimestamp = await storage.get(STORAGE_KEYS.LAST_SYNC_TIMESTAMP)

  return {
    autoSyncEnabled: false, // Now session-specific, not global
    syncIntervalMs,
    lastSyncTimestamp: lastSyncTimestamp
      ? parseInt(lastSyncTimestamp, 10)
      : undefined
  }
}

export async function updateLastSyncTimestamp(): Promise<void> {
  await storage.set(STORAGE_KEYS.LAST_SYNC_TIMESTAMP, Date.now().toString())
}
