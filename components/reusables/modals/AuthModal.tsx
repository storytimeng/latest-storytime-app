"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ArrowLeft, Mail, UserPlus } from "lucide-react";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import LoginView from "@/views/auth/loginView";
import SignupView from "@/views/auth/signupView";
import ForgotPasswordView from "@/views/auth/forgotPasswordView";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { showToast } from "@/lib/showNotification";

export const AuthModal = () => {
  const { isOpen, view, closeModal, setView } = useAuthModalStore();
  const [dragY, setDragY] = useState(0);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    closeModal();
  };

  const handleSwitchView = (newView: string) => {
    setView(newView as any);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const delta = (e.touches[0]?.clientY ?? 0) - touchStartYRef.current;
    if (delta > 0) {
      setDragY(Math.min(delta, 180));
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 85) {
      setDragY(0);
      closeModal();
    } else {
      setDragY(0);
    }
    touchStartYRef.current = null;
  };

  const renderChoiceView = () => (
    <div className="space-y-5 pt-2">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-complimentary-colour/15 text-complimentary-colour mx-auto">
          <span className={`text-xl ${Magnetik_Bold.className}`}>S</span>
        </div>
        <h2 className={`text-xl text-primary-colour ${Magnetik_Bold.className}`}>
          Welcome to Storytime
        </h2>
        <p className={`text-xs text-primary-shade-3 ${Magnetik_Regular.className}`}>
          Sign in or create an account to save your library, sync reading progress, and write stories.
        </p>
      </div>

      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={() => handleSwitchView("login")}
          className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-primary-colour text-white text-sm hover:opacity-95 transition-opacity ${Magnetik_Medium.className}`}
        >
          <Mail className="w-4 h-4" />
          Sign in with Email
        </button>

        <button
          type="button"
          onClick={() => handleSwitchView("signup")}
          className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-complimentary-colour text-white text-sm hover:opacity-95 transition-opacity ${Magnetik_Medium.className}`}
        >
          <UserPlus className="w-4 h-4" />
          Create a Free Account
        </button>

        <div className="relative flex items-center py-1">
          <div className="flex-1 border-t border-light-grey-2" />
          <span className={`px-3 text-[11px] text-primary-shade-3 ${Magnetik_Regular.className}`}>
            or
          </span>
          <div className="flex-1 border-t border-light-grey-2" />
        </div>

        <button
          type="button"
          onClick={() => {
            showToast({
              type: "info",
              message: "Google sign-in is coming soon — please use Email for now.",
            });
          }}
          className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-light-grey-2 bg-white text-primary-colour text-sm hover:bg-accent-shade-1 transition-colors ${Magnetik_Medium.className}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      <button
        type="button"
        onClick={closeModal}
        className={`w-full text-center text-xs text-primary-shade-3 hover:text-primary-colour pt-1 ${Magnetik_Regular.className}`}
      >
        Maybe later, keep browsing
      </button>
    </div>
  );

  const renderView = () => {
    switch (view) {
      case "choice":
        return renderChoiceView();
      case "login":
        return (
          <LoginView
            onSuccess={handleSuccess}
            onSwitchView={handleSwitchView}
          />
        );
      case "signup":
        return (
          <SignupView
            onSuccess={handleSuccess}
            onSwitchView={handleSwitchView}
          />
        );
      case "forgot-password":
        return (
          <ForgotPasswordView
            onSuccess={() => handleSwitchView("login")}
            onBack={() => handleSwitchView("login")}
          />
        );
      default:
        return renderChoiceView();
    }
  };

  return (
    <div
      data-auth-modal
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={closeModal}
    >
      <div
        data-auth-allow
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={
          dragY > 0
            ? { transform: `translateY(${dragY}px)`, transition: "none" }
            : undefined
        }
        className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[88vh] overflow-y-auto no-scrollbar"
      >
        {/* Swipe handle + top bar */}
        <div className="flex items-center justify-between mb-2">
          {view !== "choice" ? (
            <button
              type="button"
              onClick={() => setView("choice")}
              className="p-1.5 rounded-full text-primary-shade-3 hover:text-primary-colour hover:bg-accent-shade-1 transition-colors"
              aria-label="Back to options"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-7" />
          )}

          <div className="w-10 h-1 rounded-full bg-light-grey-2" />

          <button
            type="button"
            onClick={closeModal}
            className="p-1.5 rounded-full text-primary-shade-3 hover:text-primary-colour hover:bg-accent-shade-1 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {renderView()}
      </div>
    </div>
  );
};
