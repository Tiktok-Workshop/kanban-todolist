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

function render() {
    const counts = { todo: 0, progress: 0, done: 0 };

    Object.values(COLUMN_BODIES).forEach(id => {
        document.getElementById(id).innerHTML = '';
    });

    state.tasks.forEach(task => {
        const column = COLUMN_BODIES[task.column] ? task.column : 'todo';
        document.getElementById(COLUMN_BODIES[column]).appendChild(createTaskCardDOM(task));
        counts[column]++;
    });

    Object.keys(counts).forEach(column => {
        document.getElementById(COLUMN_COUNTS[column]).textContent = counts[column];
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
    deleteBtn.setAttribute('onclick', `deleteTask('${task.id}')`);

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
    footer.appendChild(createNavArrows(task));

    card.appendChild(header);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(footer);
    return card;
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
