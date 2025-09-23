import { Request, Response } from 'express';
import { createUploader, fileUrl } from '../services/upload.service';

const uploader = createUploader();

export const UploadController = {
  middleware: uploader.single('image'),

  async upload(req: Request, res: Response) {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = fileUrl(req.file.filename);
    res.json({ url });
  },
};