import { Server } from 'socket.io';
import { findUserById, toPublicUser } from './store.js';

let io;

export function attachSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || true,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next();
    }

    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
      const user = findUserById(payload.sub);
      if (user) {
        socket.data.user = toPublicUser(user);
      }
    } catch {
      // Anonymous socket is fine for the demo.
    }

    next();
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    if (user) {
      socket.join(`user:${user.id}`);
      socket.join(`role:${user.role}`);
    }
    socket.emit('server:ready', { connected: true, user: user || null });
  });

  return io;
}

export function emitNoticeEvent(event, payload) {
  if (!io) {
    return;
  }

  io.emit(event, payload);
}

export function emitUserNotification(userId, payload) {
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit('notification:new', payload);
}
