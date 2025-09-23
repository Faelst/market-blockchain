import { Server } from 'socket.io';
import type http from 'node:http';
import { config } from '../config';
import { startMarketTicker } from './marketTicker';

export function initSockets(server: http.Server) {
  const io = new Server(server, {
    cors: { origin: config.corsOrigin, credentials: true },
  });
  startMarketTicker(io);
  return io;
}