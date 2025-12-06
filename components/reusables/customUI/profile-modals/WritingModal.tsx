"use client";

import React, { useState, useEffect } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { Button } from "@heroui/button";
import { Switch } from "@heroui/switch";
import { TimePicker } from "../TimePicker";
import { ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUpdateProfile } from "@/src/hooks/useUpdateProfile";
import { useUserProfile } from "@/src/hooks/useUserProfile";

const DAYS = [
  { id: "mon", label: "Monday", short: "Mon" },
  { id: "tue", label: "Tuesday", short: "Tue" },
  { id: "wed", label: "Wednesday", short: "Wed" },
  { id: "thu", label: "Thursday", short: "Thu" },
  { id: "fri", label: "Friday", short: "Fri" },
  { id: "sat", label: "Saturday", short: "Sat" },
  { id: "sun", label: "Sunday", short: "Sun" },
];

type ViewMode = "summary" | "picker" | "daySelection" | "customDays";

export const WritingModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [time, setTime] = useState({ hour: 6, minute: 0, period: "AM" as "AM" | "PM" });
  const [isDaily, setIsDaily] = useState(true);
  const [dayPreset, setDayPreset] = useState<"monToFri" | "custom">("monToFri");
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);

  const { updateProfile, isUpdating } = useUpdateProfile();
  const { user } = useUserProfile();

  // Initialize from user profile
  useEffect(() => {
    if (user?.timeToWrite) {
      // Expected format: "6:00 am"
      const [timePart, periodPart] = user.timeToWrite.split(" ");
      if (timePart && periodPart) {
        const [h, m] = timePart.split(":").map(Number);
        setTime({
          hour: h,
          minute: m,
          period: periodPart.toUpperCase() as "AM" | "PM",
        });
      }
    }
    if (user?.reminder) {
      setIsDaily(user.reminder === "daily");
    }
  }, [user]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const formatTime = (t: typeof time) => {
    return `${t.hour}:${String(t.minute).padStart(2, "0")} ${t.period}`;
  };

  const formatSchedule = () => {
    if (isDaily) {
      return `${formatTime(time)} - Daily`;
    }
    if (selectedDays.length === 7) {
      return `${formatTime(time)} - Daily`;
    }
    if (dayPreset === "monToFri") {
      return `${formatTime(time)} - Mon to Fri`;
    }
    return `${formatTime(time)} - Custom`;
  };

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleDailyToggle = (value: boolean) => {
    setIsDaily(value);
    if (!value) {
      setViewMode("daySelection");
    }
  };

  const handleDayPresetSelect = (preset: "monToFri" | "custom") => {
    setDayPreset(preset);
    if (preset === "monToFri") {
      setSelectedDays(["mon", "tue", "wed", "thu", "fri"]);
      setViewMode("picker");
    } else {
      setViewMode("customDays");
    }
  };

  const handleSave = async () => {
    const formattedTime = `${time.hour}:${time.minute.toString().padStart(2, "0")} ${time.period.toLowerCase()}`;
    
    const success = await updateProfile({
      timeToWrite: formattedTime,
      reminder: isDaily ? "daily" : "custom",
      // TODO: Add selectedDays to API payload if supported
    });

    if (success) {
      setViewMode("summary");
    }
  };

  // Custom Days Selection Screen
  if (viewMode === "customDays") {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1 pb-4">
          <h2 className={`text-xl text-center ${Magnetik_Bold.className}`}>
            Custom
          </h2>
        </ModalHeader>
        <ModalBody className="pb-6 overflow-y-auto">
          <div className="space-y-4 pb-10">
            {/* Day List */}
            <div className="space-y-1">
              {DAYS.map((day) => (
                <div
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className="flex items-center justify-between py-4 border-b border-grey-5 cursor-pointer"
                >
                  <span className={`text-lg ${Magnetik_Medium.className}`}>
                    {day.label}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedDays.includes(day.id)
                        ? "border-primary-colour bg-primary-colour"
                        : "border-grey-4"
                    }`}
                  >
                    {selectedDays.includes(day.id) && (
                      <div className="w-3 h-3 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="bordered"
                className="flex-1 border-2 border-primary-colour h-14"
                onClick={() => setViewMode("daySelection")}
              >
                <span className={Magnetik_Medium.className}>Cancel</span>
              </Button>
              <Button
                className="flex-1 bg-primary-colour text-white h-14"
                onClick={() => setViewMode("picker")}
              >
                <span className={Magnetik_Medium.className}>Done</span>
              </Button>
            </div>
          </div>
        </ModalBody>
      </>
    );
  }

  // Day Selection Screen (Mon to Fri / Custom)
  if (viewMode === "daySelection") {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1 pb-4">
          <h2 className={`text-xl text-center ${Magnetik_Bold.className}`}>
            Select the days
          </h2>
        </ModalHeader>
        <ModalBody className="pb-6 overflow-y-auto">
          <div className="space-y-4 pb-10">
            {/* Mon to Fri Option */}
            <div
              onClick={() => handleDayPresetSelect("monToFri")}
              className="flex items-center justify-between py-4 border-b border-grey-5 cursor-pointer"
            >
              <span className={`text-lg ${Magnetik_Medium.className}`}>
                Mon to Fri
              </span>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  dayPreset === "monToFri"
                    ? "border-primary-colour bg-primary-colour"
                    : "border-grey-4"
                }`}
              >
                {dayPreset === "monToFri" && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Custom Option */}
            <div
              onClick={() => handleDayPresetSelect("custom")}
              className="flex items-center justify-between py-4 border-b border-grey-5 cursor-pointer"
            >
              <span className={`text-lg ${Magnetik_Medium.className}`}>
                Custom
              </span>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  dayPreset === "custom"
                    ? "border-primary-colour bg-primary-colour"
                    : "border-grey-4"
                }`}
              >
                {dayPreset === "custom" && (
                  <div className="w-3 h-3 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="bordered"
                className="flex-1 border-2 border-primary-colour h-14"
                onClick={() => {
                  setIsDaily(true);
                  setViewMode("picker");
                }}
              >
                <span className={Magnetik_Medium.className}>Cancel</span>
              </Button>
              <Button
                className="flex-1 bg-primary-colour text-white h-14"
                onClick={() => {
                  if (dayPreset === "monToFri") {
                    setSelectedDays(["mon", "tue", "wed", "thu", "fri"]);
                    setViewMode("picker");
                  } else {
                    setViewMode("customDays");
                  }
                }}
              >
                <span className={Magnetik_Medium.className}>Done</span>
              </Button>
            </div>
          </div>
        </ModalBody>
      </>
    );
  }

  // Time Picker Screen
  if (viewMode === "picker") {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1 pb-4">
          <h2 className={`text-xl text-center ${Magnetik_Bold.className}`}>
            Writing Time
          </h2>
        </ModalHeader>
        <ModalBody className="pb-6 overflow-y-auto">
          <div className="space-y-6 pb-10">
            {/* Title */}
            <div>
              <h3 className={`text-2xl ${Magnetik_Bold.className} mb-2`}>
                Select best time to write 👋
              </h3>
              <p className={`text-base text-grey-3 ${Magnetik_Regular.className}`}>
                Kindly select the best time to write. We will always send you a reminder. 
                Remember to select the most convenient time for you.
              </p>
            </div>

            {/* Time Picker */}
            <div>
              <label className={`text-base ${Magnetik_Medium.className} mb-3 block`}>
                Time
              </label>
              <TimePicker value={time} onChange={setTime} />
            </div>

            {/* Daily Toggle */}
            <div className="flex items-center justify-between py-2">
              <label className={`text-base ${Magnetik_Medium.className}`}>
                Daily
              </label>
              <Switch
                isSelected={isDaily}
                onValueChange={handleDailyToggle}
                classNames={{
                  wrapper: "bg-grey-4 group-data-[selected=true]:bg-primary-colour",
                }}
              />
            </div>

            {/* Custom Days Selection Row */}
            {!isDaily && (
              <div 
                onClick={() => setViewMode("daySelection")}
                className="flex items-center justify-between p-4 border border-grey-4 rounded-xl cursor-pointer hover:bg-grey-5 transition-colors"
              >
                <span className={`text-base text-grey-2 ${Magnetik_Medium.className}`}>
                  {dayPreset === "monToFri" ? "Mon to Fri" : "Custom"}
                </span>
                <ChevronRight className="w-5 h-5 text-grey-3" />
              </div>
            )}

            {/* Note */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-600 text-sm">
                Note: You will always get a reminder
              </p>
            </div>

            {/* Done Button */}
            <Button
              className="w-full bg-primary-colour text-white h-14 text-lg mt-auto"
              onClick={handleSave}
              isLoading={isUpdating}
            >
              <span className={Magnetik_Medium.className}>Done</span>
            </Button>
          </div>
        </ModalBody>
      </>
    );
  }

  // Summary View
  return (
    <>
      <ModalHeader className="flex flex-col gap-1 pb-4">
        <h2 className={`text-xl text-center ${Magnetik_Bold.className}`}>
          Writing Time
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6 overflow-y-auto">
        <div className="space-y-6 pb-10">
          {/* Time Display */}
          <div>
            <label className={`text-base ${Magnetik_Medium.className} mb-3 block`}>
              Time to write
            </label>
            <div className="bg-grey-5 border border-grey-4 rounded-xl p-4">
              <p className={`text-lg ${Magnetik_Medium.className}`}>
                {formatSchedule()}
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-600 text-sm">
              Note: You will always get a reminder
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-5">
            <Button
              variant="bordered"
              className="flex-1 border-2 border-primary-colour h-14"
              onClick={handleClose}
            >
              <span className={Magnetik_Medium.className}>Close</span>
            </Button>
            <Button
              className="flex-1 bg-primary-colour text-white h-14"
              onClick={() => setViewMode("picker")}
            >
              <span className={Magnetik_Medium.className}>Change</span>
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
