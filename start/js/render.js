function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (state.tasks.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-message';
        empty.textContent = 'No tasks yet — add your first one above!';
        list.appendChild(empty);
        return;
    }

    state.tasks.forEach(task => {
        const row = document.createElement('div');
        row.className = 'task-row';
        row.innerHTML = `
            <span class="task-title"></span>
            <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
        `;
        row.querySelector('.task-title').textContent = task.title;
        list.appendChild(row);
    });
}
