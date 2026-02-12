import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession } from "@/services/chatService";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatSidebarProps {
    sessions: ChatSession[];
    currentSessionId: string | null;
    onSelectSession: (session: ChatSession) => void;
    onNewChat: () => void;
    onDeleteChat: (e: React.MouseEvent, id: string) => void;
    isOpen?: boolean;
}

export function ChatSidebar({
    sessions,
    currentSessionId,
    onSelectSession,
    onNewChat,
    onDeleteChat
}: ChatSidebarProps) {
    return (
        <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full">
            <div className="p-4 border-b border-slate-200">
                <Button
                    onClick={onNewChat}
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                >
                    <Plus className="w-4 h-4" />
                    Start New Chat
                </Button>
            </div>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-2 space-y-1">
                        {sessions.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground text-sm">
                                No saved chats yet.
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => onSelectSession(session)}
                                    className={`
                    group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all
                    ${currentSessionId === session.id
                                            ? "bg-white shadow-sm border border-slate-200"
                                            : "hover:bg-slate-200/50 border border-transparent"}
                  `}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? "text-primary" : "text-slate-400"}`} />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-medium truncate text-slate-700">
                                                {session.title || "New Chat"}
                                            </span>
                                            <span className="text-[10px] text-slate-400 truncate">
                                                {formatDistanceToNow(session.lastUpdated, { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-slate-100"
                                        onClick={(e) => onDeleteChat(e, session.id)}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
