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

    const del = document.createElement('button');
    del.className = 'btn-card-action';
    del.title = 'Delete task';
    del.innerHTML = '<i class="fas fa-trash-alt"></i>';
    del.addEventListener('click', () => deleteTask(task.id));

    header.appendChild(badge);
    header.appendChild(del);

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
    return card;
}
