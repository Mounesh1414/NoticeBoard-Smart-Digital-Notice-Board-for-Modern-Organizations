import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api.js';
import { NotificationPanel } from '../components/NotificationPanel.jsx';
import { NoticeCard } from '../components/NoticeCard.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

const emptyForm = {
  title: '',
  description: '',
  category: 'Academic',
  department: 'All',
  priority: 'normal',
  publishDate: '',
  expiryDate: '',
  isPinned: false,
};

export function DashboardPage() {
  const { user, token, setUser } = useAuth();
  const { socket, connected } = useSocket(token);
  const [dashboard, setDashboard] = useState(null);
  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      const [dashboardResponse, noticesResponse, notificationsResponse, bookmarksResponse] = await Promise.all([
        apiRequest('/api/dashboard'),
        apiRequest('/api/notices'),
        apiRequest('/api/notifications'),
        apiRequest('/api/notices/bookmarks'),
      ]);

      if (!mounted) {
        return;
      }

      setDashboard(dashboardResponse.dashboard);
      setNotices(noticesResponse.notices);
      setNotifications(notificationsResponse.notifications);
      setBookmarks(bookmarksResponse.notices);
      setSelectedNotice(noticesResponse.notices[0] || null);
    }

    loadDashboard().catch((error) => setMessage(error.message));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const refresh = async () => {
      const [noticesResponse, notificationsResponse, dashboardResponse, bookmarksResponse] = await Promise.all([
        apiRequest('/api/notices'),
        apiRequest('/api/notifications'),
        apiRequest('/api/dashboard'),
        apiRequest('/api/notices/bookmarks'),
      ]);

      setNotices(noticesResponse.notices);
      setNotifications(notificationsResponse.notifications);
      setDashboard(dashboardResponse.dashboard);
      setBookmarks(bookmarksResponse.notices);
    };

    socket.on('notice:created', refresh);
    socket.on('notice:updated', refresh);
    socket.on('notice:published', refresh);
    socket.on('notice:archived', refresh);
    socket.on('notice:deleted', refresh);
    socket.on('notification:new', refresh);

    return () => {
      socket.off('notice:created', refresh);
      socket.off('notice:updated', refresh);
      socket.off('notice:published', refresh);
      socket.off('notice:archived', refresh);
      socket.off('notice:deleted', refresh);
      socket.off('notification:new', refresh);
    };
  }, [socket]);

  const visibleNotices = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return notices;
    }

    return notices.filter((notice) => [notice.title, notice.summary, notice.category, notice.department].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [notices, search]);

  async function submitNotice(event) {
    event.preventDefault();
    setMessage('');

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, String(value));
    });
    attachmentFiles.forEach((file) => payload.append('attachments', file));

    const response = await apiRequest('/api/notices', {
      method: 'POST',
      body: payload,
    });

    setNotices((current) => [response.notice, ...current]);
    setSelectedNotice(response.notice);
    setForm(emptyForm);
    setAttachmentFiles([]);
    setMessage('Notice created and broadcast live.');
  }

  async function handleBookmark(notice) {
    const response = await apiRequest(`/api/notices/${notice.id}/bookmark`, { method: 'POST' });
    setUser(response.user);
    const bookmarksResponse = await apiRequest('/api/notices/bookmarks');
    setBookmarks(bookmarksResponse.notices);
  }

  async function handleView(notice) {
    const response = await apiRequest(`/api/notices/${notice.id}/view`, { method: 'POST' });
    setSelectedNotice(response.notice);
    setNotices((current) => current.map((item) => (item.id === response.notice.id ? response.notice : item)));
  }

  async function handlePublish(notice) {
    const response = await apiRequest(`/api/notices/${notice.id}/publish`, { method: 'POST' });
    setNotices((current) => current.map((item) => (item.id === response.notice.id ? response.notice : item)));
  }

  async function handleDelete(notice) {
    await apiRequest(`/api/notices/${notice.id}`, { method: 'DELETE' });
    setNotices((current) => current.filter((item) => item.id !== notice.id));
    setSelectedNotice((current) => (current?.id === notice.id ? null : current));
  }

  async function markAllRead() {
    await apiRequest('/api/notifications/read', { method: 'PUT', body: JSON.stringify({ ids: [] }) });
    const notificationsResponse = await apiRequest('/api/notifications');
    setNotifications(notificationsResponse.notifications);
  }

  return (
    <>
      <div className="status-banner">
        {message || (connected ? 'Realtime feed is live.' : 'Connecting realtime feed...')}
      </div>

      <div className="content-grid">
        <section id="dashboard" className="dashboard-grid">
          <div className="stats-row">
            <StatCard label="Total notices" value={dashboard?.totalNotices ?? '—'} tone="blue" />
            <StatCard label="Active notices" value={dashboard?.activeNotices ?? '—'} tone="green" />
            <StatCard label="Scheduled" value={dashboard?.scheduledNotices ?? '—'} tone="violet" />
            <StatCard label="Read rate" value={`${dashboard?.readRate ?? 0}%`} tone="orange" />
          </div>

          {['admin', 'hr', 'faculty'].includes(user?.role) ? (
            <section className="panel composer-panel">
              <div className="panel-head">
                <div>
                  <p className="eyebrow">Admin tools</p>
                  <h3>Create notice</h3>
                </div>
              </div>

              <form className="compose-form" onSubmit={submitNotice}>
                <input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
                <textarea placeholder="Description" rows="5" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                <div className="form-row">
                  <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                    <option>Academic</option>
                    <option>Placement</option>
                    <option>HR</option>
                    <option>Events</option>
                    <option>Holidays</option>
                    <option>Emergency</option>
                    <option>Circulars</option>
                    <option>Meetings</option>
                  </select>
                  <input placeholder="Department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} />
                </div>
                <div className="form-row">
                  <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <input type="datetime-local" value={form.publishDate} onChange={(event) => setForm({ ...form, publishDate: event.target.value })} />
                </div>
                <div className="form-row">
                  <input type="datetime-local" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} />
                  <label className="checkbox-row">
                    <input type="checkbox" checked={form.isPinned} onChange={(event) => setForm({ ...form, isPinned: event.target.checked })} />
                    Pin important notice
                  </label>
                </div>
                <input type="file" multiple onChange={(event) => setAttachmentFiles(Array.from(event.target.files || []))} />
                <button type="submit" className="primary-button">Publish notice</button>
              </form>
            </section>
          ) : null}

          <section id="notices" className="panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Feed</p>
                <h3>All notices</h3>
              </div>
              <input className="search-input" placeholder="Search notices" value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>

            <div className="notice-grid">
              {visibleNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  active={selectedNotice?.id === notice.id}
                  onSelect={setSelectedNotice}
                  onBookmark={handleBookmark}
                  onView={handleView}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                  isOwner={['admin', 'hr', 'faculty'].includes(user?.role)}
                />
              ))}
            </div>
          </section>
        </section>

        <aside className="side-column">
          <section className="panel detail-panel">
            <p className="eyebrow">Selected notice</p>
            {selectedNotice ? (
              <div className="detail-card">
                <h3>{selectedNotice.title}</h3>
                <p>{selectedNotice.description}</p>
                <div className="notice-meta">
                  <span>{selectedNotice.department}</span>
                  <span>{selectedNotice.category}</span>
                  <span>{selectedNotice.status}</span>
                </div>
                {selectedNotice.attachments?.length ? (
                  <div className="attachment-list">
                    {selectedNotice.attachments.map((attachment) => (
                      <a key={attachment.url} href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${attachment.url}`} target="_blank" rel="noreferrer">
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="muted">Open a notice to read the full content.</p>
            )}
          </section>

          <NotificationPanel notifications={notifications} onMarkAllRead={markAllRead} />

          <section id="bookmarks" className="panel soft-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Bookmarks</p>
                <h3>Saved notices</h3>
              </div>
            </div>
            <div className="list-stack">
              {bookmarks.length === 0 ? <p className="muted">No bookmarked notices yet.</p> : null}
              {bookmarks.map((notice) => (
                <div key={notice.id} className="bookmark-item" onClick={() => setSelectedNotice(notice)} role="button" tabIndex={0}>
                  <strong>{notice.title}</strong>
                  <span>{notice.category}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
