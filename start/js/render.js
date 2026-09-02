const COLUMN_BODY_IDS = { todo: 'bodyTodo', progress: 'bodyProgress', done: 'bodyDone' };
const COLUMN_COUNT_IDS = { todo: 'countTodo', progress: 'countProgress', done: 'countDone' };
const COLUMN_EMPTY_STATES = {
    todo:     { icon: 'fa-clipboard-list', text: 'No tasks listed here.' },
    progress: { icon: 'fa-spinner',        text: 'Nothing in progress.' },
    done:     { icon: 'fa-check-double',   text: 'No completed tasks yet.' }
};

function getVisibleTasks() {
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
        if (state.sortBy === 'priority-desc') {
            const w = { high: 3, medium: 2, low: 1 };
            return w[b.priority] - w[a.priority];
        }
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });
    return filteredTasks;
}

function render() {
    const counts = { todo: 0, progress: 0, done: 0 };
    Object.values(COLUMN_BODY_IDS).forEach(id => { document.getElementById(id).innerHTML = ''; });

    getVisibleTasks().forEach(task => {
        const column = COLUMN_BODY_IDS[task.column] ? task.column : 'todo';
        document.getElementById(COLUMN_BODY_IDS[column]).appendChild(createTaskCardDOM(task));
        counts[column]++;
    });

    Object.keys(counts).forEach(column => {
        document.getElementById(COLUMN_COUNT_IDS[column]).textContent = counts[column];
        checkEmptyState(column, counts[column]);
    });
}

function checkEmptyState(column, count) {
    if (count > 0) return;
    const { icon, text } = COLUMN_EMPTY_STATES[column];
    document.getElementById(COLUMN_BODY_IDS[column]).innerHTML =
        `<div class="empty-column-placeholder"><i class="fas ${icon}"></i><p>${text}</p></div>`;
}

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}`;
    card.dataset.id = task.id;

    const header = document.createElement('div');
    header.className = 'task-header';

    const badge = document.createElement('span');
    badge.className = `badge-priority ${task.priority}`;
    badge.textContent = task.priority;

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
    const isDone = task.column === 'done';
    const editBtn = `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${isDone ? 'View Task' : 'Edit Task'}"><i class="fas ${isDone ? 'fa-expand-alt' : 'fa-pencil-alt'}"></i></button>`;
    footer.innerHTML = `<div class="card-actions-left">${editBtn}</div><div class="card-nav-arrows">${moveArrowsHTML(task)}</div>`;

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);
    return card;
}

function renderTimestampsOnly() {
    document.querySelectorAll('.task-card').forEach(card => {
        const task = state.tasks.find(t => t.id === card.dataset.id);
        const time = card.querySelector('.task-time');
        if (task && time) time.textContent = formatRelativeTime(task.createdAt);
    });
}

function moveArrowsHTML(task) {
    const arrow = (target, label, icon) =>
        `<button class="btn-arrow" onclick="moveTask('${task.id}', '${target}')" title="Move to ${label}"><i class="fas ${icon}"></i></button>`;
    switch (task.column) {
        case 'todo':     return arrow('progress', 'Progress', 'fa-arrow-right');
        case 'progress': return arrow('todo', 'To Do', 'fa-arrow-left') + arrow('done', 'Done', 'fa-arrow-right');
        case 'done':     return arrow('progress', 'In Progress', 'fa-arrow-left');
        default:         return '';
    }
}
