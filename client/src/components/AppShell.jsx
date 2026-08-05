export function AppShell({ user, connected, theme, onToggleTheme, onLogout, children }) {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">NB</div>
          <h1>NoticeBoard</h1>
          <p>Live digital notices for teams, campuses, and organizations.</p>
        </div>

        <nav className="sidebar-nav">
          <a href="#dashboard">Dashboard</a>
          <a href="#notices">Notices</a>
          <a href="#bookmarks">Bookmarks</a>
        </nav>

        <div className="sidebar-footer">
          <span className={connected ? 'status online' : 'status'}>{connected ? 'Live socket connected' : 'Socket offline'}</span>
          <button className="ghost-button" type="button" onClick={onToggleTheme}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button className="ghost-button" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>{user?.name || 'NoticeBoard user'}</h2>
          </div>
          <div className="topbar-chip">
            <span>{user?.role || 'guest'}</span>
            <strong>{user?.department || 'General'}</strong>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
