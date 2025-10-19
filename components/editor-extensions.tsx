import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Heading from "@tiptap/extension-heading"
import Table from "@tiptap/extension-table"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import TableRow from "@tiptap/extension-table-row"
import { mergeAttributes, type Extension } from "@tiptap/react"
import { cx } from "class-variance-authority"
import { all, createLowlight } from "lowlight"
import { HorizontalRule, Placeholder, StarterKit, TiptapLink } from "novel"

// create a lowlight instance with all languages loaded
export const lowlight = createLowlight(all)

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx("ce-text-primary ce-cursor-pointer")
  }
})

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("ce-my-2 ce-border-t ce-border-muted-foreground")
  }
})

const heading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level)
    const level: 1 | 2 | 3 = hasLevel
      ? node.attrs.level
      : this.options.levels[0]
    const levelMap = { 1: "ce-text-2xl", 2: "ce-text-xl", 3: "ce-text-lg" }

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `heading-node h${node.attrs.level}-style ${levelMap[level]} ce-my-[1rem] ce-font-medium`
      }),
      0
    ]
  }
}).configure({ levels: [1, 2, 3] })

const defaultPlaceholder = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === "heading") {
      return `Heading ${node.attrs.level}`
    }
    if (node.type.name === "image" || node.type.name === "table") {
      return ""
    }
    if (node.type.name === "codeBlock") {
      return "Type in your code here..."
    }

    return "Write here..."
  },
  includeChildren: true
})

export const getPlaceholder = (placeholder: string | Extension) => {
  if (!placeholder) {
    return defaultPlaceholder
  }

  if (typeof placeholder === "string") {
    return Placeholder.configure({
      placeholder: () => {
        return placeholder
      },
      includeChildren: true
    })
  }

  return placeholder
}

export const starterKit = StarterKit.configure({
  heading: false,
  history: false,
  bulletList: {
    HTMLAttributes: {
      class: cx(
        "ce-list-disc ce-list-outside ce-pl-4 ce-leading-1 ce-my-1 ce-mb-1.5"
      )
    }
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("ce-list-decimal ce-list-outside ce-pl-4 ce-leading-1 ce-my-1")
    }
  },
  listItem: {
    HTMLAttributes: {
      class: cx("ce-mt-1.5")
    }
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("ce-border-l-4 ce-border-gray-400 dark:ce-border-gray-500")
    }
  },
  paragraph: {
    HTMLAttributes: {
      class: cx("ce-leading-[24px] ce-mt-[1rem] paragraph-node")
    }
  },
  codeBlock: false,
  code: {
    HTMLAttributes: {
      class: cx(
        "ce-rounded ce-bg-grayAlpha-100 ce-text-[#BF4594] ce-px-1.5 ce-py-1 ce-font-mono ce-font-medium ce-border-none"
      ),
      spellcheck: "false"
    }
  },
  horizontalRule: false,
  dropcursor: {
    color: "#DBEAFE",
    width: 4
  },
  gapcursor: false
})

export const extensionsForConversation = [
  starterKit,
  tiptapLink,
  horizontalRule,
  heading,
  Table.configure({
    resizable: true
  }),
  TableRow,
  TableHeader,
  TableCell,
  CodeBlockLowlight.configure({
    lowlight
  })
]
