"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type MessageInputProps = {
  conversationId: string;
};

export default function MessageInput({ conversationId }: MessageInputProps) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent || isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message ?? "Failed to send message");
        return;
      }

      setContent("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") {
      return;
    }

    // Shift + Enter = explicitly insert a newline
    if (event.shiftKey) {
      event.preventDefault();

      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const nextContent = content.slice(0, start) + "\n" + content.slice(end);

      setContent(nextContent);

      requestAnimationFrame(() => {
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = start + 1;

        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      });

      return;
    }

    // Enter = send
    event.preventDefault();

    if (!content.trim() || isLoading) {
      return;
    }

    event.currentTarget.form?.requestSubmit();
  }

  function handleChange(value: string) {
    setContent(value);

    if (error) {
      setError("");
    }

    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 transition-colors focus-within:border-foreground/40 focus-within:ring-2 focus-within:ring-foreground/10">
        <label htmlFor="message-input" className="sr-only">
          Message
        </label>

        <textarea
          ref={textareaRef}
          id="message-input"
          value={content}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a message..."
          disabled={isLoading}
          autoComplete="off"
          rows={1}
          className="min-h-9 max-h-[120px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-2 text-sm leading-5 text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={isLoading || !content.trim()}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-brand px-4 text-sm font-extrabold text-brand-foreground transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-2 px-1 text-xs font-bold text-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
