import { listNotifications, markNotificationsRead } from '../services/store.js';

export function getNotifications(req, res) {
  res.json({ notifications: listNotifications(req.user.id) });
}

export function markNotificationsReadHandler(req, res) {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
  markNotificationsRead(req.user.id, ids);
  res.json({ ok: true });
}
