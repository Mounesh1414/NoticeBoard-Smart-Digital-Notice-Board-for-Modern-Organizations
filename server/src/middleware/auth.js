import jwt from 'jsonwebtoken';
import { findUserById, toPublicUser } from '../services/store.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'noticeboard-secret');
    const user = findUserById(decoded.sub);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = toPublicUser(user);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
}
