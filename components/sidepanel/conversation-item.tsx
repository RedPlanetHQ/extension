import { EditorContent, useEditor } from "@tiptap/react"
import {
  type ChatAddToolApproveResponseFunction,
  type ToolUIPart,
  type UIMessage
} from "ai"
import {
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  TriangleAlert
} from "lucide-react"
import { memo, useEffect, useState } from "react"

import StaticLogo from "~/components/logo"
import { Button } from "~/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "~/components/ui/collapsible"
import { cn } from "~/components/utils"

import { extensionsForConversation } from "../editor-extensions"
import { ApprovalComponent } from "./approval-component"
import {
  findAllToolsDeep,
  findFirstPendingApprovalIndex,
  getToolDisplayName,
  hasNeedsApprovalDeep,
  isToolDisabled
} from "./conversation-utils"

const getNestedPartsFromOutput = (output: any): any[] => {
  if (!output) return []
  if (output.parts && Array.isArray(output.parts)) return output.parts
  if (output.content && Array.isArray(output.content)) return output.content
  return []
}

const Tool = ({
  part,
  addToolApprovalResponse,
  isDisabled = false,
  allToolsFlat = [],
  firstPendingApprovalIdx = -1,
  isNested = false
}: {
  part: ToolUIPart<any>
  addToolApprovalResponse: ChatAddToolApproveResponseFunction
  isDisabled?: boolean
  allToolsFlat?: any[]
  firstPendingApprovalIdx?: number
  isNested?: boolean
}) => {
  const needsApproval = part.state === "approval-requested"
  const allNestedParts = getNestedPartsFromOutput((part as any).output)
  const nestedToolParts = allNestedParts.filter((item: any) =>
    item.type?.includes("tool-")
  )
  const hasNestedTools = nestedToolParts.length > 0
  const hasNestedApproval =
    hasNestedTools && hasNeedsApprovalDeep(nestedToolParts)
  const [isOpen, setIsOpen] = useState(needsApproval || hasNestedApproval)

  const textParts = allNestedParts.filter(
    (item: any) =>
      !item.type?.includes("tool-") && (item.text || item.type === "text")
  )
  const textPart = textParts
    .map((t: any) => t.text)
    .filter(Boolean)
    .join("\n")

  const handleApprove = () => {
    if (addToolApprovalResponse && (part as any)?.approval?.id && !isDisabled) {
      addToolApprovalResponse({ id: (part as any).approval.id, approved: true })
      setIsOpen(false)
    }
  }

  const handleReject = () => {
    if (addToolApprovalResponse && (part as any)?.approval?.id && !isDisabled) {
      addToolApprovalResponse({
        id: (part as any).approval.id,
        approved: false
      })
      setIsOpen(false)
    }
  }

  useEffect(() => {
    if (needsApproval || hasNestedApproval) setIsOpen(true)
  }, [needsApproval, hasNestedApproval])

  function getIcon() {
    if (
      part.state === "output-available" ||
      part.state === "approval-requested" ||
      part.state === "approval-responded"
    ) {
      return <StaticLogo width={18} height={18} color="#C15E50" />
    }
    if (part.state === "output-denied") {
      return <TriangleAlert size={18} />
    }
    return <LoaderCircle className="ce-h-4 ce-w-4 ce-animate-spin" />
  }

  const displayName = getToolDisplayName(part.type)

  const renderLeafContent = () => {
    if (needsApproval) {
      if (isDisabled) {
        return (
          <div className="ce-text-muted-foreground ce-py-1 ce-text-sm">
            Waiting for previous tool approval...
          </div>
        )
      }
      return (
        <ApprovalComponent onApprove={handleApprove} onReject={handleReject} />
      )
    }

    const args = (part as any).input
    const hasArgs = args && Object.keys(args).length > 0
    const output = (part as any).output
    const outputContent = output?.content || output

    return (
      <div className="ce-py-1">
        {hasArgs && (
          <>
            <p className="ce-text-muted-foreground ce-mb-1 ce-text-xs ce-font-medium">
              Input
            </p>
            <pre className="ce-bg-grayAlpha-100 ce-mb-2 ce-max-h-[200px] ce-overflow-auto ce-rounded ce-p-2 ce-font-mono ce-text-xs ce-text-[#6B8E23]">
              {JSON.stringify(args, null, 2)}
            </pre>
          </>
        )}
        <p className="ce-text-muted-foreground ce-mb-1 ce-text-xs ce-font-medium">
          Result
        </p>
        <pre className="ce-bg-grayAlpha-100 ce-max-h-[200px] ce-overflow-auto ce-rounded ce-p-2 ce-font-mono ce-text-xs ce-text-[#BF4594]">
          {typeof outputContent === "string"
            ? outputContent
            : JSON.stringify(outputContent, null, 2)}
        </pre>
      </div>
    )
  }

  const renderNestedContent = () => (
    <div className="ce-mt-1">
      {nestedToolParts.map((nestedPart: any, idx: number) => {
        const nestedDisabled = isToolDisabled(
          nestedPart,
          allToolsFlat,
          firstPendingApprovalIdx
        )
        return (
          <Tool
            key={`nested-${idx}`}
            part={nestedPart}
            addToolApprovalResponse={addToolApprovalResponse}
            isDisabled={nestedDisabled}
            allToolsFlat={allToolsFlat}
            firstPendingApprovalIdx={firstPendingApprovalIdx}
            isNested
          />
        )
      })}
      {textPart && (
        <div className="ce-py-1">
          <p className="ce-text-muted-foreground ce-mb-1 ce-text-xs ce-font-medium">
            Response
          </p>
          <p className="ce-font-mono ce-text-xs ce-text-[#BF4594]">
            {textPart}
          </p>
        </div>
      )}
    </div>
  )

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "ce-w-full",
        isNested && "ce-ml-3 ce-border-l ce-border-gray-300 ce-pl-3",
        !isNested && "ce-my-1",
        isDisabled && "ce-cursor-not-allowed ce-opacity-50"
      )}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "ce-flex ce-items-center ce-gap-2 ce-py-1 ce-text-left",
            isDisabled && "ce-cursor-not-allowed"
          )}
          disabled={isDisabled}>
          {getIcon()}
          <span>{displayName}</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className={cn("ce-w-full", isNested && "ce-pl-3")}>
        {hasNestedTools ? renderNestedContent() : renderLeafContent()}
      </CollapsibleContent>
    </Collapsible>
  )
}

