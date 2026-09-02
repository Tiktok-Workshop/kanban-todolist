function formatRelativeTime(timestamp) {
    if (!timestamp) return 'Never';
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'yesterday';
    return new Date(timestamp).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

function formatFullTime(timestamp) {
    if (!timestamp) return 'Never edited';
    return new Date(timestamp).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit' });
}

// Monday 00:00 local time of the week containing `now`.
function getStartOfWeek(now = Date.now()) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    const offset = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - offset);
    return d.getTime();
}
