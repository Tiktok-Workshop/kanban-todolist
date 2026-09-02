let editingTaskId = null;

function resetAddForm() {
    document.getElementById('todoTitleInput').value = '';
    document.getElementById('todoDescInput').value = '';
    document.getElementById('todoPriorityInput').value = 'low';
    document.getElementById('titleCounter').textContent = '40 left';
    document.getElementById('descCounter').textContent = '150 left';
}

function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();
    const priority = document.getElementById('todoPriorityInput').value;
    const desc = document.getElementById('todoDescInput').value.trim();

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
        return;
    }

    state.tasks.push({
        id: generateId(),
        title: title,
        desc: desc,
        priority: priority,
        column: 'todo',
        createdAt: Date.now(),
        editedAt: null,
        completed: false
    });
    saveToStorage();
    resetAddForm();
    render();
}

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;
    const oldColumn = task.column;
    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            alert('Tasks must go through In Progress before being marked Done.');
            return;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo' || targetColumn === 'progress') task.completed = false;
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
    priorityInput.value = task.priority;
    descInput.value = task.desc || '';
    document.getElementById('taskTitleCounter').textContent = `${40 - titleInput.value.length} left`;
    document.getElementById('taskDescCounter').textContent = `${150 - descInput.value.length} left`;
    document.getElementById('taskCreated').textContent = formatFullTime(task.createdAt);
    document.getElementById('taskEdited').textContent = task.editedAt ? formatFullTime(task.editedAt) : 'Not edited yet';

    const readOnly = task.column === 'done';
    [titleInput, priorityInput, descInput].forEach(el => { el.disabled = readOnly; });
    document.getElementById('taskModalTitle').textContent = readOnly ? 'Task Details' : 'Edit Task';
    document.getElementById('saveEditBtn').style.display = readOnly ? 'none' : '';

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
        alert('Title must be between 3 and 40 characters.');
        return;
    }
    if (desc.length > 150) {
        alert('Description must be 150 characters or fewer.');
        return;
    }

    task.title = title;
    task.desc = desc;
    task.priority = priority;
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
