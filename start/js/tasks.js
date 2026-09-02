let editingTaskId = null;

const COLUMN_LABELS = { todo: 'To Do', progress: 'In Progress', done: 'Done' };

function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const prioritySelect = document.getElementById('todoPriorityInput');

    const title = input.value.trim();
    const desc = descInput.value.trim();
    const priority = prioritySelect.value;

    if (!title) {
        input.focus();
        return;
    }

    if (title.length < 3 || title.length > 40) {
        showToast('Title must be between 3 and 40 characters.', 'error');
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
    prioritySelect.value = 'low';
    document.getElementById('titleCounter').textContent = '40 left';
    document.getElementById('descCounter').textContent = '150 left';
    document.getElementById('addTodoCard').classList.remove('expanded');

    input.focus();
    render();
    showToast('Task added to To Do.', 'success');
}

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;

    const oldColumn = task.column;

    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            showToast('Move the task through In Progress before marking it Done.', 'warning');
            return;
        }
        task.completed = true;
    }

    if (targetColumn === 'todo' || targetColumn === 'progress') task.completed = false;

    task.column = targetColumn;
    saveToStorage();
    render();
    showToast(`Moved to ${COLUMN_LABELS[targetColumn]}.`, 'success');
}

function openTaskModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;

    const titleInput = document.getElementById('taskTitleInput');
    const priorityInput = document.getElementById('taskPriorityInput');
    const descInput = document.getElementById('taskDescInput');

    titleInput.value = task.title;
    priorityInput.value = task.priority || 'low';
    descInput.value = task.desc || '';

    document.getElementById('taskTitleCounter').textContent = `${40 - titleInput.value.length} left`;
    document.getElementById('taskDescCounter').textContent = `${150 - descInput.value.length} left`;

    document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
    document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

    const isDone = task.column === 'done';
    titleInput.disabled = isDone;
    priorityInput.disabled = isDone;
    descInput.disabled = isDone;
    document.getElementById('taskModalTitle').textContent = isDone ? 'Task Details' : 'Edit Task';
    document.getElementById('saveEditBtn').classList.toggle('hidden', isDone);

    openModal('taskModal');
}

const openViewModal = openTaskModal;
const openEditModal = openTaskModal;

function saveEditedTask() {
    const task = state.tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const title = document.getElementById('taskTitleInput').value.trim();
    const desc = document.getElementById('taskDescInput').value.trim();
    const priority = document.getElementById('taskPriorityInput').value;

    if (title.length < 3 || title.length > 40) {
        showToast('Title must be between 3 and 40 characters.', 'error');
        return;
    }

    if (desc.length > 150) {
        showToast('Description must be 150 characters or fewer.', 'error');
        return;
    }

    task.title = title;
    task.desc = desc;
    task.priority = priority;
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
    showToast('Task deleted.', 'success');
}
