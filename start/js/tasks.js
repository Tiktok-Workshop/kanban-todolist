let editingTaskId = null;

function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const priorityInput = document.getElementById('todoPriorityInput');
    const descInput = document.getElementById('todoDescInput');

    const title = input.value.trim();
    const priority = priorityInput.value;
    const desc = descInput.value.trim();

    if (title.length < 3 || title.length > 40) {
        showToast('Task title must be between 3 and 40 characters.', 'error');
        input.focus();
        return;
    }
    if (desc.length > 150) {
        showToast('Description must be 150 characters or fewer.', 'error');
        descInput.focus();
        return;
    }

    state.tasks.push({
        id: 'task-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: title,
        desc: desc,
        priority: priority,
        column: 'todo',
        createdAt: Date.now(),
        editedAt: null,
        completed: false
    });
    saveToStorage();

    input.value = '';
    descInput.value = '';
    priorityInput.value = 'low';
    document.getElementById('titleCounter').textContent = '40 left';
    document.getElementById('descCounter').textContent = '150 left';
    document.getElementById('addTodoCard').classList.remove('expanded');

    render();
    showToast('Task added to To Do.', 'success');
}

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;
    const oldColumn = task.column;
    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            showToast('Tasks must go through In Progress before they can be marked Done.', 'warning');
            return;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo' || targetColumn === 'progress') task.completed = false;
    task.column = targetColumn;
    saveToStorage();
    render();
    const labels = { todo: 'To Do', progress: 'In Progress', done: 'Done' };
    showToast(`Moved "${task.title}" to ${labels[targetColumn]}.`, targetColumn === 'done' ? 'success' : 'info');
}

function openTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    editingTaskId = taskId;

    const titleInput = document.getElementById('taskTitleInput');
    const priorityInput = document.getElementById('taskPriorityInput');
    const descInput = document.getElementById('taskDescInput');

    titleInput.value = task.title;
    priorityInput.value = task.priority;
    descInput.value = task.desc || '';
    document.getElementById('taskTitleCounter').textContent = `${40 - task.title.length} left`;
    document.getElementById('taskDescCounter').textContent = `${150 - (task.desc || '').length} left`;
    document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
    document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

    const readOnly = task.column === 'done';
    [titleInput, priorityInput, descInput].forEach(el => { el.disabled = readOnly; });
    document.getElementById('taskModalTitle').textContent = readOnly ? 'Task Details' : 'Edit Task';
    document.getElementById('saveEditBtn').classList.toggle('hidden', readOnly);

    openModal('taskModal');
}
const openViewModal = openTaskModal;
const openEditModal = openTaskModal;

function saveEditedTask() {
    const task = state.tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const title = document.getElementById('taskTitleInput').value.trim();
    const priority = document.getElementById('taskPriorityInput').value;
    const desc = document.getElementById('taskDescInput').value.trim();

    if (title.length < 3 || title.length > 40) {
        showToast('Task title must be between 3 and 40 characters.', 'error');
        return;
    }
    if (desc.length > 150) {
        showToast('Description must be 150 characters or fewer.', 'error');
        return;
    }

    task.title = title;
    task.priority = priority;
    task.desc = desc;
    task.editedAt = Date.now();
    saveToStorage();
    closeModal('taskModal');
    render();
    showToast('Task updated.', 'success');
}

async function deleteTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const confirmed = await requestConfirmation('Delete Task', `Are you sure you want to permanently delete "${task.title}"?`);
    if (!confirmed) return;
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
    showToast('Task deleted.', 'info');
}
