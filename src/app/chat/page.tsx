import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/lib/auth";
import { getUserConversations } from "@/lib/conversations";
import { getConversationMessages } from "@/lib/messages";
import { getUserById, getUsersExceptCurrentUser } from "@/lib/users";
import AppHeader from "./AppHeader";
import ConversationList from "./ConversationList";
import MessageInput from "./MessageInput";
import MessageList from "./MessageList";
import NewChat from "./NewChat";

export default async function ChatPage({ searchParams }: { searchParams: Promise<{ conversationId?: string }> }) {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/login");
  }

  const currentUser = await getUserById(userId);

  if (!currentUser) {
    redirect("/login");
  }

  const { conversationId } = await searchParams;

  const conversations = await getUserConversations(userId);

  const users = await getUsersExceptCurrentUser(userId);

  const messages = conversationId ? await getConversationMessages(conversationId, userId) : [];

  const selectedConversation = conversationId ? conversations.find((conversation) => conversation.conversationId === conversationId) : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <AppHeader name={currentUser.name} email={currentUser.email} />

      <div className="mx-auto w-full max-w-7xl px-0 py-0 sm:px-6 sm:py-4 lg:px-8">
        <section className="grid h-[calc(100vh-4rem)] overflow-hidden border-border bg-surface sm:rounded-2xl sm:border sm:shadow-sm lg:h-[calc(100vh-6rem)] lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className={`${conversationId ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-b border-border bg-surface lg:border-b-0 lg:border-r`}>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-foreground">Conversations</h1>

                <p className="mt-0.5 text-xs text-muted-foreground">Your conversations</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <ConversationList conversations={conversations} />
            </div>

            <div className="border-t border-border p-4">
              <NewChat users={users} />
            </div>
          </aside>

          {/* Conversation area */}
          <section className={`${conversationId ? "flex" : "hidden lg:flex"} min-h-0 flex-col overflow-hidden bg-background`}>
            {!conversationId ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center">
                <div className="max-w-sm">
                  <h2 className="text-lg font-extrabold tracking-tight text-foreground">Select a conversation</h2>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Choose a conversation from the list or start a new chat to begin messaging.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Conversation header */}
                <header className="flex min-h-16 items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <Link
                      href="/chat"
                      aria-label="Back to conversations"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-lg font-bold text-foreground transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-foreground/20 lg:hidden"
                    >
                      ←
                    </Link>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-extrabold text-foreground">{selectedConversation?.counterpart.name.charAt(0).toUpperCase() ?? "?"}</div>

                    <div className="min-w-0">
                      <h2 className="truncate text-base font-extrabold text-foreground">{selectedConversation?.counterpart.name ?? "Conversation"}</h2>

                      <p className="mt-0.5 text-xs text-muted-foreground">Internal conversation</p>
                    </div>
                  </div>
                </header>

                {/* Messages */}
                <MessageList messages={messages} currentUserId={userId} />

                {/* Composer */}
                <div className="border-t border-border bg-surface p-3 sm:p-4">
                  <div className="mx-auto w-full max-w-3xl">
                    <MessageInput conversationId={conversationId} />
                  </div>
                </div>
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
