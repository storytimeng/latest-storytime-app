"use client";

import { useEffect, useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import { Avatar } from "@heroui/avatar";
import { Magnetik_Medium } from "@/lib/font";
import { AmbassadorHeader } from "@/components/ambassador/AmbassadorHeader";
import { fetchAmbassadorReferrals } from "@/src/lib/ambassadors";
import {
  shareReferralLink,
  shareReferralViaWhatsApp,
  shareReferralViaTwitter,
  shareReferralViaFacebook,
} from "@/lib/share";
import { showToast } from "@/lib/showNotification";

export default function AmbassadorShareView() {
  const [shareUrl, setShareUrl] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<
    Array<{
      id: string;
      source: string;
      signedUpAt: string;
      user: {
        firstName: string;
        lastName: string;
        penName?: string;
        avatar?: string;
      } | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchAmbassadorReferrals()
      .then((data) => {
        setShareUrl(data.shareUrl);
        setReferralCode(data.referralCode);
        setReferrals(data.referrals);
      })
      .catch(() => {
        showToast({ type: "error", message: "Failed to load referral data" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast({ type: "success", message: "Link copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast({ type: "error", message: "Could not copy link" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent-shade-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-colour" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent-shade-1 max-w-md mx-auto pb-24">
      <AmbassadorHeader
        title="Share Your Link"
        backHref="/ambassador/dashboard"
      />

      <div className="px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <p className={`${Magnetik_Medium.className} text-primary-colour`}>
            Your referral link
          </p>
          <div className="flex items-center gap-2 bg-grey-5 rounded-lg p-3">
            <p className="text-xs text-grey-2 flex-1 break-all">{shareUrl}</p>
            <button onClick={handleCopy} className="text-primary-colour">
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-sm text-grey-2">
            Code:{" "}
            <strong className="text-primary-colour">{referralCode}</strong>
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "Share",
              emoji: "📤",
              action: () => shareReferralLink(shareUrl, referralCode),
            },
            {
              label: "WhatsApp",
              emoji: "💬",
              action: () => shareReferralViaWhatsApp(shareUrl, referralCode),
            },
            {
              label: "Facebook",
              emoji: "📘",
              action: () => shareReferralViaFacebook(shareUrl),
            },
            {
              label: "X",
              emoji: "🐦",
              action: () => shareReferralViaTwitter(shareUrl),
            },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => void btn.action()}
              className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm"
            >
              <span className="text-xl">{btn.emoji}</span>
              <span className="text-[10px] text-primary-colour mt-1">
                {btn.label}
              </span>
            </button>
          ))}
        </div>

        <div>
          <p
            className={`${Magnetik_Medium.className} text-primary-colour mb-3`}
          >
            Your referrals ({referrals.length})
          </p>
          {referrals.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-grey-2 text-sm">
              No referrals yet. Share your link to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm"
                >
                  <Avatar
                    src={r.user?.avatar}
                    name={
                      r.user?.penName ||
                      `${r.user?.firstName || ""} ${r.user?.lastName || ""}`
                    }
                    size="sm"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-primary-colour">
                      {r.user?.penName ||
                        `${r.user?.firstName} ${r.user?.lastName}`}
                    </p>
                    <p className="text-xs text-grey-3">
                      {new Date(r.signedUpAt).toLocaleDateString()} · {r.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
