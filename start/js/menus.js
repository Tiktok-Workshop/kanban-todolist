let badgeActiveTaskId = null;
let contextActiveTaskId = null;

function openBadgePriorityMenu(event, taskId) {
    event.stopPropagation();
    event.preventDefault();

    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.column === 'done') {
        showToast('You cannot change priority of completed tasks.', 'warning');
        return;
    }

    badgeActiveTaskId = taskId;
    const menu = document.getElementById('badgePriorityMenu');
    menu.classList.remove('hidden');

    const rect = event.currentTarget.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;

    menu.querySelectorAll('.badge-dropdown-item').forEach(item => {
        item.onclick = (e) => {
            e.stopPropagation();
            changeTaskPriorityDirectly(badgeActiveTaskId, item.getAttribute('data-priority'));
            hideBadgePriorityMenu();
        };
    });
}

function changeTaskPriorityDirectly(taskId, newPriority) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.priority === newPriority) return;

    task.priority = newPriority;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    showToast(`Priority changed to ${newPriority.toUpperCase()}.`, 'success');
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
    badgeActiveTaskId = null;
}

function showContextMenu(clientX, clientY, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    contextActiveTaskId = taskId;
    const menu = document.getElementById('contextMenu');
    menu.classList.remove('hidden');

    const menuWidth = 160;
    const menuHeight = 260;
    const posX = clientX + menuWidth > window.innerWidth ? clientX - menuWidth : clientX;
    const posY = clientY + menuHeight > window.innerHeight ? clientY - menuHeight : clientY;
    menu.style.top = `${posY + window.scrollY}px`;
    menu.style.left = `${posX + window.scrollX}px`;

    const column = task.column === 'progress' || task.column === 'done' ? task.column : 'todo';
    const isDone = column === 'done';
    const isTodo = column === 'todo';

    const ctxEdit = document.getElementById('ctxEdit');
    const ctxMoveTodo = document.getElementById('ctxMoveTodo');
    const ctxMoveProgress = document.getElementById('ctxMoveProgress');
    const ctxMoveDone = document.getElementById('ctxMoveDone');

    ctxEdit.classList.toggle('disabled', isDone);
    ctxMoveTodo.classList.toggle('disabled', isTodo);
    ctxMoveProgress.classList.toggle('disabled', column === 'progress');
    ctxMoveDone.classList.toggle('disabled', isTodo || isDone);

    document.getElementById('ctxView').onclick = () => { openViewModal(taskId); hideContextMenu(); };
    ctxEdit.onclick = () => { if (!isDone) openEditModal(taskId); hideContextMenu(); };
    ctxMoveTodo.onclick = () => { moveTask(taskId, 'todo'); hideContextMenu(); };
    ctxMoveProgress.onclick = () => { moveTask(taskId, 'progress'); hideContextMenu(); };
    ctxMoveDone.onclick = () => { moveTask(taskId, 'done'); hideContextMenu(); };
    document.getElementById('ctxDelete').onclick = () => { deleteTask(taskId); hideContextMenu(); };
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
    contextActiveTaskId = null;
}
