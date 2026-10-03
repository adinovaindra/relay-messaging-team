"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
};

type NewChatProps = {
  users: User[];
};

export default function NewChat({ users }: NewChatProps) {
  const router = useRouter();

  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStartChat() {
    if (!selectedUserId || isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetUserId: selectedUserId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message ?? "Failed to create conversation");
        return;
      }

      router.push(`/chat?conversationId=${result.data.conversationId}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-sm font-extrabold text-foreground">
          New Chat
        </h2>

        <p className="mt-0.5 text-xs text-muted-foreground">
          Start a conversation with a colleague.
        </p>
      </div>

      {users.length === 0 ? (
        <p className="rounded-lg bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
          No users available.
        </p>
      ) : (
        <>
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            disabled={isLoading}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground focus:ring-2 focus:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Select a user</option>

            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleStartChat}
            disabled={!selectedUserId || isLoading}
            className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand px-4 text-sm font-extrabold text-brand-foreground transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? "Starting..." : "Start Chat"}
          </button>
        </>
      )}

      {error && (
        <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs font-bold text-foreground">
          {error}
        </p>
      )}
    </div>
  );
}