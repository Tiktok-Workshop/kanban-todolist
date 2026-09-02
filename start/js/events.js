function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const addTodoCard = document.getElementById('addTodoCard');

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
        addTodoCard.classList.add('expanded');
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

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);

    const modalTitleInput = document.getElementById('taskTitleInput');
    const modalDescInput = document.getElementById('taskDescInput');

    modalTitleInput.addEventListener('input', () => {
        document.getElementById('taskTitleCounter').textContent = `${40 - modalTitleInput.value.length} left`;
    });

    modalDescInput.addEventListener('input', () => {
        document.getElementById('taskDescCounter').textContent = `${150 - modalDescInput.value.length} left`;
    });

    setupDragAndDrop();
    setupHeaderActions();
    setupMobileTabs();

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.badge-priority')) hideBadgePriorityMenu();
        hideContextMenu();

        if (!e.target.closest('.header-actions-dropdown')) {
            document.getElementById('headerActionsMenu').classList.add('hidden');
        }

        if (addTodoCard.contains(e.target)) return;
        if (!titleInput.value.trim() && !descInput.value.trim()) {
            addTodoCard.classList.remove('expanded');
        }
    });
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

function setupHeaderActions() {
    const menu = document.getElementById('headerActionsMenu');

    document.getElementById('headerActionsBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    document.getElementById('actLoadDemo').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (!await requestConfirmation('Load Sample Data', 'This replaces every task on the board with the sample tasks. Continue?')) return;
        loadDemoData();
        render();
        showToast('Sample data loaded.', 'success');
    });

    document.getElementById('actCleanDone').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (!await requestConfirmation('Clean Done', 'Permanently delete every completed task?')) return;
        state.tasks = state.tasks.filter(t => !t.completed);
        saveToStorage();
        render();
        showToast('Completed tasks removed.', 'success');
    });

    document.getElementById('actCleanAll').addEventListener('click', async () => {
        menu.classList.add('hidden');
        if (!await requestConfirmation('Clean All', 'Permanently delete every task on the board?')) return;
        state.tasks = [];
        saveToStorage();
        render();
        showToast('Board cleared.', 'success');
    });
}

function setupMobileTabs() {
    document.querySelectorAll('.mobile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            state.activeTab = tab;
            saveToStorage();

            document.querySelectorAll('.mobile-tab-btn').forEach(b => b.classList.toggle('active', b === btn));
            document.querySelectorAll('.board-column').forEach(col => {
                col.classList.toggle('active-tab', col.getAttribute('data-column') === tab);
            });
        });
    });
}
