import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChatSession } from "@/services/chatService";
import { MessageSquare, Plus, Trash2, Pencil, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onNewChat: () => void;
  onDeleteChat: (e: React.MouseEvent, id: string) => void;
  onRenameChat?: (id: string, newTitle: string) => void;
  isOpen?: boolean;
}

export function ChatSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteChat,
  onRenameChat,
}: ChatSidebarProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(
    null,
  );
  const [newTitle, setNewTitle] = useState("");
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  const handleRenameClick = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setRenamingSessionId(session.id);
    setNewTitle(session.title || "");
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (!renamingSessionId || !newTitle.trim()) {
      toast.error("Please enter a chat title");
      return;
    }

    if (onRenameChat) {
      onRenameChat(renamingSessionId, newTitle.trim());
      toast.success("Chat renamed successfully!");
    }

    setRenameDialogOpen(false);
    setRenamingSessionId(null);
    setNewTitle("");
  };

  const handleAutoGenerateTitle = async () => {
    if (!renamingSessionId) return;

    const session = sessions.find((s) => s.id === renamingSessionId);
    if (!session || session.messages.length === 0) {
      toast.error("No messages to generate title from");
      return;
    }

    setIsGeneratingTitle(true);
    try {
      // Get first 3-5 user messages
      const userMessages = session.messages
        .filter((m) => m.role === "user")
        .slice(0, 5)
        .map((m) => m.content)
        .join(" ");

      const response = await fetch(
        "http://127.0.0.1:5000/api/generate-chat-title",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: userMessages }),
        },
      );

      if (!response.ok) throw new Error("Failed to generate title");

      const data = await response.json();
      setNewTitle(data.title || "New Conversation");
      toast.success("Title generated!");
    } catch (error) {
      console.error("Title generation error:", error);
      toast.error("Failed to generate title");
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  return (
    <>
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
                    ${
                      currentSessionId === session.id
                        ? "bg-white shadow-sm border border-slate-200"
                        : "hover:bg-slate-200/50 border border-transparent"
                    }
                  `}
                  >
                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                      <MessageSquare
                        className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? "text-primary" : "text-slate-400"}`}
                      />
                      <div className="flex flex-col overflow-hidden flex-1">
                        <span className="text-sm font-medium truncate text-slate-700">
                          {session.title || "New Chat"}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {formatDistanceToNow(session.lastUpdated, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {onRenameChat && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-primary hover:bg-slate-100"
                          onClick={(e) => handleRenameClick(e, session)}
                          title="Rename chat"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-slate-100"
                        onClick={(e) => onDeleteChat(e, session.id)}
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Give your chat a custom title or let AI generate one based on the
              conversation
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="chat-title">Chat Title</Label>
              <Input
                id="chat-title"
                placeholder="Enter chat title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleAutoGenerateTitle}
              disabled={isGeneratingTitle}
            >
              {isGeneratingTitle ? (
                <>Generating...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Generate Title
                </>
              )}
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
