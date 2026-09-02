function clampToViewport(el, x, y) {
    const pad = 8;
    const rect = el.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - pad);
    const top = Math.min(y, window.innerHeight - rect.height - pad);
    el.style.left = `${Math.max(pad, left) + window.scrollX}px`;
    el.style.top = `${Math.max(pad, top) + window.scrollY}px`;
}

function setMenuItemAction(id, disabled, action) {
    const item = document.getElementById(id);
    item.classList.toggle('disabled', disabled);
    item.onclick = disabled ? null : () => { hideContextMenu(); action(); };
}

function showContextMenu(x, y, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    hideBadgePriorityMenu();

    const menu = document.getElementById('contextMenu');
    const col = task.column;

    setMenuItemAction('ctxView', false, () => openViewModal(taskId));
    setMenuItemAction('ctxEdit', col === 'done', () => openEditModal(taskId));
    setMenuItemAction('ctxMoveTodo', col === 'todo', () => moveTask(taskId, 'todo'));
    setMenuItemAction('ctxMoveProgress', col === 'progress', () => moveTask(taskId, 'progress'));
    setMenuItemAction('ctxMoveDone', col === 'done' || col === 'todo', () => moveTask(taskId, 'done'));
    setMenuItemAction('ctxDelete', false, () => deleteTask(taskId));

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
