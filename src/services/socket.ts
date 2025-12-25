// socket.ts
import { io, type Socket } from 'socket.io-client';

export const socket: Socket = io(
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081',
);
