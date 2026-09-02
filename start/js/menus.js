function showContextMenu(x, y, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const menu = document.getElementById('contextMenu');
    menu.classList.remove('hidden');

    const rect = menu.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 8);
    const top = Math.min(y, window.innerHeight - rect.height - 8);
    menu.style.left = `${Math.max(8, left) + window.scrollX}px`;
    menu.style.top = `${Math.max(8, top) + window.scrollY}px`;

    const items = {
        ctxView: typeof openViewModal === 'function' ? () => openViewModal(taskId) : null,
        ctxEdit: typeof openEditModal === 'function' && task.column !== 'done' ? () => openEditModal(taskId) : null,
        ctxMoveTodo: task.column !== 'todo' ? () => moveTask(taskId, 'todo') : null,
        ctxMoveProgress: task.column !== 'progress' ? () => moveTask(taskId, 'progress') : null,
        ctxMoveDone: task.column === 'progress' ? () => moveTask(taskId, 'done') : null,
        ctxDelete: () => deleteTask(taskId)
    };

    Object.keys(items).forEach(id => {
        const el = document.getElementById(id);
        const action = items[id];
        el.classList.toggle('disabled', !action);
        el.onclick = action
            ? () => { action(); hideContextMenu(); }
            : null;
    });
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

    const menu = document.getElementById('badgePriorityMenu');
    menu.classList.remove('hidden');

    const badgeRect = event.currentTarget.getBoundingClientRect();
    menu.style.left = `${badgeRect.left + window.scrollX}px`;
    menu.style.top = `${badgeRect.bottom + 4 + window.scrollY}px`;

    menu.querySelectorAll('.badge-dropdown-item').forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            changeTaskPriorityDirectly(taskId, item.dataset.priority);
            hideBadgePriorityMenu();
        };
    });
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
