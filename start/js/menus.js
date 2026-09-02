const TASK_AVATARS = [
    { id: 'none',    icon: 'fa-user',        label: 'Unassigned' },
    { id: 'rocket',  icon: 'fa-rocket',      label: 'Rocket' },
    { id: 'code',    icon: 'fa-code',        label: 'Code' },
    { id: 'bug',     icon: 'fa-bug',         label: 'Bug' },
    { id: 'palette', icon: 'fa-palette',     label: 'Design' },
    { id: 'book',    icon: 'fa-book',        label: 'Docs' },
    { id: 'flask',   icon: 'fa-flask',       label: 'Research' },
    { id: 'coffee',  icon: 'fa-mug-hot',     label: 'Coffee' },
    { id: 'star',    icon: 'fa-star',        label: 'Star' },
    { id: 'heart',   icon: 'fa-heart',       label: 'Heart' }
];

function getAvatarMeta(avatarId) {
    return TASK_AVATARS.find(a => a.id === avatarId) || TASK_AVATARS[0];
}

function clampToViewport(el, x, y) {
    const rect = el.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    el.style.left = `${Math.max(8, Math.min(x, maxX)) + window.scrollX}px`;
    el.style.top = `${Math.max(8, Math.min(y, maxY)) + window.scrollY}px`;
}

/* ---------------- Right-click context menu ---------------- */
function showContextMenu(x, y, taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    hideBadgePriorityMenu();
    hideAvatarMenu();

    const menu = document.getElementById('contextMenu');
    const item = (id) => document.getElementById(id);
    const setDisabled = (id, disabled) => item(id).classList.toggle('disabled', disabled);

    setDisabled('ctxEdit', task.column === 'done');
    setDisabled('ctxMoveTodo', task.column === 'todo');
    setDisabled('ctxMoveProgress', task.column === 'progress');
    setDisabled('ctxMoveDone', task.column === 'done' || task.column === 'todo');

    const run = (fn) => () => { hideContextMenu(); fn(); };
    item('ctxView').onclick = run(() => openViewModal(taskId));
    item('ctxEdit').onclick = run(() => openEditModal(taskId));
    item('ctxMoveTodo').onclick = run(() => moveTask(taskId, 'todo'));
    item('ctxMoveProgress').onclick = run(() => moveTask(taskId, 'progress'));
    item('ctxMoveDone').onclick = run(() => moveTask(taskId, 'done'));
    item('ctxDelete').onclick = run(() => deleteTask(taskId));

    menu.classList.remove('hidden');
    clampToViewport(menu, x, y);
}

function hideContextMenu() {
    document.getElementById('contextMenu').classList.add('hidden');
}

/* ---------------- Priority badge dropdown ---------------- */
function openBadgePriorityMenu(event, taskId) {
    event.stopPropagation();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.column === 'done') {
        showToast('Completed tasks are read-only. Move it back to change priority.', 'warning');
        return;
    }
    hideContextMenu();
    hideAvatarMenu();

    const menu = document.getElementById('badgePriorityMenu');
    menu.querySelectorAll('.badge-dropdown-item').forEach(el => {
        el.onclick = (e) => {
            e.stopPropagation();
            changeTaskPriorityDirectly(taskId, el.dataset.priority);
            hideBadgePriorityMenu();
        };
    });

    menu.classList.remove('hidden');
    const rect = event.currentTarget.getBoundingClientRect();
    clampToViewport(menu, rect.left, rect.bottom + 4);
}

function hideBadgePriorityMenu() {
    document.getElementById('badgePriorityMenu').classList.add('hidden');
}

function changeTaskPriorityDirectly(taskId, newPriority) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.priority === newPriority) return;
    task.priority = newPriority;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    showToast(`Priority set to ${newPriority}.`, 'success');
}

/* ---------------- Profile icon (avatar) dropdown ---------------- */
function openAvatarMenu(event, taskId) {
    event.stopPropagation();
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.column === 'done') {
        showToast('Completed tasks are read-only. Move it back to change the icon.', 'warning');
        return;
    }
    hideContextMenu();
    hideBadgePriorityMenu();

    const menu = document.getElementById('avatarMenu');
    menu.innerHTML = '';
    TASK_AVATARS.forEach(avatar => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'avatar-option' + (avatar.id === (task.avatar || 'none') ? ' selected' : '');
        btn.title = avatar.label;
        btn.innerHTML = `<i class="fas ${avatar.icon}"></i>`;
        btn.onclick = (e) => {
            e.stopPropagation();
            changeTaskAvatar(taskId, avatar.id);
            hideAvatarMenu();
        };
        menu.appendChild(btn);
    });

    menu.classList.remove('hidden');
    const rect = event.currentTarget.getBoundingClientRect();
    clampToViewport(menu, rect.left, rect.bottom + 4);
}

function hideAvatarMenu() {
    document.getElementById('avatarMenu').classList.add('hidden');
}

function changeTaskAvatar(taskId, avatarId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || (task.avatar || 'none') === avatarId) return;
    task.avatar = avatarId;
    task.editedAt = Date.now();
    saveToStorage();
    render();
    showToast(`Icon set to ${getAvatarMeta(avatarId).label}.`, 'success');
}

function hideAllMenus() {
    hideContextMenu();
    hideBadgePriorityMenu();
    hideAvatarMenu();
    const actions = document.getElementById('headerActionsMenu');
    if (actions) actions.classList.add('hidden');
}
