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

    titleInput.addEventListener('focus', () => addTodoCard.classList.add('expanded'));
    document.addEventListener('click', (e) => {
        if (!addTodoCard.contains(e.target) && !titleInput.value && !descInput.value) {
            addTodoCard.classList.remove('expanded');
        }
        hideAllMenus();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideAllMenus(); });
    window.addEventListener('resize', hideAllMenus);

    setupDragAndDrop();
    setupHeaderActions();
    setupMobileTabs();
}

function setupDragAndDrop() {
    document.querySelectorAll('.board-column').forEach(col => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
        col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drag-over');
            moveTask(e.dataTransfer.getData('text/plain'), col.getAttribute('data-column'));
        });
    });
}

function setupHeaderActions() {
    const btn = document.getElementById('headerActionsBtn');
    const menu = document.getElementById('headerActionsMenu');
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const willOpen = menu.classList.contains('hidden');
        hideAllMenus();
        if (willOpen) menu.classList.remove('hidden');
    });
    menu.addEventListener('click', (e) => e.stopPropagation());

    const confirmThen = async (title, message, action) => {
        menu.classList.add('hidden');
        if (await requestConfirmation(title, message)) action();
    };

    document.getElementById('actLoadDemo').addEventListener('click', () =>
        confirmThen('Load Sample Data', 'This replaces every task on the board with the sample set. Continue?', () => {
            loadDemoData();
            render();
            showToast('Sample data loaded.', 'success');
        }));
    document.getElementById('actCleanDone').addEventListener('click', () =>
        confirmThen('Clean Done', 'Permanently delete all completed tasks?', () => {
            const before = state.tasks.length;
            state.tasks = state.tasks.filter(t => !t.completed);
            saveToStorage();
            render();
            showToast(`Removed ${before - state.tasks.length} completed task(s).`, 'success');
        }));
    document.getElementById('actCleanAll').addEventListener('click', () =>
        confirmThen('Clean All', 'Permanently delete every task on the board?', () => {
            state.tasks = [];
            saveToStorage();
            render();
            showToast('Board cleared.', 'info');
        }));
}

function setupMobileTabs() {
    const buttons = document.querySelectorAll('#mobileTabs .mobile-tab-btn');
    const activate = (tab) => {
        state.activeTab = tab;
        buttons.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.querySelectorAll('.board-column').forEach(col =>
            col.classList.toggle('active-tab', col.getAttribute('data-column') === tab));
    };
    buttons.forEach(b => b.addEventListener('click', () => { activate(b.dataset.tab); saveToStorage(); }));
    activate(state.activeTab || 'todo');
}
