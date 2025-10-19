import "~style.css"

import { Book, Chrome, Dot, Github } from "lucide-react"

import { Button } from "~components/button"
import StaticLogo from "~components/logo"
import { Settings } from "~components/settings"

export default function Popup() {
  return (
    <div className="ce-flex ce-flex-col ce-items-center ce-mt-5 ce-min-w-[400px] ce-min-h-[300px]">
      <div className="ce-flex ce-gap-2 ce-items-center">
        <StaticLogo width={24} height={24} color="#C15E50" />
        CORE
      </div>

      <div className="ce-flex ce-my-5 ce-items-center">
        <Button
          variant="secondary"
          className="ce-gap-2 ce-items-center"
          onClick={() => {
            window.open("https://docs.heysol.ai", "_blank")
          }}>
          <Book size={14} />
          Docs
        </Button>
        <Dot size={28} className="ce-relative ce-top-[2px]" />
        <Button
          variant="secondary"
          className="ce-gap-2 ce-items-center"
          onClick={() => {
            window.open(
              "https://docs.heysol.ai/providers/browser-extension",
              "_blank"
            )
          }}>
          <Chrome size={14} />
          Extension guide
        </Button>
        <Dot size={28} className="ce-relative ce-top-[2px]" />

        <Button
          variant="secondary"
          className="ce-gap-2 ce-items-center"
          onClick={() => {
            window.open("https://github.com/redplanethq/core", "_blank")
          }}>
          <Github size={14} />
          Github
        </Button>
      </div>
      <Settings />
    </div>
  )
}
