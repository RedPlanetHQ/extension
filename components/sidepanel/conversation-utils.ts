import type { UIMessagePart } from "ai"

export const getToolDisplayName = (toolType: string): string => {
  const name = toolType.replace("tool-", "")
  const displayNameMap: Record<string, string> = {
    gather_context: "Gather context",
    take_action: "Take action",
    integration_query: "Integration explorer",
    integration_action: "Integration explorer",
    memory_search: "Memory explorer",
    execute_integration_action: "Execute integration action",
    get_integration_actions: "Get integration actions",
    decision: "Decision",
    silent_action: "Silent action"
  }
  if (displayNameMap[name]) return displayNameMap[name]
  if (name.startsWith("gateway_")) {
    const gatewayName = name.replace("gateway_", "").replace(/_/g, " ")
    return `Gateway: ${gatewayName.charAt(0).toUpperCase() + gatewayName.slice(1)}`
  }
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const getNestedParts = (output: any): any[] => {
  if (!output) return []
  if (output.parts && Array.isArray(output.parts)) return output.parts
  if (output.content && Array.isArray(output.content)) return output.content
  return []
}

export const hasNeedsApprovalDeep = (parts: UIMessagePart[]): boolean => {
  for (const part of parts) {
    const p = part as any
    if (p.state === "approval-requested") return true
    const nestedParts = getNestedParts(p.output)
    if (nestedParts.length > 0 && hasNeedsApprovalDeep(nestedParts)) return true
  }
  return false
}

export const findAllToolsDeep = (parts: UIMessagePart[]): any[] => {
  const tools: any[] = []
  const traverse = (partList: any[]) => {
    for (const part of partList) {
      if (part.type?.includes("tool-")) tools.push(part)
      const nestedParts = getNestedParts(part.output)
      if (nestedParts.length > 0) traverse(nestedParts)
    }
  }
  traverse(parts)
  return tools
}

export const findFirstPendingApprovalIndex = (parts: UIMessagePart[]): number => {
  const allTools = findAllToolsDeep(parts)
  return allTools.findIndex((part) => part.state === "approval-requested")
}

export const isToolDisabled = (
  part: any,
  allPartsFlat: any[],
  firstPendingIndex: number
): boolean => {
  if (firstPendingIndex === -1) return false
  const toolIndex = allPartsFlat.indexOf(part)
  return toolIndex > firstPendingIndex && part.state === "approval-requested"
}
