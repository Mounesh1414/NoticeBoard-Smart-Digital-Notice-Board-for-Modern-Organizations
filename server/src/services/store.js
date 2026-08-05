import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { emitNoticeEvent, emitUserNotification } from './socket.js';

const defaultCategories = [
  { id: 'academic', name: 'Academic', color: '#2563eb', icon: 'book' },
  { id: 'placement', name: 'Placement', color: '#0f766e', icon: 'briefcase' },
  { id: 'hr', name: 'HR', color: '#9333ea', icon: 'users' },
  { id: 'events', name: 'Events', color: '#db2777', icon: 'calendar' },
  { id: 'holidays', name: 'Holidays', color: '#ea580c', icon: 'sun' },
  { id: 'emergency', name: 'Emergency', color: '#dc2626', icon: 'alert-triangle' },
  { id: 'circulars', name: 'Circulars', color: '#4f46e5', icon: 'file-text' },
  { id: 'meetings', name: 'Meetings', color: '#16a34a', icon: 'video' },
];

const state = {
  users: [],
  notices: [],
  notifications: [],
  categories: defaultCategories,
};

function createId() {
  return crypto.randomUUID();
}

async function seedAdmin() {
  if (state.users.length > 0) {
    return;
  }

  const password = await bcrypt.hash('Admin@12345', 10);
  state.users.push({
    id: createId(),
    name: 'System Admin',
    email: 'admin@noticeboard.local',
    password,
    role: 'admin',
    department: 'Administration',
    profileImage: '',
    bookmarks: [],
    createdAt: new Date().toISOString(),
  });
}

await seedAdmin();

export function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    profileImage: user.profileImage,
    bookmarks: user.bookmarks || [],
    createdAt: user.createdAt,
  };
}

export function listUsers() {
  return state.users.map(toPublicUser);
}

export function findUserById(id) {
  return state.users.find((user) => user.id === id) || null;
}

export function findUserByEmail(email) {
  return state.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUser(input) {
  const password = await bcrypt.hash(input.password, 10);
  const user = {
    id: createId(),
    name: input.name,
    email: input.email.toLowerCase(),
    password,
    role: input.role || 'student',
    department: input.department || 'General',
    profileImage: '',
    bookmarks: [],
    createdAt: new Date().toISOString(),
  };

  state.users.push(user);
  return user;
}

export function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password);
}

function createAttachmentDescriptor(file) {
  return {
    name: file.originalname,
    url: `/uploads/${file.filename}`,
    type: file.mimetype,
    size: file.size,
  };
}

function getNoticeSummary(description) {
  const plainText = String(description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plainText.length <= 180) {
    return plainText;
  }

  return `${plainText.slice(0, 180).trim()}...`;
}

function computeStatus(notice) {
  const now = new Date();
  const publishDate = notice.publishDate ? new Date(notice.publishDate) : now;
  const expiryDate = notice.expiryDate ? new Date(notice.expiryDate) : null;

  if (expiryDate && expiryDate < now) {
    return 'archived';
  }

  if (publishDate > now) {
    return 'scheduled';
  }

  return 'published';
}

function normalizeNotice(notice) {
  return {
    ...notice,
    summary: getNoticeSummary(notice.description),
    status: computeStatus(notice),
  };
}

export function listCategories() {
  return state.categories;
}

export function createNotice(input, author) {
  const notice = normalizeNotice({
    id: createId(),
    title: input.title,
    description: input.description,
    category: input.category,
    department: input.department || 'All',
    priority: input.priority || 'normal',
    attachments: input.attachments || [],
    createdBy: toPublicUser(author),
    publishDate: input.publishDate || new Date().toISOString(),
    expiryDate: input.expiryDate || '',
    status: 'draft',
    isPinned: input.isPinned || false,
    views: 0,
    bookmarks: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    readBy: [],
  });

  state.notices.unshift(notice);
  return notice;
}

export function updateNotice(id, changes) {
  const notice = state.notices.find((item) => item.id === id);
  if (!notice) {
    return null;
  }

  Object.assign(notice, {
    ...changes,
    updatedAt: new Date().toISOString(),
  });

  return normalizeNotice(notice);
}

export function removeNotice(id) {
  const index = state.notices.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  state.notices.splice(index, 1);
  return true;
}

export function getNoticeById(id) {
  return state.notices.find((item) => item.id === id) || null;
}

