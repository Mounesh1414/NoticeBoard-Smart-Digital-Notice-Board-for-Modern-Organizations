export function NotificationPanel({ notifications, onMarkAllRead }) {
  return (
    <section className="panel soft-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Notifications</p>
          <h3>Live inbox</h3>
        </div>
        <button type="button" className="text-button" onClick={onMarkAllRead}>
          Mark all read
        </button>
      </div>

      <div className="list-stack">
        {notifications.length === 0 ? <p className="muted">No notifications yet.</p> : null}
        {notifications.map((notification) => (
          <div key={notification.id} className={`notification-item ${notification.isRead ? 'read' : ''}`}>
            <span className="notification-dot" />
            <div>
              <strong>{notification.type}</strong>
              <p>{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
