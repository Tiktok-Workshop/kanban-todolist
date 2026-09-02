document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    setupEventListeners();
    render();
    refreshDevinConfig();
    startDevinPolling();
    pollDevinSessions();
});
