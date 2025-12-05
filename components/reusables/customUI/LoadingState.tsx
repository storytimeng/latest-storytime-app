import React from "react";
import { Spinner } from "@heroui/spinner";

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
}

/**
 * Reusable loading state component
 * Used as Suspense fallback and for async operations
 */
const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading...",
  showSpinner = true 
}) => {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        {showSpinner && (
          <Spinner 
            size="lg" 
            color="primary"
            label={message}
          />
        )}
        {!showSpinner && (
          <div className="text-primary-colour">{message}</div>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
