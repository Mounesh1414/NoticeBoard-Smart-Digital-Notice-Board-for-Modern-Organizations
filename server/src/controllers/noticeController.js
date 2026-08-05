import { createNotice, getBookmarks, getNoticeById, incrementView, listNotices, publishNotice, removeNotice, toggleBookmark, updateNotice, listCategories } from '../services/store.js';
import { emitNoticeEvent } from '../services/socket.js';

function parseBool(value) {
  return value === true || value === 'true' || value === '1';
}

function parseAttachments(files = []) {
  return files.map((file) => ({
    name: file.originalname,
    url: `/uploads/${file.filename}`,
    type: file.mimetype,
    size: file.size,
  }));
}

export function getAllNotices(req, res) {
  const notices = listNotices({
    search: req.query.search,
    category: req.query.category,
    department: req.query.department,
    priority: req.query.priority,
    status: req.query.status,
    bookmarkedBy: req.query.bookmarked === 'true' ? req.user?.id : '',
  });

  res.json({ notices });
}

export function getNotice(req, res) {
  const notice = getNoticeById(req.params.id);
  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  res.json({ notice: { ...notice, bookmarked: req.user?.bookmarks?.includes(notice.id) || false } });
}

export function createNoticeHandler(req, res) {
  const attachments = parseAttachments(req.files || []);
  const notice = createNotice({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    department: req.body.department,
    priority: req.body.priority,
    publishDate: req.body.publishDate,
    expiryDate: req.body.expiryDate,
    isPinned: parseBool(req.body.isPinned),
    attachments,
  }, req.user);

  if (notice.status === 'published') {
    emitNoticeEvent('notice:created', notice);
  }

  res.status(201).json({ notice });
}

export function updateNoticeHandler(req, res) {
  const notice = updateNotice(req.params.id, {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    department: req.body.department,
    priority: req.body.priority,
    publishDate: req.body.publishDate,
    expiryDate: req.body.expiryDate,
    isPinned: parseBool(req.body.isPinned),
    attachments: parseAttachments(req.files || []),
  });

  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  emitNoticeEvent('notice:updated', notice);
  res.json({ notice });
}

export function deleteNoticeHandler(req, res) {
  const removed = removeNotice(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  emitNoticeEvent('notice:deleted', { id: req.params.id });
  res.json({ ok: true });
}

export function publishNoticeHandler(req, res) {
  const notice = getNoticeById(req.params.id);
  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  publishNotice(notice);
  res.json({ notice });
}

export function viewNoticeHandler(req, res) {
  const notice = incrementView(req.params.id, req.user.id);
  if (!notice) {
    return res.status(404).json({ message: 'Notice not found' });
  }

  res.json({ notice });
}

export function bookmarkNoticeHandler(req, res) {
  const user = toggleBookmark(req.user.id, req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ user });
}

export function getBookmarksHandler(req, res) {
  res.json({ notices: getBookmarks(req.user.id) });
}

export function getCategoriesHandler(_req, res) {
  res.json({ categories: listCategories() });
}
