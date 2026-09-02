function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    if (state.tasks.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty-message';
        empty.textContent = 'No tasks yet. Add one above to get started!';
        list.appendChild(empty);
        return;
    }

    state.tasks.forEach(task => {
        const priority = task.priority || 'low';

        const card = document.createElement('div');
        card.className = `task-card priority-${priority}`;

        const header = document.createElement('div');
        header.className = 'task-header';

        const badge = document.createElement('span');
        badge.className = `badge-priority ${priority}`;
        badge.textContent = priority;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-card-action';
        deleteBtn.title = 'Delete task';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        header.appendChild(badge);
        header.appendChild(deleteBtn);

        const title = document.createElement('div');
        title.className = 'task-title';
        title.textContent = task.title;

        const desc = document.createElement('p');
        desc.className = 'task-desc-excerpt';
        if (task.desc) {
            desc.textContent = task.desc;
        } else {
            desc.textContent = 'No description provided.';
            desc.style.color = 'var(--text-muted)';
            desc.style.fontStyle = 'italic';
        }

        card.appendChild(header);
        card.appendChild(title);
        card.appendChild(desc);
        list.appendChild(card);
    });
}
