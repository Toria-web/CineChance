"use client";

import { logout } from "@/app/actions/logout";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit">
        Выйти
      </button>
    </form>
  );
}
