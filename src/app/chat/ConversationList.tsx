"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Conversation = {
  conversationId: string;
  counterpart: {
    id: string;
    name: string;
  };
  lastMessage: {
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
  } | null;
  updatedAt: Date;
};

type ConversationListProps = {
  conversations: Conversation[];
};

function formatConversationTime(date: Date) {
  const conversationDate = new Date(date);
  const today = new Date();

  const conversationDay = new Date(conversationDate.getFullYear(), conversationDate.getMonth(), conversationDate.getDate());

  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const yesterdayDay = new Date(todayDay);
  yesterdayDay.setDate(yesterdayDay.getDate() - 1);

  if (conversationDay.getTime() === todayDay.getTime()) {
    return conversationDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (conversationDay.getTime() === yesterdayDay.getTime()) {
    return "Yesterday";
  }

  return conversationDate.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

export default function ConversationList({ conversations }: ConversationListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedConversationId = searchParams.get("conversationId");

  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
        <p className="text-sm font-bold text-foreground">No conversations yet</p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">Start a new chat below.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {conversations.map((conversation) => {
        const isSelected = selectedConversationId === conversation.conversationId;

        return (
          <button
            key={conversation.conversationId}
            type="button"
            onClick={() => router.push(`/chat?conversationId=${conversation.conversationId}`)}
            className={`w-full rounded-xl px-3 py-3 text-left transition-colors ${isSelected ? "bg-brand text-brand-foreground" : "text-foreground hover:bg-surface-muted"}`}
          >
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${isSelected ? "bg-brand-foreground text-brand" : "bg-surface-muted text-foreground"}`} aria-hidden="true">
                {conversation.counterpart.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <strong className="truncate text-sm font-extrabold">{conversation.counterpart.name}</strong>

                  <span className={`shrink-0 text-[11px] ${isSelected ? "opacity-70" : "text-muted-foreground"}`}>{formatConversationTime(conversation.updatedAt)}</span>
                </div>

                <p className={`mt-1 truncate text-xs ${isSelected ? "opacity-75" : "text-muted-foreground"}`}>{conversation.lastMessage ? conversation.lastMessage.content : "No messages yet."}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
