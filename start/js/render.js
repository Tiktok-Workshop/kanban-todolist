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

const TAB_BADGES = {
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

    state.tasks.forEach(task => {
        const body = document.getElementById(COLUMN_BODIES[task.column]);
        if (!body) return;
        body.appendChild(createTaskCardDOM(task));
        counts[task.column]++;
    });

    Object.keys(counts).forEach(column => {
        document.getElementById(COLUMN_COUNTS[column]).textContent = counts[column];
        document.getElementById(TAB_BADGES[column]).textContent = counts[column];
        checkEmptyState(column, counts[column]);
    });
}

function checkEmptyState(column, count) {
    if (count > 0) return;
    const body = document.getElementById(COLUMN_BODIES[column]);
    const placeholder = document.createElement('div');
    placeholder.className = 'empty-column-placeholder';
    placeholder.innerHTML = `<i class="fas ${EMPTY_STATES[column].icon}"></i><p>${EMPTY_STATES[column].message}</p>`;
    body.appendChild(placeholder);
}

function createTaskCardDOM(task) {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}`;
    card.dataset.id = task.id;

    card.innerHTML = `
        <div class="task-header">
            <span class="badge-priority ${task.priority}" onclick="openBadgePriorityMenu(event, '${task.id}')">${task.priority}</span>
            ${buildDevinStatusPill(task)}
            <div class="task-header-actions">
                ${buildDevinCardButton(task)}
                <button class="btn-card-action" title="Delete task" onclick="deleteTask('${task.id}')"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
        <h4 class="task-title"></h4>
        ${task.desc
            ? '<p class="task-desc-excerpt"></p>'
            : '<p class="task-desc-excerpt" style="color:var(--text-muted); font-style:italic;">No description provided.</p>'}
        <div class="task-footer">
            <div class="card-nav-arrows">${buildNavArrows(task)}</div>
        </div>
    `;

    card.querySelector('.task-title').textContent = task.title;
    if (task.desc) card.querySelector('.task-desc-excerpt').textContent = task.desc;

    if (task.column !== 'done') {
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

function buildDevinCardButton(task) {
    if (!devinEnabled) return '';
    if (task.devinSessionId) {
        return `<button class="btn-card-action btn-devin-open" title="Open Devin session" onclick="openDevinSession('${task.id}')"><i class="fas fa-arrow-up-right-from-square"></i></button>`;
    }
    if (task.column !== 'todo') return '';
    return `<button class="btn-card-action btn-devin" title="Run with Devin" onclick="openDevinModal('${task.id}')"><i class="fas fa-robot"></i></button>`;
}

function buildDevinStatusPill(task) {
    if (!task.devinSessionId) return '';

    const label = devinStatusLabel(task);
    const classes = ['devin-status-pill', `devin-${label.replace(/\s+/g, '-')}`];
    if (isDevinWorking(task)) classes.push('devin-working');

    const icon = isDevinWorking(task) ? 'fa-spinner fa-spin' : 'fa-robot';
    if (!task.devinSessionUrl) {
        return `<span class="${classes.join(' ')}"><i class="fas ${icon}"></i>${label}</span>`;
    }

    classes.push('devin-clickable');
    return `<span class="${classes.join(' ')}" title="Open Devin session" onclick="openDevinSession('${task.id}')"><i class="fas ${icon}"></i>${label}</span>`;
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
