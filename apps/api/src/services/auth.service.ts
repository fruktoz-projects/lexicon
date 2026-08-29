import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { CefrLevel, UserProfile } from '@lexicon/types';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  // Secure password hashing with salt using crypto pbkdf2
  private hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, combined: string): boolean {
    const [salt, originalHash] = combined.split(':');
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  }

  async register(params: {
    email: string;
    password: string;
    targetCefr?: CefrLevel;
    currentCefr?: CefrLevel;
  }): Promise<UserProfile> {
    const { email, password, targetCefr = CefrLevel.B2, currentCefr = CefrLevel.A2 } = params;

    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = this.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        targetCefr: targetCefr as any,
        currentCefr: currentCefr as any,
        streakDays: 1,
        lastActiveAt: new Date(),
      },
    });

    return {
      id: user.id,
      email: user.email,
      targetCefr: user.targetCefr as CefrLevel,
      currentCefr: user.currentCefr as CefrLevel,
      streakDays: user.streakDays,
      lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async login(params: { email: string; password: string }): Promise<UserProfile> {
    const { email, password } = params;

    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const valid = this.verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid email or password');
    }

    // Update streak and lastActiveAt
    const now = new Date();
    let streakDays = user.streakDays;
    if (user.lastActiveAt) {
      const lastActive = new Date(user.lastActiveAt);
      const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
      if (diffHours >= 24 && diffHours < 48) {
        streakDays += 1;
      } else if (diffHours >= 48) {
        streakDays = 1;
      }
    } else {
      streakDays = 1;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastActiveAt: now,
        streakDays,
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      targetCefr: updatedUser.targetCefr as CefrLevel,
      currentCefr: updatedUser.currentCefr as CefrLevel,
      streakDays: updatedUser.streakDays,
      lastActiveAt: updatedUser.lastActiveAt?.toISOString() ?? null,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  async getMe(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      targetCefr: user.targetCefr as CefrLevel,
      currentCefr: user.currentCefr as CefrLevel,
      streakDays: user.streakDays,
      lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
