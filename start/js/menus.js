function showContextMenu(x, y, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    hideBadgePriorityMenu();
    const menu = document.getElementById('contextMenu');

    const items = {
        ctxView: () => openViewModal(taskId),
        ctxEdit: () => openEditModal(taskId),
        ctxMoveTodo: () => moveTask(taskId, 'todo'),
        ctxMoveProgress: () => moveTask(taskId, 'progress'),
        ctxMoveDone: () => moveTask(taskId, 'done'),
        ctxDelete: () => deleteTask(taskId)
    };
    Object.keys(items).forEach(id => {
        document.getElementById(id).onclick = () => { hideContextMenu(); items[id](); };
    });

    const disabled = {
        ctxEdit: task.column === 'done',
        ctxMoveTodo: task.column === 'todo',
        ctxMoveProgress: task.column === 'progress',
        ctxMoveDone: task.column === 'done' || task.column === 'todo'
    };
    Object.keys(disabled).forEach(id => document.getElementById(id).classList.toggle('disabled', disabled[id]));

    menu.classList.remove('hidden');
    const rect = menu.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 8);
    const top = Math.min(y, window.innerHeight - rect.height - 8);
    menu.style.left = `${Math.max(8, left) + window.scrollX}px`;
    menu.style.top = `${Math.max(8, top) + window.scrollY}px`;
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
        item.onclick = () => { hideBadgePriorityMenu(); changeTaskPriorityDirectly(taskId, item.dataset.priority); };
    });
    const rect = event.currentTarget.getBoundingClientRect();
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.style.top = `${rect.bottom + 4 + window.scrollY}px`;
    menu.classList.remove('hidden');
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
