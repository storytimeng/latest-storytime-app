"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Switch } from "@heroui/switch";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Search, ChevronLeft } from "lucide-react";
import { cn } from "@/lib";

type SelectionModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  titleSize?: string;
  options: string[];
  selectedOptions: string[];
  onOptionToggle: (option: string) => void;
  onNextClick: () => void;
  openToAll: boolean;
  onToggleAll: (checked: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder: string;
  closeHandler: () => void;
  renderOption?: (option: string) => React.ReactElement;
};

const SelectionModal: React.FC<SelectionModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  options,
  selectedOptions,
  onOptionToggle,
  onNextClick,
  openToAll,
  onToggleAll,
  searchQuery,
  onSearchChange,
  placeholder,
  closeHandler,
  renderOption,
}) => {
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      hideCloseButton
      isDismissable={false}
      isKeyboardDismissDisabled={false}
      backdrop="blur"
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      classNames={{
        base: "rounded-tl-[2em] rounded-tr-[2em] rounded-bl-none rounded-br-none md:rounded-large",
      }}
    >
      <ModalContent className="p-2 py-4">
        {() => (
          <>
            <div>
              <ChevronLeft onClick={closeHandler} className="mt-3 ms-2" />
            </div>
            <ModalHeader className="flex flex-col justify-center gap-1 pt-4 pb-8 text-center">
              <h1 className={cn("text-xl w-[95%] m-auto")}>{title}</h1>
            </ModalHeader>
            <ModalBody>
              <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm">I&apos;m open to all</span>
                  <Switch
                    checked={openToAll}
                    onChange={(e) => onToggleAll(e.target.checked)}
                  />
                </div>

                <div>
                  <Input
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onSearchChange(e.target.value)
                    }
                    disabled={openToAll}
                    startContent={<Search className="w-4 h-4 text-gray-500 " />}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pb-16 md:grid-cols-3">
                  {filteredOptions.map((option) => (
                    <Button
                      key={option}
                      variant={
                        selectedOptions.includes(option) ? "solid" : "bordered"
                      }
                      className="justify-start h-auto py-2 px-4 min-h-[48px] text-sm whitespace-normal break-words"
                      onPress={() => onOptionToggle(option)}
                      disabled={openToAll}
                    >
                      <div className="flex items-center w-full">
                        <div className="flex-1 text-left">
                          {renderOption ? renderOption(option) : option}
                        </div>
                        <span className="flex-shrink-0 ml-2">
                          {selectedOptions.includes(option) ? "×" : "+"}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="fixed left-0 right-0 mx-8 bottom-4">
                  <Button
                    className="w-full py-6 mt-8 text-white rounded-full bg-primary"
                    onPress={onNextClick}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SelectionModal;
