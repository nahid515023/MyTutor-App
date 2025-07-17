import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/chat-images';
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

export const uploadChatImage = [
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const imageUrl = `/chat-images/${req.file.filename}`;
      res.json({ url: imageUrl });
    } catch (error) {
      next(error);
    }
  }
];

export const getChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { connectedId } = req.params;
    const chat = await prisma.chat.findMany({ where: { connectedId }, orderBy: { createdAt: 'asc' } });
    res.json({ chat });
  } catch (error) {
    next(error);
  }
};

export const createChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { connectedId, message, senderId, receiverId } = req.body;
    const chat = await prisma.chat.create({ data: { senderId, receiverId, connectedId, message } });
    res.json({ chat });
  } catch (error) {
    next(error);
  }
};

export const deleteChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.chat.delete({ where: { id: req.params.id } });
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    next(error);
  }
};

export const connectUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contactUserId } = req.params;
    const userId = req.user?.id;

    if (!userId || !contactUserId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (userId === contactUserId) {
      return res.status(400).json({ error: 'Cannot connect to yourself' });
    }

    // Check if connection already exists
    const existingConnection = await prisma.connectedAccount.findFirst({
      where: {
        OR: [
          { userId, contactUserId },
          { userId: contactUserId, contactUserId: userId }
        ]
      }
    });

    if (existingConnection) {
      return res.status(202).json({ message: 'Connection already exists', connection: existingConnection });
    }

    const connection = await prisma.connectedAccount.create({
      data: { userId, contactUserId }
    });

    res.status(201).json({ connection });
  } catch (error) {
    next(error);
  }
};

export const disconnectUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.connectedAccount.delete({ where: { id: req.params.connectedId } });
    res.json({ message: 'Disconnected' });
  } catch (error) {
    next(error);
  }
};

export const getConnectedUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const connectedUsers = await prisma.connectedAccount.findMany({
      where: { OR: [{ userId }, { contactUserId: userId }] },
      include: { ContactUser: true, User: true }
    });
    res.json({ connectedUsers });
  } catch (error) {
    next(error);
  }
};
