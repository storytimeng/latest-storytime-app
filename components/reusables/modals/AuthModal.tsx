"use client";

import React from "react";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200 my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={24} />
        </button>

        {renderView()}
      </div>
    </div>
  );
};
