const COLUMN_BODIES = { todo: 'bodyTodo', progress: 'bodyProgress', done: 'bodyDone' };
const COLUMN_COUNTS = { todo: 'countTodo', progress: 'countProgress', done: 'countDone' };
const TAB_BADGES = { todo: 'todoTabBadge', progress: 'progressTabBadge', done: 'doneTabBadge' };
const EMPTY_STATES = {
    todo:     { icon: 'fa-clipboard-list', text: 'No tasks listed here.' },
    progress: { icon: 'fa-spinner',        text: 'Nothing in progress.' },
    done:     { icon: 'fa-check-double',   text: 'No completed tasks yet.' }
};

function render() {
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
        if (state.sortBy === 'date-asc') return a.createdAt - b.createdAt;
        if (state.sortBy === 'priority-desc') {
            const w = { high: 3, medium: 2, low: 1 };
            return w[b.priority] - w[a.priority];
        }
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });

    const counts = { todo: 0, progress: 0, done: 0 };
    Object.values(COLUMN_BODIES).forEach(id => { document.getElementById(id).innerHTML = ''; });

    filteredTasks.forEach(task => {
        const column = COLUMN_BODIES[task.column] ? task.column : 'todo';
        document.getElementById(COLUMN_BODIES[column]).appendChild(createTaskCardDOM(task));
        counts[column]++;
    });

    Object.keys(counts).forEach(column => {
        document.getElementById(COLUMN_COUNTS[column]).textContent = counts[column];
        document.getElementById(TAB_BADGES[column]).textContent = counts[column];
        checkEmptyState(column, counts[column]);
    });
}

function checkEmptyState(column, count) {
    if (count > 0) return;
    const { icon, text } = EMPTY_STATES[column];
    document.getElementById(COLUMN_BODIES[column]).innerHTML =
        `<div class="empty-column-placeholder"><i class="fas ${icon}"></i><p>${text}</p></div>`;
}

function createMoveArrows(task) {
    const arrow = (target, label, icon) =>
        `<button class="btn-arrow" onclick="moveTask('${task.id}', '${target}')" title="Move to ${label}"><i class="fas ${icon}"></i></button>`;
    switch (task.column) {
        case 'todo':     return arrow('progress', 'Progress', 'fa-arrow-right');
        case 'progress': return arrow('todo', 'To Do', 'fa-arrow-left') + arrow('done', 'Done', 'fa-arrow-right');
        case 'done':     return arrow('progress', 'In Progress', 'fa-arrow-left');
        default:         return '';
    }
}

function renderTimestampsOnly() {
    document.querySelectorAll('.task-card').forEach(card => {
        const task = state.tasks.find(t => t.id === card.dataset.id);
        const timeEl = card.querySelector('.task-time');
        if (task && timeEl) timeEl.textContent = formatRelativeTime(task.createdAt);
    });
}

function createTaskCardDOM(task) {
    const isDone = task.column === 'done';
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}`;
    card.dataset.id = task.id;

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${task.priority}" onclick="openBadgePriorityMenu(event, '${task.id}')" title="Change priority">${task.priority}</span>
            <span class="task-time">${formatRelativeTime(task.createdAt)}</span>
            <button class="btn-card-action" title="Delete" onclick="deleteTask('${task.id}')"><i class="fas fa-trash-alt"></i></button>
        </div>
        <h4 class="task-title"></h4>
        <p class="task-desc-excerpt"></p>
        <div class="task-footer">
            <div class="card-actions-left">
                <button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${isDone ? 'View Task' : 'Edit Task'}"><i class="fas ${isDone ? 'fa-expand-alt' : 'fa-pencil-alt'}"></i></button>
            </div>
            <div class="card-nav-arrows">${createMoveArrows(task)}</div>
        </div>
    `;

    card.querySelector('.task-title').textContent = task.title;
    const descEl = card.querySelector('.task-desc-excerpt');
    if (task.desc) {
        descEl.textContent = task.desc;
    } else {
        descEl.textContent = 'No description provided.';
        descEl.style.color = 'var(--text-muted)';
        descEl.style.fontStyle = 'italic';
    }

    if (!isDone) {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => { card.classList.add('dragging'); e.dataTransfer.setData('text/plain', task.id); });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    }
    card.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); showContextMenu(e.clientX, e.clientY, task.id); });
    return card;
}
