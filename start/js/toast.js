function showToast(message, options = {}) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';

    const text = document.createElement('span');
    text.className = 'toast-message';
    text.textContent = message;
    toast.appendChild(text);

    const duration = options.duration || 3000;
    let dismissTimer;

    const dismiss = () => {
        clearTimeout(dismissTimer);
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    };

    if (options.actionLabel && typeof options.onAction === 'function') {
        const action = document.createElement('button');
        action.className = 'toast-action';
        action.textContent = options.actionLabel;
        action.addEventListener('click', () => {
            options.onAction();
            dismiss();
        });
        toast.appendChild(action);
    }

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 50);
    dismissTimer = setTimeout(dismiss, duration);
    return dismiss;
}
