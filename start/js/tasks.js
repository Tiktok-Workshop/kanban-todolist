function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const prioritySelect = document.getElementById('todoPriorityInput');

    const title = input.value.trim();
    const desc = descInput.value.trim();
    const priority = prioritySelect.value;

    if (title.length < 3 || title.length > 40) {
        alert('Please enter a task title between 3 and 40 characters.');
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
    resetAddForm();
    render();
}

function resetAddForm() {
    const input = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const prioritySelect = document.getElementById('todoPriorityInput');

    input.value = '';
    descInput.value = '';
    prioritySelect.value = 'low';
    document.getElementById('titleCounter').textContent = '40 left';
    document.getElementById('descCounter').textContent = '150 left';
    document.getElementById('addTodoCard').classList.remove('expanded');
    input.focus();
}

function moveTask(taskId, targetColumn) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.column === targetColumn) return;

    const oldColumn = task.column;

    if (targetColumn === 'done') {
        if (oldColumn === 'todo') {
            alert('Move the task to In Progress before marking it Done.');
            return;
        }
        task.completed = true;
    }

    if (targetColumn === 'todo' || targetColumn === 'progress') task.completed = false;

    task.column = targetColumn;
    saveToStorage();
    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
