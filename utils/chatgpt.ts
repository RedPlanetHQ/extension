import TurndownService from "turndown"

import { addEpisode, fetchLogs } from "./api"
import { getIsSyncing, setIsSyncing } from "./storage"

const turndownService = new TurndownService()

/**
 * Extract full conversation from ChatGPT DOM
 * Returns array of formatted conversation messages
 */
export function extractConversation(): string[] {
  try {
    const conversation: string[] = []
    const articles = document.querySelectorAll("article[data-turn]")

    articles.forEach((article) => {
      const turn = article.getAttribute("data-turn")

      if (turn === "user") {
        const userDiv = article.querySelector(
          'div[data-message-author-role="user"]'
        )
        if (userDiv) {
          const html = userDiv.innerHTML
          const markdown = turndownService.turndown(html)
          conversation.push(`user: ${markdown}`)
        }
      } else if (turn === "assistant") {
        const assistantDiv = article.querySelector(
          'div[data-message-author-role="assistant"]'
        )

        const finished = article.querySelector(
          'button[data-testid="good-response-turn-action-button"]'
        )

        if (assistantDiv && finished) {
          const html = assistantDiv.innerHTML
          const markdown = turndownService.turndown(html)
          conversation.push(`assistant: ${markdown}`)
        }
      }
    })

    return conversation
  } catch (error) {
    console.error("Error extracting ChatGPT conversation:", error)
    return []
  }
}

/**
 * Get the current input value from ChatGPT contenteditable div
 * Based on the DOM structure: contenteditable div with id="prompt-textarea"
 */
export function getInputValue(): string {
  try {
    const editor = document.getElementById("prompt-textarea")

    if (editor) {
      // Get text content from the contenteditable div
      const p = editor.querySelector("p")

      if (p) {
        // Check if it has placeholder class (empty state)
        if (p.classList.contains("placeholder")) {
          return ""
        }
        return p.textContent || ""
      }

      // Fallback to textContent of the editor itself
      return editor.textContent || ""
    }

    console.warn("ChatGPT editor not found")
    return ""
  } catch (error) {
    console.error("Error getting ChatGPT input value:", error)
    return ""
  }
}

/**
 * Add or replace text in ChatGPT input
 * Based on the DOM structure: textarea with id="prompt-textarea"
 *
 * @param text - The text to set in the input
 */
export function addToInput(text: string): void {
  try {
    const editor = document.getElementById("prompt-textarea")

    if (editor) {
      editor.focus()

      // Find the paragraph element
      const p = editor.querySelector("p")

      if (p) {
        // Remove placeholder class if it exists
        p.classList.remove("placeholder")

        // Append text node
        const textNode = document.createTextNode(text)
        p.appendChild(textNode)

        // Move cursor to end
        const range = document.createRange()
        const selection = window.getSelection()
        range.setStartAfter(textNode)
        range.collapse(true)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  } catch (error) {
    console.error("Error setting ChatGPT input value:", error)
  }
}

/**
 * Extract conversation ID from ChatGPT URL
 * URL format: https://chatgpt.com/c/68ef5240-9070-8324-80a8-f6793b34b6da
 */
function getConversationId(): string | null {
  try {
    const url = window.location.href
    const match = url.match(/\/c\/([^/]+)/)
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
      // Call addEpisode for each pair that hasn't been synced yet
      const newPairs = conversationPairs.slice(totalCount)
      console.log(`Syncing ${newPairs.length} new pairs`)

      for (const pair of newPairs) {
        const episodeBody = `User: ${pair.user}\n\nAssistant: ${pair.assistant}`
        await addEpisode(episodeBody, conversationId)
        console.log("Episode added successfully")
      }

      console.log("ChatGPT conversation synced to API")
    } else {
      console.log("No new messages to sync")
    }

    await setIsSyncing(false)
  } catch (error) {
    console.error("Failed to sync ChatGPT conversation:", error)
    await setIsSyncing(false)
  }
}
