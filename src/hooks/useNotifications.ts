import React from "react";
import useSWR from "swr";
import {
  notificationsControllerGetUserNotifications,
  notificationsControllerGetUnreadCount,
  notificationsControllerMarkAsRead,
  notificationsControllerMarkAllAsRead,
  notificationsControllerDeleteNotification,
  notificationsControllerDeleteAllNotifications,
} from "@/src/client";

export function useNotifications() {
  const [page, setPage] = React.useState(1);
  const limit = 20;

  const { data, error, isLoading, mutate } = useSWR(
    `/notifications?page=${page}&limit=${limit}`,
    async () => {
      const response = await notificationsControllerGetUserNotifications({
        query: { page, limit },
      });
      return response.data;
    }
  );

  const { data: unreadCountData, mutate: mutateUnreadCount } = useSWR(
    "/notifications/unread/count",
    async () => {
      const response = await notificationsControllerGetUnreadCount();
      return response.data;
    }
  );

  const markAsRead = async (id: string) => {
    try {
      await notificationsControllerMarkAsRead({
        path: { id },
      });
      await Promise.all([mutate(), mutateUnreadCount()]);
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsControllerMarkAllAsRead();
      await Promise.all([mutate(), mutateUnreadCount()]);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsControllerDeleteNotification({
        path: { id },
      });
      await Promise.all([mutate(), mutateUnreadCount()]);
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationsControllerDeleteAllNotifications();
      await Promise.all([mutate(), mutateUnreadCount()]);
    } catch (error) {
      console.error("Failed to delete all notifications", error);
    }
  };

  return {
    notifications: (data as any)?.notifications || [],
    total: (data as any)?.total || 0,
    unreadCount: (unreadCountData as any)?.unreadCount || 0,
    isLoading,
    error,
    page,
    setPage,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    mutate,
  };
}