interface ConversationItemProps {
  message: UIMessage
  addToolApprovalResponse: ChatAddToolApproveResponseFunction
}

const ConversationItemComponent = ({
  message,
  addToolApprovalResponse
}: ConversationItemProps) => {
  const isUser = message.role === "user"
  const textPart = message.parts.find((part) => part.type === "text")
  const [showAllTools, setShowAllTools] = useState(false)
  console.log(message, isUser)

  const editor = useEditor({
    extensions: [...extensionsForConversation],
    editable: false,
    content: textPart ? (textPart as any).text : "",
    immediatelyRender: false
  })

  useEffect(() => {
    if (textPart) {
      editor?.commands.setContent((textPart as any).text)
    }
  }, [message])

  if (!message) return null

  const groupedParts: Array<{ type: "tool-group" | "single"; parts: any[] }> =
    []
  let currentToolGroup: any[] = []

  message.parts.forEach((part) => {
    if ((part as any).type?.includes("tool-")) {
      currentToolGroup.push(part)
    } else {
      if (currentToolGroup.length > 0) {
        groupedParts.push({ type: "tool-group", parts: [...currentToolGroup] })
        currentToolGroup = []
      }
      groupedParts.push({ type: "single", parts: [part] })
    }
  })
  if (currentToolGroup.length > 0) {
    groupedParts.push({ type: "tool-group", parts: [...currentToolGroup] })
  }

  const handleToolApproval = (params: { id: string; approved: boolean }) => {
    addToolApprovalResponse(params)
    if (!params.approved) {
      const allTools = findAllToolsDeep(message.parts)
      const currentToolIndex = allTools.findIndex(
        (part: any) => part.approval?.id === params.id
      )
      if (currentToolIndex !== -1) {
        allTools.slice(currentToolIndex + 1).forEach((part: any) => {
          if (part.state === "approval-requested" && part.approval?.id) {
            setTimeout(() => {
              addToolApprovalResponse({
                id: part.approval.id,
                approved: false,
                reason: "don't call this"
              })
            }, 100)
          }
        })
      }
    }
  }

  const allToolsFlat = findAllToolsDeep(message.parts)
  const firstPendingApprovalIdx = findFirstPendingApprovalIndex(message.parts)

  const getComponent = (part: any, disabled = false) => {
    if (part.type?.includes("tool-")) {
      return (
        <Tool
          part={part}
          addToolApprovalResponse={handleToolApproval}
          isDisabled={disabled}
          allToolsFlat={allToolsFlat}
          firstPendingApprovalIdx={firstPendingApprovalIdx}
        />
      )
    }
    if (part.type === "text") {
      return <EditorContent editor={editor} className="editor-container" />
    }
    if (part.type === "file" && (part as any).mediaType?.startsWith("image/")) {
      return (
        <img
          src={(part as any).url}
          alt={(part as any).filename ?? "attachment"}
          className="ce-mt-2 ce-max-h-[400px] ce-max-w-full ce-rounded-md ce-object-contain"
        />
      )
    }
    return null
  }

  return (
    <div
      className={cn(
        "ce-flex ce-w-full ce-gap-2 ce-px-4 ce-pb-2",
        isUser && "ce-my-4 ce-justify-end"
      )}>
      <div
        className={cn(
          "ce-flex ce-w-full ce-flex-col",
          isUser &&
            "ce-bg-primary/20 ce-w-fit ce-max-w-[500px] ce-rounded-md ce-p-3"
        )}>
        {groupedParts.map((group, groupIndex) => {
          if (group.type === "single") {
            return (
              <div key={`single-${groupIndex}`}>
                {getComponent(group.parts[0])}
              </div>
            )
          }

          const toolGroup = group.parts
          const shouldCollapse = toolGroup.length > 3
          const visibleTools =
            shouldCollapse && !showAllTools ? toolGroup.slice(0, 2) : toolGroup
          const hiddenCount = shouldCollapse ? toolGroup.length - 2 : 0

          return (
            <div key={`group-${groupIndex}`}>
              {visibleTools.map((part, index) => {
                const disabled = isToolDisabled(
                  part,
                  allToolsFlat,
                  firstPendingApprovalIdx
                )
                return (
                  <div key={`tool-${groupIndex}-${index}`}>
                    {getComponent(part, disabled)}
                  </div>
                )
              })}
              {shouldCollapse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTools(!showAllTools)}
                  className="ce-text-muted-foreground hover:ce-text-foreground ce-mt-2 ce-self-start ce-text-sm">
                  {showAllTools
                    ? "Show less"
                    : `Show ${hiddenCount} more tool${hiddenCount > 1 ? "s" : ""}...`}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const ConversationItem = memo(
  ConversationItemComponent,
  (prev, next) => prev.message === next.message
)
