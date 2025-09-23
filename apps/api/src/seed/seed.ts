import { connectDB } from '../db';
import { User } from '../models/User';
import { Collection } from '../models/Collection';
import { NFT } from '../models/NFT';
import { Transaction } from '../models/Transaction';
import mongoose from 'mongoose';

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SEED_STRING = process.env.SEED_STRING || 'spectra-market-seed';
const RNG = mulberry32(hashSeed(SEED_STRING));

const PROFILE = (process.env.SEED_PROFILE || 'small').toLowerCase() as
  | 'small'
  | 'medium'
  | 'large';

const DEFAULTS = {
  small: { users: 6, collections: 5, nfts: 60, withTxs: true },
  medium: { users: 16, collections: 10, nfts: 240, withTxs: true },
  large: { users: 32, collections: 16, nfts: 500, withTxs: true },
}[PROFILE];

const USERS = Number(process.env.SEED_USERS || DEFAULTS.users);
const COLLECTIONS = Number(process.env.SEED_COLLECTIONS || DEFAULTS.collections);
const NFTS = Number(process.env.SEED_NFTS || DEFAULTS.nfts);
const SEED_TXNS = String(process.env.SEED_TXNS || (DEFAULTS.withTxs ? 'yes' : 'no')).toLowerCase() === 'yes';

