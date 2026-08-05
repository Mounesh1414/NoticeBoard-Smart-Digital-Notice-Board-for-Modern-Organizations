export function NoticeCard({ notice, active, onSelect, onBookmark, onView, onPublish, onDelete, isOwner }) {
  return (
    <article className={`notice-card ${active ? 'active' : ''}`}>
      <div className="notice-card-head">
        <div>
          <p className="pill">{notice.category}</p>
          <h3>{notice.title}</h3>
        </div>
        <span className={`status ${notice.status}`}>{notice.status}</span>
      </div>

      <p className="notice-summary">{notice.summary || notice.description}</p>

      <div className="notice-meta">
        <span>{notice.department}</span>
        <span>{notice.priority}</span>
        <span>{notice.views} views</span>
      </div>

      <div className="notice-actions">
        <button type="button" className="text-button" onClick={() => onSelect(notice)}>
          Open
        </button>
        <button type="button" className="text-button" onClick={() => onView(notice)}>
          Read
        </button>
        <button type="button" className="text-button" onClick={() => onBookmark(notice)}>
          Bookmark
        </button>
        {isOwner ? (
          <>
            <button type="button" className="text-button" onClick={() => onPublish(notice)}>
              Publish
            </button>
            <button type="button" className="danger-button" onClick={() => onDelete(notice)}>
              Delete
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}
