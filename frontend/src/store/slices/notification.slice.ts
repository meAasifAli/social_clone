import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  onlineUsers: string[];
  isConnected: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  onlineUsers: [],
  isConnected: false,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications.pop();
      }
    },

    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
    },

    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
      state.unreadCount = 0;
    },

    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },

    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  addNotification,
  setNotifications,
  updateUnreadCount,
  markAsRead,
  markAllAsRead,
  setOnlineUsers,
  setConnectionStatus,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
