let currentSelectedText = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateSelectedText") {
    currentSelectedText = request.text;
  } else if (request.action === "getSelectedText") {
    sendResponse({selectedText: currentSelectedText});
  }
  return true;
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText"}, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else if (response && response.selectedText) {
          currentSelectedText = response.selectedText;
          chrome.action.openPopup();
        }
      });
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['customShortcut'], (result) => {
    if (result.customShortcut) {
      chrome.commands.update({
        name: "_execute_action",
        shortcut: result.customShortcut
      });
    }
  });
});
