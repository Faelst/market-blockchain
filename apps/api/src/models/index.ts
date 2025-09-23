export { User } from './User';
export { NFT } from './NFT';
export { Collection } from './Collection';
export { Transaction } from './Transaction';

export async function syncAllIndexes() {
  const { User } = await import('./User');
  const { NFT } = await import('./NFT');
  const { Collection } = await import('./Collection');
  const { Transaction } = await import('./Transaction');
  await Promise.all([
    User.syncIndexes(),
    NFT.syncIndexes(),
    Collection.syncIndexes(),
    Transaction.syncIndexes(),
  ]);
}