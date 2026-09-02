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
        list.appendChild(createTaskCard(task));
    });
}

function createTaskCard(task) {
    const priority = task.priority || 'low';

    const card = document.createElement('div');
    card.className = `task-card priority-${priority}`;
    card.setAttribute('data-id', task.id);

    const descHTML = task.desc
        ? `<p class="task-desc-excerpt"></p>`
        : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${priority}">${priority}</span>
            <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
        </div>
        <h4 class="task-title"></h4>
        ${descHTML}
    `;

    card.querySelector('.task-title').textContent = task.title;
    if (task.desc) card.querySelector('.task-desc-excerpt').textContent = task.desc;

    return card;
}
