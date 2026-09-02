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
        id: generateTaskId(),
        title: title,
        desc: desc,
        priority: priority,
        createdAt: new Date().toISOString()
    });

    saveToStorage();
    resetAddTodoForm();
    render();
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

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
