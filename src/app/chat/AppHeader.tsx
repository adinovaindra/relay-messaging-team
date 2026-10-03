"use client";

import Image from "next/image";
import LogoutButton from "./LogoutButton";
import ThemeToggle from "../ThemeToggle";

type AppHeaderProps = {
  name: string;
  email: string;
};

export default function AppHeader({ name, email }: AppHeaderProps) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center">
          <div className="relative h-16 w-44 shrink-0">
            <Image src="/relay-logo-dark.svg" alt="Relay logo." fill priority className="object-contain object-left [html[data-theme='dark']_&]:hidden" />

            <Image src="/relay-logo-white.svg" alt="Relay logo." fill priority className="hidden object-contain object-left [html[data-theme='dark']_&]:block" />
          </div>

          <div className="ml-3 hidden border-l border-border pl-3 sm:block">
            <p className="text-xs font-bold text-muted-foreground">Team Messaging</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-foreground">{name}</p>

            <p className="max-w-48 truncate text-xs text-muted-foreground">{email}</p>
          </div>

          <ThemeToggle />

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
