"use client";

import React from "react";
import { useAuthModalStore } from "@/src/stores/useAuthModalStore";
import LoginView from "@/views/auth/loginView";
import SignupView from "@/views/auth/signupView";
import ForgotPasswordView from "@/views/auth/forgotPasswordView";

export const AuthModal = () => {
  const { isOpen, view, closeModal, setView } = useAuthModalStore();

  if (!isOpen) return null;

  const handleSuccess = () => {
    closeModal();
  };

  const handleSwitchView = (newView: string) => {
    setView(newView as any);
  };

  const renderView = () => {
    switch (view) {
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
        return (
          <LoginView
            onSuccess={handleSuccess}
            onSwitchView={handleSwitchView}
          />
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 pb-8 sm:pb-6 shadow-xl relative animate-in slide-in-from-bottom sm:fade-in sm:zoom-in duration-300 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto no-scrollbar">
        {renderView()}
      </div>
    </div>
  );
};
