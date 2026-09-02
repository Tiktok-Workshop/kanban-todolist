function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (state.tasks.length === 0) {
        list.innerHTML = '<p class="empty-state">No tasks yet. Add one above to get started!</p>';
        return;
    }

    state.tasks.forEach(task => {
        const row = document.createElement('div');
        row.className = 'task-row';

        const title = document.createElement('span');
        title.className = 'task-title';
        title.textContent = task.title;

        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.textContent = 'Delete';
        del.addEventListener('click', () => deleteTask(task.id));

        row.appendChild(title);
        row.appendChild(del);
        list.appendChild(row);
    });
}
