"use client";

import React from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useUserAchievements } from "@/src/hooks/useUserAchievements";
import { Skeleton } from "@heroui/skeleton";

export const CertificateModal = () => {
  const { certificates, isLoading } = useUserAchievements();

  if (isLoading) {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className={`text-xl ${Magnetik_Bold.className}`}>Certificates</h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-lg bg-accent-shade-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </ModalBody>
      </>
    );
  }

  if (certificates.length === 0) {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className={`text-xl ${Magnetik_Bold.className}`}>Certificates</h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="py-8 text-center">
            <div className="mb-4 text-6xl">📜</div>
            <p className={`text-grey-3 ${Magnetik_Regular.className}`}>
              No certificates yet
            </p>
            <p
              className={`text-sm text-grey-4 mt-2 ${Magnetik_Regular.className}`}
            >
              Complete achievements to earn certificates
            </p>
          </div>
        </ModalBody>
      </>
    );
  }

  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Certificates</h2>
        <p className="text-sm text-grey-3">{certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned</p>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="p-4 rounded-lg bg-accent-shade-1 border border-grey-5">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📜</div>
                <div className="flex-1">
                  <h3 className={`text-base ${Magnetik_Medium.className} text-primary-colour`}>
                    {cert.name}
                  </h3>
                  {cert.description && (
                    <p className={`text-sm text-grey-3 mt-1 ${Magnetik_Regular.className}`}>
                      {cert.description}
                    </p>
                  )}
                  {cert.issuedAt && (
                    <p className="text-xs text-grey-3 mt-2">
                      Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ModalBody>
    </>
  );
};
