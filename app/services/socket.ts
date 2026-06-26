import { io, Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let socket: Socket | null = null;

/** Get or create the singleton Socket.IO connection */
export function getSocket(): Socket {
  if (socket && socket.connected) return socket;

  socket = io(API_BASE, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket.IO connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket.IO disconnected');
  });

  socket.on('connect_error', (err) => {
    console.warn('🔌 Socket.IO connection error:', err.message);
  });

  return socket;
}

/** Join a session-specific room to receive progress events */
export function joinSession(sessionId: string): void {
  const s = getSocket();
  s.emit('join:session', sessionId);
}

/** Leave a session room */
export function leaveSession(sessionId: string): void {
  const s = getSocket();
  s.emit('leave:session', sessionId);
}

/** Disconnect the socket */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/** Register a progress event listener */
export function onProgress(
  event: string,
  callback: (data: any) => void
): () => void {
  const s = getSocket();
  s.on(event, callback);
  return () => {
    s.off(event, callback);
  };
}
