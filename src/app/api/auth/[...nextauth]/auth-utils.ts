// src/app/api/auth/[...nextauth]/auth-utils.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

// Для серверных действий
export const getAuthSession = () => getServerSession(authOptions);

// Серверный signOut (альтернатива)
export async function serverSignOut() {
  // В NextAuth 4 signOut - это клиентская функция
  // Для серверных действий нужно очистить куки или использовать redirect
  return { success: true };
}