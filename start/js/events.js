function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const addCard = document.getElementById('addTodoCard');

    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    titleInput.addEventListener('input', () => {
        document.getElementById('titleCounter').textContent = `${40 - titleInput.value.length} left`;
    });
    descInput.addEventListener('input', () => {
        document.getElementById('descCounter').textContent = `${150 - descInput.value.length} left`;
    });

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);
    document.getElementById('taskTitleInput').addEventListener('input', (e) => {
        document.getElementById('taskTitleCounter').textContent = `${40 - e.target.value.length} left`;
    });
    document.getElementById('taskDescInput').addEventListener('input', (e) => {
        document.getElementById('taskDescCounter').textContent = `${150 - e.target.value.length} left`;
    });

    document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; saveToStorage(); render(); });
    document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; saveToStorage(); render(); });

    titleInput.addEventListener('focus', () => addCard.classList.add('expanded'));
    document.addEventListener('click', (e) => {
        if (addCard.contains(e.target)) return;
        if (titleInput.value.trim() === '' && descInput.value.trim() === '') {
            addCard.classList.remove('expanded');
        }
    });

    document.querySelectorAll('.board-column').forEach(col => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            moveTask(e.dataTransfer.getData('text/plain'), col.getAttribute('data-column'));
        });
    });

    const actionsBtn = document.getElementById('headerActionsBtn');
    const actionsMenu = document.getElementById('headerActionsMenu');
    actionsBtn.addEventListener('click', (e) => { e.stopPropagation(); actionsMenu.classList.toggle('hidden'); });
    document.addEventListener('click', (e) => {
        if (!actionsMenu.contains(e.target)) actionsMenu.classList.add('hidden');
        if (!document.getElementById('contextMenu').contains(e.target)) hideContextMenu();
        if (!document.getElementById('badgePriorityMenu').contains(e.target)) hideBadgePriorityMenu();
    });
    document.addEventListener('contextmenu', () => { hideContextMenu(); hideBadgePriorityMenu(); });

    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        actionsMenu.classList.add('hidden');
        if (!await requestConfirmation('Load Sample Data', 'This will replace your current tasks with sample data. Continue?')) return;
        loadDemoData();
        render();
        showToast('Sample data loaded.', 'success');
    });
    document.getElementById('actCleanDone').addEventListener('click', async () => {
        actionsMenu.classList.add('hidden');
        const doneCount = state.tasks.filter(t => t.completed).length;
        if (doneCount === 0) { showToast('No completed tasks to clean.', 'info'); return; }
        if (!await requestConfirmation('Clean Done', `Permanently delete ${doneCount} completed task(s)?`)) return;
        state.tasks = state.tasks.filter(t => !t.completed);
        saveToStorage();
        render();
        showToast(`Removed ${doneCount} completed task(s).`, 'success');
    });
    document.getElementById('actCleanAll').addEventListener('click', async () => {
        actionsMenu.classList.add('hidden');
        if (state.tasks.length === 0) { showToast('The board is already empty.', 'info'); return; }
        if (!await requestConfirmation('Clean All', 'Permanently delete ALL tasks on the board?')) return;
        state.tasks = [];
        saveToStorage();
        render();
        showToast('All tasks removed.', 'success');
    });

    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });
}

function setActiveTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.board-column').forEach(c => c.classList.toggle('active-tab', c.dataset.column === tab));
    saveToStorage();
}
