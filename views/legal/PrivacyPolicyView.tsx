"use client";

import React from "react";
import useSWR from "swr";
import { Skeleton } from "@heroui/skeleton";
import { PageHeader } from "@/components/reusables/customUI";
import { Magnetik_Bold, Magnetik_Regular } from "@/lib/font";
import { isHtmlContent, sanitizeRichHtml } from "@/lib/sanitizeRichHtml";
import { termsAndPolicyControllerGetPrivacyPolicy } from "@/src/client";
import { APP_CONFIG } from "@/config/app";

const PrivacyPolicyView = () => {
  const fetchPrivacy = async () => {
    const response = (await termsAndPolicyControllerGetPrivacyPolicy()) as any;
    return response?.data?.data || response?.data;
  };

  const { data, isLoading, error } = useSWR(
    "privacy-policy-page",
    fetchPrivacy,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60 * 60 * 1000,
    },
  );

  const content = typeof data === "string" ? data : data?.content || "";

  const title = data?.title || "Privacy Policy";
  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-accent-shade-1">
      <div className="px-4 pt-4 pb-6">
        <PageHeader
          title="Privacy Policy"
          backLink="/"
          titleClassName="text-lg font-medium text-primary-colour"
          backButtonClassName="text-primary-colour"
          showBackButton={true}
        />
      </div>

      <div className="px-5 pb-12 max-w-3xl mx-auto">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-4/5 rounded-lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p
              className={`text-primary-colour/60 ${Magnetik_Regular.className}`}
            >
              Could not load the privacy policy.
            </p>
            <p
              className={`text-xs mt-2 text-primary-colour/40 ${Magnetik_Regular.className}`}
            >
              Please check your connection and try again.
            </p>
          </div>
        ) : !content ? (
          <div className="text-center py-12">
            <p
              className={`text-primary-colour/40 ${Magnetik_Regular.className}`}
            >
              No privacy policy available at this time.
            </p>
          </div>
        ) : (
          <article>
            <header className="mb-6">
              <h1
                className={`text-2xl font-bold text-primary-colour mb-2 ${Magnetik_Bold.className}`}
              >
                {title}
              </h1>
              {updatedAt && (
                <p
                  className={`text-xs text-primary-colour/40 ${Magnetik_Regular.className}`}
                >
                  Last updated: {updatedAt}
                </p>
              )}
            </header>

            <div
              className={`text-sm text-primary-colour/80 leading-relaxed ${Magnetik_Regular.className}`}
            >
              {isHtmlContent(content) ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichHtml(content),
                  }}
                />
              ) : (
                <div className="whitespace-pre-wrap">{content}</div>
              )}
            </div>

            <footer className="mt-12 pt-6 border-t border-primary-colour/10">
              <p
                className={`text-xs text-primary-colour/40 text-center ${Magnetik_Regular.className}`}
              >
                {APP_CONFIG.name} © {new Date().getFullYear()}
              </p>
            </footer>
          </article>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
