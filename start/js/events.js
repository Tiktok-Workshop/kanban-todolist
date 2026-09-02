function setActiveTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.board-column').forEach(c => c.classList.toggle('active-tab', c.dataset.column === tab));
    saveToStorage();
}

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
    const taskTitleInput = document.getElementById('taskTitleInput');
    const taskDescInput = document.getElementById('taskDescInput');
    taskTitleInput.addEventListener('input', () => {
        document.getElementById('taskTitleCounter').textContent = `${40 - taskTitleInput.value.length} left`;
    });
    taskDescInput.addEventListener('input', () => {
        document.getElementById('taskDescCounter').textContent = `${150 - taskDescInput.value.length} left`;
    });

    document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; saveToStorage(); render(); });
    document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; saveToStorage(); render(); });

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
    actionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = actionsMenu.classList.contains('hidden');
        hideAllMenus();
        actionsMenu.classList.toggle('hidden', !willOpen);
    });
    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        hideAllMenus();
        if (!await requestConfirmation('Load Sample Data', 'This replaces all current tasks with the sample set. Continue?')) return;
        loadDemoData();
        render();
        showToast('Sample data loaded.', 'success');
    });
    document.getElementById('actCleanDone').addEventListener('click', async () => {
        hideAllMenus();
        const doneCount = state.tasks.filter(t => t.completed).length;
        if (!doneCount) { showToast('No completed tasks to clean.', 'info'); return; }
        if (!await requestConfirmation('Clean Done', `Permanently delete ${doneCount} completed task(s)?`)) return;
        state.tasks = state.tasks.filter(t => !t.completed);
        saveToStorage();
        render();
        showToast(`Removed ${doneCount} completed task(s).`, 'success');
    });
    document.getElementById('actCleanAll').addEventListener('click', async () => {
        hideAllMenus();
        if (!state.tasks.length) { showToast('The board is already empty.', 'info'); return; }
        if (!await requestConfirmation('Clean All', 'Permanently delete every task on the board?')) return;
        state.tasks = [];
        saveToStorage();
        render();
        showToast('All tasks removed.', 'success');
    });

    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });
    setActiveTab(state.activeTab);

    document.addEventListener('click', hideAllMenus);
    document.addEventListener('contextmenu', hideAllMenus);
    window.addEventListener('resize', hideAllMenus);

    titleInput.addEventListener('focus', () => addCard.classList.add('expanded'));
    document.addEventListener('click', (e) => {
        if (!addCard.contains(e.target) && !titleInput.value && !descInput.value) {
            addCard.classList.remove('expanded');
        }
    });
}
