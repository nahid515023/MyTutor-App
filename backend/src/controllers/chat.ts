import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

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
