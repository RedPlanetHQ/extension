if (chrome.sidePanel) {
  // Chrome 114+ — disable popup and open sidepanel on icon click
  chrome.action.setPopup({ popup: "" })
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error)
}
// No sidePanel (Arc, Firefox, older Chrome) — popup.tsx opens as default
