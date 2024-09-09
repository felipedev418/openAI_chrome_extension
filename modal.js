chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const contentDiv = document.getElementById('content');
    if (request.action === "showResults") {
        contentDiv.textContent = request.data;
    } else if (request.action === "showError") {
        contentDiv.textContent = "Error: " + request.error;
        contentDiv.style.color = "red";
    }
});