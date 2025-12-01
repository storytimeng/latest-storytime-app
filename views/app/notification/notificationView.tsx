"use client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
  emailSentAt?: string;
  isRead: boolean;
}

import React, { useState } from "react";
import { ChevronRight, Trash2, CheckCheck } from "lucide-react";
import Image from "next/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { PageHeader } from "@/components/reusables/customUI";
import { useNotifications } from "@/src/hooks/useNotifications";
import { cn } from "@/lib/utils";

const NotificationView = () => {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
  } = useNotifications();

  // Debug: log notifications data
  React.useEffect(() => {
    console.log("Notifications:", notifications);
  }, [notifications]);

  const [selectedNotification, setSelectedNotification] = useState<any | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewNotification = (notification: any) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "achievement":
        return "🏆";
      case "milestone":
        return "🎉";
      case "story_like":
        return "❤️";
      case "story_comment":
        return "💬";
      case "admin_message":
        return "📢";
      default:
        return "👋";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto px-4 pb-6">
      {/* Page Header */}
      <div className="flex items-center justify-between pt-4 mb-6">
        <PageHeader
          title="Notifications"
          backLink="/home"
          className="mb-0 pt-0"
        />
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="flat"
            onPress={() => markAllAsRead()}
            className="text-xs text-complimentary-colour bg-transparent"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-xl border border-gray-100"
              >
                <div className="flex gap-3">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-3/4 h-4 rounded" />
                    <Skeleton className="w-full h-3 rounded" />
                  </div>
                </div>
              </div>
            ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-4 transition-shadow duration-200 border rounded-xl hover:shadow-md relative overflow-hidden",
                notification.isRead
                  ? "bg-universal-white border-gray-100"
                  : "bg-blue-50/50 border-blue-100"
              )}
            >
              {!notification.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-complimentary-colour rounded-full" />
              )}

              <div className="flex items-start gap-3">
                {/* Logo Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="relative w-6 h-6 flex items-center justify-center text-lg">
                    {getIconForType(notification.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <div className="flex items-center gap-2 pr-4">
                    <h3
                      className={`text-gray-900 text-base font-semibold ${Magnetik_Medium.className}`}
                    >
                      {notification.title}
                    </h3>
                  </div>

                  {/* Message */}
                  <p
                    className={`text-gray-600 text-[12px] mb-3 leading-relaxed line-clamp-2 ${Magnetik_Regular.className}`}
                  >
                    {notification.message}
                  </p>

                  {/* Divider */}
                  <div className="mb-3 border-b border-gray-100/50" />

                  {/* Timestamp and Actions */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-gray-500 text-[10px] ${Magnetik_Regular.className}`}
                    >
                      {formatTime(
                        notification.createdAt ||
                          notification.updatedAt ||
                          notification.emailSentAt ||
                          ""
                      )}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        className="flex items-center gap-1 text-gray-900 transition-colors duration-200 hover:text-orange-500"
                        onClick={() => handleViewNotification(notification)}
                      >
                        <span
                          className={`text-[10px] font-medium ${Magnetik_Regular.className}`}
                        >
                          View
                        </span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="lg"
        classNames={{
          backdrop: "bg-black/50",
          base: "bg-universal-white rounded-2xl m-4",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center justify-between p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center text-2xl bg-accent-shade-1 rounded-full">
                {selectedNotification &&
                  getIconForType(selectedNotification.type)}
              </div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-lg text-primary-colour font-medium ${Magnetik_Medium.className}`}
                >
                  {selectedNotification?.title}
                </h2>
              </div>
            </div>
          </ModalHeader>

          <ModalBody className="px-6 py-4">
            <div className="space-y-4">
              {/* Message */}
              <p
                className={`text-primary-shade-4 text-base leading-relaxed ${Magnetik_Regular.className}`}
              >
                {selectedNotification?.message}
              </p>

              {/* Timestamp */}
              <div className="pt-2 border-t border-light-grey-2 flex justify-between items-center">
                <p
                  className={`text-primary-shade-4 text-sm ${Magnetik_Regular.className}`}
                >
                  {selectedNotification &&
                    new Date(selectedNotification.createdAt).toLocaleString()}
                </p>

                {selectedNotification?.isRead && (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <CheckCheck className="w-3 h-3" />
                    <span>Read</span>
                  </div>
                )}
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="p-6 pt-2 flex justify-between">
            <Button
              variant="light"
              color="danger"
              onPress={() => {
                if (selectedNotification) {
                  deleteNotification(selectedNotification.id);
                  handleCloseModal();
                }
              }}
              className={`${Magnetik_Medium.className}`}
            >
              Delete
            </Button>
            <Button
              color="primary"
              onPress={handleCloseModal}
              className={`bg-complimentary-colour text-universal-white ${Magnetik_Medium.className}`}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default NotificationView;
