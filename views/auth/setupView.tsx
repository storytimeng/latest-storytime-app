"use client";

import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import GenreButton from "@/components/reusables/customUI/GenreButton";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular, Magnetik_SemiBold } from "@/lib/font";

type Period = "AM" | "PM";

type TimeValue = {
  hour: number; // 1-12
  minute: number; // 0-59
  period: Period;
};

const ALL_GENRES = [
  "Action",
  "Adventure",
  "Anthology",
  "Biography",
  "Classic",
  "Comedy",
  "Drama",
  "Fantasy",
  "Historical",
  "Horror",
  "Mystery",
  "Poetry",
  "Romance",
  "Sci-fi",
  "Thriller",
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function formatTime(t: TimeValue) {
  const mm = t.minute.toString().padStart(2, "0");
  return `${t.hour}:${mm} ${t.period}`;
}

const takenPenNames = new Set(["ruby", "rubyjay", "admin", "user"]);

export default function SetupView() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1); // 1..7
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [penName, setPenName] = useState("");
  const [penStatus, setPenStatus] = useState<
    "idle" | "checking" | "taken" | "available"
  >("idle");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [readTime, setReadTime] = useState<TimeValue>({
    hour: 6,
    minute: 45,
    period: "AM",
  });
  const [writeTime, setWriteTime] = useState<TimeValue>({
    hour: 6,
    minute: 45,
    period: "AM",
  });
  const [writeDaily, setWriteDaily] = useState<boolean>(false);
  const [writeDays, setWriteDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const [showDaysModal, setShowDaysModal] = useState(false);
  const [dayPreset, setDayPreset] = useState<"Mon to Fri" | "Custom">(
    "Mon to Fri"
  );

  const timeOptions = useMemo(
    () => ({
      hours: Array.from({ length: 12 }, (_, i) => i + 1),
      minutes: Array.from({ length: 60 }, (_, i) => i),
      periods: ["AM", "PM"] as Period[],
    }),
    []
  );

  const progressSteps = 5; // show 5 segments in header

  const checkPenName = useCallback(async () => {
    const name = penName.trim();
    if (!name) return;
    setPenStatus("checking");
    await new Promise((r) => setTimeout(r, 700));
    const isTaken = takenPenNames.has(name.toLowerCase());
    setPenStatus(isTaken ? "taken" : "available");
    return !isTaken; // Return true if available, false if taken
  }, [penName]);

  // Debounced pen name checking
  useEffect(() => {
    if (penName.trim().length >= 3) {
      const timeoutId = setTimeout(() => {
        checkPenName();
      }, 1000); // Check after 1 second of no typing
      
      return () => clearTimeout(timeoutId);
    } else {
      setPenStatus("idle");
    }
  }, [penName, checkPenName]);

  const canContinue = () => {
    switch (step) {
      case 1:
        return penName.trim().length >= 3 && (penStatus === "available" || penStatus === "idle");
      case 2:
        return true; // optional image
      case 3:
        return selectedGenres.length > 0;
      case 4:
        return true; // any valid time
      case 5:
        return writeDaily || writeDays.length > 0;
      case 6:
        return true; // preview
      default:
        return true;
    }
  };

  const goNext = async () => {
    if (step === 1) {
      // If pen name hasn't been checked yet, check it first
      if (penStatus === "idle" && penName.trim().length >= 3) {
        const isAvailable = await checkPenName();
        // If it's taken, don't proceed
        if (!isAvailable) return;
      }
      // If pen name is taken, don't proceed
      if (penStatus === "taken") return;
    }
    
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 150)); // Smooth transition
    if (step < 6) setStep(step + 1);
    else setStep(7);
    setIsTransitioning(false);
  };

  const skipToNext = async () => {
    setIsTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 150));
    if (step < 6) setStep(step + 1);
    else setStep(7);
    setIsTransitioning(false);
  };

  const goBack = async () => {
    if (step > 1) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 150));
      setStep(step - 1);
      setIsTransitioning(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canContinue()) {
      goNext();
    } else if (e.key === 'Escape' && step > 1) {
      goBack();
    }
  };

  const handleImageSelection = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setShowImagePicker(false);
    setShowImagePreview(true);
  };

  const acceptImage = () => {
    setShowImagePreview(false);
  };

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const toggleDay = (d: string) => {
    setWriteDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const applyPreset = (preset: "Mon to Fri" | "Custom") => {
    setDayPreset(preset);
    if (preset === "Mon to Fri")
      setWriteDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  };

  const Header = () => (
    <div className="px-4 pt-4">
      {/* Progress segments */}
      <div className="flex items-center gap-2 mt-2">
        {Array.from({ length: progressSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isCompleted = step > stepNumber;
          const isCurrent = step === stepNumber;
          const isActive = isCompleted || isCurrent;
          
          return (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                isActive ? "bg-orange-500" : "bg-orange-200"
              }`}
            />
          );
        })}
      </div>
    </div>
  );

  const Section = ({
    children,
    title,
    subtitle,
  }: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
  }) => (
    <div className="px-4 pt-6">
      <h2 className={`text-xl text-primary-colour mb-1 ${Magnetik_Bold.className}`}>{title}</h2>
      {subtitle && (
        <p className={`text-grey-3 body-text-small-medium-auto mb-6 ${Magnetik_Regular.className}`}>{subtitle}</p>
      )}
      {children}
    </div>
  );

  const TimePicker = ({
    value,
    onChange,
  }: {
    value: TimeValue;
    onChange: (v: TimeValue) => void;
  }) => (
    <div className="flex items-center gap-3">
      <select
        aria-label="Hour"
        className={`border border-light-grey-2 rounded-lg px-4 py-3 pr-8 bg-universal-white text-grey-1 transition-all duration-200 focus:ring-2 focus:ring-primary-colour/20 focus:border-primary-colour ${Magnetik_Medium.className}`}
        value={value.hour}
        onChange={(e) =>
          onChange({ ...value, hour: parseInt(e.target.value, 10) })
        }
      >
        {timeOptions.hours.map((h) => (
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
        {timeOptions.minutes.map((m) => (
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
          onChange({ ...value, period: e.target.value as Period })
        }
      >
        {timeOptions.periods.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div 
      className="w-full max-w-md mx-auto h-screen flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
        <Header />

        {/* Step Content */}
        <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        {step === 1 && (
          <Section
            title="Enter a Pen Name 👋"
            subtitle="A unique Pen Name to make you stand out."
          >
            <div className="space-y-2">
            <label className={`text-primary-colour body-text-small-medium-auto mb-1 ${Magnetik_Medium.className}`}>
              Pen Name
            </label>
            <input
              type="text"
              className={`w-full rounded-lg border px-4 py-3 outline-none body-text-small-regular-auto bg-transparent transition-all duration-200 focus:ring-2 focus:ring-primary-colour/20 ${Magnetik_Regular.className} ${
                penStatus === "taken"
                  ? "border-danger text-danger focus:border-danger"
                  : penStatus === "available"
                  ? "border-success text-grey-1 focus:border-success"
                  : "border-light-grey-2 text-primary-colour focus:border-primary-colour"
              }`}
              placeholder="Enter Pen Name"
              value={penName}
              onChange={(e) => {
                setPenName(e.target.value);
              }}
              onBlur={checkPenName}
              autoComplete="off"
              spellCheck="false"
            />
            {penStatus === "checking" && (
              <p className={`text-grey-2 body-text-small-regular-auto ${Magnetik_Regular.className}`}>
                🔍 Checking availability...
              </p>
            )}
            {penStatus === "taken" && (
              <p className={`text-danger body-text-small-regular-auto ${Magnetik_Regular.className}`}>
                ❌ Pen Name is taken. Please try another.
              </p>
            )}
            {penStatus === "available" && (
              <p className={`text-success body-text-small-regular-auto ${Magnetik_Regular.className}`}>
                ✅ Pen Name is available. Nice!
              </p>
            )}
            {penStatus === "idle" && penName.trim().length >= 3 && (
              <p className={`text-grey-2 body-text-small-regular-auto ${Magnetik_Regular.className}`}>
                💡 Click Next to check availability and continue
              </p>
            )}
            <p className={`text-grey-2 body-text-small-regular-auto ${Magnetik_Regular.className}`}>
              You can use emojis and special characters.
            </p>
          </div>

          <div className="mt-8">
            <Button
              className={`w-full py-4 rounded-lg body-text-small-medium-auto transition-all duration-200 ${
                canContinue() && penStatus !== "checking"
                  ? "bg-primary-colour hover:bg-primary-shade-6 text-universal-white shadow-md hover:shadow-lg"
                  : "bg-light-grey-2 text-grey-1 cursor-not-allowed"
              }`}
              disabled={!canContinue() || penStatus === "checking"}
              onClick={goNext}
            >
              {penStatus === "checking" ? "Checking..." : "Next"}
            </Button>
          </div>
          
        </Section>
      )}

      {step === 2 && (
        <Section
          title="Add a profile picture 👋"
          subtitle="Add an image you like as your display picture."
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-accent-shade-1 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full border-2 border-primary-colour flex items-center justify-center text-primary-colour">
                  👤
                </div>
              )}
            </div>
            <button
              type="button"
              className={`text-primary-colour underline ${Magnetik_Medium.className}`}
              onClick={() => setShowImagePicker(true)}
            >
              Tap to change
            </button>
          </div>

          <div className="mt-10 space-y-2">
            <Button
              className={`w-full py-4 rounded-lg transition-all duration-200 ${
                canContinue()
                  ? "bg-primary-colour hover:bg-primary-shade-6 text-universal-white shadow-md hover:shadow-lg"
                  : "bg-light-grey-2 text-grey-1 cursor-not-allowed"
              }`}
              disabled={!canContinue()}
              onClick={goNext}
            >
              Next
            </Button>
            <button
              className={`w-full text-grey-2 mt-2 body-text-small-medium-auto hover:text-primary-colour transition-colors duration-200 ${Magnetik_Medium.className}`}
              onClick={skipToNext}
            >
              Skip
            </button>
          </div>

        </Section>
      )}

      {step === 3 && (
        <Section
          title="Select Favourite Genre 👋"
          subtitle="Choose the genres you love to read. This will help us recommend the best stories for you."
        >
          <div className="grid grid-cols-3 gap-3">
            {ALL_GENRES.map((g) => (
              <GenreButton
                key={g}
                genre={g}
                isSelected={selectedGenres.includes(g)}
                onClick={() => toggleGenre(g)}

              />
            ))}
          </div>

          <div className="mt-8">
            <Button
              className="w-full bg-primary-colour hover:bg-primary-shade-6 text-universal-white py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              disabled={!canContinue()}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        </Section>
      )}

      {step === 4 && (
        <Section
          title="Select best time to read 👋"
          subtitle="Kindly select the best time to read. We will always send you a reminder."
        >
          <div className="flex items-center justify-center py-4">
            <TimePicker value={readTime} onChange={setReadTime} />
          </div>
          <p className={`text-grey-2 body-text-small-regular-auto mt-6 ${Magnetik_Regular.className}`}>  
            Note: You will always get a reminder
          </p>
          <div className="mt-8">
            <Button
              className={`w-full py-4 rounded-lg transition-all duration-200 ${
                canContinue()
                  ? "bg-primary-colour hover:bg-primary-shade-6 text-universal-white shadow-md hover:shadow-lg"
                  : "bg-light-grey-2 text-grey-1 cursor-not-allowed"
              }`}
              disabled={!canContinue()}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        </Section>
      )}

      {step === 5 && (
        <Section
          title="Select best time to write 👋"
          subtitle="Kindly select the best time to write. We will always send you a reminder."
        >
          <div className="flex items-center justify-center py-4">
            <TimePicker value={writeTime} onChange={setWriteTime} />
          </div>

          <div className="flex items-center justify-between mt-6">
            <span className={`text-primary-colour ${Magnetik_Medium.className}`}>Daily</span>
            <button
              className={`w-12 h-7 rounded-full relative transition-colors ${
                writeDaily ? "bg-primary-colour" : "bg-light-grey-2"
              }`}
              onClick={() => setWriteDaily(!writeDaily)}
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
                onClick={() => setShowDaysModal(true)}
              >
                {dayPreset === "Mon to Fri"
                  ? "Mon to Fri"
                  : `${writeDays.length} day(s) selected`}
              </Button>
            </div>
          )}

          <p className={`text-grey-2 body-text-small-regular-auto mt-6 ${Magnetik_Regular.className}`}>
            Note: You will always get a reminder
          </p>
           <div className="mt-8 space-y-2">
             <Button
               className={`w-full py-4 rounded-lg transition-all duration-200 ${
                 canContinue()
                   ? "bg-primary-colour hover:bg-primary-shade-6 text-universal-white shadow-md hover:shadow-lg"
                   : "bg-light-grey-2 text-grey-1 cursor-not-allowed"
               }`}
               disabled={!canContinue()}
               onClick={goNext}
             >
               Next
             </Button>
             <button
               className={`w-full text-grey-2 mt-2 hover:text-primary-colour transition-colors duration-200 ${Magnetik_Medium.className}`}
               onClick={skipToNext}
             >
               Skip
             </button>
           </div>

          {/* Days Modal */}
          {showDaysModal && (
            <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setShowDaysModal(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-universal-white rounded-t-2xl p-4 shadow-lg">
                <div className={`text-center mb-4 ${Magnetik_Medium.className}`}>
                  Select the days
                </div>
                <div className="space-y-3">
                  <label className={`flex items-center justify-between border border-light-grey-2 rounded-lg px-4 py-3 cursor-pointer hover:border-primary-colour transition-colors duration-200 ${Magnetik_Medium.className}`}>
                    <span>Mon to Fri</span>
                    <input
                      type="radio"
                      name="dayPreset"
                      checked={dayPreset === "Mon to Fri"}
                      onChange={() => applyPreset("Mon to Fri")}
                      className="cursor-pointer"
                    />
                  </label>

                  <label className={`flex items-center justify-between border border-light-grey-2 rounded-lg px-4 py-3 cursor-pointer hover:border-primary-colour transition-colors duration-200 ${Magnetik_Medium.className}`}>
                    <span>Custom</span>
                    <input
                      type="radio"
                      name="dayPreset"
                      checked={dayPreset === "Custom"}
                      onChange={() => applyPreset("Custom")}
                      className="cursor-pointer"
                    />
                  </label>

                  {dayPreset === "Custom" && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {DAYS.map((d) => (
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
                    onClick={() => setShowDaysModal(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Section>
      )}

      {step === 6 && (
        <Section
          title="Preview"
          subtitle="You can always edit this in your profile"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-accent-shade-1">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-colour">
                  👤
                </div>
              )}
            </div>
            <button
              type="button"
              className={`text-primary-colour text-[12px] hover:text-primary-shade-6 transition-colors duration-200 ${Magnetik_Medium.className}`}
              onClick={() => setShowImagePicker(true)}
            >
              Tap to change
            </button>
            <div className="w-full space-y-3">
              <div>
                <label className={`body-text-small-regular-auto text-primary-colour ${Magnetik_SemiBold.className}`}>
                  Pen Name
                </label>
                <div className={`border border-light-grey-2 rounded-lg px-4 py-3 body-text-small-regular-auto ${Magnetik_Regular.className}`}>
                  {penName || "—"}
                </div>
              </div>
              <div>
                <label className={`body-text-small-regular-auto text-primary-colour ${Magnetik_SemiBold.className}`}>
                  Genre
                </label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {selectedGenres.map((g) => (
                    <div
                      key={g}
                      className={`relative whitespace-nowrap flex-shrink-0 px-2 py-1 rounded-lg min-w-[70px] text-center transition-all duration-200 ease-in-out shadow-lg text-xs ${Magnetik_Regular.className}`}
                      style={{
                        backgroundImage: `repeating-linear-gradient(-45deg, #f89a28, #f89a28 18px, #ec8e1c 18px, #ec8e1c 36px)`,
                        color: "white",
                        border: "2px solid rgba(255,255,255,0.9)",
                        boxShadow: "0 8px 20px -8px rgba(0,0,0,0.2)",
                        fontWeight: 300,
                      }}
                    >
                      {/* check-in-circle top-right */}
                      <span
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-white"
                        style={{ border: "2px solid #f28a20" }}
                      >
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="#f28a20"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="relative z-10">{g}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className={`body-text-small-regular-auto text-primary-colour ${Magnetik_SemiBold.className}`}>
                    Time to read
                  </label>
                  <div className={`border border-light-grey-2 rounded-lg px-4 py-3 body-text-small-regular-auto ${Magnetik_Regular.className}`}>
                    {formatTime(readTime)}
                  </div>
                </div>
                <div>
                  <label className={`body-text-small-regular-auto text-primary-colour ${Magnetik_SemiBold.className}`}>
                    Time to write
                  </label>
                  <div className={`border border-light-grey-2 rounded-lg px-4 py-3 body-text-small-regular-auto ${Magnetik_Regular.className}`}>
                    {formatTime(writeTime)}{" "}
                    {writeDaily
                      ? "— Daily"
                      : writeDays.length
                      ? `— ${writeDays.join(", ")}`
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Button
              className={`w-full py-4 rounded-lg transition-all duration-200 ${
                canContinue()
                  ? "bg-primary-colour hover:bg-primary-shade-6 text-universal-white shadow-md hover:shadow-lg"
                  : "bg-light-grey-2 text-grey-1 cursor-not-allowed"
              }`}
              disabled={!canContinue()}
              onClick={goNext}
            >
              Next
            </Button>
          </div>
        </Section>
      )}

      {step === 7 && (
        <div className="px-4 pt-10 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/celebrate.gif"
              alt="Celebrate"
              width={160}
              height={160}
            />
          </div>
          <h2 className={`text-xl text-primary-colour mb-2 ${Magnetik_Bold.className}`}>
            Profile Setup Complete
          </h2>
          <p className={`text-grey-2 mb-6 ${Magnetik_Regular.className}`}>
            Your profile is ready. Start exploring, discovering new stories, and
            writing your own. Enjoy your time on Storytime!
          </p>
          <Button
            className="w-full bg-primary-colour hover:bg-primary-shade-6 text-universal-white py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            onClick={() => router.push("/")}
          >
            🚀 Start Exploring
          </Button>
        </div>
      )}

        </div>

        {/* Hidden inputs for file selection */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleImageSelection(e.target.files?.[0] ?? null)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(e) => handleImageSelection(e.target.files?.[0] ?? null)}
        />

        {/* Image Picker Bottom Sheet */}
        {showImagePicker && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowImagePicker(false)}
            />
            <div className="relative w-full max-w-md bg-universal-white rounded-t-3xl p-6 shadow-2xl transform transition-all duration-300 ease-out">
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg text-primary-colour ${Magnetik_Bold.className}`}>
                  Profile Picture
                </h3>
                <button
                  onClick={() => setShowImagePicker(false)}
                  className="text-grey-2 hover:text-primary-colour transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <Button
                  className="w-full bg-transparent text-orange-500 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-orange-500"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  Take a photo
                </Button>
                <Button
                  className="w-full bg-transparent text-orange-500 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-orange-500"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select from album
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {showImagePreview && (
          <div className="fixed inset-0 z-[70] flex flex-col" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            
            {/* Image Container */}
            <div className="relative flex-1 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview ?? ""}
                alt="Image Preview"
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="relative p-4 bg-universal-white/95 backdrop-blur-sm">
              <div className="flex gap-3 max-w-md mx-auto">
                <Button
                  className="flex-1 bg-accent-shade-1 hover:bg-accent-shade-2 text-grey-1 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={() => setShowImagePreview(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary-colour hover:bg-primary-shade-6 text-universal-white py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={acceptImage}
                >
                  Set as Profile Picture
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
