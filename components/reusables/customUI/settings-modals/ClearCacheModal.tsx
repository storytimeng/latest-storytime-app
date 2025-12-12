"use client";

import React, { useState } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@/components/ui/button";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { useCacheManagement } from "@/hooks/useCacheManagement";
import { showToast } from "@/lib/showNotification";
import { Trash2, RefreshCw, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

const ClearCacheModal = () => {
  const router = useRouter();
  const {
    cacheStats,
    isCalculating,
    formatBytes,
    calculateCacheSizes,
    clearLocalStorage,
    clearIndexedDB,
    clearAllCaches,
  } = useCacheManagement();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleClearPenCache = async () => {
    setIsClearing(true);
    try {
      const success = await clearIndexedDB();
      if (success) {
        showToast({
          type: "success",
          message: "Pen cache cleared successfully",
          duration: 2000,
        });
      } else {
        showToast({
          type: "error",
          message: "Failed to clear pen cache",
          duration: 3000,
        });
      }
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearDownloadsCache = async () => {
    setIsClearing(true);
    try {
      const success = await clearIndexedDB();
      if (success) {
        showToast({
          type: "success",
          message: "Downloads cache cleared successfully",
          duration: 2000,
        });
      } else {
        showToast({
          type: "error",
          message: "Failed to clear downloads cache",
          duration: 3000,
        });
      }
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearMiscCache = () => {
    setIsClearing(true);
    try {
      const success = clearLocalStorage();
      if (success) {
        showToast({
          type: "success",
          message: "Misc cache cleared successfully",
          duration: 2000,
        });
      } else {
        showToast({
          type: "error",
          message: "Failed to clear misc cache",
          duration: 3000,
        });
      }
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearAll = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    setIsClearing(true);
    try {
      const success = await clearAllCaches();
      if (success) {
        showToast({
          type: "success",
          message: "All caches cleared successfully. Redirecting to login...",
          duration: 2000,
        });
        // Redirect to login after clearing all
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        showToast({
          type: "error",
          message: "Failed to clear all caches",
          duration: 3000,
        });
      }
    } finally {
      setIsClearing(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <ModalHeader>
        <h2 className={`text-xl text-primary-colour ${Magnetik_Bold.className}`}>
          Clear Cache
        </h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-4">
          {/* Pen Cache */}
          <div className="p-4 bg-light-grey-1 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3
                  className={`text-primary-colour font-medium ${Magnetik_Regular.className}`}
                >
                  Pen Cache
                </h3>
                <p className="text-xs text-grey-2 mt-1">
                  Stories saved for offline writing and drafts
                </p>
              </div>
              <span className="text-sm text-primary-colour font-medium">
                {formatBytes(cacheStats.indexedDB / 2)}
              </span>
            </div>
            <Button
              variant="bordered"
              size="sm"
              onPress={handleClearPenCache}
              isDisabled={isClearing || isCalculating}
              startContent={<Trash2 size={16} />}
              className="w-full mt-2"
            >
              Clear Pen Cache
            </Button>
          </div>

          {/* Downloads Cache */}
          <div className="p-4 bg-light-grey-1 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3
                  className={`text-primary-colour font-medium ${Magnetik_Regular.className}`}
                >
                  Downloads Cache
                </h3>
                <p className="text-xs text-grey-2 mt-1">
                  Downloaded stories for offline reading
                </p>
              </div>
              <span className="text-sm text-primary-colour font-medium">
                {formatBytes(cacheStats.indexedDB / 2)}
              </span>
            </div>
            <Button
              variant="bordered"
              size="sm"
              onPress={handleClearDownloadsCache}
              isDisabled={isClearing || isCalculating}
              startContent={<Trash2 size={16} />}
              className="w-full mt-2"
            >
              Clear Downloads Cache
            </Button>
          </div>

          {/* Misc Cache */}
          <div className="p-4 bg-light-grey-1 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3
                  className={`text-primary-colour font-medium ${Magnetik_Regular.className}`}
                >
                  Misc Cache
                </h3>
                <p className="text-xs text-grey-2 mt-1">
                  Access tokens, login data, preferences, and app settings
                </p>
              </div>
              <span className="text-sm text-primary-colour font-medium">
                {formatBytes(cacheStats.localStorage)}
              </span>
            </div>
            <Button
              variant="bordered"
              size="sm"
              onPress={handleClearMiscCache}
              isDisabled={isClearing || isCalculating}
              startContent={<Trash2 size={16} />}
              className="w-full mt-2"
            >
              Clear Misc Cache
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            variant="bordered"
            size="sm"
            onPress={calculateCacheSizes}
            isDisabled={isClearing || isCalculating}
            startContent={<RefreshCw size={16} />}
            className="w-full"
          >
            {isCalculating ? "Calculating..." : "Refresh Cache Sizes"}
          </Button>

          {/* Clear All Section */}
          <div className="pt-4 border-t border-light-grey-2">
            {!showConfirmation ? (
              <Button
                variant="small"
                onPress={handleClearAll}
                isDisabled={isClearing}
                startContent={<AlertTriangle size={16} />}
                className="w-full bg-red text-white"
              >
                Clear All Caches
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red/10 border border-red rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={20} className="text-red flex-shrink-0 mt-0.5" />
                    <div>
                      <p className={`text-sm text-red font-medium ${Magnetik_Bold.className}`}>
                        Warning: This action cannot be undone
                      </p>
                      <p className="text-xs text-grey-2 mt-1">
                        This will delete all local data including login session, saved stories,
                        and preferences. You will be logged out.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="bordered"
                    size="sm"
                    onPress={() => setShowConfirmation(false)}
                    isDisabled={isClearing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="small"
                    onPress={handleClearAll}
                    isDisabled={isClearing}
                    className="flex-1 bg-red text-white"
                  >
                    {isClearing ? "Clearing..." : "Confirm Clear All"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Total Size */}
          <div className="pt-2 text-center">
            <p className="text-xs text-grey-2">
              Total Cache Size:{" "}
              <span className="font-medium text-primary-colour">
                {formatBytes(cacheStats.total)}
              </span>
            </p>
          </div>
        </div>
      </ModalBody>
    </>
  );
};

export default ClearCacheModal;
