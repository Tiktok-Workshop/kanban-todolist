const COLUMN_META = {
    todo:     { bodyId: 'bodyTodo',     countId: 'countTodo',     emptyIcon: 'fa-clipboard-list', emptyText: 'No tasks listed here.' },
    progress: { bodyId: 'bodyProgress', countId: 'countProgress', emptyIcon: 'fa-spinner',        emptyText: 'Nothing in progress.' },
    done:     { bodyId: 'bodyDone',     countId: 'countDone',     emptyIcon: 'fa-check-double',   emptyText: 'No completed tasks yet.' }
};

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

function getFilteredSortedTasks() {
    let filteredTasks = [...state.tasks];
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(t =>
            t.title.toLowerCase().includes(q) || (t.desc || '').toLowerCase().includes(q));
    }
    if (state.filterPriority !== 'all') {
        filteredTasks = filteredTasks.filter(t => t.priority === state.filterPriority);
    }
    filteredTasks.sort((a, b) => {
        if (state.sortBy === 'date-desc') return b.createdAt - a.createdAt;
        if (state.sortBy === 'date-asc')  return a.createdAt - b.createdAt;
        if (state.sortBy === 'priority-desc') return (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });
    return filteredTasks;
}

function render() {
    const counts = { todo: 0, progress: 0, done: 0 };

    Object.values(COLUMN_META).forEach(meta => {
        document.getElementById(meta.bodyId).innerHTML = '';
    });

    getFilteredSortedTasks().forEach(task => {
        const column = COLUMN_META[task.column] ? task.column : 'todo';
        counts[column]++;
        document.getElementById(COLUMN_META[column].bodyId).appendChild(createTaskCardDOM(task));
    });

    Object.keys(COLUMN_META).forEach(column => {
        document.getElementById(COLUMN_META[column].countId).textContent = counts[column];
        const tabBadge = document.getElementById(`${column}TabBadge`);
        if (tabBadge) tabBadge.textContent = counts[column];
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
    badge.title = 'Change priority';
    badge.addEventListener('click', (e) => openBadgePriorityMenu(e, task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-card-action';
    deleteBtn.title = 'Delete task';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    const time = document.createElement('span');
    time.className = 'task-time';
    time.textContent = formatRelativeTime(task.createdAt);

    header.appendChild(badge);
    header.appendChild(time);
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
    const actionsLeft = document.createElement('div');
    actionsLeft.className = 'card-actions-left';
    const isDone = task.column === 'done';
    actionsLeft.innerHTML = `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${isDone ? 'View Task' : 'Edit Task'}"><i class="fas ${isDone ? 'fa-expand-alt' : 'fa-pencil-alt'}"></i></button>`;
    footer.appendChild(actionsLeft);
    const arrows = document.createElement('div');
    arrows.className = 'card-nav-arrows';
    arrows.innerHTML = getMoveArrowsHTML(task);
    footer.appendChild(arrows);

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);

    if (!isDone) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.id);
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    }
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, task.id);
    });
    return card;
}

function renderTimestampsOnly() {
    document.querySelectorAll('.task-card').forEach(card => {
        const task = state.tasks.find(t => t.id === card.dataset.id);
        const time = card.querySelector('.task-time');
        if (task && time) time.textContent = formatRelativeTime(task.createdAt);
    });
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
