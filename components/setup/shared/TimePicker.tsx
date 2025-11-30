import { Magnetik_Medium } from "@/lib/font";
import type { TimePickerProps } from "../types";

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ["AM", "PM"] as const;

  return (
    <div className="flex items-center gap-3">
      <select
        aria-label="Hour"
        className={`border border-light-grey-2 rounded-lg px-4 py-3 pr-8 bg-universal-white text-grey-1 transition-all duration-200 focus:ring-2 focus:ring-primary-colour/20 focus:border-primary-colour ${Magnetik_Medium.className}`}
        value={value.hour}
        onChange={(e) =>
          onChange({ ...value, hour: parseInt(e.target.value, 10) })
        }
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {h.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
      <span className={`text-grey-2 ${Magnetik_Medium.className}`}>:</span>
      <select
        aria-label="Minute"
        className={`border border-light-grey-2 rounded-lg px-4 py-3 pr-8 bg-universal-white text-grey-1 transition-all duration-200 focus:ring-2 focus:ring-primary-colour/20 focus:border-primary-colour ${Magnetik_Medium.className}`}
        value={value.minute}
        onChange={(e) =>
          onChange({ ...value, minute: parseInt(e.target.value, 10) })
        }
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
      <select
        aria-label="AM/PM"
        className={`border border-light-grey-2 rounded-lg px-3 py-3 pr-8 bg-universal-white text-grey-1 transition-all duration-200 focus:ring-2 focus:ring-primary-colour/20 focus:border-primary-colour ${Magnetik_Medium.className}`}
        value={value.period}
        onChange={(e) =>
          onChange({ ...value, period: e.target.value as "AM" | "PM" })
        }
      >
        {periods.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );
}
