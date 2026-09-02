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

    titleInput.addEventListener('focus', () => {
        addCard.classList.add('expanded');
    });

    document.addEventListener('click', (e) => {
        if (addCard.contains(e.target)) return;
        if (!titleInput.value.trim() && !descInput.value.trim()) {
            addCard.classList.remove('expanded');
        }
    });

    setupDragAndDrop();
    setupMenuDismissal();
    setupHeaderActions();
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
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-context-menu')) hideContextMenu();
        if (!e.target.closest('.badge-dropdown-menu') && !e.target.closest('.badge-priority')) hideBadgePriorityMenu();
    });
    document.addEventListener('contextmenu', (e) => {
        if (!e.target.closest('.task-card')) hideContextMenu();
    });
    window.addEventListener('scroll', hideContextMenu, true);
}

function setupHeaderActions() {
    const btn = document.getElementById('headerActionsBtn');
    const menu = document.getElementById('headerActionsMenu');

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-actions-dropdown')) menu.classList.add('hidden');
    });

    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (!await confirmAction('Replace the board with the sample tasks?')) return;
        loadDemoData();
        render();
        showToast('Sample data loaded.', 'success');
    });

    document.getElementById('actCleanDone').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (!await confirmAction('Delete every completed task?')) return;
        state.tasks = state.tasks.filter(t => !t.completed);
        saveToStorage();
        render();
        showToast('Completed tasks cleared.', 'success');
    });

    document.getElementById('actCleanAll').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (!await confirmAction('Delete every task on the board?')) return;
        state.tasks = [];
        saveToStorage();
        render();
        showToast('Board cleared.', 'success');
    });
}

function confirmAction(message) {
    if (typeof requestConfirmation === 'function') return requestConfirmation(message);
    return Promise.resolve(window.confirm(message));
}

function setupMobileTabs() {
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.activeTab = btn.dataset.tab;
            saveToStorage();
            applyActiveTab();
        });
    });
    applyActiveTab();
}

function applyActiveTab() {
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
    });
    document.querySelectorAll('.board-column').forEach(col => {
        col.classList.toggle('active-tab', col.getAttribute('data-column') === state.activeTab);
    });
}
