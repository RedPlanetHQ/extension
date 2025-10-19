# Adding a New Provider

This guide explains how to add support for a new AI provider (like Gemini, Claude, etc.) to the Core Extension.

## Overview

The extension is built with a platform-agnostic architecture. Adding a new provider involves creating platform-specific utilities and a content script that integrates with the shared components.

## Steps to Add a New Provider

### 1. Add Platform to Enum

**File**: `types/index.ts`

Add your platform to the `Platform` enum:

```typescript
export enum Platform {
  CHATGPT = "chatgpt",
  GEMINI = "gemini",
  CLAUDE = "claude", // Add your new platform here
}
```

### 2. Create Platform-Specific Utilities

**File**: `utils/{platform-name}.ts` (e.g., `utils/claude.ts`)

Create a new file with the following required functions:

```typescript
import TurndownService from "turndown"
import { addEpisode, fetchLogs } from "./api"
import { getIsSyncing, setIsSyncing } from "./storage"

const turndownService = new TurndownService()

/**
 * Extract full conversation from the provider's DOM
 * Returns array of formatted conversation messages in alternating user/assistant format
 *
 * Example output: ["user: Hello", "assistant: Hi there", "user: How are you?", "assistant: I'm good"]
 */
export function extractConversation(): string[] {
  try {
    const conversation: string[] = []

    // TODO: Find conversation elements in the DOM
    // Example for your provider:
    const messages = document.querySelectorAll(".message-selector")

    messages.forEach((message) => {
      // TODO: Determine if message is from user or assistant
      const isUser = message.classList.contains("user-message")

      // TODO: Extract message content
      const content = message.querySelector(".content")?.innerHTML || ""

      // TODO: Only include finished assistant messages
      // Check for completion indicator specific to your provider
      const isFinished = message.querySelector(".completion-indicator")

      if (content && (isUser || isFinished)) {
        const markdown = turndownService.turndown(content)
        const prefix = isUser ? "user:" : "assistant:"
        conversation.push(`${prefix} ${markdown}`)
      }
    })

    return conversation
  } catch (error) {
    console.error("Error extracting conversation:", error)
    return []
  }
}

/**
 * Get the current input value from the provider's input field
 * Returns the text content of the input
 */
export function getInputValue(): string {
  try {
    // TODO: Find the input element
    const editor = document.querySelector(".input-selector")

    if (editor) {
      // TODO: Extract text content (handle contenteditable, textarea, etc.)
      return editor.textContent || ""
    }

    return ""
  } catch (error) {
    console.error("Error getting input value:", error)
    return ""
  }
}

/**
 * Add text to the provider's input field
 * Should append text and move cursor to the end
 */
export function addToInput(text: string): void {
  try {
    // TODO: Find the input element
    const editor = document.querySelector(".input-selector")

    if (editor) {
      editor.focus()

      // TODO: Insert text based on input type (contenteditable, textarea, etc.)
      // For contenteditable:
      const textNode = document.createTextNode(text)
      editor.appendChild(textNode)

      // TODO: Move cursor to end
      const range = document.createRange()
      const selection = window.getSelection()
      range.setStartAfter(textNode)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  } catch (error) {
    console.error("Error adding to input:", error)
  }
}

/**
 * Extract conversation ID from URL
 *
 * Example URL: https://provider.com/chat/abc-123-def
 * Should return: "abc-123-def"
 */
function getConversationId(): string | null {
  try {
    const url = window.location.href
    // TODO: Update regex to match your provider's URL pattern
    const match = url.match(/\/chat\/([^/]+)/)
    return match ? match[1] : null
  } catch (error) {
    console.error("Failed to extract conversation ID:", error)
    return null
  }
}

/**
 * Sync function called by auto-sync interval
 * Syncs new conversation pairs to the API
 */
export async function syncFunction(): Promise<void> {
  // Check if already syncing
  const isSyncing = await getIsSyncing()
  if (isSyncing) {
    console.log("Sync already in progress, skipping...")
    return
  }

  try {
    await setIsSyncing(true)

    const conversation = extractConversation()

    if (conversation.length === 0) {
      await setIsSyncing(false)
      return
    }

    const conversationId = getConversationId()
    if (!conversationId) {
      console.warn("No conversation ID found in URL")
      await setIsSyncing(false)
      return
    }

    // Fetch current totalCount from API
    const logsResponse = await fetchLogs(conversationId, 1)
    if (!logsResponse) {
      console.warn("Failed to fetch logs")
      await setIsSyncing(false)
      return
    }

    const totalCount = logsResponse.totalCount || 0
    console.log(`TotalCount: ${totalCount}, Conversation length: ${conversation.length}`)

    // Create pairs of user-assistant messages
    const conversationPairs: Array<{ user: string; assistant: string }> = []

    for (let i = 0; i < conversation.length - 1; i += 2) {
      const userMsg = conversation[i]
      const assistantMsg = conversation[i + 1]

      // Only add if both user and assistant messages exist
      if (
        userMsg &&
        userMsg.startsWith("user:") &&
        assistantMsg &&
        assistantMsg.startsWith("assistant:")
      ) {
        conversationPairs.push({
          user: userMsg.replace("user: ", "").trim(),
          assistant: assistantMsg.replace("assistant: ", "").trim()
        })
      }
    }

    console.log(`Found ${conversationPairs.length} conversation pairs`)

    // Check if we need to sync new messages
    if (totalCount < conversationPairs.length) {
      const newPairs = conversationPairs.slice(totalCount)
      console.log(`Syncing ${newPairs.length} new pairs`)

      for (const pair of newPairs) {
        const episodeBody = `User: ${pair.user}\n\nAssistant: ${pair.assistant}`
        await addEpisode(episodeBody, conversationId)
        console.log("Episode added successfully")
      }

      console.log("Conversation synced to API")
    } else {
      console.log("No new messages to sync")
    }

    await setIsSyncing(false)
  } catch (error) {
    console.error("Failed to sync conversation:", error)
    await setIsSyncing(false)
  }
}
```

