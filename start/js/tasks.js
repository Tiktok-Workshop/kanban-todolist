function addNewTodo() {
    const input = document.getElementById('todoTitleInput');
    const title = input.value.trim();
    if (!title) {
        input.focus();
        return;
    }

    state.tasks.push({
        id: generateTaskId(),
        title: title,
        createdAt: new Date().toISOString()
    });

    saveToStorage();
    input.value = '';
    input.focus();
    render();
}

function deleteTask(taskId) {
    const index = state.tasks.findIndex(t => t.id === taskId);
    if (index === -1) return;
    const [removed] = state.tasks.splice(index, 1);
    saveToStorage();
    render();

    showToast(`Deleted "${removed.title}"`, {
        actionLabel: 'Undo',
        duration: 5000,
        onAction: () => restoreTask(removed, index)
    });
}

function restoreTask(task, index) {
    if (state.tasks.some(t => t.id === task.id)) return;
    state.tasks.splice(Math.min(index, state.tasks.length), 0, task);
    saveToStorage();
    render();
}
