import { type RootState } from "../index";
import { io, Socket } from "socket.io-client";
import { baseApi } from "./base-api";

export interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    username?: string;
    avatar?: string;
  };
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    username: string;
    avatar?: string;
  };
  latestMessage: string | null;
  unreadCount: number;
  updatedAt: string;
}

let socket: Socket | null = null;

const getSocket = (token: string) => {
  if (!socket) {
    socket = io(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/messages`, {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket;
};

export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => "/messages/conversations",
      providesTags: ["Conversation"],
      async onCacheEntryAdded(
        _,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        const token = (getState() as RootState).auth.accessToken; // auth.accessToken instead of auth.token
        if (!token) return;

        try {
          await cacheDataLoaded;
          const currentSocket = getSocket(token);

          const handleNewMessage = (data: { message: Message; conversationId: string }) => {
            updateCachedData((draft) => {
              const convoIndex = draft.findIndex((c) => c.id === data.conversationId);
              if (convoIndex !== -1) {
                const convo = draft[convoIndex];
                convo.latestMessage = data.message.content;
                convo.updatedAt = data.message.createdAt;
                
                // Only increment unread count if the message is from someone else
                if (data.message.sender.id !== (getState() as RootState).auth.user?.id) {
                  convo.unreadCount += 1;
                }
                
                // Move to top
                draft.splice(convoIndex, 1);
                draft.unshift(convo);

                if (!window.location.pathname.includes("/messages") && data.message.sender.id !== (getState() as RootState).auth.user?.id) {
                  // Notification is now handled by the server's NotificationGateway
                  // No need to dispatch local notification here anymore
                }
              }
            });
          };

          currentSocket.on("new_message", handleNewMessage);
          await cacheEntryRemoved;
          currentSocket.off("new_message", handleNewMessage);
        } catch {}
      },
    }),
    syncOnlineUsers: builder.query<string[], void>({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(_, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }) {
        const token = (getState() as RootState).auth.accessToken;
        if (!token) return;

        try {
          await cacheDataLoaded;
          const currentSocket = getSocket(token);

          const handleOnlineUsers = (users: string[]) => {
            updateCachedData(() => users);
          };

          const handleUserStatus = ({ userId, status }: { userId: string; status: "online" | "offline" }) => {
            updateCachedData((draft) => {
              if (status === "online" && !draft.includes(userId)) draft.push(userId);
              if (status === "offline") return draft.filter((id) => id !== userId);
            });
          };

          currentSocket.on("online_users", handleOnlineUsers);
          currentSocket.on("user_status", handleUserStatus);

          await cacheEntryRemoved;
          currentSocket.off("online_users", handleOnlineUsers);
          currentSocket.off("user_status", handleUserStatus);
        } catch {}
      },
    }),
    getMessages: builder.query<Message[], { conversationId: string; limit?: number; offset?: number }>({
      query: ({ conversationId, limit = 50, offset = 0 }) =>
        `/messages/${conversationId}?limit=${limit}&offset=${offset}`,
      providesTags: (_result, _error, arg) => [{ type: "Message", id: arg.conversationId }],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved, getState }
      ) {
        const token = (getState() as RootState).auth.accessToken;
        if (!token) return;

        try {
          await cacheDataLoaded;
          const currentSocket = getSocket(token);

          const handleNewMessage = (data: { message: Message; conversationId: string }) => {
            if (data.conversationId === arg.conversationId) {
              updateCachedData((draft) => {
                draft.push(data.message);
              });
            }
          };

          currentSocket.on("new_message", handleNewMessage);
          await cacheEntryRemoved;
          currentSocket.off("new_message", handleNewMessage);
        } catch {}
      },
    }),
    createConversation: builder.mutation<Conversation, { targetUserId: string }>({
      query: (body) => ({
        url: "/messages/conversation",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversation"],
    }),
    sendMessageSocket: builder.mutation<void, { conversationId?: string; targetUserId?: string; content: string }>({
      queryFn: async (arg, { getState }) => {
        const token = (getState() as RootState).auth.accessToken;
        if (!token) return { error: { status: 401, data: "No token" } };
        const currentSocket = getSocket(token);
        
        return new Promise((resolve) => {
          currentSocket.emit("send_message", arg);
          resolve({ data: undefined });
        });
      },
    }),
    markAsRead: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/messages/${conversationId}/read`,
        method: "POST",
      }),
      async onQueryStarted(conversationId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            messageApi.util.updateQueryData("getConversations", undefined, (draft) => {
              const convo = draft.find((c) => c.id === conversationId);
              if (convo) {
                convo.unreadCount = 0;
              }
            })
          );
        } catch {}
      }
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useSendMessageSocketMutation,
  useMarkAsReadMutation,
  useSyncOnlineUsersQuery,
} = messageApi;
