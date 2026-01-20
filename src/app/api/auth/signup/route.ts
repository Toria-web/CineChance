// src/app/api/auth/signup/route.ts
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { rateLimit } from '@/middleware/rateLimit';

export async function POST(req: Request) {
  const { success } = await rateLimit(req, '/api/search');
  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests. Пожалуйста, подождите перед повторной попыткой.' },
      { status: 429 }
    );
  }

  try {
    const { email, password, name, birthDate, agreedToTerms, inviteToken } = await req.json();

    logger.debug('SIGNUP: Request received', {
      email,
      hasInviteToken: !!inviteToken,
      inviteToken: inviteToken ? inviteToken.substring(0, 20) + '...' : null,
      context: 'Auth',
    });

    if (!email || !password || !birthDate) {
      return NextResponse.json(
        { error: 'Email, пароль и дата рождения обязательны' },
        { status: 400 }
      );
    }

    if (name && (name.length < 2 || name.length > 30)) {
      return NextResponse.json(
        { error: 'Никнейм должен содержать от 2 до 30 символов' },
        { status: 400 }
      );
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        { error: 'Необходимо согласиться с Пользовательским соглашением' },
        { status: 400 }
      );
    }

    // Валидация приглашения
    let invitation = null;
    if (inviteToken) {
      invitation = await prisma.invitation.findUnique({
        where: { token: inviteToken },
        select: {
          id: true,
          email: true,
          usedAt: true,
          expiresAt: true,
        },
      });

      if (!invitation) {
        return NextResponse.json({ error: 'Приглашение не найдено' }, { status: 400 });
      }

      if (invitation.usedAt) {
        return NextResponse.json({ error: 'Приглашение уже использовано' }, { status: 400 });
      }

      if (invitation.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Срок действия приглашения истёк' }, { status: 400 });
      }

      if (invitation.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Email не соответствует приглашению' },
          { status: 400 }
        );
      }
    }

    // Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Транзакция для создания пользователя и обновления приглашения
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          hashedPassword,
          birthDate: birthDate ? new Date(birthDate) : null,
          agreedToTerms: Boolean(agreedToTerms),
          emailVerified: inviteToken ? new Date() : null,
        },
      });

      logger.info('SIGNUP: User created', { userId: newUser.id, email: newUser.email, context: 'Auth' });

      // Если было приглашение, помечаем его как использованное
      if (inviteToken && invitation) {
        await tx.invitation.update({
          where: { token: inviteToken },
          data: {
            usedAt: new Date(),
            usedById: newUser.id,
          },
        });
        logger.debug('SIGNUP: Invitation marked as used', { invitationId: invitation.id, context: 'Auth' });
      }

      return newUser;
    });

    return NextResponse.json({ id: user.id }, { status: 201 });
  } catch (error) {
    logger.error('SIGNUP: Error during registration', {
      error: error instanceof Error ? error.message : String(error),
      context: 'Auth',
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