function choice<T>(arr: T[]) {
  return arr[Math.floor(RNG() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(RNG() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2) {
  const v = RNG() * (max - min) + min;
  const p = Math.pow(10, decimals);
  return Math.round(v * p) / p;
}

function roundTo(value: number, decimals = 2) {
  const p = Math.pow(10, decimals);
  return Math.round(value * p) / p;
}

const REALISTIC_COLLECTIONS = [
  {
    name: "Bored Ape Yacht Club",
    description: "A collection of 10,000 Bored Ape NFTs—unique digital collectibles living on the Ethereum blockchain. Your Bored Ape doubles as your Yacht Club membership card, and grants access to members-only benefits.",
    category: "PFP",
    verified: true,
    featured: true,
    totalSupply: 10000,
    floorPrice: 15.5,
    volumeTraded: 1250000,
    websiteUrl: "https://boredapeyachtclub.com",
    twitterUrl: "https://twitter.com/BoredApeYC",
    discordUrl: "https://discord.gg/3P5K3dzgdB"
  },
  {
    name: "CryptoPunks",
    description: "10,000 unique collectible characters with proof of ownership stored on the Ethereum blockchain. The project that inspired the modern CryptoArt movement.",
    category: "PFP",
    verified: true,
    featured: true,
    totalSupply: 10000,
    floorPrice: 45.2,
    volumeTraded: 2800000,
    websiteUrl: "https://larvalabs.com/cryptopunks",
    twitterUrl: "https://twitter.com/cryptopunksnfts"
  },
  {
    name: "Art Blocks",
    description: "Curated generative art collections where the algorithm is the artist. Each piece is unique and created by code.",
    category: "Generative Art",
    verified: true,
    featured: true,
    totalSupply: 5000,
    floorPrice: 2.8,
    volumeTraded: 450000,
    websiteUrl: "https://artblocks.io",
    twitterUrl: "https://twitter.com/artblocks_io"
  },
  {
    name: "World of Women",
    description: "A collection of 10,000 NFTs celebrating representation, inclusivity, and equal opportunities for all.",
    category: "PFP",
    verified: true,
    featured: false,
    totalSupply: 10000,
    floorPrice: 0.8,
    volumeTraded: 180000,
    websiteUrl: "https://worldofwomen.art",
    twitterUrl: "https://twitter.com/worldofwomennft"
  },
  {
    name: "Doodles",
    description: "A community-driven collectibles project featuring art by Burnt Toast. Doodles come in a joyful range of colors, traits and sizes with a collection size of 10,000.",
    category: "PFP",
    verified: true,
    featured: true,
    totalSupply: 10000,
    floorPrice: 3.2,
    volumeTraded: 320000,
    websiteUrl: "https://doodles.app",
    twitterUrl: "https://twitter.com/doodles"
  },
  {
    name: "CloneX",
    description: "Next-gen Avatars For The Metaverse. CloneX is a collection of 20,000 next-gen Avatars, designed by RTFKT.",
    category: "3D",
    verified: true,
    featured: true,
    totalSupply: 20000,
    floorPrice: 4.1,
    volumeTraded: 280000,
    websiteUrl: "https://clonex.rtfkt.com",
    twitterUrl: "https://twitter.com/RTFKT"
  },
  {
    name: "Azuki",
    description: "A brand for the metaverse. Built by the community. Azuki starts with a collection of 10,000 avatars that give you membership access to The Garden.",
    category: "PFP",
    verified: true,
    featured: true,
    totalSupply: 10000,
    floorPrice: 2.5,
    volumeTraded: 150000,
    websiteUrl: "https://www.azuki.com",
    twitterUrl: "https://twitter.com/azukiofficial"
  },
  {
    name: "Cool Cats",
    description: "Cool Cats is a collection of 9,999 randomly generated and stylistically curated NFTs that exist on the Ethereum Blockchain.",
    category: "PFP",
    verified: true,
    featured: false,
    totalSupply: 9999,
    floorPrice: 1.2,
    volumeTraded: 95000,
    websiteUrl: "https://coolcatsnft.com",
    twitterUrl: "https://twitter.com/coolcatsnft"
  },
  {
    name: "Meebits",
    description: "20,000 unique 3D voxel characters, created by a custom generative algorithm, then registered on the Ethereum blockchain.",
    category: "3D",
    verified: true,
    featured: false,
    totalSupply: 20000,
    floorPrice: 0.9,
    volumeTraded: 120000,
    websiteUrl: "https://meebits.larvalabs.com",
    twitterUrl: "https://twitter.com/meebitsnft"
  },
  {
    name: "Mutant Ape Yacht Club",
    description: "A collection of up to 20,000 Mutant Apes that can only be created by exposing an existing Bored Ape to a vial of MUTANT SERUM.",
    category: "PFP",
    verified: true,
    featured: true,
    totalSupply: 20000,
    floorPrice: 3.8,
    volumeTraded: 200000,
    websiteUrl: "https://boredapeyachtclub.com",
    twitterUrl: "https://twitter.com/BoredApeYC"
  },
  {
    name: "Fidenza",
    description: "Fidenza is a long-form generative art project created by Tyler Hobbs. It is a series of outputs, each with a unique grid structure driven by an underlying algorithm.",
    category: "Generative Art",
    verified: true,
    featured: true,
    totalSupply: 999,
    floorPrice: 8.5,
    volumeTraded: 180000,
    websiteUrl: "https://tylerxhobbs.com/fidenza",
    twitterUrl: "https://twitter.com/tylerxhobbs"
  },
  {
    name: "Chromie Squiggle",
    description: "Chromie Squiggle by Snowfro is a generative art project that creates unique, colorful squiggles. Each piece is algorithmically generated.",
    category: "Generative Art",
    verified: true,
    featured: false,
    totalSupply: 9999,
    floorPrice: 1.8,
    volumeTraded: 75000,
    websiteUrl: "https://snowfro.com",
    twitterUrl: "https://twitter.com/snowfro"
  }
];

const REALISTIC_USERS = [
  { name: "Beeple", username: "beeple", bio: "Digital artist behind 'Everydays'." },
  { name: "Pak", username: "pak", bio: "Anonymous digital artist; creator of 'The Fungible'." },
  { name: "XCOPY", username: "xcopy", bio: "Glitch art exploring tech and mortality." },
  { name: "Hackatao", username: "hackatao", bio: "Italian duo blending symbolism and tech." },
  { name: "FEWOCiOUS", username: "fewocious", bio: "Colorful, emotional works about identity." },
  { name: "Tyler Hobbs", username: "tylerhobbs", bio: "Generative artist; algorithmic aesthetics." },
  { name: "Snowfro", username: "snowfro", bio: "Art Blocks founder; Chromie Squiggle." },
  { name: "Matt DesLauriers", username: "mattdesl", bio: "Creative coder; math and art." },
  { name: "Sofia Crespo", username: "sofiacrespo", bio: "Nature and AI explorations." },
  { name: "Refik Anadol", username: "refikanadol", bio: "Immersive ML-driven installations." },
  { name: "Casey Reas", username: "caseyreas", bio: "Processing co-creator; generative art." },
  { name: "Mario Klingemann", username: "quasimondo", bio: "AI art pioneer." },
  { name: "Helena Sarin", username: "helenasarin", bio: "Neural artworks and sketching." },
  { name: "Robbie Barrat", username: "robbiebarrat", bio: "GANs and creative ML." },
  { name: "Anna Ridler", username: "annaridler", bio: "Data, AI, and narratives." },
];

const FILE_TYPES = ['image', 'video', 'audio', 'gif', '3d'];
const RARITY_LEVELS = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic'];

const TRAIT_CATEGORIES = {
  PFP: {
    'Background': ['Blue', 'Purple', 'Red', 'Green', 'Yellow', 'Orange', 'Pink', 'Black', 'White', 'Rainbow'],
    'Eyes': ['Normal', 'Laser', 'Cyborg', '3D', 'Zombie', 'Alien', 'Robot', 'Demon', 'Angel', 'Wink'],
    'Mouth': ['Smile', 'Frown', 'Open', 'Tongue', 'Teeth', 'Fangs', 'Lips', 'Mustache', 'Beard', 'None'],
    'Hat': ['None', 'Cap', 'Crown', 'Helmet', 'Beanie', 'Top Hat', 'Cowboy', 'Wizard', 'Crown', 'Headband'],
    'Clothing': ['T-Shirt', 'Suit', 'Hoodie', 'Dress', 'Armor', 'Robe', 'Jacket', 'Tank Top', 'Sweater', 'Naked'],
    'Accessories': ['None', 'Glasses', 'Sunglasses', 'Mask', 'Earrings', 'Necklace', 'Watch', 'Bracelet', 'Ring', 'Chain'],
    'Fur': ['None', 'Brown', 'Black', 'White', 'Gray', 'Blonde', 'Red', 'Blue', 'Green', 'Purple'],
    'Expression': ['Happy', 'Sad', 'Angry', 'Surprised', 'Confused', 'Sleepy', 'Excited', 'Calm', 'Fierce', 'Mysterious']
  },
  'Generative Art': {
    'Palette': ['Monochrome', 'Rainbow', 'Pastel', 'Neon', 'Earth Tones', 'Cool', 'Warm', 'High Contrast', 'Muted', 'Vibrant'],
    'Pattern': ['Geometric', 'Organic', 'Fractal', 'Spiral', 'Grid', 'Wave', 'Dots', 'Lines', 'Curves', 'Abstract'],
    'Density': ['Sparse', 'Medium', 'Dense', 'Very Dense', 'Variable', 'Clustered', 'Scattered', 'Uniform', 'Random', 'Structured'],
    'Complexity': ['Simple', 'Moderate', 'Complex', 'Very Complex', 'Minimalist', 'Detailed', 'Layered', 'Multi-dimensional', 'Dynamic', 'Static'],
    'Mood': ['Calm', 'Energetic', 'Mysterious', 'Playful', 'Serious', 'Meditative', 'Chaotic', 'Harmonious', 'Melancholic', 'Uplifting']
  },
  '3D': {
    'Material': ['Metal', 'Plastic', 'Glass', 'Wood', 'Stone', 'Fabric', 'Crystal', 'Liquid', 'Gas', 'Energy'],
    'Texture': ['Smooth', 'Rough', 'Glossy', 'Matte', 'Reflective', 'Transparent', 'Opaque', 'Translucent', 'Fuzzy', 'Sharp'],
    'Color': ['Monochrome', 'Multi-color', 'Gradient', 'Metallic', 'Neon', 'Pastel', 'Vibrant', 'Muted', 'Transparent', 'Glowing'],
    'Shape': ['Geometric', 'Organic', 'Abstract', 'Humanoid', 'Animal', 'Mechanical', 'Crystalline', 'Fluid', 'Angular', 'Curved'],
    'Animation': ['Static', 'Rotating', 'Pulsing', 'Floating', 'Spinning', 'Bouncing', 'Glowing', 'Morphing', 'Particle', 'None']
  }
};

const COLLECTION_THEMES: Record<string, { banner: string; logo: string }> = {
  'bored ape yacht club': { banner: 'yacht, tropical, palm, luxury', logo: 'ape, portrait, illustration' },
  'cryptopunks': { banner: 'city, neon, cyberpunk, pixel', logo: 'pixel art face, 8-bit, portrait' },
  'art blocks': { banner: 'generative art, abstract patterns, geometry', logo: 'abstract geometric, bold colors' },
  'world of women': { banner: 'women, diversity, vibrant colors', logo: 'female portrait, illustration' },
  'doodles': { banner: 'pastel colors, playful, doodles', logo: 'cartoon face, pastel portrait' },
  'clonex': { banner: 'futuristic, 3d render, neon', logo: '3d avatar, portrait' },
  'azuki': { banner: 'anime, garden, sakura, red', logo: 'anime portrait, illustration' },
  'cool cats': { banner: 'cats, playful, blue', logo: 'cat illustration, portrait' },
  'meebits': { banner: 'voxel, 3d, minimal', logo: 'voxel face, 3d portrait' },
  'mutant ape yacht club': { banner: 'mutant, neon, lab', logo: 'mutant ape, portrait' },
  'fidenza': { banner: 'generative art, fidenza style, curves', logo: 'abstract curves, warm palette' },
  'chromie squiggle': { banner: 'rainbow, gradient, neon', logo: 'colorful squiggle, minimal' },
};

function getCollectionMedia(name: string, index: number) {
  const key = name.toLowerCase();
  const theme = COLLECTION_THEMES[key];
  if (theme) {
    const banner = `https://source.unsplash.com/1500x500/?${encodeURIComponent(theme.banner)}`;
    const logo = `https://source.unsplash.com/400x400/?${encodeURIComponent(theme.logo)}`;
    return { banner, logo };
  }

  return {
    banner: getMediaUrl(`${name}-banner`, index, 'image').replace('/800/800', '/1500/500'),
    logo: getMediaUrl(`${name}-logo`, index, 'image').replace('/800/800', '/400/400'),
  };
}

function getMediaUrl(collectionName: string, tokenId: number, fileType: string): string {
  const imageBase = 'https://picsum.photos/seed';
  const collectionSlug = collectionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const id = `${collectionSlug}-${tokenId}`;
  switch (fileType) {
    case 'image':
      return `${imageBase}/${encodeURIComponent(id)}/800/800`;
    case 'video':
      return 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4';
    case 'audio':
      return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    case 'gif':
      return 'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif';
    case '3d':
      return `https://modelviewer.dev/shared-assets/models/Astronaut.glb`;
    default:
      return `${imageBase}/${encodeURIComponent(id)}/800/800`;
  }
}

function generateRealisticAttributes(collection: any, tokenId: number): any[] {
  const category = collection.category || 'PFP';
  const traits = TRAIT_CATEGORIES[category as keyof typeof TRAIT_CATEGORIES] || TRAIT_CATEGORIES.PFP;
  const attributes: any[] = [];
  
  const numAttributes = randInt(3, 6);
  const traitTypes = Object.keys(traits);
  
  for (let i = 0; i < numAttributes; i++) {
    const traitType = choice(traitTypes);
    const values = traits[traitType as keyof typeof traits];
    const value = choice(values);
    const rarity = choice(RARITY_LEVELS);
    
    attributes.push({
      trait_type: traitType,
      value: value,
      rarity: rarity
    });
  }
  
  return attributes;
}

function calculateRarityScore(attributes: any[]): number {
  const rarityWeights = {
    'Common': 1,
    'Uncommon': 2,
    'Rare': 3,
    'Epic': 4,
    'Legendary': 5,
    'Mythic': 6
  };
  
  const totalScore = attributes.reduce((sum, attr) => {
    return sum + (rarityWeights[attr.rarity as keyof typeof rarityWeights] || 1);
  }, 0);
  
  return Math.min(100, Math.round((totalScore / attributes.length) * 10));
}

async function main() {
  const conn = await connectDB();

  console.log('🧹 Cleaning existing data...');
  await Promise.all([
    User.deleteMany({}),
    Collection.deleteMany({}),
    NFT.deleteMany({}),
    Transaction.deleteMany({}),
  ]);

  console.log('👥 Creating users...');
  const users: any[] = [];
  for (let i = 0; i < USERS; i++) {
    const userData = REALISTIC_USERS[i % REALISTIC_USERS.length];
    const username = `${userData.username}_${i}`;
    const email = `${username}@nftmarketplace.com`;
    const balance = randFloat(100, 5000, 2);
    const passwordHash = '$2a$10$uM7p3nRWsxZ.ZKqXUSY1qOj0e7r1PMyAo4vu1cWJrd19IP5KgiVEa';

    users.push({
      email,
      username,
      passwordHash,
      balance,
      bio: userData.bio,
      avatarSeed: `${userData.username}-${i}`,
      createdAt: new Date(Date.now() - randInt(30, 365) * 24 * 3600 * 1000),
    });
  }
  const userDocs = (await User.create(users, { ordered: true })) as any[];

  console.log('📚 Creating collections...');
  const collections: any[] = [];
  for (let i = 0; i < COLLECTIONS; i++) {
    const collectionData = REALISTIC_COLLECTIONS[i % REALISTIC_COLLECTIONS.length];
    const creator = choice(userDocs);
    const bannerSeed = `${collectionData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-banner-${i}`;
    const media = getCollectionMedia(collectionData.name, i);
    
    collections.push({
      name: collectionData.name,
      description: collectionData.description,
      creator: creator._id,
      category: collectionData.category,
      bannerSeed,
      bannerUrl: media.banner,
      logoUrl: media.logo,
      websiteUrl: collectionData.websiteUrl,
      twitterUrl: collectionData.twitterUrl,
      discordUrl: collectionData.discordUrl,
      totalSupply: collectionData.totalSupply,
      floorPrice: collectionData.floorPrice,
      volumeTraded: collectionData.volumeTraded,
      verified: collectionData.verified,
      featured: collectionData.featured,
      createdAt: new Date(Date.now() - randInt(1, 180) * 24 * 3600 * 1000),
    });
  }
  const colDocs = await Collection.create(collections, { ordered: true });

  console.log('🎨 Creating NFTs...');
  const nfts: any[] = [];
  const collectionToContract = new Map<string, string>();
  for (const col of colDocs) {
    const slug = (col.name as string).toLowerCase().replace(/[^a-z0-9]/g, '');
    const hex = Buffer.from(slug).toString('hex').slice(0, 40).padEnd(40, '0');
    collectionToContract.set(String(col._id), `0x${hex}`);
  }

  for (let i = 0; i < NFTS; i++) {
    const collection = colDocs[i % colDocs.length];
    const creator = choice(userDocs);
    const owner = choice(userDocs);
    const fileType = choice(FILE_TYPES);
    const tokenId = i + 1;
    
    const collectionName = collection.name as string;
    const series = collectionName.split(' ').join('');
    const tokenName = `${collectionName} #${tokenId}`;
    const seed = `${series}-${tokenId}`;
    const onSale = RNG() > 0.4;
    
    const basePrice = collection.floorPrice || 0.1;
    const priceMultiplier = randFloat(0.5, 5.0, 2);
    const price = onSale ? roundTo(basePrice * priceMultiplier, 2) : undefined;
    
    const createdAt = new Date(Date.now() - randInt(0, 90) * 24 * 3600 * 1000);
    const attributes = generateRealisticAttributes(collection, tokenId);
    const rarityScore = calculateRarityScore(attributes);
    
    let dimensions;
    if (fileType === 'image' || fileType === 'gif') {
      dimensions = { width: 800, height: 800 };
    } else if (fileType === 'video') {
      dimensions = { width: 1920, height: 1080 };
    } else if (fileType === '3d') {
      dimensions = { width: 1024, height: 1024 };
    }
    
    const nft = {
      name: tokenName,
      description: `A unique ${collection.category} NFT from the ${collection.name} collection. This piece represents the intersection of art and technology, created through algorithmic generation.`,
      imageSeed: seed,
      imageUrl: getMediaUrl(collection.name, tokenId, 'image'),
      videoUrl: fileType === 'video' ? getMediaUrl(collection.name, tokenId, 'video') : undefined,
      audioUrl: fileType === 'audio' ? getMediaUrl(collection.name, tokenId, 'audio') : undefined,
      creator: creator._id,
      owner: owner._id,
      collectionId: collection._id,
      attributes,
      price,
      onSale,
      tokenId,
      contractAddress: collectionToContract.get(String(collection._id)),
      fileType,
      fileSize: randInt(100000, 10000000), // 100KB to 10MB
      dimensions,
      rarityScore,
      views: randInt(0, 1000),
      likes: randInt(0, 100),
      createdAt,
    };
    nfts.push(nft);
  }
  const nftDocs = await NFT.insertMany(nfts, { ordered: false });

  if (SEED_TXNS) {
    console.log('📊 Creating transactions...');
    const txs: any[] = [];
    const now = Date.now();
    
    for (const nft of nftDocs) {
      const initialOwner = nft.owner;
      const mintAt = new Date(now - randInt(1, 60) * 24 * 3600 * 1000);
      
      txs.push({
        type: 'mint',
        nft: nft._id,
        to: initialOwner,
        createdAt: mintAt,
      });

      const doSale = RNG() > 0.6;
      if (doSale) {
        const buyer: any = (choice(userDocs) as any)._id;
        const salePrice = randFloat(0.1, 10.0, 2);
        const soldAt = new Date(mintAt.getTime() + randInt(1, 30) * 24 * 3600 * 1000);
        txs.push({
          type: 'sale',
          nft: nft._id,
          from: initialOwner,
          to: buyer,
          price: salePrice,
          createdAt: soldAt,
        });
      }

      if (nft.onSale && nft.price) {
        const listAt = new Date(now - randInt(1, 7) * 24 * 3600 * 1000);
        txs.push({
          type: 'list',
          nft: nft._id,
          from: doSale ? undefined : initialOwner,
          price: nft.price,
          createdAt: listAt,
        });
      }
    }

    if (txs.length) await Transaction.insertMany(txs, { ordered: false });
  }

  console.log('✅ Seed data created successfully!');
  console.log(`👥 Users: ${userDocs.length}`);
  console.log(`📚 Collections: ${colDocs.length}`);
  console.log(`🎨 NFTs: ${nftDocs.length}`);
  console.log(`📊 Transactions: ${SEED_TXNS ? 'Generated' : 'Skipped'}`);

  await mongoose.connection.close();
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
