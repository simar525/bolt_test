let selectedText = '';

document.addEventListener('mouseup', () => {
  selectedText = window.getSelection().toString().trim();
  chrome.runtime.sendMessage({action: "updateSelectedText", text: selectedText});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    sendResponse({selectedText: selectedText});
  }
});
