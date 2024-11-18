document.addEventListener('DOMContentLoaded', () => {
  const selectedTextArea = document.getElementById('selectedText');
  const prebuiltPrompts = document.getElementById('prebuiltPrompts');
  const customPrompts = document.getElementById('customPrompts');
  const newPromptInput = document.getElementById('newPrompt');
  const addPromptButton = document.getElementById('addPrompt');
  const resultDiv = document.getElementById('result');

  // Load selected text
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText"}, (response) => {
      if (response && response.selectedText) {
        selectedTextArea.value = response.selectedText;
      }
    });
  });

  // Load custom prompts
  chrome.storage.sync.get(['customPrompts'], (result) => {
    const prompts = result.customPrompts || [];
    prompts.forEach(prompt => addCustomPromptButton(prompt));
  });

  // Add new custom prompt
  addPromptButton.addEventListener('click', () => {
    const newPrompt = newPromptInput.value.trim();
    if (newPrompt) {
      addCustomPromptButton(newPrompt);
      chrome.storage.sync.get(['customPrompts'], (result) => {
        const prompts = result.customPrompts || [];
        prompts.push(newPrompt);
        chrome.storage.sync.set({customPrompts: prompts});
      });
      newPromptInput.value = '';
    }
  });

  // Handle prompt button clicks
  document.body.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.prompt) {
      const prompt = e.target.dataset.prompt;
      const text = selectedTextArea.value;
      processPrompt(prompt, text);
    }
  });

  function addCustomPromptButton(prompt) {
    const button = document.createElement('button');
    button.textContent = prompt;
    button.dataset.prompt = prompt;
    customPrompts.appendChild(button);
  }

  function processPrompt(prompt, text) {
    // In a real application, you would send this to an AI service.
    // For this example, we'll just show a placeholder result.
    resultDiv.textContent = `Processed "${text}" with prompt "${prompt}". AI result would appear here.`;
  }
});
