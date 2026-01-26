/**
 * Offline Manager Component
 * Handles synchronization lifecycle and global UI indicators
 */

"use client";

import React, { useEffect } from "react";
import { setupSyncListeners, processSyncQueue } from "@/lib/offline/syncProcessor";
import { OfflineBanner } from "./OfflineBanner";

export const OfflineManager = () => {
  useEffect(() => {
    // Initialize sync listeners when the app mounts
    setupSyncListeners();
    
    // Initial sync attempt in case we started online with pending items
    processSyncQueue();
  }, []);

  return <OfflineBanner />;
};
