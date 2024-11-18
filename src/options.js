document.addEventListener('DOMContentLoaded', () => {
  const customShortcutInput = document.getElementById('customShortcut');
  const saveShortcutButton = document.getElementById('saveShortcut');
  const currentShortcutSpan = document.getElementById('currentShortcut');

  // Load current shortcut
  chrome.storage.sync.get(['customShortcut'], (result) => {
    if (result.customShortcut) {
      currentShortcutSpan.textContent = result.customShortcut;
    } else {
      currentShortcutSpan.textContent = 'Ctrl+Shift+K (default)';
    }
  });

  // Save custom shortcut
  saveShortcutButton.addEventListener('click', () => {
    const shortcut = customShortcutInput.value.trim();
    if (shortcut) {
      chrome.storage.sync.set({ customShortcut: shortcut }, () => {
        chrome.commands.update({
          name: "_execute_action",
          shortcut: shortcut
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error updating shortcut:', chrome.runtime.lastError);
            alert('Error updating shortcut. Please try a different combination.');
          } else {
            alert('Custom shortcut saved successfully!');
            currentShortcutSpan.textContent = shortcut;
            customShortcutInput.value = '';
          }
        });
      });
    }
  });
});
