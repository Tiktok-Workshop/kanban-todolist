function setupEventListeners() {
    const titleInput = document.getElementById('todoTitleInput');
    const descInput = document.getElementById('todoDescInput');
    const addCard = document.getElementById('addTodoCard');

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
    document.getElementById('taskTitleInput').addEventListener('input', (e) => {
        document.getElementById('taskTitleCounter').textContent = `${40 - e.target.value.length} left`;
    });
    document.getElementById('taskDescInput').addEventListener('input', (e) => {
        document.getElementById('taskDescCounter').textContent = `${150 - e.target.value.length} left`;
    });

    document.getElementById('searchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value.trim(); render(); });
    document.getElementById('priorityFilter').addEventListener('change', (e) => { state.filterPriority = e.target.value; saveToStorage(); render(); });
    document.getElementById('sortBySelect').addEventListener('change', (e) => { state.sortBy = e.target.value; saveToStorage(); render(); });

    titleInput.addEventListener('focus', () => addCard.classList.add('expanded'));
    document.addEventListener('click', (e) => {
        if (addCard.contains(e.target)) return;
        if (titleInput.value.trim() === '' && descInput.value.trim() === '') {
            addCard.classList.remove('expanded');
        }
    });
}
