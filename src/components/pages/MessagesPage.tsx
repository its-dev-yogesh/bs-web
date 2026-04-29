"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Edit, MoreHorizontal, Image as ImageIcon, Paperclip, Smile } from "lucide-react";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { Card } from "@/components/ui/card/Card";
import { useMessageThreads, useSendMessage, useThreadMessages } from "@/hooks/queries/useMessages";
import { formatRelative } from "@/lib/date";
import { appRoutes } from "@/config/routes/app.routes";
import { useAppStore } from "@/store/main.store";
import { selectUser } from "@/store/selectors/auth.selectors";

export function MessagesPage({ thread: initialThread }: { thread?: string }) {
  const user = useAppStore(selectUser);
  const isLoggedIn = Boolean(user?._id ?? user?.id);
  const { data: threadData } = useMessageThreads({ enabled: isLoggedIn });
  const threads = threadData?.items ?? [];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeThreadId, setActiveThreadId] = useState<string>(initialThread || "");
  const [inputText, setInputText] = useState("");
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredThreads = normalizedQuery
    ? threads.filter((t) => {
        const participantNames = t.participants
          .map((p) => (p.name ?? "").toLowerCase())
          .join(" ");
        const preview = (t.preview ?? "").toLowerCase();
        return participantNames.includes(normalizedQuery) || preview.includes(normalizedQuery);
      })
    : threads;
  const activeThread = filteredThreads.find((t) => t.id === activeThreadId) ?? filteredThreads[0];
  const { data: messageData } = useThreadMessages(activeThread?.id);
  const messages = messageData?.items ?? [];
  const { mutate: sendMessage } = useSendMessage();

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-20 max-w-md mx-auto text-center space-y-4">
        <h1 className="text-[18px] font-bold text-foreground">Sign in to message brokers</h1>
        <p className="text-sm text-muted-foreground">
          Messaging is available after you log in or create an account.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href={appRoutes.login}
            className="rounded-full border border-surface-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-surface-muted"
          >
            Sign in
          </Link>
          <Link
            href={appRoutes.register}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Sign up
          </Link>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!inputText.trim() || !activeThread?.id) return;
    sendMessage({ threadId: activeThread.id, body: inputText });
    setInputText("");
  };

  const selectThread = (id: string) => {
    setActiveThreadId(id);
    setShowChatOnMobile(true);
  };

  return (
    <div className="px-0 md:px-0">
      <Card className="flex flex-col md:flex-row h-[calc(100vh-140px)] min-h-[500px] rounded-none md:rounded-xl overflow-hidden border-0 md:border border-surface-border/50 shadow-none md:shadow-sm">
        
        {/* Left: Threads List */}
        <div className={`w-full md:w-[320px] shrink-0 flex flex-col border-r border-surface-border/50 bg-surface ${
          showChatOnMobile ? "hidden md:flex" : "flex"
        }`}>
          <div className="p-3 border-b border-surface-border/50 flex justify-between items-center">
            <h3 className="font-bold text-[16px] text-foreground">Messaging</h3>
            <button className="p-1.5 hover:bg-surface-muted rounded-full text-muted-foreground hover:text-foreground transition">
              <Edit className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-3 border-b border-surface-border/50">
            <div className="flex items-center gap-2 rounded bg-[#EDF3F8] px-3 h-[34px] text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-brand/40 w-full">
              <Search className="w-4 h-4 text-gray-600" />
              <input
                type="search"
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-foreground outline-none placeholder:text-gray-600 placeholder:font-normal text-[13px]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-surface-border/50">
            {filteredThreads.map((t) => (
              <button
                key={t.id}
                onClick={() => selectThread(t.id)}
                className={`flex items-start gap-3 w-full p-4 text-left hover:bg-surface-muted transition ${
                  activeThread?.id === t.id ? "bg-brand-soft/50 border-l-4 border-brand" : ""
                }`}
              >
                <Avatar src={t.participants[0]?.avatarUrl} name={t.participants[0]?.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h4 className={`text-[14px] truncate ${t.unreadCount > 0 ? "font-bold text-foreground" : "font-semibold text-gray-700"}`}>{t.participants[0]?.name ?? "Broker"}</h4>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatRelative(t.lastMessageAt)}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate mt-0.5">Broker conversation</p>
                  <p className={`text-[12px] truncate mt-1 ${t.unreadCount > 0 ? "font-bold text-foreground" : "text-gray-500"}`}>{t.preview}</p>
                </div>
              </button>
            ))}
            {filteredThreads.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No connected people/messages found.
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Active Chat Area */}
        <div className={`flex-1 flex flex-col bg-[#FCFDFE] ${
          showChatOnMobile ? "flex" : "hidden md:flex"
        }`}>
          {/* Active Chat Header */}
          <div className="p-3 border-b border-surface-border/50 flex justify-between items-center bg-surface">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowChatOnMobile(false)}
                className="p-1 hover:bg-surface-muted rounded-full md:hidden text-gray-600"
                aria-label="Back to threads"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <Avatar src={activeThread?.participants[0]?.avatarUrl} name={activeThread?.participants[0]?.name} size="sm" />
              <div>
                <h4 className="font-bold text-[14px] text-foreground hover:underline cursor-pointer">{activeThread?.participants[0]?.name ?? "Select chat"}</h4>
                <p className="text-[11px] text-muted-foreground">Property lead discussion</p>
              </div>
            </div>
            <button className="p-1.5 hover:bg-surface-muted rounded-full text-muted-foreground hover:text-foreground transition">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Active Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-start gap-3 ${m.senderId === (user?._id ?? user?.id) ? "flex-row-reverse" : ""}`}>
                <Avatar src={undefined} name={m.senderId} size="sm" />
                <div className={`max-w-[70%] p-3 rounded-xl text-[13px] font-medium shadow-sm ${
                  m.senderId === (user?._id ?? user?.id) ? "bg-brand text-white rounded-br-none" : "bg-white border border-surface-border/50 rounded-bl-none text-foreground"
                }`}>
                  <p className="leading-relaxed">{m.body}</p>
                  <span className={`text-[9px] block text-right mt-1 ${m.senderId === (user?._id ?? user?.id) ? "text-blue-100" : "text-gray-400"}`}>{formatRelative(m.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Chat Input */}
          <div className="p-3 border-t border-surface-border/50 bg-surface">
            <div className="border border-surface-border/50 rounded-xl p-2 bg-surface-muted">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Write a message…"
                className="w-full bg-transparent outline-none resize-none text-[13px] font-medium text-foreground p-1 placeholder:text-gray-500 h-16"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <button aria-label="Attach image" className="p-1.5 hover:bg-gray-200 rounded-full transition"><ImageIcon className="w-4 h-4" /></button>
                  <button className="p-1.5 hover:bg-gray-200 rounded-full transition"><Paperclip className="w-4 h-4" /></button>
                  <button className="p-1.5 hover:bg-gray-200 rounded-full transition"><Smile className="w-4 h-4" /></button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold text-white transition ${
                    inputText.trim() ? "bg-brand hover:bg-brand-hover" : "bg-brand/50 cursor-not-allowed"
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>

        </div>

      </Card>
    </div>
  );
}
