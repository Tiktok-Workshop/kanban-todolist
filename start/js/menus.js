function clampToViewport(el, x, y) {
    const pad = 8;
    const w = el.offsetWidth, h = el.offsetHeight;
    const left = Math.min(x, window.innerWidth - w - pad);
    const top = Math.min(y, window.innerHeight - h - pad);
    el.style.left = `${Math.max(pad, left) + window.scrollX}px`;
    el.style.top = `${Math.max(pad, top) + window.scrollY}px`;
}

function setMenuItemDisabled(id, disabled) {
    document.getElementById(id).classList.toggle('disabled', disabled);
}

function showContextMenu(x, y, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    hideBadgePriorityMenu();

    const menu = document.getElementById('contextMenu');
    const isDone = task.column === 'done';

    setMenuItemDisabled('ctxEdit', isDone);
    setMenuItemDisabled('ctxMoveTodo', task.column === 'todo');
    setMenuItemDisabled('ctxMoveProgress', task.column === 'progress');
    setMenuItemDisabled('ctxMoveDone', isDone || task.column === 'todo');

    const wire = (id, fn) => {
        document.getElementById(id).onclick = () => { hideContextMenu(); fn(); };
    };
    wire('ctxView', () => openViewModal(taskId));
    wire('ctxEdit', () => openEditModal(taskId));
    wire('ctxMoveTodo', () => moveTask(taskId, 'todo'));
    wire('ctxMoveProgress', () => moveTask(taskId, 'progress'));
    wire('ctxMoveDone', () => moveTask(taskId, 'done'));
    wire('ctxDelete', () => deleteTask(taskId));

    menu.classList.remove('hidden');
    clampToViewport(menu, x, y);
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
}

function openBadgePriorityMenu(event, taskId) {
    event.stopPropagation();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.column === 'done') {
        showToast('Completed tasks cannot change priority.', 'warning');
        return;
    }
    hideContextMenu();

    const menu = document.getElementById('badgePriorityMenu');
    menu.querySelectorAll('.badge-dropdown-item').forEach(item => {
        item.onclick = () => {
            hideBadgePriorityMenu();
            changeTaskPriorityDirectly(taskId, item.dataset.priority);
        };
    });

    const rect = event.currentTarget.getBoundingClientRect();
    menu.classList.remove('hidden');
    clampToViewport(menu, rect.left, rect.bottom + 4);
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
}

function changeTaskPriorityDirectly(taskId, newPriority) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.priority === newPriority) return;
    task.priority = newPriority;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    showToast(`Priority set to ${newPriority}.`, 'success');
}

function hideAllMenus() {
    hideContextMenu();
    hideBadgePriorityMenu();
    const actions = document.getElementById('headerActionsMenu');
    if (actions) actions.classList.add('hidden');
}
