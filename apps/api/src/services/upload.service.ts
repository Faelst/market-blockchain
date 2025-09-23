import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export function createUploader() {
  const allowed = new Set([
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'video/mp4',
    'audio/mpeg',
  ]);

  return multer({
    storage,
    limits: {
      fileSize: 10 * 1024 * 1024,
      files: 1,
    },
    fileFilter: (_req, file, cb) => {
      if (allowed.has(file.mimetype)) return cb(null, true);
      cb(new Error('Unsupported file type'));
    },
  });
}

export function fileUrl(filename: string) {
  return `/uploads/${filename}`;
}