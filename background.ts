const handleClick = (tab) => {
  if (!tab.id) throw new Error("tab id not found")
  chrome.tabs.sendMessage(tab.id, {
    name: "show-dialog"
  })
}

if (chrome.action != undefined) {
  chrome.action.onClicked.addListener(handleClick)
} else {
  chrome.browserAction.onClicked.addListener(handleClick)
}
