"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Magnetik_Bold, Magnetik_Regular, Magnetik_Medium } from "@/lib/font";
import { cn } from "@/lib/utils";

interface CollaboratorsModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  author: any;
  collaborators: string[] | null;
}

export const CollaboratorsModal: React.FC<CollaboratorsModalProps> = ({
  isOpen,
  onOpenChange,
  author,
  collaborators,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        wrapper: "items-end sm:items-center",
        base: "m-0 sm:m-auto w-full sm:w-auto max-h-[85vh] sm:max-h-[90vh] rounded-b-none sm:rounded-b-lg bg-accent-shade-1 border-t border-primary-colour/10 sm:border border-primary-colour/10",
        header: "border-b border-primary-colour/10",
        footer: "border-t border-primary-colour/10",
        closeButton:
          "hover:bg-primary-colour/5 active:bg-primary-colour/10 text-primary-colour/70",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2
                className={cn(
                  "text-xl text-primary-colour",
                  Magnetik_Bold.className,
                )}
              >
                Writers & Cast
              </h2>
            </ModalHeader>
            <ModalBody className="py-6">
              <div className="space-y-6">
                {/* Author Section */}
                <div className="space-y-3">
                  <h3
                    className={cn(
                      "text-primary-colour/60 text-xs uppercase tracking-wider font-medium",
                      Magnetik_Medium.className,
                    )}
                  >
                    Author
                  </h3>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-colour/5 transition-colors">
                    <Avatar
                      src={author?.avatar || undefined}
                      name={(
                        author?.firstName?.[0] ||
                        author?.penName?.[0] ||
                        "A"
                      ).toUpperCase()}
                      className="w-12 h-12 text-lg"
                      isBordered
                      color="secondary"
                    />
                    <div>
                      <p
                        className={cn(
                          "text-primary-colour font-medium",
                          Magnetik_Bold.className,
                        )}
                      >
                        {author?.penName ||
                          `${author?.firstName || ""} ${author?.lastName || ""}`.trim() ||
                          "Anonymous"}
                      </p>
                      <p
                        className={cn(
                          "text-primary-colour/40 text-xs",
                          Magnetik_Regular.className,
                        )}
                      >
                        Original Creator
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collaborators Section */}
                {collaborators && collaborators.length > 0 && (
                  <div className="space-y-3">
                    <h3
                      className={cn(
                        "text-primary-colour/60 text-xs uppercase tracking-wider font-medium",
                        Magnetik_Medium.className,
                      )}
                    >
                      Collaborators
                    </h3>
                    <div className="space-y-2">
                      {collaborators.map((collaborator, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-colour/5 transition-colors"
                        >
                          <Avatar
                            name={collaborator[0]?.toUpperCase()}
                            className="w-10 h-10 text-sm"
                            isBordered={false}
                          />
                          <div>
                            <p
                              className={cn(
                                "text-primary-colour font-medium",
                                Magnetik_Regular.className,
                              )}
                            >
                              {collaborator}
                            </p>
                            <p
                              className={cn(
                                "text-primary-colour/40 text-xs",
                                Magnetik_Regular.className,
                              )}
                            >
                              Contributor
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                className={cn(
                  "text-primary-colour/70 hover:text-primary-colour",
                  Magnetik_Medium.className,
                )}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
