import { useEffect, useState } from "react"

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const handleChange = () => {
      setPathname(window.location.pathname)
    }

    // Monitor for changes
    const observer = new MutationObserver(handleChange)
    observer.observe(document.body, { childList: true, subtree: true })

    window.addEventListener("popstate", handleChange)

    // Intercept navigation
    const pushState = history.pushState
    history.pushState = function (...args) {
      pushState.apply(this, args)
      handleChange()
    }

    return () => {
      observer.disconnect()
      window.removeEventListener("popstate", handleChange)
      history.pushState = pushState
    }
  }, [])

  return pathname
}