export function listNotices(filters = {}) {
  const { search = '', category = '', department = '', priority = '', status = '', bookmarkedBy = '' } = filters;
  const term = String(search).trim().toLowerCase();

  return state.notices
    .map(normalizeNotice)
    .filter((notice) => {
      const matchesSearch = !term || [notice.title, notice.description, notice.category, notice.department].some((value) => String(value || '').toLowerCase().includes(term));
      const matchesCategory = !category || notice.category === category;
      const matchesDepartment = !department || notice.department === department;
      const matchesPriority = !priority || notice.priority === priority;
      const matchesStatus = !status || notice.status === status;
      const matchesBookmark = !bookmarkedBy || (notice.bookmarks?.includes(bookmarkedBy) ?? false);

      return matchesSearch && matchesCategory && matchesDepartment && matchesPriority && matchesStatus && matchesBookmark;
    })
    .sort((left, right) => {
      if (left.isPinned !== right.isPinned) {
        return left.isPinned ? -1 : 1;
      }

      return new Date(right.createdAt) - new Date(left.createdAt);
    });
}

export function incrementView(id, userId) {
  const notice = getNoticeById(id);
  if (!notice) {
    return null;
  }

  notice.views += 1;
  if (userId && !notice.readBy.includes(userId)) {
    notice.readBy.push(userId);
  }

  return normalizeNotice(notice);
}

export function toggleBookmark(userId, noticeId) {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }

  user.bookmarks = user.bookmarks || [];
  const existingIndex = user.bookmarks.indexOf(noticeId);
  if (existingIndex >= 0) {
    user.bookmarks.splice(existingIndex, 1);
  } else {
    user.bookmarks.push(noticeId);
  }

  return toPublicUser(user);
}

export function getBookmarks(userId) {
  const user = findUserById(userId);
  if (!user) {
    return [];
  }

  return listNotices({ bookmarkedBy: userId });
}

export function listNotifications(userId) {
  return state.notifications
    .filter((notification) => notification.userId === userId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export function createNotification(userId, noticeId, type = 'notice') {
  const notification = {
    id: createId(),
    userId,
    noticeId,
    isRead: false,
    type,
    createdAt: new Date().toISOString(),
  };

  state.notifications.unshift(notification);
  emitUserNotification(userId, notification);
  return notification;
}

export function markNotificationsRead(userId, ids = []) {
  const selectedIds = new Set(ids);
  state.notifications.forEach((notification) => {
    if (notification.userId === userId && (ids.length === 0 || selectedIds.has(notification.id))) {
      notification.isRead = true;
    }
  });
}

export function publishNotice(notice) {
  notice.status = 'published';
  notice.updatedAt = new Date().toISOString();
  state.users.forEach((user) => {
    if (user.role !== 'guest') {
      createNotification(user.id, notice.id);
    }
  });
  emitNoticeEvent('notice:published', normalizeNotice(notice));
}

export function archiveNotice(notice) {
  notice.status = 'archived';
  notice.updatedAt = new Date().toISOString();
  emitNoticeEvent('notice:archived', normalizeNotice(notice));
}

export function listDashboardStats(user) {
  const notices = listNotices({});
  const activeNotices = notices.filter((notice) => notice.status === 'published');
  const scheduledNotices = notices.filter((notice) => notice.status === 'scheduled');
  const archivedNotices = notices.filter((notice) => notice.status === 'archived');

  return {
    totalUsers: state.users.length,
    totalNotices: notices.length,
    activeNotices: activeNotices.length,
    scheduledNotices: scheduledNotices.length,
    archivedNotices: archivedNotices.length,
    readRate: notices.length ? Math.round((notices.reduce((sum, notice) => sum + notice.readBy.length, 0) / (notices.length * Math.max(state.users.length, 1))) * 100) : 0,
    recentActivities: state.notifications.slice(0, 8),
    latestNotices: notices.slice(0, 6),
    pinnedNotices: notices.filter((notice) => notice.isPinned).slice(0, 6),
    notifications: user ? listNotifications(user.id).slice(0, 10) : [],
  };
}

export function applyLifecycleTick() {
  let changed = false;

  state.notices.forEach((notice) => {
    const nextStatus = computeStatus(notice);
    if (nextStatus !== notice.status) {
      notice.status = nextStatus;
      notice.updatedAt = new Date().toISOString();
      changed = true;

      if (nextStatus === 'published') {
        state.users.forEach((user) => {
          if (user.role !== 'guest') {
            createNotification(user.id, notice.id, 'publish');
          }
        });
        emitNoticeEvent('notice:published', normalizeNotice(notice));
      }

      if (nextStatus === 'archived') {
        emitNoticeEvent('notice:archived', normalizeNotice(notice));
      }
    }
  });

  return changed;
}

let lifecycleTimer;

export function startNoticeLifecycleLoop() {
  if (lifecycleTimer) {
    return;
  }

  lifecycleTimer = setInterval(() => {
    applyLifecycleTick();
  }, 15000);
}

export function getStateSnapshot() {
  return state;
}
