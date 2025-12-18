import { prisma } from "@/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1️⃣ Проверка существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 } // Conflict
      );
    }

    // 2️⃣ Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Создаём пользователя
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    return NextResponse.json(
      { id: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
