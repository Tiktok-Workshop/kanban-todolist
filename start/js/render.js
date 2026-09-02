function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (state.tasks.length === 0) {
        list.innerHTML = '<p class="empty-message">No tasks yet. Add one above to get started!</p>';
        return;
    }

    state.tasks.forEach(task => {
        const row = document.createElement('div');
        row.className = 'task-row';

        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        row.appendChild(title);
        row.appendChild(deleteBtn);
        list.appendChild(row);
    });
}
