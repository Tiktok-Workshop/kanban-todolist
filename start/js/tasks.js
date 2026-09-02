const COLUMN_LABELS = {
    todo: 'To Do',
    progress: 'In Progress',
    done: 'Done'
};

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
        id: generateTaskId(),
        title: title,
        desc: desc,
        priority: priority,
        column: 'todo',
        createdAt: Date.now(),
        editedAt: null,
        completed: false
    });

    saveToStorage();
    resetAddTodoForm();
    render();
    showToast('Task added to To Do.', 'success');
}

function resetAddTodoForm() {
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
            showToast('Move the task to In Progress before marking it Done.', 'warning');
            return;
        }
        task.completed = true;
    }
    if (targetColumn === 'todo' || targetColumn === 'progress') {
        task.completed = false;
    }

    task.column = targetColumn;
    saveToStorage();
    render();
    showToast(`Moved to ${COLUMN_LABELS[targetColumn]}.`, 'info');
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
    showToast('Task deleted.', 'success');
}
