let popupOpen = false;
let selectedText = '';

document.addEventListener('mouseup', () => {
  selectedText = window.getSelection().toString().trim();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    sendResponse({selectedText: selectedText});
  } else if (request.action === "togglePopup") {
    if (!popupOpen) {
      createPopup();
    } else {
      removePopup();
    }
  }
});

function createPopup() {
  const popup = document.createElement('div');
  popup.id = 'voila-ai-clone-popup';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 300px;
    height: 400px;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    z-index: 9999;
  `;
  
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('popup.html');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
  `;
  
  popup.appendChild(iframe);
  document.body.appendChild(popup);
  popupOpen = true;
}

function removePopup() {
  const popup = document.getElementById('voila-ai-clone-popup');
  if (popup) {
    popup.remove();
    popupOpen = false;
  }
}
