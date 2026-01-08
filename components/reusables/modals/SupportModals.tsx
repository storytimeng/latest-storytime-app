"use client";

import React, { useEffect, useState } from "react";
import { X, ExternalLink, Mail, Phone, MessageSquare } from "lucide-react";
import { useSupportStore, SupportViewType } from "@/src/stores/useSupportStore";
import {
  faqsControllerFindAll,
  termsAndPolicyControllerGetTerms,
  termsAndPolicyControllerGetPrivacyPolicy,
  supportControllerFindActive,
} from "@/src/client";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { Skeleton } from "@heroui/skeleton";

export const SupportModals = () => {
  const { isOpen, view, closeModal, setView } = useSupportStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        let response: any;
        switch (view) {
          case "faqs":
            response = await faqsControllerFindAll();
            break;
          case "terms":
            response = await termsAndPolicyControllerGetTerms();
            break;
          case "privacy":
            response = await termsAndPolicyControllerGetPrivacyPolicy();
            break;
          case "support":
            response = await supportControllerFindActive();
            break;
        }
        setData(response?.data?.data || response?.data);
      } catch (error) {
        console.error(`Failed to fetch ${view}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, view]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-5/6 rounded-lg" />
        </div>
      );
    }

    if (!data) {
      return (
        <div className="text-center py-8 text-primary/40">
          No information available at this time.
        </div>
      );
    }

    switch (view) {
      case "faqs":
        return (
          <div className="space-y-6">
            {Array.isArray(data) ? (
              data.map((faq: any) => (
                <div key={faq.id} className="space-y-2">
                  <h4 className={`text-lg font-bold text-primary ${Magnetik_Bold.className}`}>
                    {faq.question}
                  </h4>
                  <p className={`text-sm text-primary/70 leading-relaxed ${Magnetik_Regular.className}`}>
                    {faq.answer}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-primary/70">No FAQs found.</p>
            )}
          </div>
        );
      case "terms":
      case "privacy":
        return (
          <div className="prose prose-sm prose-invert max-w-none">
            <h3 className={`text-xl font-bold text-primary mb-4 ${Magnetik_Bold.className}`}>
              {view === "terms" ? "Terms of Service" : "Privacy Policy"}
            </h3>
            <div 
              className={`text-sm text-primary/80 leading-relaxed whitespace-pre-wrap ${Magnetik_Regular.className}`}
              dangerouslySetInnerHTML={{ __html: data.content || data }}
            />
          </div>
        );
      case "support":
        return (
          <div className="space-y-6">
            <h3 className={`text-xl font-bold text-primary mb-2 ${Magnetik_Bold.className}`}>
              Contact Support
            </h3>
            <p className={`text-sm text-primary/70 mb-6 ${Magnetik_Regular.className}`}>
              Need help? Reach out to our team through any of the channels below.
            </p>
            
            <div className="space-y-4">
              {data.email && (
                <a href={`mailto:${data.email}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-primary/40">Email</p>
                    <p className="text-sm font-medium text-primary">{data.email}</p>
                  </div>
                </a>
              )}
              {data.phone && (
                <a href={`tel:${data.phone}`} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-primary/40">Phone</p>
                    <p className="text-sm font-medium text-primary">{data.phone}</p>
                  </div>
                </a>
              )}
              {data.whatsapp && (
                <a href={`https://wa.me/${data.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-primary/40">WhatsApp</p>
                    <p className="text-sm font-medium text-primary">Chat with us</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div 
        className="bg-accent-shade-1 border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl relative animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {(["faqs", "terms", "privacy", "support"] as SupportViewType[]).map((t) => (
              <button
                key={t}
                onClick={() => setView(t)}
                className={`text-sm font-medium whitespace-nowrap px-4 py-2 rounded-full transition-all ${
                  view === t 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-primary/40 hover:text-primary hover:bg-white/5"
                }`}
              >
                {t === "faqs" ? "FAQs" : t === "terms" ? "Terms" : t === "privacy" ? "Privacy" : "Support"}
              </button>
            ))}
          </div>
          <button
            onClick={closeModal}
            className="p-2 text-primary/40 hover:text-primary hover:bg-white/10 rounded-full transition-colors ml-4"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 text-center">
          <p className="text-[10px] text-primary/20 uppercase tracking-widest font-bold">
            Antigravity Storytime © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};
