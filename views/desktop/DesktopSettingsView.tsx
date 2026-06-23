"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { Switch } from "@heroui/switch";
import { ChevronRight } from "lucide-react";
import {
  ProfileCard,
  SecurityModal,
  FAQsModal,
  SupportModal,
  DeleteAccountModal,
  ClearCacheModal,
  LogoutModal,
  SubscriptionModal,
} from "@/components/reusables/customUI";
import { cn } from "@/lib/utils";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import {
  SETTINGS_OPTIONS,
  SUBSCRIPTION_SETTING_OPTION,
} from "@/config/settings";
import { DESKTOP_ROUTES } from "@/config/desktopRoutes";
import { useSupportStore } from "@/src/stores/useSupportStore";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";
import { usePremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { useAuthStore } from "@/src/stores/useAuthStore";
import { fetchPaymentHistory } from "@/src/lib/subscriptions";
import { showToast } from "@/lib/showNotification";
import type { SettingOption } from "@/components/reusables/customUI/SettingsOption";

const PANEL_OPTIONS = new Set([
  "security",
  "subscription",
  "faqs",
  "support",
  "delete-account",
  "clear-cache",
  "logout",
]);

function panelTitle(section: string): string {
  const titles: Record<string, string> = {
    security: "Security",
    subscription: "Subscription",
    faqs: "FAQs",
    support: "Support",
    "delete-account": "Delete account",
    "clear-cache": "Clear cache",
    logout: "Log out",
  };
  return titles[section] ?? "Settings";
}

function SettingsPanelContent({
  section,
  onCloseLogout,
  onCloseSection,
}: {
  section: string;
  onCloseLogout?: () => void;
  onCloseSection?: () => void;
}) {
  switch (section) {
    case "security":
      return <SecurityModal />;
    case "subscription":
      return <SubscriptionModal />;
    case "faqs":
      return <FAQsModal />;
    case "support":
      return <SupportModal />;
    case "delete-account":
      return <DeleteAccountModal onClose={onCloseSection} />;
    case "clear-cache":
      return <ClearCacheModal />;
    case "logout":
      return <LogoutModal onClose={onCloseLogout ?? (() => undefined)} />;
    default:
      return null;
  }
}

export function DesktopSettingsView() {
  const openSupportModal = useSupportStore((state) => state.openModal);
  const isOnline = useOnlineStatus();
  const { isAuthenticated } = useAuthStore();
  const {
    isPremium,
    isSubscriptionCancelled,
    isLoading: premiumLoading,
  } = usePremiumFeatures();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const isLoggedIn = isAuthenticated();

  const { data: paymentHistory } = useSWR(
    isLoggedIn ? "subscription-history" : null,
    fetchPaymentHistory,
    { revalidateOnFocus: false },
  );

  const hasPaymentHistory = (paymentHistory?.payments?.length ?? 0) > 0;

  const settingsOptions = useMemo(() => {
    const showSubscription =
      isLoggedIn &&
      !premiumLoading &&
      (isPremium || isSubscriptionCancelled || hasPaymentHistory);

    if (!showSubscription) {
      return SETTINGS_OPTIONS;
    }

    const options = [...SETTINGS_OPTIONS];
    const securityIndex = options.findIndex((opt) => opt.id === "security");
    const insertAt = securityIndex >= 0 ? securityIndex + 1 : 1;
    options.splice(insertAt, 0, SUBSCRIPTION_SETTING_OPTION);
    return options;
  }, [
    isLoggedIn,
    premiumLoading,
    isPremium,
    isSubscriptionCancelled,
    hasPaymentHistory,
  ]);

  const handleOptionClick = (option: SettingOption) => {
    if (option.hasToggle) return;

    if (option.id === "faqs") {
      openSupportModal("faqs");
      setActiveSection("faqs");
      return;
    }
    if (option.id === "terms-policy") {
      openSupportModal("terms");
      return;
    }
    if (option.id === "support") {
      openSupportModal("support");
      setActiveSection("support");
      return;
    }

    if (
      !isOnline &&
      (option.id === "security" || option.id === "delete-account")
    ) {
      showToast({
        type: "error",
        message: "This setting is unavailable while offline",
      });
      return;
    }

    if (PANEL_OPTIONS.has(option.id)) {
      setActiveSection(option.id);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:gap-8">
      <aside className="w-full shrink-0 lg:w-72 xl:w-80">
        <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 lg:sticky lg:top-20">
          <Link
            href={DESKTOP_ROUTES.profile}
            className={cn(
              "block text-sm text-[#361B17]/60 hover:text-primary-colour",
              Magnetik_Medium.className,
            )}
          >
            ← Back to profile
          </Link>

          <ProfileCard
            containerClassName="mt-0 bg-transparent px-0 pb-0"
            className="h-auto"
            textClassName="text-primary-colour"
            useLiveData
            settingsHref={DESKTOP_ROUTES.settings}
          />

          <div className="space-y-1">
            {settingsOptions.map((option) => {
              if (option.hasToggle) {
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 text-sm text-[#361B17]">
                      {option.icon}
                      <span className={Magnetik_Regular.className}>
                        {option.label}
                      </span>
                    </div>
                    <Switch
                      defaultSelected={option.isEnabled}
                      onValueChange={option.onToggle}
                      color="warning"
                      size="sm"
                    />
                  </div>
                );
              }

              if (option.route) {
                return (
                  <Link
                    key={option.id}
                    href={option.route}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-black/[0.04]",
                      option.isDanger ? "text-red-600" : "text-[#361B17]",
                      Magnetik_Regular.className,
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-40" />
                  </Link>
                );
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                    Magnetik_Regular.className,
                    activeSection === option.id
                      ? "bg-primary-colour/10 text-primary-colour font-medium"
                      : option.isDanger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-[#361B17] hover:bg-black/[0.04]",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4">
          <h2
            className={cn(
              "text-xl text-[#361B17] md:text-2xl",
              Magnetik_Bold.className,
            )}
          >
            {activeSection ? panelTitle(activeSection) : "Settings"}
          </h2>
          <p
            className={cn(
              "mt-1 text-sm text-[#361B17]/60",
              Magnetik_Regular.className,
            )}
          >
            {activeSection
              ? "Manage your account preferences"
              : "Choose an option from the sidebar"}
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 md:p-6">
          {activeSection && PANEL_OPTIONS.has(activeSection) ? (
            <SettingsPanelContent
              section={activeSection}
              onCloseLogout={() => setActiveSection(null)}
              onCloseSection={() => setActiveSection(null)}
            />
          ) : (
            <div className="py-12 text-center">
              <p className={cn("text-[#361B17]", Magnetik_Medium.className)}>
                Select a setting to get started
              </p>
              <p
                className={cn(
                  "mt-2 text-sm text-[#361B17]/60",
                  Magnetik_Regular.className,
                )}
              >
                Security, subscription, support, and account actions live here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
