"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex h-9 items-center justify-center rounded-lg bg-brand px-3 text-sm font-bold text-brand-foreground transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-foreground/20"
    >
      Logout
    </button>
  );
}