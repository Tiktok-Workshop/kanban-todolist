const COLUMN_BODIES = { todo: 'bodyTodo', progress: 'bodyProgress', done: 'bodyDone' };
const COLUMN_COUNTS = { todo: 'countTodo', progress: 'countProgress', done: 'countDone' };
const EMPTY_STATES = {
    todo:     { icon: 'fa-clipboard-list', text: 'No tasks listed here.' },
    progress: { icon: 'fa-spinner',        text: 'Nothing in progress.' },
    done:     { icon: 'fa-check-double',   text: 'No completed tasks yet.' }
};

function render() {
    const counts = { todo: 0, progress: 0, done: 0 };
    Object.values(COLUMN_BODIES).forEach(id => { document.getElementById(id).innerHTML = ''; });

    const filteredTasks = getFilteredSortedTasks();

    filteredTasks.forEach(task => {
        const column = COLUMN_BODIES[task.column] ? task.column : 'todo';
        document.getElementById(COLUMN_BODIES[column]).appendChild(createTaskCardDOM(task));
        counts[column]++;
    });

    Object.keys(counts).forEach(column => {
        document.getElementById(COLUMN_COUNTS[column]).textContent = counts[column];
        checkEmptyState(column, counts[column]);
        document.getElementById(`${column}TabBadge`).textContent = counts[column];
    });
}

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
        if (state.sortBy === 'priority-desc') {
            const w = { high: 3, medium: 2, low: 1 };
            return w[b.priority] - w[a.priority];
        }
        if (state.sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
    });
    return filteredTasks;
}

function renderTimestampsOnly() {
    document.querySelectorAll('.task-card').forEach(card => {
        const task = state.tasks.find(t => t.id === card.dataset.id);
        const time = card.querySelector('.task-time');
        if (task && time) time.textContent = formatRelativeTime(task.createdAt);
    });
}

function checkEmptyState(column, count) {
    if (count > 0) return;
    const info = EMPTY_STATES[column];
    document.getElementById(COLUMN_BODIES[column]).innerHTML =
        `<div class="empty-column-placeholder"><i class="fas ${info.icon}"></i><p>${info.text}</p></div>`;
}

function createTaskCardDOM(task) {
    const priority = task.priority || 'low';
    const column = task.column || 'todo';

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

    const del = document.createElement('button');
    del.className = 'btn-card-action';
    del.title = 'Delete task';
    del.innerHTML = '<i class="fas fa-trash-alt"></i>';
    del.addEventListener('click', () => deleteTask(task.id));

    const time = document.createElement('span');
    time.className = 'task-time';
    time.textContent = formatRelativeTime(task.createdAt);

    const headerRight = document.createElement('div');
    headerRight.className = 'task-header-right';
    headerRight.appendChild(time);
    headerRight.appendChild(del);

    header.appendChild(badge);
    if (task.devinSessionId) {
        const working = isDevinWorking(task);
        const label = devinStatusLabel(task);
        const pill = document.createElement('span');
        pill.className = `devin-status-pill devin-${label.replace(/\s+/g, '-').toLowerCase()}${working ? ' devin-working' : ''}${task.devinSessionUrl ? ' devin-clickable' : ''}`;
        pill.title = task.devinSessionUrl ? 'Open Devin session' : 'Devin session status';
        pill.innerHTML = `<i class="fas ${working ? 'fa-spinner fa-spin' : 'fa-robot'}"></i> `;
        pill.appendChild(document.createTextNode(label));
        if (task.devinSessionUrl) pill.addEventListener('click', () => openDevinSession(task.id));
        header.appendChild(pill);
    }
    header.appendChild(headerRight);

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
    actionsLeft.innerHTML = column === 'done'
        ? `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="View Task"><i class="fas fa-expand-alt"></i></button>`
        : `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="Edit Task"><i class="fas fa-pencil-alt"></i></button>`;
    if (devinEnabled && column === 'todo' && !task.devinSessionId) {
        actionsLeft.innerHTML += `<button class="btn-card-action btn-devin" onclick="openDevinModal('${task.id}')" title="Run with Devin"><i class="fas fa-robot"></i></button>`;
    } else if (task.devinSessionId) {
        actionsLeft.innerHTML += `<button class="btn-card-action btn-devin-open" onclick="openDevinSession('${task.id}')" title="Open Devin session"><i class="fas fa-arrow-up-right-from-square"></i></button>`;
    }
    const arrows = document.createElement('div');
    arrows.className = 'card-nav-arrows';

    let arrowsHtml = '';
    if (column === 'todo') {
        arrowsHtml = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to Progress"><i class="fas fa-arrow-right"></i></button>`;
    } else if (column === 'progress') {
        arrowsHtml = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'todo')" title="Move to To Do"><i class="fas fa-arrow-left"></i></button>` +
                     `<button class="btn-arrow" onclick="moveTask('${task.id}', 'done')" title="Move to Done"><i class="fas fa-arrow-right"></i></button>`;
    } else {
        arrowsHtml = `<button class="btn-arrow" onclick="moveTask('${task.id}', 'progress')" title="Move to In Progress"><i class="fas fa-arrow-left"></i></button>`;
    }
    arrows.innerHTML = arrowsHtml;

    footer.appendChild(actionsLeft);
    footer.appendChild(arrows);

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, task.id);
    });

    if (column !== 'done') {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (e) => { card.classList.add('dragging'); e.dataTransfer.setData('text/plain', task.id); });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
    }

    return card;
}
