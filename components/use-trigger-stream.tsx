import { EventSource } from "eventsource"
import { useEffect, useState } from "react"

export const useTriggerStream = (
  runId: string,
  token: string,
  afterStreaming?: (finalMessage: string) => void
) => {
  const [message, setMessage] = useState("")
  const [error, setError] = useState<ErrorEvent | null>(null)

  useEffect(() => {
    startStreaming()
  }, [])

  const startStreaming = () => {
    const adjustedApiURL = "https://trigger.heysol.ai"
    const eventSource = new EventSource(
      `${adjustedApiURL}/realtime/v1/streams/${runId}/messages`,
      {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            headers: {
              ...init.headers,
              Authorization: `Bearer ${token}`
            }
          })
      }
    )

    eventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data)

        if (eventData.type.includes("MESSAGE_")) {
          setMessage((prevMessage) => prevMessage + eventData.message)
        }
      } catch (e) {
        console.error("Failed to parse message:", e)
      }
    }

    eventSource.onerror = (err: ErrorEvent) => {
      console.error("EventSource failed:", err)
      setError(err as ErrorEvent)
      eventSource.close()
      if (afterStreaming) {
        afterStreaming(message)
      }
    }
  }

  return { message, error }
}
