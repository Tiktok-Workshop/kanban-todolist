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

    titleInput.addEventListener('focus', () => addCard.classList.add('expanded'));

    document.addEventListener('click', (e) => {
        if (addCard.contains(e.target)) return;
        if (!titleInput.value.trim() && !descInput.value.trim()) {
            addCard.classList.remove('expanded');
        }
    });

    const modalTitleInput = document.getElementById('taskTitleInput');
    const modalDescInput = document.getElementById('taskDescInput');

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

    modalTitleInput.addEventListener('input', () => {
        document.getElementById('taskTitleCounter').textContent = `${40 - modalTitleInput.value.length} left`;
    });

    modalDescInput.addEventListener('input', () => {
        document.getElementById('taskDescCounter').textContent = `${150 - modalDescInput.value.length} left`;
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        render();
    });

    document.getElementById('priorityFilter').addEventListener('change', (e) => {
        state.filterPriority = e.target.value;
        saveToStorage();
        render();
    });

    document.getElementById('sortBySelect').addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        saveToStorage();
        render();
    });

    setupDragAndDrop();
    setupMenuDismissal();
    setupBulkActions();
    setupMobileTabs();
}

function setupDragAndDrop() {
    document.querySelectorAll('.board-column').forEach(col => {
        col.addEventListener('dragover', (e) => {
            e.preventDefault();
            col.classList.add('drag-over');
        });

        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));

        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            moveTask(e.dataTransfer.getData('text/plain'), col.getAttribute('data-column'));
        });
    });
}

function setupMenuDismissal() {
    document.addEventListener('click', () => {
        hideContextMenu();
        hideBadgePriorityMenu();
    });

    document.addEventListener('contextmenu', (e) => {
        if (!e.target.closest('.task-card')) hideContextMenu();
    });
}

function setupBulkActions() {
    const menu = document.getElementById('headerActionsMenu');

    document.getElementById('headerActionsBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) menu.classList.add('hidden');
    });

    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        menu.classList.add('hidden');
        const confirmed = await requestConfirmation('Load Sample Data',
            'This replaces every task on the board with the sample tasks. Continue?');
        if (!confirmed) return;
        loadDemoData();
        render();
        showToast('Sample data loaded.', 'success');
    });

    document.getElementById('actCleanDone').addEventListener('click', async () => {
        menu.classList.add('hidden');
        const doneCount = state.tasks.filter(t => t.completed).length;
        if (!doneCount) {
            showToast('There are no completed tasks to clean.', 'info');
            return;
        }
        const confirmed = await requestConfirmation('Clean Done',
            `Are you sure you want to permanently delete ${doneCount} completed task(s)?`);
        if (!confirmed) return;
        state.tasks = state.tasks.filter(t => !t.completed);
        saveToStorage();
        render();
        showToast(`${doneCount} completed task(s) deleted.`, 'success');
    });

    document.getElementById('actCleanAll').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (!state.tasks.length) {
            showToast('The board is already empty.', 'info');
            return;
        }
        const confirmed = await requestConfirmation('Clean All',
            'Are you sure you want to permanently delete every task on the board?');
        if (!confirmed) return;
        state.tasks = [];
        saveToStorage();
        render();
        showToast('All tasks deleted.', 'success');
    });
}

function setupMobileTabs() {
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => activateTab(btn.getAttribute('data-tab')));
    });
}

function activateTab(tab) {
    state.activeTab = tab;
    saveToStorage();

    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    document.querySelectorAll('.board-column').forEach(col => {
        col.classList.toggle('active-tab', col.getAttribute('data-column') === tab);
    });
}