### 3. Create Content Script

**File**: `contents/{platform-name}.tsx` (e.g., `contents/claude.tsx`)

```typescript
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetInlineAnchor } from "plasmo"
import { useEffect, useRef, useState } from "react"

import PlatformDot from "~components/platform-dot"
import { cn } from "~components/utils"
import { Platform } from "~types"
import * as platformUtils from "~utils/{platform-name}" // Import your utils
import { syncFunction } from "~utils/{platform-name}"
import {
  getAutoSyncEnabled,
  getIsSyncing,
  setAutoSyncEnabled
} from "~utils/storage"

// TODO: Update with your provider's URLs
export const config: PlasmoCSConfig = {
  matches: ["https://provider.com/*", "https://provider.ai/*"]
}

// TODO: Update to mount the dot in the correct location for your provider
export const getInlineAnchor: PlasmoGetInlineAnchor = async () => {
  const waitForContainer = () => {
    return new Promise<Element>((resolve) => {
      const checkContainer = () => {
        // TODO: Find the container where you want to mount the dot
        // Example: next to a submit button, in the toolbar, etc.
        const buttonContainer = document.querySelector(".submit-button-container")

        if (buttonContainer && buttonContainer.parentElement) {
          resolve(buttonContainer.parentElement)
        } else {
          setTimeout(checkContainer, 100)
        }
      }
      checkContainer()
    })
  }

  const parentContainer = await waitForContainer()

  return {
    element: parentContainer,
    insertPosition: "beforebegin" // or "afterend", "afterbegin", "beforeend"
  }
}

export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize
    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")
  styleElement.textContent = updatedCssText

  return styleElement
}

const PlatformContent = () => {
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const initialize = async () => {
      const enabled = await getAutoSyncEnabled()
      setIsAutoSyncEnabled(enabled)

      if (enabled) {
        await platformUtils.syncFunction()

        // Run sync every 5 seconds
        syncIntervalRef.current = setInterval(() => {
          platformUtils.syncFunction()
        }, 5000)
      }

      // Poll sync status every second
      statusCheckIntervalRef.current = setInterval(async () => {
        const syncing = await getIsSyncing()
        setIsSyncing(syncing)
      }, 1000)
    }

    initialize()

    return () => {
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
    await setAutoSyncEnabled(enabled)
    setIsAutoSyncEnabled(enabled)

    if (enabled) {
      await platformUtils.syncFunction()

      syncIntervalRef.current = setInterval(() => {
        platformUtils.syncFunction()
      }, 5000)

      console.log("Auto-sync started (5 second interval)")
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }

      console.log("Auto-sync stopped")
    }
  }

  const handleImprovePrompt = (improvedText: string) => {
    platformUtils.addToInput(improvedText)
  }

  return (
    <div className={cn("ce-main-container")}>
      <PlatformDot
        platform={Platform.CLAUDE} // TODO: Use your platform enum
        onImprovePrompt={handleImprovePrompt}
        getCurrentInput={platformUtils.getInputValue}
        onAutoSyncChange={handleAutoSyncChange}
        isAutoSyncActive={isAutoSyncEnabled}
        isSyncing={isSyncing}
      />
    </div>
  )
}

export default PlatformContent
```

