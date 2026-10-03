"use client";

export default function ThemeToggle() {
  function handleThemeToggle() {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";

    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
  }

  return (
    <button
      type="button"
      onClick={handleThemeToggle}
      aria-label="Toggle theme"
      className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-bold text-foreground transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-foreground/20"
    >
      <span className="[html[data-theme='dark']_&]:hidden">☾ Dark</span>
      <span className="hidden [html[data-theme='dark']_&]:inline">☀ Light</span>
    </button>
  );
}
