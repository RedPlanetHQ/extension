import { useEffect, useState } from "react"

export const useStreamReader = (
  stream: ReadableStream<Uint8Array>,
  afterStreaming?: (finalMessage: string) => void
) => {
  const [message, setMessage] = useState("")
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!stream) return

    let finalMessage = ""

    const readStream = async () => {
      try {
        const reader = stream.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            // Streaming complete
            if (afterStreaming) {
              afterStreaming(finalMessage)
            }
            break
          }

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true })

          // Parse SSE format - split by newlines
          const lines = chunk.split("\n")

          for (const line of lines) {
            // SSE format: lines start with "data: "
            if (line.startsWith("data: ")) {
              try {
                const jsonStr = line.slice(6) // Remove "data: " prefix
                const data = JSON.parse(jsonStr)

                // Look for text-delta events and append the delta
                if (data.type === "text-delta" && data.delta) {
                  finalMessage += data.delta
                  setMessage((prev) => prev + data.delta)
                }
              } catch (e) {
                // Skip if JSON parsing fails
                console.debug("Failed to parse SSE line:", line)
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to read stream:", err)
        setError(err as Error)
      }
    }

    readStream()
  }, [stream, afterStreaming])

  return { message, error }
}
