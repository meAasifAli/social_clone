import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { socketService } from "@/services/socket.service";
import {
  setConnectionStatus,
  updateUnreadCount,
} from "@/store/slices/notification.slice";
import { useGetUnreadCountQuery } from "@/store/apis/notifications-api";

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Fetch initial unread count
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    skip: !user,
  });

  useEffect(() => {
    if (unreadData?.count !== undefined) {
      dispatch(updateUnreadCount(unreadData.count));
    }
  }, [unreadData, dispatch]);

  useEffect(() => {
    if (!accessToken || !user) return;

    // Connect to socket
    socketService.connect(accessToken);

    // Handle connection established
    const unsubscribeConnected = socketService.on("connected:confirmed", () => {
      dispatch(setConnectionStatus(true));
    });

    // Handle connection lost
    const unsubscribeDisconnected = socketService.on("connection:lost", () => {
      dispatch(setConnectionStatus(false));
    });

    // Handle unread count updates
    const unsubscribeUnread = socketService.on(
      "unread:count:updated",
      (count: number) => {
        dispatch(updateUnreadCount(count));
      },
    );

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeUnread();
      socketService.disconnect();
      dispatch(setConnectionStatus(false));
    };
  }, [accessToken, user, dispatch]);

  return <>{children}</>;
};
