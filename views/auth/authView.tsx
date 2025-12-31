"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ONBOARDING_CONFIG } from "@/config/onboarding";

import Image from "next/image";

export default function AuthView() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center text-primary-colour body-text-big-bold-auto">
        Welcome to Storytime
      </div>

      <div>
        <div
          className={`w-full flex justify-center mb-6 h-[${ONBOARDING_CONFIG.layout.imageHeight}px]`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="auth-divider"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: ONBOARDING_CONFIG.animation.duration,
                ease: ONBOARDING_CONFIG.animation.easing,
              }}
              className="flex items-center justify-center"
            >
              <Image
                src={"/images/onboarding1.png"}
                alt="Auth Divider"
                width={260}
                height={260}
                className="object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <Link href="/auth/login">
            <Button variant="large">Log In</Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="skip">Sign Up</Button>
          </Link>
        </div>

        {/* Divider */}
        <div className="flex items-center invisible my-4">
          <div className="flex-1 border-t border-light-grey-1"></div>
          <div className="px-4 body-text-small-regular text-[#708090] body-text-small-auto-regular">
            or
          </div>
          <div className="flex-1 border-t border-light-grey-1"></div>
        </div>

        <Button
          variant="google"
          startContent={<div className="w-5 h-5 rounded bg-grey-1"></div>}
          className="invisible"
        >
          Continue with Google
        </Button>
      </div>

      {/* Terms */}
      <div className="mt-4 text-center">
        <p className="body-text-small-regular text-grey-2">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="font-bold text-primary-colour hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-bold text-primary-colour hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
