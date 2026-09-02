document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    setupEventListeners();
    document.getElementById('priorityFilter').value = state.filterPriority;
    document.getElementById('sortBySelect').value = state.sortBy;
    setActiveTab(state.activeTab || 'todo');
    render();
    setInterval(renderTimestampsOnly, 30000);
    refreshDevinConfig();
    startDevinPolling();
    pollDevinSessions();
});
