"use client";

import React, { useState, useEffect } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { Button } from "@heroui/button";
import { TimePicker } from "../TimePicker";
import { useRouter, useSearchParams } from "next/navigation";
import { useUpdateProfile } from "@/src/hooks/useUpdateProfile";
import { useUserProfile } from "@/src/hooks/useUserProfile";

export const ReadingModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPicker, setShowPicker] = useState(false);
  const [time, setTime] = useState({ hour: 8, minute: 0, period: "PM" as "AM" | "PM" });
  
  const { updateProfile, isUpdating } = useUpdateProfile();
  const { user } = useUserProfile();

  // Initialize from user profile
  useEffect(() => {
    if (user?.timeToRead) {
      // Expected format: "8:00 pm"
      const [timePart, periodPart] = user.timeToRead.split(" ");
      if (timePart && periodPart) {
        const [h, m] = timePart.split(":").map(Number);
        setTime({
          hour: h,
          minute: m,
          period: periodPart.toUpperCase() as "AM" | "PM",
        });
      }
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

  const handleSave = async () => {
    const formattedTime = `${time.hour}:${time.minute.toString().padStart(2, "0")} ${time.period.toLowerCase()}`;
    
    const success = await updateProfile({
      timeToRead: formattedTime,
      // Default to daily for reading time as per UI
      reminder: "daily",
    });

    if (success) {
      setShowPicker(false);
    }
  };

  if (showPicker) {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1 pb-4">
          <h2 className={`text-xl text-center ${Magnetik_Bold.className}`}>
            Reading Time
          </h2>
        </ModalHeader>
        <ModalBody className="pb-6 overflow-y-auto">
          <div className="space-y-6 pb-10">
            {/* Title */}
            <div>
              <h3 className={`text-2xl ${Magnetik_Bold.className} mb-2`}>
                Select best time to read 👋
              </h3>
              <p className={`text-base text-grey-3 ${Magnetik_Regular.className}`}>
                Kindly select the best time to read. We will always send you a reminder. 
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

            {/* Note */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-600 text-sm">
                Note: You will always get a daily reminder
              </p>
            </div>

            {/* Done Button */}
            <Button
              className="w-full bg-primary-colour text-white h-14 text-lg"
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

  // Summary view
  return (
    <>
      <ModalHeader className="flex flex-col gap-1 pb-4">
        <h2 className={`text-xl text-center ${Magnetik_Bold.className}`}>
          Reading Time
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6 overflow-y-auto">
        <div className="space-y-6 pb-10">
          {/* Time Display */}
          <div>
            <label className={`text-base ${Magnetik_Medium.className} mb-3 block`}>
              Time to read
            </label>
            <div className="bg-grey-5 border border-grey-4 rounded-xl p-4">
              <p className={`text-lg ${Magnetik_Medium.className}`}>
                {formatTime(time)}
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-600 text-sm">
              Note: You will always get a daily reminder
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="bordered"
              className="flex-1 border-2 border-primary-colour h-14"
              onClick={handleClose}
            >
              <span className={Magnetik_Medium.className}>Close</span>
            </Button>
            <Button
              className="flex-1 bg-primary-colour text-white h-14"
              onClick={() => setShowPicker(true)}
            >
              <span className={Magnetik_Medium.className}>Change</span>
            </Button>
          </div>
        </div>
      </ModalBody>
    </>
  );
};
