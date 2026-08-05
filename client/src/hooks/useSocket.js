import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { getApiUrl } from '../api.js';

export function useSocket(token) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      setConnected(false);
      socketRef.current?.disconnect();
      socketRef.current = null;
      return undefined;
    }

    const socket = io(getApiUrl(), {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return { socket: socketRef.current, connected };
}
