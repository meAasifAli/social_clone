import { io, Socket } from "socket.io-client";
import { store } from "@/store";
import {
  addNotification,
  updateUnreadCount,
  setOnlineUsers,
} from "@/store/slices/notification.slice";
import { toast } from "sonner";

let socket: Socket | null = null;
const listeners: Map<string, Function[]> = new Map();

export const socketService = {
  connect(token: string) {
    if (socket?.connected) {
      console.log("🔌 Socket already connected");
      return;
    }

    socket = io(`${import.meta.env.VITE_API_URL}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    setupListeners();
  },

  disconnect() {
    if (socket) {
      socket.disconnect();
      socket = null;
      listeners.clear();
    }
  },

  on(event: string, callback: Function) {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = listeners.get(event) || [];
      listeners.set(
        event,
        callbacks.filter((cb) => cb !== callback),
      );
    };
  },

  off(event: string, callback?: Function) {
    if (callback) {
      const callbacks = listeners.get(event) || [];
      listeners.set(
        event,
        callbacks.filter((cb) => cb !== callback),
      );
    } else {
      listeners.delete(event);
    }
  },

  emit(event: string, data: any) {
    const callbacks = listeners.get(event) || [];
    callbacks.forEach((cb) => {
      try {
        cb(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  },

  send(event: string, data: any) {
    if (socket?.connected) {
      socket.emit(event, data);
    } else {
      console.warn("Socket not connected, cannot send:", event);
    }
  },

  isConnected() {
    return socket?.connected || false;
  },

  getSocketId() {
    return socket?.id || null;
  },
};

function setupListeners() {
  if (!socket) return;

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
    socketService.emit("connection:established", { socketId: socket?.id });
  });

  socket.on("disconnect", (reason: string) => {
    console.log("🔌 Socket disconnected:", reason);
    socketService.emit("connection:lost", { reason });
  });

  socket.on("connect_error", (error: Error) => {
    console.error("Socket connection error:", error);
    socketService.emit("connection:error", error);
  });

  // Listen for new notifications
  socket.on("notification", (data: any) => {
    console.log("📨 New notification received:", data);

    // Add to Redux store
    store.dispatch(addNotification(data));

    // Show toast based on notification type
    const type = data.type;
    const actorName = data.actorName || data.actor?.name || "Someone";

    switch (type) {
      case "like":
        toast.success(`${actorName} liked your post`);
        break;
      case "comment": {
        const commentText = data.data?.commentContent || "";
        toast.success(`${actorName} commented: ${commentText}`);
        break;
      }
      case "follow":
        toast.success(`${actorName} started following you`);
        break;
      case "repost":
        toast.success(`${actorName} reposted your post`);
        break;
      case "message":
        const messageText = data.data?.messageContent || "";
        toast.success(`${actorName} sent you a message: ${messageText}`);
        break;
      default:
        toast.success(`New notification from ${actorName}`);
    }

    socketService.emit("new:notification", data);
  });

  // Listen for unread count updates
  socket.on("unread:count", (count: number) => {
    console.log("🔔 Unread count updated:", count);
    store.dispatch(updateUnreadCount(count));
    socketService.emit("unread:count:updated", count);
  });

  // Listen for online users list
  socket.on("online:users", (users: string[]) => {
    console.log("👥 Online users:", users);
    store.dispatch(setOnlineUsers(users));
    socketService.emit("online:users:updated", users);
  });

  // Listen for user status changes
  socket.on(
    "user:status",
    ({ userId, online }: { userId: string; online: boolean }) => {
      console.log(`👤 User ${userId} is ${online ? "online" : "offline"}`);
      socketService.emit("user:status:changed", { userId, online });
    },
  );

  // Listen for connection confirmation
  socket.on("connected", (data: any) => {
    console.log("✅ Socket connection confirmed:", data);
    if (data.unreadCount !== undefined) {
      store.dispatch(updateUnreadCount(data.unreadCount));
    }
    socketService.emit("connected:confirmed", data);
  });

  // Listen for pong response
  socket.on("pong", (data: any) => {
    console.log("📡 Socket heartbeat:", data);
  });

  // Heartbeat to keep connection alive
  setInterval(() => {
    if (socket?.connected) {
      socket.emit("ping");
    }
  }, 30000);
}
