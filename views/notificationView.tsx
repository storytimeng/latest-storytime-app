"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { PageHeader } from "@/components/reusables/customUI";

interface Notification {
  id: number;
  type: "welcome" | "new_story" | "write_reminder" | "read_reminder";
  title: string;
  message: string;
  timestamp: string;
  icon: string;
}

const NotificationView = () => {
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock notification data matching the design
  const notifications: Notification[] = [
    {
      id: 1,
      type: "welcome",
      title: "Welcome to Storytime",
      message: "Welcome to Storytime app, enjoy our services.",
      timestamp: "Today 10:27pm",
      icon: "🥳",
    },
    {
      id: 2,
      type: "new_story",
      title: "New Story",
      message: "Hey Rubystar, there's a new story for you to read.",
      timestamp: "Today 10:27pm",
      icon: "🥳",
    },
    {
      id: 3,
      type: "write_reminder",
      title: "Time to write",
      message: "Hello Rubystar, it is time to write.",
      timestamp: "Today 10:27pm",
      icon: "🥳",
    },
    {
      id: 4,
      type: "read_reminder",
      title: "Time to read",
      message: "Hello Rubystar, it is time to read a new story.",
      timestamp: "Today 10:27pm",
      icon: "🥳",
    },
    {
      id: 5,
      type: "read_reminder",
      title: "Time to read",
      message: "Hello Rubystar, it is time to continue reading.",
      timestamp: "Today 10:27pm",
      icon: "🥳",
    },
  ];

  const handleViewNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-[28rem] mx-auto px-4 pb-6">
      {/* Page Header */}
      <PageHeader title="Notifications" backLink="/app" className="pt-4 mb-6" />

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className="bg-universal-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start gap-3">
              {/* Logo Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-6 h-6 relative">
                  <Image
                    src="/images/logo.png"
                    alt="Storytime"
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title with emoji */}
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-gray-900 text-base font-semibold ${Magnetik_Medium.className}`}
                  >
                    {notification.title}
                  </h3>
                  <span className="text-lg">{notification.icon}</span>
                </div>

                {/* Message */}
                <p
                  className={`text-gray-600 text-[12px] mb-3 leading-relaxed ${Magnetik_Regular.className}`}
                >
                  {notification.message}
                </p>

                {/* Divider */}
                <div className="border-b border-gray-100 mb-3" />

                {/* Timestamp and View Button */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-gray-500 text-[10px] ${Magnetik_Regular.className}`}
                  >
                    {notification.timestamp}
                  </span>
                  <button
                    className="flex items-center gap-1 text-gray-900 hover:text-orange-500 transition-colors duration-200"
                    onClick={() => handleViewNotification(notification)}
                  >
                    <span className={`text-[10px] font-medium ${Magnetik_Regular.className}`}>
                      View
                    </span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
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
              <div className="w-8 h-8 relative">
                <Image
                  src="/images/logo.png"
                  alt="Storytime"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-lg text-primary-colour font-medium ${Magnetik_Medium.className}`}
                >
                  {selectedNotification?.title}
                </h2>
                <span className="text-lg">{selectedNotification?.icon}</span>
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
              <div className="pt-2 border-t border-light-grey-2">
                <p
                  className={`text-primary-shade-4 text-sm ${Magnetik_Regular.className}`}
                >
                  {selectedNotification?.timestamp}
                </p>
              </div>
            </div>
          </ModalBody>

          <ModalFooter className="p-6 pt-2">
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
