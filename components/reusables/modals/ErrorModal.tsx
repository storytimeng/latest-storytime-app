"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { AlertCircle } from "lucide-react";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = "Error",
  message,
  details,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      classNames={{
        backdrop: "bg-black/50",
        base: "bg-universal-white",
      }}
    >
      <ModalContent>
        <ModalHeader className={`flex items-center gap-3 text-red-600 ${Magnetik_Bold.className}`}>
          <AlertCircle size={24} />
          <span>{title}</span>
        </ModalHeader>
        <ModalBody>
          <p className={`text-primary-colour ${Magnetik_Regular.className}`}>
            {message}
          </p>
          {details && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-xs text-gray-600 font-mono break-all">
                {details}
              </p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="flat"
            onPress={onClose}
            className={Magnetik_Regular.className}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
