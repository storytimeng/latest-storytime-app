import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Magnetik_Medium } from "@/lib/font";
import { DAYS_OF_WEEK } from "@/config/setup";
import type { DaySelectorProps } from "../types";

export default function DaySelector({
  writeDaily,
  writeDays,
  dayPreset,
  onDailyChange,
  onDaysChange,
  onPresetChange,
}: DaySelectorProps) {
  const [showModal, setShowModal] = useState(false);

  const toggleDay = (day: string) => {
    const newDays = writeDays.includes(day)
      ? writeDays.filter((d) => d !== day)
      : [...writeDays, day];
    onDaysChange(newDays);
  };

  return (
    <>
      <div className="flex items-center justify-between mt-6">
        <span className={`text-primary-colour ${Magnetik_Medium.className}`}>
          Daily
        </span>
        <button
          className={`w-12 h-7 rounded-full relative transition-colors ${
            writeDaily ? "bg-primary-colour" : "bg-light-grey-2"
          }`}
          onClick={() => onDailyChange(!writeDaily)}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-universal-white transition-transform ${
              writeDaily ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {!writeDaily && (
        <div className="mt-4">
          <Button
            className="w-full bg-accent-shade-1 hover:bg-accent-shade-2 text-grey-1 py-4 rounded-lg transition-all duration-200 border border-primary-colour"
            onClick={() => setShowModal(true)}
          >
            {dayPreset === "Mon to Fri"
              ? "Mon to Fri"
              : `${writeDays.length} day(s) selected`}
          </Button>
        </div>
      )}

      {/* Days Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowModal(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-universal-white rounded-t-2xl p-4 shadow-lg">
            <div className={`text-center mb-4 ${Magnetik_Medium.className}`}>
              Select the days
            </div>
            <div className="space-y-3">
              <label
                className={`flex items-center justify-between border border-light-grey-2 rounded-lg px-4 py-3 cursor-pointer hover:border-primary-colour transition-colors duration-200 ${Magnetik_Medium.className}`}
              >
                <span>Mon to Fri</span>
                <input
                  type="radio"
                  name="dayPreset"
                  checked={dayPreset === "Mon to Fri"}
                  onChange={() => onPresetChange("Mon to Fri")}
                  className="cursor-pointer"
                />
              </label>

              <label
                className={`flex items-center justify-between border border-light-grey-2 rounded-lg px-4 py-3 cursor-pointer hover:border-primary-colour transition-colors duration-200 ${Magnetik_Medium.className}`}
              >
                <span>Custom</span>
                <input
                  type="radio"
                  name="dayPreset"
                  checked={dayPreset === "Custom"}
                  onChange={() => onPresetChange("Custom")}
                  className="cursor-pointer"
                />
              </label>

              {dayPreset === "Custom" && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      key={d}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${Magnetik_Medium.className} ${
                        writeDays.includes(d)
                          ? "border-primary-colour bg-accent-shade-1 text-primary-colour shadow-md"
                          : "border-light-grey-2 text-grey-2 hover:border-primary-colour hover:text-primary-colour"
                      }`}
                      onClick={() => toggleDay(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button
                className="w-full bg-primary-colour hover:bg-primary-shade-6 text-universal-white py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                onClick={() => setShowModal(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
