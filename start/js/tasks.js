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
        createdAt: new Date().toISOString()
    });
    saveToStorage();
    resetAddForm();
    render();
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    saveToStorage();
    render();
}
