"use server";

import { signOut } from "@/auth";

/**
 * Server Action для выхода пользователя
 * Безопасно для App Router
 */
export async function logout() {
  await signOut({
    redirectTo: "/login",
  });
}
