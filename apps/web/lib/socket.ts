'use client';
import { io, Socket } from 'socket.io-client';
import { API_URL } from './env';

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, { withCredentials: true });
  }
  return socket;
}