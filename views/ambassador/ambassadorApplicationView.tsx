"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Loader2 } from "lucide-react";
import { Magnetik_Medium } from "@/lib/font";
import { AmbassadorHeader } from "@/components/ambassador/AmbassadorHeader";
import {
  AmbassadorStepIndicator,
  AmbassadorTypeCard,
} from "@/components/ambassador/AmbassadorComponents";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useGenres } from "@/src/hooks/useGenres";
import {
  submitAmbassadorApplication,
  type AmbassadorType,
  type CreateApplicationPayload,
} from "@/src/lib/ambassadors";
import { showToast } from "@/lib/showNotification";

const STEPS = ["Know You", "Journey", "Community", "Commit"];

const PLATFORM_OPTIONS = [
  "Instagram",
  "Twitter/X",
  "TikTok",
  "WhatsApp",
  "Facebook",
  "LinkedIn",
  "Campus groups",
  "Other",
];

export default function AmbassadorApplicationView() {
  const router = useRouter();
  const { user } = useUserProfile();
  const { genres: apiGenres } = useGenres();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<AmbassadorType>("campus");
  const [fullName, setFullName] = useState(
    user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "",
  );
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [institution, setInstitution] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [readingExperience, setReadingExperience] = useState("");
  const [writingExperience, setWritingExperience] = useState("");
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [communityDescription, setCommunityDescription] = useState("");
  const [estimatedReach, setEstimatedReach] = useState("100");
  const [hasLedCommunityBefore, setHasLedCommunityBefore] = useState(false);
  const [communityPlatforms, setCommunityPlatforms] = useState<string[]>([]);
  const [weeklyHours, setWeeklyHours] = useState("5");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);

  const genreOptions = apiGenres?.length
    ? apiGenres
    : ["Romance", "Fantasy", "Drama", "Thriller", "Comedy", "Adventure"];

  const toggleGenre = (genre: string) => {
    setFavoriteGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const togglePlatform = (platform: string) => {
    setCommunityPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  };

  const validateStep = (): string | null => {
    switch (step) {
      case 1:
        if (!fullName.trim()) return "Full name is required.";
        if (!email.trim()) return "Email is required.";
        if (!city.trim()) return "City is required.";
        if (!country.trim()) return "Country is required.";
        if (type === "campus" && !institution.trim()) {
          return "Institution is required for campus ambassadors.";
        }
        return null;
      case 2:
        if (whyJoin.trim().length < 50) {
          return "Tell us why you want to join (at least 50 characters).";
        }
        if (readingExperience.trim().length < 20) {
          return "Describe your reading experience (at least 20 characters).";
        }
        if (favoriteGenres.length === 0) {
          return "Select at least one favorite genre.";
        }
        return null;
      case 3:
        if (communityDescription.trim().length < 30) {
          return "Describe how you'll engage your community.";
        }
        if (communityPlatforms.length === 0) {
          return "Select at least one platform.";
        }
        return null;
      case 4:
        if (!agreedToTerms || !agreedToGuidelines) {
          return "You must agree to the terms and guidelines.";
        }
        return null;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    const error = validateStep();
    if (error) {
      showToast({ type: "error", message: error });
      return;
    }

    if (step < 4) {
      setStep(step + 1);
      return;
    }

    const payload: CreateApplicationPayload = {
      type,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      city: city.trim(),
      country: country.trim(),
      institution: institution.trim() || undefined,
      instagram: instagram.trim() || undefined,
      twitter: twitter.trim() || undefined,
      tiktok: tiktok.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
      whyJoin: whyJoin.trim(),
      readingExperience: readingExperience.trim(),
      writingExperience: writingExperience.trim() || undefined,
      favoriteGenres,
      communityDescription: communityDescription.trim(),
      estimatedReach: parseInt(estimatedReach, 10) || 0,
      hasLedCommunityBefore,
      communityPlatforms,
      weeklyHoursCommitment: parseInt(weeklyHours, 10) || 1,
      agreedToTerms,
      agreedToGuidelines,
    };

    setSubmitting(true);
    try {
      await submitAmbassadorApplication(payload);
      showToast({
        type: "success",
        message: "Application submitted successfully!",
      });
      router.push("/ambassador/status");
    } catch (err) {
      showToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to submit application",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-24">
      <AmbassadorHeader title="Ambassador Application" backHref="/ambassador" />
      <AmbassadorStepIndicator steps={STEPS} currentStep={step} />

      <div className="px-4 space-y-4">
        {step === 1 && (
          <>
            <p className={`${Magnetik_Medium.className} text-primary-colour`}>
              Choose your ambassador type
            </p>
            <AmbassadorTypeCard
              emoji="🎓"
              title="Campus Ambassador"
              description="For students representing Storytime on campus."
              selected={type === "campus"}
              onClick={() => setType("campus")}
            />
            <AmbassadorTypeCard
              emoji="🌍"
              title="Community Ambassador"
              description="For creators and community leaders online."
              selected={type === "community"}
              onClick={() => setType("community")}
            />
            <Input
              label="Full name"
              value={fullName}
              onValueChange={setFullName}
            />
            <Input label="Email" value={email} onValueChange={setEmail} />
            <Input
              label="Phone (optional)"
              value={phone}
              onValueChange={setPhone}
            />
            <Input label="City" value={city} onValueChange={setCity} />
            <Input label="Country" value={country} onValueChange={setCountry} />
            {type === "campus" && (
              <Input
                label="Institution / School"
                value={institution}
                onValueChange={setInstitution}
              />
            )}
            <Input
              label="Instagram (optional)"
              value={instagram}
              onValueChange={setInstagram}
            />
            <Input
              label="Twitter/X (optional)"
              value={twitter}
              onValueChange={setTwitter}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Textarea
              label="Why do you want to be a Storytime Ambassador?"
              minRows={4}
              value={whyJoin}
              onValueChange={setWhyJoin}
            />
            <Textarea
              label="Your reading journey"
              minRows={3}
              value={readingExperience}
              onValueChange={setReadingExperience}
            />
            <Textarea
              label="Your writing experience (optional)"
              minRows={3}
              value={writingExperience}
              onValueChange={setWritingExperience}
            />
            <p className="text-sm text-primary-colour">Favorite genres</p>
            <div className="flex flex-wrap gap-2">
              {genreOptions.map((g: string) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    favoriteGenres.includes(g)
                      ? "bg-primary-colour text-white border-primary-colour"
                      : "bg-white text-primary-colour border-grey-4"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Textarea
              label="How will you grow the Storytime community?"
              minRows={4}
              value={communityDescription}
              onValueChange={setCommunityDescription}
            />
            <Input
              label="Estimated reach (people)"
              type="number"
              value={estimatedReach}
              onValueChange={setEstimatedReach}
            />
            <Checkbox
              isSelected={hasLedCommunityBefore}
              onValueChange={setHasLedCommunityBefore}
            >
              I have led a community or group before
            </Checkbox>
            <p className="text-sm text-primary-colour">Platforms you use</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    communityPlatforms.includes(p)
                      ? "bg-primary-colour text-white border-primary-colour"
                      : "bg-white text-primary-colour border-grey-4"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <Input
              label="Weekly hours you can commit"
              type="number"
              value={weeklyHours}
              onValueChange={setWeeklyHours}
            />
            <Checkbox
              isSelected={agreedToTerms}
              onValueChange={setAgreedToTerms}
            >
              I agree to the Storytime Ambassador Terms
            </Checkbox>
            <Checkbox
              isSelected={agreedToGuidelines}
              onValueChange={setAgreedToGuidelines}
            >
              I agree to follow the Ambassador Community Guidelines
            </Checkbox>
            <div className="bg-white rounded-xl p-4 text-sm text-grey-2">
              <p className="text-primary-colour font-magnetik-medium mb-2">
                Review summary
              </p>
              <p>
                <strong>Type:</strong>{" "}
                {type === "campus"
                  ? "Campus Ambassador"
                  : "Community Ambassador"}
              </p>
              <p>
                <strong>Location:</strong> {city}, {country}
              </p>
              <p>
                <strong>Weekly commitment:</strong> {weeklyHours} hours
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              variant="bordered"
              className="flex-1 border-primary-colour text-primary-colour"
              onPress={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}
          <Button
            className="flex-1 bg-primary-colour text-white"
            onPress={handleNext}
            isDisabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : step === 4 ? (
              "Submit Application"
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
