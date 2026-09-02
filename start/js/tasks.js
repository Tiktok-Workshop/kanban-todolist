let editingTaskId = null;

function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const priorityInput = document.getElementById('todoPriorityInput');
    const descInput = document.getElementById('todoDescInput');

    const title = input.value.trim();
    const priority = priorityInput.value;
    const desc = descInput.value.trim();

    if (!title) {
        input.focus();
        return;
    }
    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        input.focus();
        return;
    }
    if (desc.length > 150) {
        alert('Description must be 150 characters or fewer.');
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
}

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;
    const oldColumn = task.column;
    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            alert('Tasks must pass through In Progress before they can be marked Done.');
            return;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo') task.completed = false;
    if ((oldColumn === 'done' || oldColumn === 'progress') && (targetColumn === 'todo' || targetColumn === 'progress')) task.completed = false;
    task.column = targetColumn;
    saveToStorage();
    render();
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

    const titleInput = document.getElementById('taskTitleInput');
    const descInput = document.getElementById('taskDescInput');
    const title = titleInput.value.trim();
    const desc = descInput.value.trim();

    if (title.length < 3 || title.length > 40) {
        alert('Title must be between 3 and 40 characters.');
        titleInput.focus();
        return;
    }
    if (desc.length > 150) {
        alert('Description must be 150 characters or fewer.');
        descInput.focus();
        return;
    }

    task.title = title;
    task.desc = desc;
    task.priority = document.getElementById('taskPriorityInput').value;
    task.editedAt = Date.now();

    saveToStorage();
    closeModal('taskModal');
    render();
}

async function deleteTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    const confirmed = await requestConfirmation('Delete Task', `Are you sure you want to permanently delete "${task.title}"?`);
    if (!confirmed) return;
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
