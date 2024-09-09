document.addEventListener('DOMContentLoaded', function() {
    const configForm = document.getElementById('config-form');
    const statusDiv = document.getElementById('result');
  
    // Load saved configuration
    chrome.storage.sync.get(['apiKey', 'url', 'path', 'prompt', 'model'], function(items) {
      document.getElementById('apiKey').value = items.apiKey || '';
      document.getElementById('url').value = items.url || '';
      document.getElementById('path').value = items.path || '';
      document.getElementById('prompt').value = items.prompt || '';
      document.getElementById('model').value = items.model || '';
    });
  
    // Save configuration
    configForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const config = {
        apiKey: document.getElementById('apiKey').value,
        url: document.getElementById('url').value,
        path: document.getElementById('path').value,
        prompt: document.getElementById('prompt').value,
        model: document.getElementById('model').value
      };
  
      chrome.storage.sync.set(config, function() {
        statusDiv.textContent = 'Configuration saved!';
        setTimeout(() => { statusDiv.textContent = ''; }, 2000);
      });
    });
  });
  