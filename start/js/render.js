const COLUMN_META = {
    todo:     { bodyId: 'bodyTodo',     countId: 'countTodo',     emptyIcon: 'fa-clipboard-list', emptyText: 'No tasks listed here.' },
    progress: { bodyId: 'bodyProgress', countId: 'countProgress', emptyIcon: 'fa-spinner',        emptyText: 'Nothing in progress.' },
    done:     { bodyId: 'bodyDone',     countId: 'countDone',     emptyIcon: 'fa-check-double',   emptyText: 'No completed tasks yet.' }
};

function render() {
    const counts = { todo: 0, progress: 0, done: 0 };

    Object.values(COLUMN_META).forEach(meta => {
        document.getElementById(meta.bodyId).innerHTML = '';
    });

    state.tasks.forEach(task => {
        const column = COLUMN_META[task.column] ? task.column : 'todo';
        counts[column]++;
        document.getElementById(COLUMN_META[column].bodyId).appendChild(createTaskCardDOM(task));
    });

    Object.keys(COLUMN_META).forEach(column => {
        document.getElementById(COLUMN_META[column].countId).textContent = counts[column];
        checkEmptyState(column, counts[column]);
    });
}

function checkEmptyState(column, count) {
    if (count > 0) return;
    const meta = COLUMN_META[column];
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = `<i class="fas ${meta.emptyIcon}"></i><p>${meta.emptyText}</p>`;
    document.getElementById(meta.bodyId).appendChild(placeholder);
}

function createTaskCardDOM(task) {
    const priority = task.priority || 'low';

    const card = document.createElement('article');
    card.className = `task-card priority-${priority}`;
    card.dataset.id = task.id;

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

    const title = document.createElement('h4');
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

    const footer = document.createElement('div');
    footer.className = 'task-footer';
    const arrows = document.createElement('div');
    arrows.className = 'card-nav-arrows';
    arrows.innerHTML = getMoveArrowsHTML(task);
    footer.appendChild(arrows);

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);
    return card;
}

function getMoveArrowsHTML(task) {
    const left = (target, label) =>
        `<button class="btn-arrow" onclick="moveTask('${task.id}', '${target}')" title="Move to ${label}"><i class="fas fa-arrow-left"></i></button>`;
    const right = (target, label) =>
        `<button class="btn-arrow" onclick="moveTask('${task.id}', '${target}')" title="Move to ${label}"><i class="fas fa-arrow-right"></i></button>`;

    switch (task.column) {
        case 'progress': return left('todo', 'To Do') + right('done', 'Done');
        case 'done':     return left('progress', 'In Progress');
        default:         return right('progress', 'Progress');
    }
}
