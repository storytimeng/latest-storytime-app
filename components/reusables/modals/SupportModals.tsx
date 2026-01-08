"use client";

import React, { useEffect, useState, useMemo } from "react";
import useSWR, { preload } from "swr";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { useSupportStore, SupportViewType } from "@/src/stores/useSupportStore";
import {
  faqsControllerFindAll,
  termsAndPolicyControllerGetTerms,
  termsAndPolicyControllerGetPrivacyPolicy,
  supportControllerFindActive,
} from "@/src/client";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { Skeleton } from "@heroui/skeleton";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Accordion, AccordionItem } from "@heroui/accordion";

export const SupportModals = () => {
  const { isOpen, view, closeModal, setView } = useSupportStore();

  const CACHE_TIME = 3 * 60 * 60 * 1000; // 3 hours in ms

  // SWR Fetchers
  const fetchFAQs = async () => {
    const response = await faqsControllerFindAll() as any;
    let result = response?.data?.data || response?.data;
    if (result?.faqs) result = result.faqs;
    return result;
  };

  const fetchTerms = async () => {
    const response = await termsAndPolicyControllerGetTerms() as any;
    return response?.data?.data || response?.data;
  };

  const fetchPrivacy = async () => {
    const response = await termsAndPolicyControllerGetPrivacyPolicy() as any;
    return response?.data?.data || response?.data;
  };

  const fetchSupport = async () => {
    const response = await supportControllerFindActive() as any;
    return response?.data?.data || response?.data;
  };

  // SWR Hooks
  const { data: faqsData, isLoading: isLoadingFAQs } = useSWR(
    isOpen ? "support-faqs" : null,
    fetchFAQs,
    { dedupingInterval: CACHE_TIME, revalidateOnFocus: false }
  );

  const { data: termsData, isLoading: isLoadingTerms } = useSWR(
    isOpen ? "support-terms" : null,
    fetchTerms,
    { dedupingInterval: CACHE_TIME, revalidateOnFocus: false }
  );

  const { data: privacyData, isLoading: isLoadingPrivacy } = useSWR(
    isOpen ? "support-privacy" : null,
    fetchPrivacy,
    { dedupingInterval: CACHE_TIME, revalidateOnFocus: false }
  );

  const { data: supportData, isLoading: isLoadingSupport } = useSWR(
    isOpen ? "support-info" : null,
    fetchSupport,
    { dedupingInterval: CACHE_TIME, revalidateOnFocus: false }
  );

  // Prefetching logic
  useEffect(() => {
    if (isOpen) {
      // Trigger prefetch for all tabs in parallel
      preload("support-faqs", fetchFAQs);
      preload("support-terms", fetchTerms);
      preload("support-privacy", fetchPrivacy);
      preload("support-info", fetchSupport);
    }
  }, [isOpen]);

  // Map data and loading state based on current view
  const { data, isLoading } = useMemo(() => {
    switch (view) {
      case "faqs":
        return { data: faqsData, isLoading: isLoadingFAQs };
      case "terms":
        return { data: termsData, isLoading: isLoadingTerms };
      case "privacy":
        return { data: privacyData, isLoading: isLoadingPrivacy };
      case "support":
        return { data: supportData, isLoading: isLoadingSupport };
      default:
        return { data: null, isLoading: false };
    }
  }, [view, faqsData, termsData, privacyData, supportData, isLoadingFAQs, isLoadingTerms, isLoadingPrivacy, isLoadingSupport]);

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
          <div className="space-y-4">
            {Array.isArray(data) && data.length > 0 ? (
              <Accordion 
                variant="splitted"
                className="px-0"
                itemClasses={{
                  base: "bg-white/5 border border-white/10 rounded-2xl mb-3",
                  title: `text-primary font-bold ${Magnetik_Bold.className}`,
                  content: `text-sm text-primary/70 leading-relaxed ${Magnetik_Regular.className}`,
                  trigger: "py-4",
                }}
              >
                {data.map((faq: any) => (
                  <AccordionItem 
                    key={faq.id} 
                    title={faq.question}
                  >
                    {faq.answer}
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-primary/40">No FAQs found.</p>
              </div>
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
    <Modal 
      isOpen={isOpen} 
      onClose={closeModal}
      scrollBehavior="inside"
      size="2xl"
      placement="auto"
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: 20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      classNames={{
        base: "bg-accent-shade-1 border border-white/10 rounded-3xl m-0 sm:m-4 h-[50vh]",
        header: "border-b border-white/10 p-4 sm:p-6",
        body: "p-4 sm:p-8 custom-scrollbar",
        footer: "border-t border-white/10 p-4 sm:p-6",
        closeButton: "hover:bg-white/10 active:bg-white/20 mt-2 mr-2",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {(["faqs", "terms", "privacy", "support"] as SupportViewType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setView(t)}
                    className={`text-xs sm:text-sm font-medium whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all ${
                      view === t 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-primary/40 hover:text-primary hover:bg-white/5"
                    }`}
                  >
                    {t === "faqs" ? "FAQs" : t === "terms" ? "Terms" : t === "privacy" ? "Privacy" : "Support"}
                  </button>
                ))}
              </div>
            </ModalHeader>
            <ModalBody>
              {renderContent()}
            </ModalBody>
            <ModalFooter className="justify-center">
              <p className="text-[10px] text-primary/20 uppercase tracking-widest font-bold">
                Storytime © {new Date().getFullYear()}
              </p>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
