const COLUMN_BODIES = {
    todo: 'bodyTodo',
    progress: 'bodyProgress',
    done: 'bodyDone'
};

const COLUMN_COUNTS = {
    todo: 'countTodo',
    progress: 'countProgress',
    done: 'countDone'
};

const EMPTY_STATES = {
    todo: { icon: 'fa-clipboard-list', message: 'No tasks listed here.' },
    progress: { icon: 'fa-spinner', message: 'Nothing in progress.' },
    done: { icon: 'fa-check-double', message: 'No completed tasks yet.' }
};

const TAB_BADGES = {
    todo: 'todoTabBadge',
    progress: 'progressTabBadge',
    done: 'doneTabBadge'
};

const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

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
        if (state.sortBy === 'date-asc') return a.createdAt - b.createdAt;
        if (state.sortBy === 'priority-desc') return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });

    return filteredTasks;
}

function render() {
    const bodies = {};
    const counts = { todo: 0, progress: 0, done: 0 };

    Object.keys(COLUMN_BODIES).forEach(column => {
        bodies[column] = document.getElementById(COLUMN_BODIES[column]);
        bodies[column].innerHTML = '';
    });

    getVisibleTasks().forEach(task => {
        const column = bodies[task.column] ? task.column : 'todo';
        bodies[column].appendChild(createTaskCardDOM(task));
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

    const { icon, message } = EMPTY_STATES[column];
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = `<i class="fas ${icon}"></i><p>${message}</p>`;
    document.getElementById(COLUMN_BODIES[column]).appendChild(placeholder);
}

function createTaskCardDOM(task) {
    const priority = task.priority || 'low';
    const isDone = task.column === 'done';

    const card = document.createElement('article');
    card.className = `task-card priority-${priority}`;
    card.setAttribute('data-id', task.id);

    const descHTML = task.desc
        ? `<p class="task-desc-excerpt"></p>`
        : `<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>`;

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${priority}" onclick="openBadgePriorityMenu(event, '${task.id}')" title="Change priority">${priority}</span>
            <span class="task-time">${formatRelativeTime(task.createdAt)}</span>
        </div>
        <h4 class="task-title"></h4>
        ${descHTML}
        <div class="task-footer">
            <div class="card-nav-arrows">${buildNavArrows(task)}</div>
            <div class="card-actions-left">
                <button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${isDone ? 'View Task' : 'Edit Task'}"><i class="fas ${isDone ? 'fa-expand-alt' : 'fa-pencil-alt'}"></i></button>
                <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete Task"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
    `;

    card.querySelector('.task-title').textContent = task.title;
    if (task.desc) card.querySelector('.task-desc-excerpt').textContent = task.desc;

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
    state.tasks.forEach(task => {
        const timeLabel = document.querySelector(`.task-card[data-id="${task.id}"] .task-time`);
        if (timeLabel) timeLabel.textContent = formatRelativeTime(task.createdAt);
    });
}

function buildNavArrows(task) {
    if (task.column === 'todo') {
        return `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to Progress"><i class="fas fa-arrow-right"></i></button>`;
    }

    if (task.column === 'progress') {
        return `
            <button class="btn-arrow" onclick="moveTask('${task.id}', 'todo')" title="Move to To Do"><i class="fas fa-arrow-left"></i></button>
            <button class="btn-arrow" onclick="moveTask('${task.id}', 'done')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>
        `;
    }

    return `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to In Progress"><i class="fas fa-arrow-left"></i></button>`;
}
