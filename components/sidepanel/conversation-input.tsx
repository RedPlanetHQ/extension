import { Document } from "@tiptap/extension-document"
import HardBreak from "@tiptap/extension-hard-break"
import { History } from "@tiptap/extension-history"
import { Paragraph } from "@tiptap/extension-paragraph"
import { Text } from "@tiptap/extension-text"
import { type Editor } from "@tiptap/react"
import { ArrowUp } from "lucide-react"
import { EditorContent, EditorRoot, Placeholder } from "novel"
import { useCallback, useRef, useState } from "react"

import { cn } from "~/components/utils"
import { Button } from "~components/ui/button"

interface ConversationInputProps {
  onSubmit: (message: string) => Promise<void>
  loading?: boolean
}

export function ConversationInput({
  onSubmit,
  loading
}: ConversationInputProps) {
  const [content, setContent] = useState("")
  const [editor, setEditor] = useState<Editor>()
  const editorRef = useRef<any>(null)

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || loading) return
    const message = content
    editor?.commands.clearContent()
    setContent("")
    await onSubmit(message)
  }, [content, editor, loading, onSubmit])

  return (
    <div className="ce-flex ce-w-full ce-flex-col ce-items-center ce-px-4 ce-pb-4">
      <div className="ce-w-full ce-max-w-[70ch]">
        <div className="ce-bg-background-3 ce-rounded-xl">
          <EditorRoot>
            <EditorContent
              ref={editorRef}
              autofocus
              extensions={[
                Placeholder.configure({
                  placeholder: () => "Ask corebrain...",
                  includeChildren: true
                }),
                Document,
                Paragraph,
                Text,
                HardBreak.configure({ keepMarks: true }),
                History
              ]}
              onCreate={({ editor }) => setEditor(editor)}
              editorProps={{
                attributes: {
                  class:
                    "ce-prose ce-prose-sm dark:ce-prose-invert focus:ce-outline-none ce-max-w-full"
                },
                handleKeyDown: (_view: any, event: KeyboardEvent) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    handleSubmit()
                    return true
                  }
                  return false
                }
              }}
              immediatelyRender={false}
              className="ce-max-h-[160px] ce-min-h-[52px] ce-w-full ce-overflow-auto ce-px-3 ce-pt-3 ce-text-sm"
              onUpdate={({ editor }: { editor: any }) => {
                setContent(editor.getText())
              }}
            />
          </EditorRoot>
          <div className="ce-flex ce-justify-end ce-px-2 ce-pb-2 ce-pt-1">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="ce-gap-1 ce-rounded">
              <ArrowUp size={14} />
              Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
