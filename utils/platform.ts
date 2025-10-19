import { Platform } from "../types"

// Platform configuration - Add new platforms here
interface PlatformConfig {
  hostPatterns: string[]
  displayName: string
}

const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  [Platform.CHATGPT]: {
    hostPatterns: ["chat.openai.com", "chatgpt.com"],
    displayName: "ChatGPT"
  },
  [Platform.GEMINI]: {
    hostPatterns: ["gemini.google.com"],
    displayName: "Gemini"
  }
}

/**
 * Detect platform based on current URL
 */
export function detectPlatform(url?: string): Platform | null {
  const currentUrl = url || window.location.href
  const hostname = new URL(currentUrl).hostname

  for (const [platform, config] of Object.entries(PLATFORM_CONFIGS)) {
    if (config.hostPatterns.some((pattern) => hostname.includes(pattern))) {
      return platform as Platform
    }
  }

  return null
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: Platform): string {
  return PLATFORM_CONFIGS[platform]?.displayName || platform
}

/**
 * Check if current page is a supported platform
 */
export function isSupportedPlatform(url?: string): boolean {
  return detectPlatform(url) !== null
}

/**
 * Get all supported platforms
 */
export function getAllPlatforms(): Platform[] {
  return Object.keys(PLATFORM_CONFIGS) as Platform[]
}