## Key Implementation Details

### DOM Extraction Requirements

Your `extractConversation()` function must:

1. **Return alternating user/assistant messages** in order
   - Format: `["user: message1", "assistant: response1", "user: message2", "assistant: response2"]`

2. **Only include completed assistant responses**
   - Look for completion indicators (e.g., done generating, thumbs up/down buttons visible)
   - Skip in-progress responses

3. **Convert HTML to Markdown**
   - Use the `turndownService.turndown(html)` to convert HTML content to markdown
   - This preserves formatting like code blocks, lists, bold/italic, etc.

### Input Manipulation Requirements

Your `addToInput()` function must:

1. **Focus the input element**
2. **Append the text** (don't replace existing content)
3. **Move cursor to the end**
4. **Handle the specific input type** used by your provider:
   - `contenteditable` div
   - `textarea`
   - Custom React components

### URL Pattern Requirements

Your `getConversationId()` function must:

1. **Extract a unique conversation identifier** from the URL
2. **Return null** if no conversation is active
3. **Be consistent** across page refreshes

### Mounting Location

The `getInlineAnchor` function determines where the Core Memory dot appears:

1. **Find a stable container** that exists on conversation pages
2. **Choose a visible location** near the input area or toolbar
3. **Use appropriate insert position**:
   - `beforebegin`: Before the element
   - `afterend`: After the element
   - `afterbegin`: Inside, before first child
   - `beforeend`: Inside, after last child

## Testing Your Implementation

1. **Test conversation extraction**:
   - Open console and run: `extractConversation()`
   - Verify it returns properly formatted messages
   - Verify incomplete messages are excluded

2. **Test input manipulation**:
   - Open console and run: `addToInput("test text")`
   - Verify text is added to the input
   - Verify cursor moves to the end

3. **Test auto-sync**:
   - Enable auto-sync
   - Have a conversation
   - Check console logs for sync progress
   - Verify API receives episodes

4. **Test dot mounting**:
   - Navigate to conversation page
   - Verify dot appears in expected location
   - Verify popover opens correctly

## Common Pitfalls

1. **Dynamic DOM**: Provider UIs may use React/Vue with dynamic class names
   - Use `data-*` attributes when available
   - Use stable structural selectors
   - Handle elements that load asynchronously

2. **Shadow DOM**: Some providers use shadow DOM
   - You may need to pierce shadow roots
   - Test thoroughly across different pages

3. **URL Changes**: SPAs may not reload on navigation
   - Your conversation ID extraction should handle this
   - The sync function fetches fresh totalCount each time

4. **Rate Limiting**: API calls happen every 5 seconds
   - The `isSyncing` check prevents overlapping syncs
   - Don't reduce the interval below 5 seconds

## Example: ChatGPT Implementation

For reference, see the existing ChatGPT implementation:

- **Utils**: `utils/chatgpt.ts`
- **Content Script**: `contents/chatgpt.tsx`
- **Platform**: `Platform.CHATGPT` in `types/index.ts`

The ChatGPT implementation demonstrates:
- Extracting from `article[data-turn]` elements
- Checking for completion with `button[data-testid="good-response-turn-action-button"]`
- Manipulating `contenteditable` div inputs
- Extracting conversation ID from URL pattern `/c/{id}`
- Mounting next to composer buttons

## Need Help?

If you have questions or run into issues:

1. Check the existing ChatGPT implementation as a reference
2. Review the shared components in `components/platform-dot.tsx`
3. Test DOM selectors in the browser console first
4. Check Chrome DevTools for any console errors
