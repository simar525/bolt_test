import { Configuration, OpenAIApi } from "openai";

let openai;
let userApiKey = '';

document.addEventListener('DOMContentLoaded', () => {
  const selectedTextArea = document.getElementById('selectedText');
  const customPrompts = document.getElementById('customPrompts');
  const newPromptInput = document.getElementById('newPrompt');
  const addPromptButton = document.getElementById('addPrompt');
  const resultDiv = document.getElementById('resultContent');
  const modelRadios = document.getElementsByName('model');
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiKeyButton = document.getElementById('saveApiKey');
  const removeApiKeyButton = document.getElementById('removeApiKey');

  document.getElementById('copyResult').addEventListener('click', () => {
    const resultText = document.getElementById('resultContent').textContent;
    navigator.clipboard.writeText(resultText).then(() => {
      alert('Result copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  });
  


  // Load API key
  chrome.storage.sync.get(['openaiApiKey'], (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
      userApiKey = result.openaiApiKey;
      initializeOpenAI(userApiKey);
    } else {
      initializeOpenAI(process.env.OPENAI_API_KEY);
    }
  });

  // Load selected text
  chrome.runtime.sendMessage({action: "getSelectedText"}, (response) => {
    if (response && response.selectedText) {
      selectedTextArea.value = response.selectedText;
    }
  });

  // Save API key
  saveApiKeyButton.addEventListener('click', () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
        alert('API key saved successfully!');
        userApiKey = apiKey;
        initializeOpenAI(userApiKey);
      });
    }
  });

  // Remove API key
  removeApiKeyButton.addEventListener('click', () => {
    chrome.storage.sync.remove('openaiApiKey', () => {
      alert('API key removed successfully!');
      apiKeyInput.value = '';
      userApiKey = '';
      initializeOpenAI(process.env.OPENAI_API_KEY);
    });
  });

  function initializeOpenAI(apiKey) {
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    openai = new OpenAIApi(configuration);
  }

  // Load custom prompts
  loadCustomPrompts();

  // Add new custom prompt
  addPromptButton.addEventListener('click', () => {
    const newPrompt = newPromptInput.value.trim();
    if (newPrompt) {
      const promptName = prompt("Enter a short name for this prompt:");
      if (promptName) {
        addCustomPromptButton(promptName, newPrompt);
        chrome.storage.sync.get(['customPrompts'], (result) => {
          const prompts = result.customPrompts || [];
          prompts.push({ name: promptName, prompt: newPrompt });
          chrome.storage.sync.set({customPrompts: prompts});
        });
        newPromptInput.value = '';
      }
    }
  });

  // Handle prompt button clicks
  document.body.addEventListener('click', async (e) => {
    if (e.target.tagName === 'BUTTON' && e.target.dataset.prompt) {
      const prompt = e.target.dataset.prompt;
      const text = selectedTextArea.value;
      const model = Array.from(modelRadios).find(radio => radio.checked).value;
      try {
        resultDiv.textContent = "Processing...";
        const result = await processPrompt(prompt, text, model);
        resultDiv.textContent = result;
      } catch (error) {
        resultDiv.textContent = `Error: ${error.message}`;
      }
    }
  });

  // Replace the loadCustomPrompts function with this:
function loadCustomPrompts() {
  chrome.storage.sync.get(['customPrompts'], (result) => {
    const prompts = result.customPrompts || [];
    const dropdown = document.getElementById('customPromptsDropdown');
    
    // Clear existing options except the first one
    while (dropdown.options.length > 1) {
      dropdown.remove(1);
    }
    
    prompts.forEach(prompt => {
      const option = document.createElement('option');
      option.value = prompt.prompt;
      option.textContent = prompt.name;
      dropdown.appendChild(option);
    });
  });
}

// Add this event listener for the dropdown
document.getElementById('customPromptsDropdown').addEventListener('change', async (e) => {
  const selectedPrompt = e.target.value;
  if (selectedPrompt) {
    const text = document.getElementById('selectedText').value;
    const model = Array.from(document.getElementsByName('model')).find(radio => radio.checked).value;
    
    try {
      const resultDiv = document.getElementById('resultContent');
      resultDiv.textContent = "Processing...";
      resultDiv.classList.add('processing');
      
      const result = await processPrompt(selectedPrompt, text, model);
      resultDiv.textContent = result;
      resultDiv.classList.remove('processing');
    } catch (error) {
      resultDiv.textContent = `Error: ${error.message}`;
      resultDiv.classList.remove('processing');
    }
  }
});

  function addCustomPromptButton(name, prompt) {
    const container = document.createElement('div');
    container.className = 'custom-prompt-container group';

    const button = document.createElement('button');
    button.textContent = name;
    button.dataset.prompt = prompt;
    button.className = 'custom-prompt-btn';

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '&times;';
    deleteButton.className = 'custom-prompt-delete';
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      chrome.storage.sync.get(['customPrompts'], (result) => {
        const prompts = result.customPrompts || [];
        const updatedPrompts = prompts.filter(p => p.name !== name);
        chrome.storage.sync.set({customPrompts: updatedPrompts}, () => {
          container.remove();
        });
      });
    });

    container.appendChild(button);
    container.appendChild(deleteButton);
    customPrompts.appendChild(container);
  }

  async function processPrompt(prompt, text, model) {
    const apiKey = userApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("No API key available. Please add your OpenAI API key.");
    }

    const messages = [
      { role: "system", content: "You are a helpful assistant that processes text based on given prompts." },
      { role: "user", content: `${prompt}: ${text}` }
    ];

    const response = await openai.createChatCompletion({
      model: model,
      messages: messages,
    });

    return response.data.choices[0].message.content;
  }
});
