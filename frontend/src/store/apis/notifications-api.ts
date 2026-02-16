import { baseApi } from "./base-api";

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "repost" | "mention";
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  data?: {
    postId?: string;
    postContent?: string;
    commentId?: string;
    commentContent?: string;
  };
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: "/notifications",
        params: { page, limit },
      }),
      providesTags: ["Notifications"],
    }),

    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => "/notifications/unread-count",
      providesTags: ["UnreadCount"],
    }),

    getNotificationStats: builder.query<
      { total: number; unread: number; byType: Record<string, number> },
      void
    >({
      query: () => "/notifications/stats",
    }),

    markAsRead: builder.mutation<
      { success: true; unreadCount: number },
      string
    >({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    markMultipleAsRead: builder.mutation<
      { success: true; unreadCount: number },
      string[]
    >({
      query: (notificationIds) => ({
        url: "/notifications/read-multiple",
        method: "PATCH",
        body: { notificationIds },
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    markAllAsRead: builder.mutation<
      { success: true; unreadCount: number },
      void
    >({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    deleteNotification: builder.mutation<
      { success: true; unreadCount: number },
      string
    >({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    clearAllNotifications: builder.mutation<{ success: true }, void>({
      query: () => ({
        url: "/notifications/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useGetNotificationStatsQuery,
  useMarkAsReadMutation,
  useMarkMultipleAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} = notificationApi;
