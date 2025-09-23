import { User } from '../models/User';
import { Collection } from '../models/Collection';
import { NFT } from '../models/NFT';
import { Transaction } from '../models/Transaction';

export async function up() {
  await Promise.all([
    User.syncIndexes(),
    Collection.syncIndexes(),
    NFT.syncIndexes(),
    Transaction.syncIndexes(),
  ]);

  await Promise.all([
    NFT.collection.createIndex({ collectionId: 1, onSale: 1, price: 1 }),
    NFT.collection.createIndex({ owner: 1, createdAt: -1 }),
    Transaction.collection.createIndex({ nft: 1, createdAt: -1 }),
  ]);
}

export async function down() {
  try {
    await Promise.all([
      NFT.collection.dropIndex('collectionId_1_onSale_1_price_1').catch(() => {}),
      NFT.collection.dropIndex('owner_1_createdAt_-1').catch(() => {}),
      Transaction.collection.dropIndex('nft_1_createdAt_-1').catch(() => {}),
    ]);
  } catch {}
}

