"use client";

import React from "react";
import { Button } from "@heroui/react";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push("/app");
  };

  const handleGoHome = () => {
    router.push("/app");
  };

  return (
    <div className="min-h-screen max-w-[28rem] mx-auto relative">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          className={`bg-primary-shade-6 text-universal-white px-4 py-2 rounded-full ${Magnetik_Medium.className}`}
          size="sm"
          onPress={handleGoBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* 404 Illustration */}
        <div className="w-40 h-40 mb-8 flex items-center justify-center bg-complimentary-colour/10 rounded-2xl">
          <FileQuestion className="w-24 h-24 text-complimentary-colour" />
        </div>

        {/* Error Code */}
        <div className="mb-4">
          <h1
            className={`text-6xl text-primary-colour text-center ${Magnetik_Bold.className}`}
          >
            404
          </h1>
        </div>

        {/* Error Message */}
        <h2
          className={`text-xl text-primary-colour text-center mb-4 ${Magnetik_Bold.className}`}
        >
          Page Not Found
        </h2>

        <p
          className={`text-center text-grey-2 mb-12 max-w-sm ${Magnetik_Regular.className}`}
        >
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-sm">
          {/* Home Button */}
          <Button
            className={`w-full bg-primary-shade-6 text-universal-white py-4 rounded-full ${Magnetik_Medium.className}`}
            onPress={handleGoHome}
          >
            <div className="flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              <span className="text-base">Go Home</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
