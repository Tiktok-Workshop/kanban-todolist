function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const addTodoCard = document.getElementById('addTodoCard');

    document.getElementById('addTodoBtn').addEventListener('click', addNewTodo);
    titleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addNewTodo();
    });

    titleInput.addEventListener('input', () => {
        document.getElementById('titleCounter').textContent = `${40 - titleInput.value.length} left`;
    });
    descInput.addEventListener('input', () => {
        document.getElementById('descCounter').textContent = `${150 - descInput.value.length} left`;
    });

    document.getElementById('saveEditBtn').addEventListener('click', saveEditedTask);
    const taskTitleInput = document.getElementById('taskTitleInput');
    const taskDescInput = document.getElementById('taskDescInput');
    taskTitleInput.addEventListener('input', () => {
        document.getElementById('taskTitleCounter').textContent = `${40 - taskTitleInput.value.length} left`;
    });
    taskDescInput.addEventListener('input', () => {
        document.getElementById('taskDescCounter').textContent = `${150 - taskDescInput.value.length} left`;
    });

    document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; saveToStorage(); render(); });
    document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; saveToStorage(); render(); });

    titleInput.addEventListener('focus', () => addTodoCard.classList.add('expanded'));
    document.addEventListener('click', (e) => {
        if (!addTodoCard.contains(e.target) && !titleInput.value && !descInput.value) {
            addTodoCard.classList.remove('expanded');
        }
    });
}
