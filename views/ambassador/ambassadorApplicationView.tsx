"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib";
import {
  Magnetik_Bold,
  Magnetik_Medium,
  Magnetik_Regular,
  Magnetik_SemiBold,
} from "@/lib/font";
import {
  ApplicationProgressBar,
  ApplicationStepHeader,
  FieldError,
  FormErrorBanner,
  FormTextArea,
  FormTextInput,
  HelperText,
  OptionCard,
  PrimaryFormButton,
  RequiredLabel,
  YesNoCards,
} from "@/components/ambassador/application-form-ui";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import {
  submitAmbassadorApplication,
  type AmbassadorType,
  type CreateApplicationPayload,
} from "@/src/lib/ambassadors";
import { showToast } from "@/lib/showNotification";
import { mutate } from "swr";

const PROFILE_TYPES = [
  "Secondary school student",
  "University student",
  "Polytechnic / College of Education student",
  "Member of a reading club",
  "Reading club/community lead",
  "Educator",
  "Other (specify)",
] as const;

const PROMOTION_METHODS = [
  "Social media promotion",
  "Campus/community outreach",
  "Hosting reading circles",
  "Hosting writing challenges",
  "One-on-one referrals",
  "Content creation (videos/posts)",
  "Other (specify)",
] as const;

const STORYTIME_ROLES = [
  "I am primarily a writer",
  "I am primarily a reader",
  "I am both",
  "I am still exploring",
] as const;

const COMMITMENTS = [
  "I understand that being an Ambassador is a responsibility-based role.",
  "I agree to represent Storytime with integrity and professionalism.",
  "I am willing to submit monthly activity reports.",
  "I understand that performance will be reviewed monthly.",
] as const;

const MOTIVATION_MIN = 250;
const OTHER_PROFILE_TYPE = "Other (specify)";
const OTHER_PROMOTION = "Other (specify)";

type FormStep = 1 | 2 | 3 | 4;
type ViewPhase = FormStep | "success";

type ErrorField =
  | "cityState"
  | "profileTypes"
  | "otherProfileType"
  | "motivation"
  | "promotionMethods"
  | "otherPromotion"
  | "partOfCommunity"
  | "storytimeRole"
  | "conflictHandling"
  | "commitments"
  | "form";

type StepErrors = Partial<Record<ErrorField, string>>;

const ERROR_FIELD_ORDER: ErrorField[] = [
  "form",
  "cityState",
  "profileTypes",
  "otherProfileType",
  "motivation",
  "promotionMethods",
  "otherPromotion",
  "partOfCommunity",
  "storytimeRole",
  "conflictHandling",
  "commitments",
];

function parseSubmitError(error: unknown): string {
  if (error instanceof Error) {
    const raw = error.message.trim();
    if (!raw) return "We couldn't submit your application. Please try again.";

    try {
      const parsed = JSON.parse(raw) as { message?: string | string[] };
      if (Array.isArray(parsed.message)) {
        return parsed.message.join(". ");
      }
      if (typeof parsed.message === "string" && parsed.message) {
        return parsed.message;
      }
    } catch {
      // message is plain text
    }

    if (raw.toLowerCase().includes("already")) {
      return "You already have a pending ambassador application.";
    }

    return raw;
  }

  return "We couldn't submit your application. Please try again.";
}

function scrollToFirstError(errors: StepErrors) {
  const firstField = ERROR_FIELD_ORDER.find((field) => errors[field]);
  if (!firstField) return;

  const targetId =
    firstField === "form" ? "application-form-error" : `field-${firstField}`;

  requestAnimationFrame(() => {
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
}

function parseCityState(cityState: string): { city: string; country: string } {
  const parts = cityState
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      city: parts.slice(0, -1).join(", "),
      country: parts[parts.length - 1],
    };
  }

  return { city: cityState.trim(), country: "Nigeria" };
}

