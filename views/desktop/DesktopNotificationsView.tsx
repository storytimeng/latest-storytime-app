"use client";

import { useState } from "react";
import { ChevronRight, Trash2, CheckCheck } from "lucide-react";
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
import {
  getNotificationPreview,
  isHtmlContent,
  sanitizeRichHtml,
} from "@/lib/sanitizeRichHtml";
import {
  formatNotificationTime,
  getNotificationIcon,
  stripLeadingEmojis,
  type NotificationItem,
} from "@/lib/notificationDisplay";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { cn } from "@/lib/utils";

export function DesktopNotificationsView() {
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount,
  } = useNotifications();
  const isOnline = useOnlineStatus();

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewNotification = (notification: NotificationItem) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
    if (!notification.isRead) {
      void markAsRead(notification.id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#361B17]/60">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="flat"
            onPress={() => isOnline && markAllAsRead()}
            className={cn(
              "text-xs text-primary-colour bg-transparent",
              !isOnline && "cursor-not-allowed opacity-50",
            )}
            disabled={!isOnline}
          >
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-black/10 bg-white p-4"
              >
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                  </div>
                </div>
              </div>
            ))
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white py-16 text-center text-[#361B17]/60">
            <p className={Magnetik_Medium.className}>No notifications yet</p>
            <p className={cn("mt-2 text-sm", Magnetik_Regular.className)}>
              We&apos;ll notify you about story activity and reminders here.
            </p>
          </div>
        ) : (
          notifications.map((notification: NotificationItem) => (
            <div
              key={notification.id}
              className={cn(
                "relative overflow-hidden rounded-xl border p-4 transition-shadow hover:shadow-md",
                notification.isRead
                  ? "border-black/10 bg-white"
                  : "border-primary-colour/20 bg-primary-colour/[0.04]",
              )}
            >
              {!notification.isRead && (
                <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary-colour" />
              )}

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFFAF1] text-lg">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <h3
                    className={cn(
                      "pr-6 text-base font-semibold text-[#361B17]",
                      Magnetik_Medium.className,
                    )}
                  >
                    {stripLeadingEmojis(notification.title)}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 text-sm leading-relaxed text-[#361B17]/70",
                      Magnetik_Regular.className,
                    )}
                  >
                    {getNotificationPreview(notification.message)}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                    <span className="text-xs text-[#361B17]/50">
                      {formatNotificationTime(
                        notification.createdAt ||
                          notification.updatedAt ||
                          notification.emailSentAt ||
                          "",
                      )}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className={cn(
                          "text-[#361B17]/40 transition-colors",
                          isOnline
                            ? "hover:text-red-500"
                            : "cursor-not-allowed opacity-30",
                        )}
                        disabled={!isOnline}
                        onClick={() =>
                          isOnline && deleteNotification(notification.id)
                        }
                        aria-label="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-sm text-[#361B17] transition-colors hover:text-primary-colour"
                        onClick={() => handleViewNotification(notification)}
                      >
                        <span className={Magnetik_Regular.className}>View</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        size="2xl"
        classNames={{
          backdrop: "bg-black/50",
          base: "bg-white rounded-2xl m-4",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3 p-6 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFFAF1] text-2xl">
              {selectedNotification &&
                getNotificationIcon(selectedNotification.type)}
            </div>
            <h2
              className={cn(
                "text-lg font-medium text-[#361B17]",
                Magnetik_Medium.className,
              )}
            >
              {selectedNotification
                ? stripLeadingEmojis(selectedNotification.title)
                : null}
            </h2>
          </ModalHeader>

          <ModalBody className="px-6 py-4">
            {selectedNotification?.type === "admin_message" &&
            isHtmlContent(selectedNotification.message) ? (
              <div
                className={cn(
                  "prose prose-sm max-w-none text-base leading-relaxed text-[#361B17]/80",
                  Magnetik_Regular.className,
                )}
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichHtml(selectedNotification.message),
                }}
              />
            ) : (
              <p
                className={cn(
                  "text-base leading-relaxed text-[#361B17]/80",
                  Magnetik_Regular.className,
                )}
              >
                {selectedNotification?.message}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
              <p className="text-sm text-[#361B17]/50">
                {selectedNotification &&
                  new Date(selectedNotification.createdAt).toLocaleString()}
              </p>
              {selectedNotification?.isRead && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Read</span>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="flex justify-between p-6 pt-2">
            <Button
              variant="light"
              color="danger"
              onPress={() => {
                if (selectedNotification) {
                  void deleteNotification(selectedNotification.id);
                  handleCloseModal();
                }
              }}
              className={Magnetik_Medium.className}
            >
              Delete
            </Button>
            <Button
              color="primary"
              onPress={handleCloseModal}
              className={cn(
                "bg-primary-colour text-white",
                Magnetik_Medium.className,
              )}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
