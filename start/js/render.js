const COLUMN_META = {
    todo:     { bodyId: 'bodyTodo',     countId: 'countTodo',     emptyIcon: 'fa-clipboard-list', emptyText: 'No tasks listed here.' },
    progress: { bodyId: 'bodyProgress', countId: 'countProgress', emptyIcon: 'fa-spinner',        emptyText: 'Nothing in progress.' },
    done:     { bodyId: 'bodyDone',     countId: 'countDone',     emptyIcon: 'fa-check-double',   emptyText: 'No completed tasks yet.' }
};

function render() {
    const counts = { todo: 0, progress: 0, done: 0 };

    Object.keys(COLUMN_META).forEach(col => {
        document.getElementById(COLUMN_META[col].bodyId).innerHTML = '';
    });

    getVisibleTasks().forEach(task => {
        const column = COLUMN_META[task.column] ? task.column : 'todo';
        document.getElementById(COLUMN_META[column].bodyId).appendChild(createTaskCardDOM(task));
        counts[column]++;
    });

    Object.keys(COLUMN_META).forEach(col => {
        document.getElementById(COLUMN_META[col].countId).textContent = counts[col];
        const tabBadge = document.getElementById(`${col}TabBadge`);
        if (tabBadge) tabBadge.textContent = counts[col];
        checkEmptyState(col, counts[col]);
    });
}

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
    const meta = COLUMN_META[column];
    const body = document.getElementById(meta.bodyId);
    body.innerHTML = `
        <div class="empty-column-placeholder">
            <i class="fas ${meta.emptyIcon}"></i>
            <p>${meta.emptyText}</p>
        </div>`;
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
    badge.title = column === 'done' ? 'Priority' : 'Change priority';
    badge.addEventListener('click', (e) => openBadgePriorityMenu(e, task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-card-action';
    deleteBtn.title = 'Delete task';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    const time = document.createElement('span');
    time.className = 'task-time';
    time.textContent = formatRelativeTime(task.createdAt);

    const headerRight = document.createElement('div');
    headerRight.className = 'task-header-right';
    headerRight.appendChild(time);
    headerRight.appendChild(deleteBtn);

    header.appendChild(badge);
    header.appendChild(headerRight);

    const avatarMeta = getAvatarMeta(task.avatar);
    const avatar = document.createElement('button');
    avatar.type = 'button';
    avatar.className = `task-avatar${task.avatar && task.avatar !== 'none' ? ' assigned' : ''}`;
    avatar.title = column === 'done' ? avatarMeta.label : `${avatarMeta.label} · click to change icon`;
    avatar.innerHTML = `<i class="fas ${avatarMeta.icon}"></i>`;
    avatar.addEventListener('click', (e) => openAvatarMenu(e, task.id));

    const title = document.createElement('h4');
    title.className = 'task-title';
    title.textContent = task.title;

    const titleRow = document.createElement('div');
    titleRow.className = 'task-title-row';
    titleRow.appendChild(avatar);
    titleRow.appendChild(title);

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
    arrows.innerHTML = buildMoveArrows(task.id, column);

    const actionsLeft = document.createElement('div');
    actionsLeft.className = 'card-actions-left';
    const isDone = column === 'done';
    actionsLeft.innerHTML = `<button class="btn-card-action" onclick="openTaskModal('${task.id}')" title="${isDone ? 'View Task' : 'Edit Task'}"><i class="fas ${isDone ? 'fa-expand-alt' : 'fa-pencil-alt'}"></i></button>`;

    footer.appendChild(actionsLeft);
    footer.appendChild(arrows);

    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart', (e) => {
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', task.id);
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
    card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, task.id);
    });

    card.appendChild(header);
    card.appendChild(titleRow);
    card.appendChild(desc);
    card.appendChild(footer);
    return card;
}

function buildMoveArrows(taskId, column) {
    const left = (target, label) =>
        `<button class="btn-arrow" onclick="moveTask('${taskId}', '${target}')" title="Move to ${label}"><i class="fas fa-arrow-left"></i></button>`;
    const right = (target, label) =>
        `<button class="btn-arrow" onclick="moveTask('${taskId}', '${target}')" title="Move to ${label}"><i class="fas fa-arrow-right"></i></button>`;

    if (column === 'todo') return right('progress', 'Progress');
    if (column === 'progress') return left('todo', 'To Do') + right('done', 'Done');
    return left('progress', 'In Progress');
}
