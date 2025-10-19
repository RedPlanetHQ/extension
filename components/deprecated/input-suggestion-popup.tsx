import { useCallback, useEffect, useState } from "react"

import { searchFacts } from "~utils/api"

import { Button } from "../button"
import StaticLogo from "../logo"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"

interface InputSuggestionsPopupProps {
  onClose: () => void
  inputValue: string
  position: { top: number; left: number }
  onFactSelect?: (fact: string) => void
}

export default function InputSuggestionsPopup({
  onClose,
  inputValue,
  position,
  onFactSelect
}: InputSuggestionsPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [facts, setFacts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const fetchFacts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFacts([])
      return
    }

    setIsLoading(true)
    try {
      const result = await searchFacts(query)
      setFacts(result?.facts || [])
    } catch (error) {
      console.error("Error fetching facts:", error)
      setFacts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced effect for API calls
  useEffect(() => {
    if (!isOpen || !inputValue.trim()) {
      return
    }

    const timeoutId = setTimeout(() => {
      fetchFacts(inputValue)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputValue, isOpen, fetchFacts])

  // Auto-hide after 10 seconds
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      setIsOpen(false)
      onClose()
    }, 10000)

    return () => clearTimeout(timer)
  }, [isOpen, onClose])

  const handleFactSelect = (fact: string) => {
    if (onFactSelect) {
      onFactSelect(fact)
    }
    setIsOpen(false)
    onClose()
  }

  const handleAddAllFacts = () => {
    if (onFactSelect && facts.length > 0) {
      const allFactsString = facts.join(" ")
      onFactSelect(allFactsString)
    }
    setIsOpen(false)
    onClose()
  }

  return (
    <div
      className="ce-absolute !ce-font-sans"
      style={{
        top: position.top,
        left: position.left,
        zIndex: 2147483647
      }}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="ce-flex ce-items-center ce-justify-center"
            style={{
              width: "20px",
              height: "20px",
              background: "#c15e50",
              borderRadius: "6px",
              padding: "4px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 1
            }}>
            <StaticLogo width={14} height={14} color="#fff" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="ce-p-2 shadow-1 !ce-bg-background-3"
          align="end"
          style={{ maxWidth: "400px", maxHeight: "300px", overflowY: "auto" }}>
          <div>
            {/* Header */}
            <div className="ce-mb-3 ce-font-medium ce-text-foreground ce-border-b ce-border-border ce-pb-2 ce-flex ce-justify-between ce-items-center">
              <span>AI Suggestions</span>
              <div className="ce-flex ce-gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddAllFacts}>
                  Add all
                </Button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsOpen(false)
                    onClose()
                  }}
                  className="ce-text-muted-foreground hover:ce-text-foreground ce-cursor-pointer ce-text-xl ce-p-0 ce-w-5 ce-h-5 ce-flex ce-items-center ce-justify-center ce-bg-transparent ce-border-none">
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="ce-mb-3">
              {isLoading ? (
                <div className="ce-text-muted-foreground ce-text-sm ce-text-center ce-p-5">
                  Searching for relevant facts...
                </div>
              ) : facts.length > 0 ? (
                facts.map((fact, index) => (
                  <div
                    key={index}
                    onClick={() => handleFactSelect(fact)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={`ce-p-2 ce-m-1 ce-rounded ce-cursor-pointer ce-border ce-border-border ce-transition-colors ${
                      hoveredIndex === index
                        ? "ce-bg-accent"
                        : "ce-bg-background-2"
                    }`}>
                    <div className="ce-text-sm ce-text-foreground ce-leading-relaxed">
                      {fact}
                    </div>
                  </div>
                ))
              ) : (
                <div className="ce-text-muted-foreground ce-text-sm ce-text-center ce-p-5">
                  No relevant suggestions found
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
