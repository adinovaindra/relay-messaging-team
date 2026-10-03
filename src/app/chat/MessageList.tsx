"use client";

import { useEffect, useRef } from "react";

type Message = {
  id: string;
  senderId: string;
  content: string;
  createdAt: Date;
};

type MessageListProps = {
  messages: Message[];
  currentUserId: string;
};

function formatMessageDate(date: Date) {
  const messageDate = new Date(date);
  const today = new Date();

  const messageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate(),
  );

  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const yesterdayDay = new Date(todayDay);
  yesterdayDay.setDate(yesterdayDay.getDate() - 1);

  if (messageDay.getTime() === todayDay.getTime()) {
    return "Today";
  }

  if (messageDay.getTime() === yesterdayDay.getTime()) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

export default function MessageList({
  messages,
  currentUserId,
}: MessageListProps) {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messageContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6">
        <div className="flex h-full items-center justify-center text-center">
          <div className="max-w-sm">
            <p className="text-sm font-bold text-foreground">
              No messages yet
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Send a message to start the conversation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messageContainerRef}
      className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        {messages.map((message, index) => {
          const isOwnMessage = message.senderId === currentUserId;

          const currentDate = new Date(message.createdAt);
          const previousDate =
            index > 0 ? new Date(messages[index - 1].createdAt) : null;

          const isNewDate =
            !previousDate ||
            currentDate.getFullYear() !== previousDate.getFullYear() ||
            currentDate.getMonth() !== previousDate.getMonth() ||
            currentDate.getDate() !== previousDate.getDate();

          return (
            <div key={message.id}>
              {isNewDate && (
                <div className="my-5 flex justify-center">
                  <span className="rounded-full bg-surface-muted px-3 py-1 text-[11px] font-bold text-muted-foreground">
                    {formatMessageDate(currentDate)}
                  </span>
                </div>
              )}

              <div
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[85%] flex-col ${
                    isOwnMessage ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      isOwnMessage
                        ? "rounded-br-md bg-brand text-brand-foreground"
                        : "rounded-bl-md border border-border bg-surface text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </p>
                  </div>

                  <time
                    dateTime={currentDate.toISOString()}
                    className="mt-1 px-1 text-[11px] text-muted-foreground"
                  >
                    {currentDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}