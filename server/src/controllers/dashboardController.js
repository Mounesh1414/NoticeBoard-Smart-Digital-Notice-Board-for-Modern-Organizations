import { listDashboardStats } from '../services/store.js';

export function getDashboard(req, res) {
  res.json({ dashboard: listDashboardStats(req.user) });
}
