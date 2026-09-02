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

const COLUMN_TAB_BADGES = {
    todo: 'todoTabBadge',
    progress: 'progressTabBadge',
    done: 'doneTabBadge'
};

const EMPTY_STATES = {
    todo: { icon: 'fa-clipboard-list', message: 'No tasks listed here.' },
    progress: { icon: 'fa-spinner', message: 'Nothing in progress.' },
    done: { icon: 'fa-check-double', message: 'No completed tasks yet.' }
};

function render() {
    const counts = { todo: 0, progress: 0, done: 0 };

    Object.values(COLUMN_BODIES).forEach(id => {
        document.getElementById(id).innerHTML = '';
    });

    getVisibleTasks().forEach(task => {
        const column = COLUMN_BODIES[task.column] ? task.column : 'todo';
        document.getElementById(COLUMN_BODIES[column]).appendChild(createTaskCardDOM(task));
        counts[column]++;
    });

    Object.keys(counts).forEach(column => {
        document.getElementById(COLUMN_COUNTS[column]).textContent = counts[column];
        document.getElementById(COLUMN_TAB_BADGES[column]).textContent = counts[column];
        checkEmptyState(column, counts[column]);
    });
}

function getVisibleTasks() {
    let tasks = [...state.tasks];

    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        tasks = tasks.filter(t =>
            t.title.toLowerCase().includes(query) || (t.desc || '').toLowerCase().includes(query));
    }

    if (state.filterPriority !== 'all') {
        tasks = tasks.filter(t => (t.priority || 'low') === state.filterPriority);
    }

    tasks.sort((a, b) => {
        if (state.sortBy === 'date-desc') return b.createdAt - a.createdAt;
        if (state.sortBy === 'date-asc') return a.createdAt - b.createdAt;
        if (state.sortBy === 'priority-desc') {
            const weight = { high: 3, medium: 2, low: 1 };
            return weight[b.priority || 'low'] - weight[a.priority || 'low'];
        }
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });

    return tasks;
}

function renderTimestampsOnly() {
    state.tasks.forEach(task => {
        const time = document.querySelector(`.task-card[data-id="${task.id}"] .task-time`);
        if (time) time.textContent = formatRelativeTime(task.createdAt);
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

    const card = document.createElement('article');
    card.className = `task-card priority-${priority}`;
    card.dataset.id = task.id;

    const header = document.createElement('div');
    header.className = 'task-header';

    const badge = document.createElement('span');
    badge.className = `badge-priority ${priority}`;
    badge.textContent = priority;
    badge.setAttribute('onclick', `openBadgePriorityMenu(event, '${task.id}')`);

    const time = document.createElement('span');
    time.className = 'task-time';
    time.textContent = formatRelativeTime(task.createdAt);

    header.appendChild(badge);
    header.appendChild(time);

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
    footer.appendChild(createCardActions(task));
    footer.appendChild(createNavArrows(task));

    card.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('.badge-priority')) return;
        openTaskModal(task.id);
    });

    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, task.id);
    });

    if (task.column !== 'done') {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.setData('text/plain', task.id);
        });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    }

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);
    return card;
}

function createCardActions(task) {
    const isDone = task.column === 'done';

    const actions = document.createElement('div');
    actions.className = 'card-actions-left';
    actions.innerHTML = `
        <button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${isDone ? 'View Task' : 'Edit Task'}"><i class="fas ${isDone ? 'fa-expand-alt' : 'fa-pencil-alt'}"></i></button>
        <button class="btn-card-action" onclick="deleteTask('${task.id}')" title="Delete task"><i class="fas fa-trash-alt"></i></button>
    `;
    return actions;
}

function createNavArrows(task) {
    const column = COLUMN_BODIES[task.column] ? task.column : 'todo';

    const arrows = document.createElement('div');
    arrows.className = 'card-nav-arrows';

    if (column === 'progress' || column === 'done') {
        const target = column === 'done' ? 'progress' : 'todo';
        const label = column === 'done' ? 'Move to Progress' : 'Move to To Do';
        arrows.innerHTML += `<button class="btn-arrow" onclick="moveTask('${task.id}', '${target}')" title="${label}"><i class="fas fa-arrow-left"></i></button>`;
    }

    if (column === 'todo' || column === 'progress') {
        const target = column === 'todo' ? 'progress' : 'done';
        const label = column === 'todo' ? 'Move to Progress' : 'Move to Done';
        arrows.innerHTML += `<button class="btn-arrow" onclick="moveTask('${task.id}', '${target}')" title="${label}"><i class="fas fa-arrow-right"></i></button>`;
    }

    return arrows;
}