function toggleSelection<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function ApplicationSuccessScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto px-6 flex flex-col items-center justify-center text-center pb-12">
      <div className="w-24 h-24 rounded-full bg-[#34A853] flex items-center justify-center mb-6">
        <Check className="w-12 h-12 text-white" strokeWidth={3} />
      </div>
      <h1
        className={cn(
          Magnetik_Bold.className,
          "text-2xl text-primary-colour mb-3",
        )}
      >
        Application Submitted!!
      </h1>
      <p
        className={cn(
          Magnetik_Regular.className,
          "text-sm text-grey-2 leading-relaxed mb-8 max-w-xs",
        )}
      >
        Your application has been submitted successfully. Our team will
        carefully review your responses and get back to you soon.
      </p>
      <PrimaryFormButton onClick={() => router.push("/ambassador/status")}>
        View My Application Status
      </PrimaryFormButton>
      <Link
        href="/profile"
        className={cn(
          Magnetik_Medium.className,
          "mt-4 text-sm text-primary-colour underline-offset-2 hover:underline",
        )}
      >
        Back to Profile
      </Link>
    </div>
  );
}

export default function AmbassadorApplicationView() {
  const router = useRouter();
  const { user } = useUserProfile();
  const [phase, setPhase] = useState<ViewPhase>(1);
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<StepErrors>({});

  const [cityState, setCityState] = useState("");
  const [profileTypes, setProfileTypes] = useState<string[]>([]);
  const [otherProfileType, setOtherProfileType] = useState("");
  const [institution, setInstitution] = useState("");

  const [type, setType] = useState<AmbassadorType>("campus");
  const [motivation, setMotivation] = useState("");
  const [promotionMethods, setPromotionMethods] = useState<string[]>([]);
  const [otherPromotion, setOtherPromotion] = useState("");

  const [partOfCommunity, setPartOfCommunity] = useState<"yes" | "no" | null>(
    null,
  );
  const [storytimeRole, setStorytimeRole] = useState<string | null>(null);
  const [conflictHandling, setConflictHandling] = useState("");

  const [commitments, setCommitments] = useState<boolean[]>(
    COMMITMENTS.map(() => false),
  );

  const step = phase === "success" ? 4 : phase;

  const clearError = (field: ErrorField) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleBack = () => {
    if (submitting) return;
    if (phase === 1) {
      router.push("/ambassador");
      return;
    }
    if (phase !== "success") {
      setErrors({});
      setPhase((phase - 1) as FormStep);
    }
  };

  const validateStep = (currentStep: FormStep): StepErrors => {
    const nextErrors: StepErrors = {};

    switch (currentStep) {
      case 1:
        if (!cityState.trim()) {
          nextErrors.cityState = "Please enter your city and state.";
        }
        if (profileTypes.length === 0) {
          nextErrors.profileTypes =
            "Select at least one option that describes you.";
        }
        if (
          profileTypes.includes(OTHER_PROFILE_TYPE) &&
          !otherProfileType.trim()
        ) {
          nextErrors.otherProfileType = "Please specify your profile type.";
        }
        break;
      case 2:
        if (motivation.trim().length < MOTIVATION_MIN) {
          nextErrors.motivation = `Please write at least ${MOTIVATION_MIN} characters about your motivation.`;
        }
        if (promotionMethods.length === 0) {
          nextErrors.promotionMethods =
            "Select at least one way you plan to promote Storytime.";
        }
        if (
          promotionMethods.includes(OTHER_PROMOTION) &&
          !otherPromotion.trim()
        ) {
          nextErrors.otherPromotion =
            "Please describe your other promotion methods.";
        }
        break;
      case 3:
        if (!partOfCommunity) {
          nextErrors.partOfCommunity =
            "Please let us know if you are part of an organized community.";
        }
        if (!storytimeRole) {
          nextErrors.storytimeRole =
            "Select which best describes you on Storytime.";
        }
        if (conflictHandling.trim().length < 20) {
          nextErrors.conflictHandling =
            "Please share how you would handle conflict or harmful content (at least 20 characters).";
        }
        break;
      case 4:
        if (!commitments.every(Boolean)) {
          nextErrors.commitments =
            "Please agree to all ambassador commitments before submitting.";
        }
        break;
      default:
        const _exhaustive: never = currentStep;
        return _exhaustive;
    }

    return nextErrors;
  };

  const buildPayload = (): CreateApplicationPayload => {
    const { city, country } = parseCityState(cityState);

    const normalizedProfileTypes = profileTypes.map((item) =>
      item === OTHER_PROFILE_TYPE && otherProfileType.trim()
        ? OTHER_PROFILE_TYPE
        : item,
    );

    const normalizedPromotionMethods = promotionMethods.map((item) =>
      item === OTHER_PROMOTION ? OTHER_PROMOTION : item,
    );

    return {
      type,
      city,
      country,
      institution: institution.trim() || undefined,
      profileTypes: normalizedProfileTypes,
      otherProfileType: profileTypes.includes(OTHER_PROFILE_TYPE)
        ? otherProfileType.trim() || undefined
        : undefined,
      whyJoin: motivation.trim(),
      promotionMethods: normalizedPromotionMethods,
      otherPromotionDetail: promotionMethods.includes(OTHER_PROMOTION)
        ? otherPromotion.trim() || undefined
        : undefined,
      partOfOrganizedCommunity: partOfCommunity === "yes",
      storytimeRole: storytimeRole || "",
      conflictHandling: conflictHandling.trim(),
      agreedToResponsibility: commitments[0],
      agreedToIntegrity: commitments[1],
      agreedToMonthlyReports: commitments[2],
      agreedToPerformanceReview: commitments[3],
    };
  };

  const handleNext = async () => {
    if (phase === "success" || submitting) return;

    const currentStep = phase;
    const stepErrors = validateStep(currentStep);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      scrollToFirstError(stepErrors);
      showToast({
        type: "error",
        message: "Please fix the highlighted fields to continue.",
      });
      return;
    }

    setErrors({});

    if (currentStep !== 4) {
      setPhase((currentStep + 1) as FormStep);
      return;
    }

    setSubmitting(true);
    try {
      if (!user?.email) {
        throw new Error("Please sign in before submitting your application.");
      }

      await submitAmbassadorApplication(buildPayload());
      await mutate("ambassador-overview");
      setPhase("success");
    } catch (err) {
      const message = parseSubmitError(err);
      setErrors({ form: message });
      scrollToFirstError({ form: message });
      showToast({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "success") {
    return <ApplicationSuccessScreen />;
  }

  return (
    <div
      className="min-h-screen bg-accent-shade-1 max-w-md mx-auto flex flex-col"
      aria-busy={submitting}
    >
      <div className="pt-4">
        <button
          type="button"
          onClick={handleBack}
          disabled={submitting}
          className="px-4 text-primary-colour disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <ApplicationProgressBar step={step} />
      </div>

      <div className="flex-1 px-4 py-5 space-y-5 overflow-y-auto pb-4">
        <div id="application-form-error">
          <FormErrorBanner message={errors.form} />
        </div>

        {phase === 1 && (
          <>
            <ApplicationStepHeader
              title="Let's get to know you"
              subtitle="Tell us a bit about yourself and where you're from."
            />
            <div className="space-y-2">
              <RequiredLabel>City &amp; State</RequiredLabel>
              <FormTextInput
                id="field-cityState"
                value={cityState}
                onChange={(value) => {
                  setCityState(value);
                  clearError("cityState");
                }}
                placeholder="e.g., Lagos, Nigeria"
                focused={focusedField === "cityState"}
                onFocus={() => setFocusedField("cityState")}
                onBlur={() => setFocusedField(null)}
                disabled={submitting}
                invalid={!!errors.cityState}
                errorMessage={errors.cityState}
              />
              <HelperText>
                This helps us connect you with local opportunities
              </HelperText>
            </div>

            <div className="space-y-3" id="field-profileTypes">
              <RequiredLabel>Which best describes you?</RequiredLabel>
              <div className="space-y-3">
                {PROFILE_TYPES.map((option) => (
                  <OptionCard
                    key={option}
                    label={option}
                    selected={profileTypes.includes(option)}
                    onClick={() => {
                      setProfileTypes((prev) => toggleSelection(prev, option));
                      clearError("profileTypes");
                    }}
                    disabled={submitting}
                    invalid={!!errors.profileTypes}
                  />
                ))}
              </div>
              <FieldError message={errors.profileTypes} />
              {profileTypes.includes(OTHER_PROFILE_TYPE) && (
                <FormTextInput
                  id="field-otherProfileType"
                  value={otherProfileType}
                  onChange={(value) => {
                    setOtherProfileType(value);
                    clearError("otherProfileType");
                  }}
                  placeholder="Please specify"
                  focused={focusedField === "otherProfileType"}
                  onFocus={() => setFocusedField("otherProfileType")}
                  onBlur={() => setFocusedField(null)}
                  disabled={submitting}
                  invalid={!!errors.otherProfileType}
                  errorMessage={errors.otherProfileType}
                />
              )}
              <HelperText>Select all that apply</HelperText>
            </div>

            <div className="space-y-2">
              <RequiredLabel>
                Name of your school, institution, or community (if applicable)
              </RequiredLabel>
              <FormTextInput
                value={institution}
                onChange={setInstitution}
                placeholder="Short answer"
                focused={focusedField === "institution"}
                onFocus={() => setFocusedField("institution")}
                onBlur={() => setFocusedField(null)}
                disabled={submitting}
              />
              <HelperText>Optional but encouraged.</HelperText>
            </div>
          </>
        )}

        {phase === 2 && (
          <>
            <ApplicationStepHeader
              title="Your ambassador journey"
              subtitle="Choose your role and share your passion for Storytime."
            />

            <div className="space-y-3">
              <RequiredLabel>
                Which ambassador role are you most interested in?
              </RequiredLabel>
              <OptionCard
                label="Campus Ambassador"
                description="Lead the Storytime movement in your school or university. Connect with student communities and inspire fellow students."
                selected={type === "campus"}
                onClick={() => setType("campus")}
                type="radio"
                disabled={submitting}
              />
              <OptionCard
                label="Community Ambassador"
                description="Engage with broader reading communities online and offline. Inspire readers and writers beyond campus walls."
                selected={type === "community"}
                onClick={() => setType("community")}
                type="radio"
                disabled={submitting}
              />
              <HelperText>
                Campus ambassadors focus on schools and universities, while
                community ambassadors engage with broader reading communities.
              </HelperText>
            </div>

            <div className="space-y-2" id="field-motivation">
              <RequiredLabel>
                Why do you want to be a Storytime Ambassador?
              </RequiredLabel>
              <FormTextArea
                id="field-motivation"
                value={motivation}
                onChange={(value) => {
                  setMotivation(value);
                  clearError("motivation");
                }}
                placeholder="Write 3–5 clear sentences about your motivation"
                rows={5}
                focused={focusedField === "motivation"}
                onFocus={() => setFocusedField("motivation")}
                onBlur={() => setFocusedField(null)}
                disabled={submitting}
                invalid={!!errors.motivation}
                errorMessage={errors.motivation}
              />
              <div className="flex items-center justify-between gap-2">
                <HelperText>
                  Write 3–5 clear sentences about your motivation
                </HelperText>
                <p
                  className={cn(
                    Magnetik_Regular.className,
                    "text-xs shrink-0",
                    motivation.length >= MOTIVATION_MIN
                      ? "text-grey-3"
                      : "text-complimentary-colour",
                  )}
                >
                  {motivation.length}/{MOTIVATION_MIN} characters minimum
                </p>
              </div>
            </div>

            <div className="space-y-3" id="field-promotionMethods">
              <RequiredLabel>
                How do you plan to promote Storytime?
              </RequiredLabel>
              <div className="space-y-3">
                {PROMOTION_METHODS.map((option) => (
                  <OptionCard
                    key={option}
                    label={option}
                    selected={promotionMethods.includes(option)}
                    onClick={() => {
                      setPromotionMethods((prev) =>
                        toggleSelection(prev, option),
                      );
                      clearError("promotionMethods");
                    }}
                    disabled={submitting}
                    invalid={!!errors.promotionMethods}
                  />
                ))}
              </div>
              <FieldError message={errors.promotionMethods} />
              {promotionMethods.includes(OTHER_PROMOTION) && (
                <FormTextInput
                  id="field-otherPromotion"
                  value={otherPromotion}
                  onChange={(value) => {
                    setOtherPromotion(value);
                    clearError("otherPromotion");
                  }}
                  placeholder="Describe your promotion methods"
                  focused={focusedField === "otherPromotion"}
                  onFocus={() => setFocusedField("otherPromotion")}
                  onBlur={() => setFocusedField(null)}
                  disabled={submitting}
                  invalid={!!errors.otherPromotion}
                  errorMessage={errors.otherPromotion}
                />
              )}
              <HelperText>Required.</HelperText>
            </div>
          </>
        )}

        {phase === 3 && (
          <>
            <ApplicationStepHeader
              title="Your community & identity"
              subtitle="Help us understand your network and how you engage with Storytime."
            />

            <div className="space-y-3" id="field-partOfCommunity">
              <RequiredLabel>
                Are you currently part of any organized community where you can
                promote Storytime?
              </RequiredLabel>
              <YesNoCards
                value={partOfCommunity}
                onChange={(value) => {
                  setPartOfCommunity(value);
                  clearError("partOfCommunity");
                }}
                disabled={submitting}
                invalid={!!errors.partOfCommunity}
              />
              <FieldError message={errors.partOfCommunity} />
            </div>

            <div className="space-y-3" id="field-storytimeRole">
              <RequiredLabel>
                Which best describes you on Storytime?
              </RequiredLabel>
              <div className="space-y-3">
                {STORYTIME_ROLES.map((option) => (
                  <OptionCard
                    key={option}
                    label={option}
                    selected={storytimeRole === option}
                    onClick={() => {
                      setStorytimeRole(option);
                      clearError("storytimeRole");
                    }}
                    type="radio"
                    disabled={submitting}
                    invalid={!!errors.storytimeRole}
                  />
                ))}
              </div>
              <FieldError message={errors.storytimeRole} />
            </div>

            <div className="space-y-2" id="field-conflictHandling">
              <p
                className={cn(
                  Magnetik_Regular.className,
                  "text-xs text-grey-3",
                )}
              >
                Be specific
              </p>
              <RequiredLabel>
                Storytime is a safe creative space. How would you handle
                conflict, harmful content, or misinformation within your
                community?
              </RequiredLabel>
              <FormTextArea
                id="field-conflictHandling"
                value={conflictHandling}
                onChange={(value) => {
                  setConflictHandling(value);
                  clearError("conflictHandling");
                }}
                placeholder="Short paragraph"
                rows={5}
                focused={focusedField === "conflictHandling"}
                onFocus={() => setFocusedField("conflictHandling")}
                onBlur={() => setFocusedField(null)}
                disabled={submitting}
                invalid={!!errors.conflictHandling}
                errorMessage={errors.conflictHandling}
              />
            </div>
          </>
        )}

        {phase === 4 && (
          <>
            <ApplicationStepHeader
              title="Almost there! 🎉"
              subtitle="Review your commitment as a Storytime Ambassador."
            />

            <div className="space-y-3" id="field-commitments">
              <p
                className={cn(
                  Magnetik_SemiBold.className,
                  "text-sm text-primary-colour",
                )}
              >
                Ambassador Commitments
              </p>
              <HelperText>
                By checking all boxes below, you agree to uphold these
                responsibilities:
              </HelperText>
              <div className="space-y-3">
                {COMMITMENTS.map((text, index) => (
                  <OptionCard
                    key={text}
                    label={text}
                    selected={commitments[index]}
                    onClick={() => {
                      setCommitments((prev) => {
                        const next = [...prev];
                        next[index] = !next[index];
                        return next;
                      });
                      clearError("commitments");
                    }}
                    disabled={submitting}
                    invalid={!!errors.commitments}
                  />
                ))}
              </div>
              <FieldError message={errors.commitments} />
            </div>
          </>
        )}
      </div>

      <div className="px-4 pb-8 pt-2">
        <PrimaryFormButton
          onClick={handleNext}
          loading={submitting}
          disabled={submitting}
          loadingLabel="Submitting application..."
        >
          {phase === 4 ? "Submit Application" : "Next"}
        </PrimaryFormButton>
      </div>
    </div>
  );
}
