const REPORT_PRIORITIES = ['high', 'medium', 'low'];

function getTasksDoneThisWeek() {
    const weekStart = getStartOfWeek();
    return state.tasks.filter(t =>
        t.column === 'done' && t.completed && (t.completedAt || t.editedAt || t.createdAt) >= weekStart
    );
}

function openWeeklyReport() {
    const body = document.getElementById('reportBody');
    const done = getTasksDoneThisWeek();
    const weekStart = new Date(getStartOfWeek());
    const rangeLabel = `${weekStart.toLocaleDateString('en-US', { month:'short', day:'numeric' })} – ${new Date().toLocaleDateString('en-US', { month:'short', day:'numeric' })}`;

    body.innerHTML = '';

    const summary = document.createElement('div');
    summary.className = 'report-summary';
    summary.innerHTML = `
        <div class="report-total"><span class="report-total-count">${done.length}</span><span class="report-total-label">task${done.length === 1 ? '' : 's'} completed</span></div>
        <div class="report-range">Week of ${rangeLabel}</div>
        <div class="report-pills">
            ${REPORT_PRIORITIES.map(p => `<span class="badge-priority ${p}">${p}: ${done.filter(t => t.priority === p).length}</span>`).join('')}
        </div>`;
    body.appendChild(summary);

    if (done.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-column-placeholder';
        empty.innerHTML = '<i class="fas fa-check-double"></i><p>No tasks completed this week yet.</p>';
        body.appendChild(empty);
    }

    REPORT_PRIORITIES.forEach(priority => {
        const group = done
            .filter(t => t.priority === priority)
            .sort((a, b) => (b.completedAt || b.editedAt || 0) - (a.completedAt || a.editedAt || 0));
        if (group.length === 0) return;

        const section = document.createElement('section');
        section.className = `report-group priority-${priority}`;

        const heading = document.createElement('div');
        heading.className = 'report-group-header';
        heading.innerHTML = `<span class="badge-priority ${priority}">${priority}</span><span class="report-group-count">${group.length}</span>`;
        section.appendChild(heading);

        const list = document.createElement('ul');
        list.className = 'report-list';
        group.forEach(task => {
            const item = document.createElement('li');
            item.className = 'report-item';
            const title = document.createElement('span');
            title.className = 'report-item-title';
            title.textContent = task.title;
            const when = document.createElement('span');
            when.className = 'report-item-time';
            when.textContent = `Done ${formatRelativeTime(task.completedAt || task.editedAt)}`;
            item.appendChild(title);
            item.appendChild(when);
            list.appendChild(item);
        });
        section.appendChild(list);
        body.appendChild(section);
    });

    openModal('reportModal');
}
