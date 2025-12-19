// src/app/actions/logout.ts
'use server';

import { redirect } from "next/navigation";

export async function logout() {
  // В NextAuth 4 серверный logout делается через redirect
  redirect("/api/auth/signout?callbackUrl=/");
}