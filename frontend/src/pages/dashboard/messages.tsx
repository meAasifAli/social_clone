import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Send, ArrowLeft, MessageSquarePlus } from "lucide-react";

import { useAppSelector } from "@/store/hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageSocketMutation,
  useMarkAsReadMutation,
  useCreateConversationMutation,
  useSyncOnlineUsersQuery,
} from "@/store/apis/message-api";
import { useGetAllUsersQuery } from "@/store/apis/user-api";
import { cn } from "@/lib/utils";

export default function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get("userId");

  const authUser = useAppSelector((state) => state.auth.user);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);

  const { data: conversations, isLoading: isConversationsLoading } = useGetConversationsQuery();
  const { data: suggestions } = useGetAllUsersQuery();
  const { data: onlineUsers } = useSyncOnlineUsersQuery();
  
  const [sendMessageSocket] = useSendMessageSocketMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [createConversation, { isLoading: isCreatingChat }] = useCreateConversationMutation();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine active conversation based on selectedUserId
  useEffect(() => {
    if (selectedUserId && conversations) {
      const existing = conversations.find((c) => c.user.id === selectedUserId);
      if (existing) {
        setActiveConversationId(existing.id);
        setNewChatOpen(false); // Close dialog if open
      } else {
        createConversation({ targetUserId: selectedUserId })
          .unwrap()
          .then((convo) => {
            setActiveConversationId(convo.id);
            setNewChatOpen(false); // Close dialog
            setSearchParams({});
          })
          .catch(console.error);
      }
    }
  }, [selectedUserId, conversations]);

  // Read status effect
  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId]);

  const { data: messages, isLoading: isMessagesLoading } = useGetMessagesQuery(
    { conversationId: activeConversationId! },
    { skip: !activeConversationId }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConversation = conversations?.find((c) => c.id === activeConversationId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    try {
      await sendMessageSocket({
        conversationId: activeConversationId,
        content: newMessage.trim(),
      }).unwrap();
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const startNewChat = async (userId: string) => {
    try {
      const convo = await createConversation({ targetUserId: userId }).unwrap();
      setActiveConversationId(convo.id);
      setNewChatOpen(false);
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  return (
    <div className="flex flex-1 h-full w-full overflow-hidden bg-background border rounded-lg shadow-sm">
      {/* Sidebar: Conversations List */}
      <div
        className={cn(
          "w-full md:w-80 flex-col border-r bg-muted/10",
          activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        <div className="p-4 border-b flex items-center justify-between bg-background">
          <span className="font-semibold text-lg">Messages</span>
          <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <MessageSquarePlus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] mt-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-medium text-muted-foreground px-2 mb-2">All Users</div>
                  {suggestions?.map((user) => {
                    const isOnline = onlineUsers?.includes(user.id);
                    return (
                    <button
                      key={user.id}
                      disabled={isCreatingChat}
                      onClick={() => startNewChat(user.id)}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition text-left"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || ""} />
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background bg-green-500" />
                        )}
                      </div>
                      <div className="flex flex-col flex-1 truncate">
                        <span className="font-semibold text-sm truncate">{user.fullName || user.username}</span>
                        <span className="text-xs text-muted-foreground truncate">@{user.username}</span>
                      </div>
                    </button>
                    )
                  })}
                  {(!suggestions || suggestions.length === 0) && (
                    <div className="text-sm text-center text-muted-foreground py-4">
                      No suggestions found.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="flex-1">
          {isConversationsLoading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
          ) : conversations?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-3 h-full">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <MessageSquarePlus className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">No messages found</h3>
              <p className="text-sm text-muted-foreground">
                Start connecting with others right now.
              </p>
              <Button className="mt-2 rounded-full px-6" onClick={() => setNewChatOpen(true)}>
                New message
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-1 p-2">
              {conversations?.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).map((conversation) => {
                const isSelected = conversation.id === activeConversationId;
                const avatarFallback = conversation.user.username.charAt(0).toUpperCase();
                const isOnline = onlineUsers?.includes(conversation.user.id);

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all text-left group overflow-hidden",
                      isSelected && "bg-muted shadow-sm"
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11 border bg-muted transition-transform group-hover:scale-105">
                        <AvatarImage src={conversation.user.avatar} className="object-cover" />
                        <AvatarFallback className="bg-transparent">{avatarFallback}</AvatarFallback>
                      </Avatar>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background bg-green-500" />
                      )}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1 gap-2">
                        <span className="font-semibold text-sm truncate">
                          {conversation.user.username}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {format(new Date(conversation.updatedAt), "MMM d")}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-xs truncate w-full block",
                          conversation.unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {conversation.latestMessage || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-background relative overflow-hidden",
          !activeConversationId ? "hidden md:flex" : "flex"
        )}
      >
        {activeConversationId && activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-background sticky top-0 z-10">
              <button
                className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                onClick={() => setActiveConversationId(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="relative">
                <Avatar className="h-10 w-10 border shadow-sm">
                  <AvatarImage src={activeConversation.user.avatar} className="object-cover" />
                  <AvatarFallback className="bg-muted">
                    {activeConversation.user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {onlineUsers?.includes(activeConversation.user.id) && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background bg-green-500" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold leading-none mb-1">{activeConversation.user.username}</span>
                {onlineUsers?.includes(activeConversation.user.id) ? (
                  <span className="text-xs text-green-500 font-medium">Online</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Offline</span>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 min-h-0 relative">
              <ScrollArea className="h-full bg-background absolute inset-0">
                <div className="flex flex-col gap-4 w-full p-4 lg:p-6 pb-2">
                {isMessagesLoading ? (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    Loading messages...
                  </div>
                ) : (
                  messages?.map((message) => {
                    const isOwnMessage = message.sender.id === authUser?.id;

                    return (
                      <div
                        key={message.id}
                        className={cn("flex max-w-[85%] sm:max-w-[75%] flex-col gap-1", isOwnMessage ? "self-end" : "self-start")}
                      >
                        <div
                          className={cn(
                            "px-4 py-2.5 text-[15px] shadow-sm relative group",
                            isOwnMessage
                              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                              : "bg-muted text-foreground rounded-2xl rounded-bl-sm"
                          )}
                        >
                          {message.content}
                        </div>
                        <span className={cn(
                          "text-[10px] text-muted-foreground px-1 select-none",
                          isOwnMessage ? "text-right" : "text-left"
                        )}>
                          {format(new Date(message.createdAt), "HH:mm")}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
           </div>

            {/* Chat Input */}
            <div className="pt-2 pb-4 px-4 bg-transparent shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center w-full">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="rounded-full pl-6 pr-6 py-4 bg-muted border-transparent hover:bg-muted/80 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent transition-colors shadow-sm text-base h-auto flex-1"
                  autoComplete="off"
                />
                <Button 
                  type="submit" 
                  className="rounded-full transition-transform active:scale-95 bg-primary hover:bg-primary/90 shadow-sm px-6 h-auto py-3.5" 
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Send className="h-16 w-16 mb-4 opacity-20" />
            <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
