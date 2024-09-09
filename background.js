chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "sendToOpenAI",
    title: "Send to OpenAI API",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  if (info.menuItemId === "sendToOpenAI") {
    chrome.storage.sync.get(
      ["apiKey", "url", "path", "prompt", "model"],
      async function (config) {
        const selectedText = info.selectionText;
        console.log(selectedText);
        // const fullPrompt = config.prompt.replace("{selection}", selectedText);
        const fullPrompt = '(' + selectedText +  ')' + config.prompt;
        console.log(fullPrompt);

        try {
          const response = await fetch(`${config.url}${config.path}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
              model: config.model,
              //   model: "gpt-4o-mini",
              messages: [{ role: "user", content: fullPrompt }],
              temperature: 0.7,
            }),
          });
          const data = await response.json();
          const result = data.choices[0].message.content;
          console.log(result);
          // Create and show modal window
          chrome.windows.create(
            {
              url: chrome.runtime.getURL("modal.html"),
              type: "popup",
              width: 400,
              height: 300,
            },
            (window) => {
              const tabId = window.tabs[0].id;

              function sendMessage() {
                chrome.tabs.sendMessage(
                  tabId,
                  {
                    action: "showResults",
                    data: result,
                  },
                  (response) => {
                    if (chrome.runtime.lastError) {
                      console.log("Retrying to send message...");
                      setTimeout(sendMessage, 100); // Retry after 100ms
                    }
                  }
                );
              }
              chrome.tabs.onUpdated.addListener(function listener(
                updatedTabId,
                info
              ) {
                if (updatedTabId === tabId && info.status === "complete") {
                  chrome.tabs.onUpdated.removeListener(listener);
                  sendMessage();
                }
              });
            }
          );
        } catch (error) {
          console.error("Error:", error);
          chrome.windows.create(
            {
              url: chrome.runtime.getURL("modal.html"),
              type: "popup",
              width: 400,
              height: 300,
            },
            (window) => {
              chrome.tabs.sendMessage(window.tabs[0].id, {
                action: "showError",
                error: error.message,
              });
            }
          );
        }
      }
    );
  }
});
