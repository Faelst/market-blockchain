import type { Server } from 'socket.io';
import { Transaction } from '../models/Transaction';

export function startMarketTicker(io: Server) {
  const tick = async () => {
    const now = new Date();
    const since = new Date(Date.now() - 1000 * 60 * 60);
    const sales = await Transaction.countDocuments({
      type: 'sale',
      createdAt: { $gte: since },
    });
    io.emit('stats', { t: now.toISOString(), salesLastHour: sales });
  };
  setInterval(tick, 15000);
  tick();
}