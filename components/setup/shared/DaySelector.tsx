import { useState } from "react";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Magnetik_Medium, Magnetik_Regular, Magnetik_Bold } from "@/lib/font";
import { DAYS_OF_WEEK } from "@/config/setup";
import { ChevronRight } from "lucide-react";
import type { DaySelectorProps } from "../types";

const DAYS = [
  { id: "Monday", short: "Mon" },
  { id: "Tuesday", short: "Tue" },
  { id: "Wednesday", short: "Wed" },
  { id: "Thursday", short: "Thu" },
  { id: "Friday", short: "Fri" },
  { id: "Saturday", short: "Sat" },
  { id: "Sunday", short: "Sun" },
];

export default function DaySelector({
  writeDaily,
  writeDays,
  dayPreset,
  onDailyChange,
  onDaysChange,
  onPresetChange,
}: DaySelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"preset" | "custom">("preset");

  const toggleDay = (day: string) => {
    const newDays = writeDays.includes(day)
      ? writeDays.filter((d) => d !== day)
      : [...writeDays, day];
    onDaysChange(newDays);
  };

  const handleOpenModal = () => {
    setViewMode(dayPreset === "Custom" ? "custom" : "preset");
    setIsModalOpen(true);
  };

  const handlePresetSelect = (preset: "Mon to Fri" | "Custom") => {
    onPresetChange(preset);
    if (preset === "Mon to Fri") {
      onDaysChange(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    } else {
      setViewMode("custom");
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Daily Toggle */}
      <div className="flex items-center justify-between py-2">
        <label className={`text-base text-primary-colour ${Magnetik_Medium.className}`}>
          Daily
        </label>
        <Switch
          isSelected={writeDaily}
          onValueChange={onDailyChange}
          color="warning"
          classNames={{
            wrapper: "bg-grey-4 group-data-[selected=true]:bg-primary-colour",
          }}
        />
      </div>

      {/* Custom Days Selection Row */}
      {!writeDaily && (
        <div 
          onClick={handleOpenModal}
          className="flex items-center justify-between p-4 border border-grey-4 rounded-xl cursor-pointer hover:bg-grey-5 transition-colors"
        >
          <span className={`text-base text-grey-2 ${Magnetik_Medium.className}`}>
            {dayPreset === "Mon to Fri" ? "Mon to Fri" : "Custom"}
          </span>
          <ChevronRight className="w-5 h-5 text-grey-3" />
        </div>
      )}

      {/* Day Selection Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        placement="bottom"
        className="m-0"
        classNames={{
          wrapper: "items-end",
          base: "rounded-t-3xl max-h-[80vh] m-0",
          backdrop: "bg-black/50"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 pb-2">
            <h2 className={`text-xl text-center text-primary-colour ${Magnetik_Bold.className}`}>
              {viewMode === "preset" ? "Select the days" : "Custom"}
            </h2>
          </ModalHeader>
          <ModalBody className="pb-6">
            {viewMode === "preset" ? (
              <div className="space-y-4 py-2">
                {/* Mon to Fri Option */}
                <div
                  onClick={() => handlePresetSelect("Mon to Fri")}
                  className="flex items-center justify-between py-4 border-b border-grey-5 cursor-pointer"
                >
                  <span className={`text-lg text-primary-colour ${Magnetik_Medium.className}`}>Mon to Fri</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    dayPreset === "Mon to Fri" ? "border-primary-colour bg-primary-colour" : "border-grey-4"
                  }`}>
                    {dayPreset === "Mon to Fri" && <div className="w-3 h-3 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Custom Option */}
                <div
                  onClick={() => handlePresetSelect("Custom")}
                  className="flex items-center justify-between py-4 border-b border-grey-5 cursor-pointer"
                >
                  <span className={`text-lg text-primary-colour ${Magnetik_Medium.className}`}>Custom</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    dayPreset === "Custom" ? "border-primary-colour bg-primary-colour" : "border-grey-4"
                  }`}>
                    {dayPreset === "Custom" && <div className="w-3 h-3 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1 py-2 overflow-y-auto max-h-[50vh]">
                {DAYS.map((day) => (
                  <div
                    key={day.id}
                    onClick={() => toggleDay(day.id)}
                    className="flex items-center justify-between py-4 border-b border-grey-5 cursor-pointer"
                  >
                    <span className={`text-lg text-primary-colour ${Magnetik_Medium.className}`}>{day.id}</span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      writeDays.includes(day.id) ? "border-primary-colour bg-primary-colour" : "border-grey-4"
                    }`}>
                      {writeDays.includes(day.id) && <div className="w-3 h-3 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-3 pt-6">
              {viewMode === "custom" ? (
                <Button
                  variant="bordered"
                  className="flex-1 border-2 border-primary-colour h-14"
                  onClick={() => setViewMode("preset")}
                >
                  <span className={Magnetik_Medium.className}>Back</span>
                </Button>
              ) : (
                <Button
                  variant="bordered"
                  className="flex-1 border-2 border-primary-colour h-14"
                  onClick={() => setIsModalOpen(false)}
                >
                  <span className={Magnetik_Medium.className}>Cancel</span>
                </Button>
              )}
              <Button
                className="flex-1 bg-primary-colour text-white h-14"
                onClick={() => setIsModalOpen(false)}
              >
                <span className={Magnetik_Medium.className}>Done</span>
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
