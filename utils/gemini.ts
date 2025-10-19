import TurndownService from "turndown"

import { addEpisode, fetchLogs } from "./api"
import { getIsSyncing, setIsSyncing } from "./storage"

const turndownService = new TurndownService()

/**
 * Extract full conversation from Gemini DOM
 * Returns array of formatted conversation messages in alternating user/assistant format
 */
export function extractConversation(): string[] {
  try {
    const conversation: string[] = []
    const chatHistory = document.querySelector("infinite-scroller.chat-history")

    if (!chatHistory) {
      console.warn("Gemini chat history not found")
      return []
    }

    // Get all children (conversation turns)
    const turns = Array.from(chatHistory.children)

    turns.forEach((turn) => {
      // Check for user message
      const userContent = turn.querySelector("user-query-content")
      if (userContent) {
        const html = userContent.innerHTML
        const markdown = turndownService.turndown(html)
        conversation.push(`user: ${markdown}`)
      }

      // Check for assistant message
      const messageContent = turn.querySelector("message-content")
      const messageActions = turn.querySelector("message-actions")

      // Only include finished assistant messages (has message-actions)
      if (messageContent && messageActions) {
        const html = messageContent.innerHTML
        const markdown = turndownService.turndown(html)
        conversation.push(`assistant: ${markdown}`)
      }
    })

    return conversation
  } catch (error) {
    console.error("Error extracting Gemini conversation:", error)
    return []
  }
}

/**
 * Get the current input value from Gemini input area
 * Based on the DOM structure: contenteditable div with class ql-editor
 */
export function getInputValue(): string {
  try {
    // Find the contenteditable div with class ql-editor
    const editor = document.querySelector(".ql-editor[contenteditable='true']")

    if (editor) {
      // Check for placeholder (empty state)
      const p = editor.querySelector("p")
      if (p) {
        const brOnly = p.querySelector("br") && p.childNodes.length === 1
        if (brOnly) {
          return "" // Empty state
        }
        return p.textContent || ""
      }

      return editor.textContent || ""
    }

    console.warn("Gemini editor not found")
    return ""
  } catch (error) {
    console.error("Error getting Gemini input value:", error)
    return ""
  }
}

/**
 * Add text to Gemini input
 * Based on the DOM structure: contenteditable div with class ql-editor
 *
 * @param text - The text to add to the input
 */
export function addToInput(text: string): void {
  try {
    const editor = document.querySelector(
      ".ql-editor[contenteditable='true']"
    ) as HTMLElement

    if (editor) {
      editor.focus()

      // Find or create the paragraph element
      let p = editor.querySelector("p")
      if (!p) {
        p = document.createElement("p")
        editor.appendChild(p)
      }

      // Remove any br elements (empty state)
      const br = p.querySelector("br")
      if (br) {
        br.remove()
      }

      // Append text node
      const textNode = document.createTextNode(text)
      p.appendChild(textNode)

      // Move cursor to end
      const range = document.createRange()
      const selection = window.getSelection()
      range.setStartAfter(textNode)
      range.collapse(true)
      selection?.removeAllRanges()
      selection?.addRange(range)

      // Dispatch input event to notify the framework
      editor.dispatchEvent(new Event("input", { bubbles: true }))
    }
  } catch (error) {
    console.error("Error setting Gemini input value:", error)
  }
}

/**
 * Extract conversation ID from Gemini URL
 * URL format: https://gemini.google.com/app/e42441d556a9debc
 */
function getConversationId(): string | null {
  try {
    const url = window.location.href
    const match = url.match(/\/app\/([^/?]+)/)
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
  // If already syncing, return early
  const isSyncing = await getIsSyncing()
  if (isSyncing) {
    console.log("Sync already in progress, skipping...")
    return
  }

  try {
    await setIsSyncing(true)

    const conversation = extractConversation()

    // Don't sync if no conversation
    if (conversation.length === 0) {
      await setIsSyncing(false)
      return
    }

    // Get conversation ID from URL
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
    console.log(
      `TotalCount: ${totalCount}, Conversation length: ${conversation.length}`
    )

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
      // Call addEpisode for each pair that hasn't been synced yet
      const newPairs = conversationPairs.slice(totalCount)
      console.log(`Syncing ${newPairs.length} new pairs`)

      for (const pair of newPairs) {
        const episodeBody = `User: ${pair.user}\n\nAssistant: ${pair.assistant}`
        await addEpisode(episodeBody, conversationId)
        console.log("Episode added successfully")
      }

      console.log("Gemini conversation synced to API")
    } else {
      console.log("No new messages to sync")
    }

    await setIsSyncing(false)
  } catch (error) {
    console.error("Failed to sync Gemini conversation:", error)
    await setIsSyncing(false)
  }
}
