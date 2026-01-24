"use client";

import React, { ReactNode } from "react";
import { usePremiumFeatures, PremiumFeatures } from "@/src/hooks/usePremiumFeatures";
import { Lock } from "lucide-react";
import { Button } from "@heroui/button";
import { Magnetik_Medium } from "@/lib/font";

interface PremiumGateProps {
  /** Which premium feature is required */
  feature: keyof PremiumFeatures;
  /** Content to show when user has access */
  children: ReactNode;
  /** Optional custom fallback when access denied */
  fallback?: ReactNode;
  /** If true, renders nothing when access denied (instead of fallback) */
  hideWhenLocked?: boolean;
  /** Custom message for locked state */
  lockedMessage?: string;
  /** Show loading skeleton while checking premium status */
  showLoadingState?: boolean;
}

/**
 * Wrapper component for premium-only features
 *
 * Usage:
 * <PremiumGate feature="advancedVoices">
 *   <VoiceSelector />
 * </PremiumGate>
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({
  feature,
  children,
  fallback,
  hideWhenLocked = false,
  lockedMessage = "Premium feature",
  showLoadingState = true,
}) => {
  const { checkFeature, isLoading } = usePremiumFeatures();

  // Show loading state
  if (isLoading && showLoadingState) {
    return (
      <div className="animate-pulse bg-light-grey-2 rounded-lg h-10 w-full" />
    );
  }

  // Check if user has access
  if (checkFeature(feature)) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (hideWhenLocked) {
    return null;
  }

  // Show custom fallback or default locked UI
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state UI
  return (
    <LockedFeatureUI message={lockedMessage} />
  );
};

interface LockedFeatureUIProps {
  message: string;
  onUpgrade?: () => void;
}

/**
 * Default locked state component
 */
const LockedFeatureUI: React.FC<LockedFeatureUIProps> = ({
  message,
  onUpgrade,
}) => {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // TODO: Navigate to premium upgrade page or show modal
      console.log("Upgrade to premium clicked");
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-light-grey-1 rounded-lg border border-light-grey-2">
      <Lock className="w-4 h-4 text-grey-1" />
      <span className={`text-xs text-grey-2 ${Magnetik_Medium.className} flex-1`}>
        {message}
      </span>
      <Button
        size="sm"
        variant="flat"
        className="text-xs bg-complimentary-colour text-white px-3 py-1 h-auto min-h-0"
        onPress={handleUpgrade}
      >
        Upgrade
      </Button>
    </div>
  );
};

/**
 * HOC version for class components or when you need more control
 */
export function withPremiumGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: keyof PremiumFeatures,
  fallback?: ReactNode
) {
  return function PremiumGatedComponent(props: P) {
    return (
      <PremiumGate feature={feature} fallback={fallback}>
        <WrappedComponent {...props} />
      </PremiumGate>
    );
  };
}
