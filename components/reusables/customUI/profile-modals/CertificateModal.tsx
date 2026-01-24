"use client";

import React, { useState } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useUserAchievements } from "@/src/hooks/useUserAchievements";
import { Skeleton } from "@heroui/skeleton";
import { ChevronLeft, X, Lock } from "lucide-react";
import { Button } from "@heroui/button";
import Image from "next/image";

// Certificate card component
const CertificateCard = ({ 
  certificate, 
  isPending = false,
  isLocked = false,
  onClick 
}: { 
  certificate: any; 
  isPending?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${isPending || isLocked ? 'opacity-40 grayscale' : 'hover:scale-105'}`}
      onClick={onClick}
    >
      {/* Certificate Image/Card */}
      <div className={`relative border-4 rounded-sm overflow-hidden aspect-[3/2] ${isLocked ? 'bg-grey-5 border-grey-4' : 'bg-gradient-to-br from-amber-100 to-amber-50 border-amber-900 shadow-md'}`}>
        {certificate.imageUrl && !isLocked ? (
          <Image 
            src={certificate.imageUrl} 
            alt={certificate.name} 
            fill 
            className="object-cover"
          />
        ) : (
          /* Certificate Content Fallback */
          <div className="absolute inset-0 p-3 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div className={`text-[10px] font-serif ${isLocked ? 'text-grey-4' : 'text-amber-900'}`}>
                <div className="font-bold">StoryTime</div>
              </div>
              <div className={`text-[8px] text-center ${isLocked ? 'text-grey-4' : 'text-amber-900'}`}>
                <div className="font-bold">CERTIFICATE</div>
                <div className="text-[6px]">OF ACHIEVEMENT</div>
              </div>
            </div>
            
            {/* Badge */}
            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 relative ${isLocked ? 'bg-grey-4 border-grey-5' : 'bg-gradient-to-br from-orange-500 to-orange-600 border-amber-900'}`}>
                  <div className={`absolute -top-1 left-1/2 -translate-x-1/2 text-[6px] font-bold ${isLocked ? 'text-grey-5' : 'text-white'}`}>
                    CELEBRATING
                  </div>
                  <div className={`text-2xl font-bold ${isLocked ? 'text-grey-5' : 'text-white'}`}>
                    {isLocked ? '?' : (certificate.count || "1")}
                  </div>
                  {!isLocked && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-bold text-white whitespace-nowrap">
                      {certificate.unit || "STORIES"}
                    </div>
                  )}
                </div>
                {/* Ribbon */}
                {!isLocked && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-8 bg-gradient-to-b from-orange-500 to-orange-600 clip-ribbon"></div>}
              </div>
            </div>
            
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Lock size={20} className="text-white/30" />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Title */}
      <div className="text-center mt-2">
        <p className={`text-[10px] text-primary-shade-3 uppercase tracking-tighter ${Magnetik_Medium.className}`}>
          {isLocked ? "Hidden Certificate" : "Celebrating"}
        </p>
        <p className={`text-sm text-primary-colour ${isLocked ? 'blur-[3px] select-none' : ''} ${Magnetik_Medium.className}`}>
          {certificate.name}
        </p>
      </div>
    </div>
  );
};

export const CertificateModal = () => {
  const { certificates, isLoading } = useUserAchievements();
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  // Parse certificate data
  const parseCertificate = (cert: any) => {
    const parts = cert.id.split('_');
    const count = parts[0];
    const unit = parts.slice(1).join(' ').toUpperCase();
    return {
      ...cert,
      count,
      unit,
      name: `${count} ${parts.slice(1).join(' ').replace(/_/g, ' ')}`.replace(/\b\w/g, l => l.toUpperCase())
    };
  };

  const earnedCertificates = certificates.map(parseCertificate);
  
  // Mock pending certificates (these would come from API in real implementation)
  const pendingCertificates = [
    { id: '5_stories', count: '5', unit: 'STORIES', name: '5 Stories' },
    { id: '10_stories', count: '10', unit: 'STORIES', name: '10 Stories' },
    { id: '20_stories', count: '20', unit: 'STORIES', name: '20 Stories' },
    { id: '30_stories', count: '30', unit: 'STORIES', name: '30 Stories' },
    { id: '75_stories', count: '75', unit: 'STORIES', name: '75 Stories' },
    { id: '500_stories', count: '500', unit: 'STORIES', name: '500 Stories' },
    { id: '1000_stories', count: '1000', unit: 'STORIES', name: '1000 Stories' },
    { id: '2000_stories', count: '2000', unit: 'STORIES', name: '2000 Stories' },
    { id: '5000_stories', count: '5000', unit: 'STORIES', name: '5000 Stories' },
  ].filter(p => !earnedCertificates.find(e => e.id === p.id));

  if (isLoading) {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className={`text-xl ${Magnetik_Bold.className}`}>Certificates</h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[3/2] rounded" />
            ))}
          </div>
        </ModalBody>
      </>
    );
  }

  // Detail view
  if (selectedCertificate) {
    return (
      <>
        <ModalHeader className="flex items-center gap-3 pb-4">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={() => setSelectedCertificate(null)}
          >
            <ChevronLeft size={20} />
          </Button>
          <h2 className={`text-lg ${Magnetik_Bold.className} flex-1 text-center -ml-10`}>
            Celebrating {selectedCertificate.name}
          </h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="space-y-6">
            {/* Large Certificate */}
            <div className={`relative border-8 rounded-sm overflow-hidden aspect-[3/2] flex flex-col ${!selectedCertificate.imageUrl ? 'bg-gradient-to-br from-amber-100 to-amber-50 border-amber-900 p-6' : 'border-amber-900 shadow-xl'}`}>
              {selectedCertificate.imageUrl ? (
                <Image 
                  src={selectedCertificate.imageUrl} 
                  alt={selectedCertificate.name} 
                  fill 
                  className="object-contain"
                />
              ) : (
                <>
                  {/* Fallback detailed view */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-serif text-amber-900">
                      <div className="font-bold text-base">StoryTime</div>
                    </div>
                    <div className="text-xs text-center text-amber-900">
                      <div className="font-bold text-sm">CERTIFICATE</div>
                      <div className="text-[10px]">OF ACHIEVEMENT</div>
                      <div className="text-[8px] mt-1">THIS CERTIFICATE IS PRESENTED TO:</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-8 border-amber-900 relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-white">
                          CELEBRATING
                        </div>
                        <div className="text-5xl font-bold text-white">
                          {selectedCertificate.count}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-white">
                          {selectedCertificate.unit}
                        </div>
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-orange-500 to-orange-600"></div>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-amber-900 font-serif italic mt-4">
                    <div className="text-lg">Congratulations</div>
                    <div className="text-xs mt-2">Congratulations on writing {selectedCertificate.count} stories on Storytime.</div>
                  </div>
                </>
              )}
            </div>
            {/* Obtained date */}
            <div className="bg-grey-5 rounded-lg p-4 text-center">
              <p className={`text-base ${Magnetik_Medium.className}`}>
                Obtained on {selectedCertificate.issuedAt ? new Date(selectedCertificate.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '16 Jun, 2024'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="bordered"
                className="flex-1 border-2 border-primary-colour"
                onClick={() => setSelectedCertificate(null)}
              >
                <span className={Magnetik_Medium.className}>Cancel</span>
              </Button>
              <Button
                className="flex-1 bg-primary-colour text-white"
                onClick={() => {
                  if (selectedCertificate.imageUrl) {
                    window.open(selectedCertificate.imageUrl, "_blank");
                  }
                }}
              >
                <span className={Magnetik_Medium.className}>Download</span>
              </Button>
            </div>
          </div>
        </ModalBody>
      </>
    );
  }

  // Main grid view
  return (
    <>
      <ModalHeader className="flex flex-col gap-1">
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Certificates</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-6">
          {/* Earned Certificates */}
          {earnedCertificates.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {earnedCertificates.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  onClick={() => setSelectedCertificate(cert)}
                />
              ))}
            </div>
          )}

          {/* Pending/Locked Certificates */}
          <div>
            <h3 className={`text-base ${Magnetik_Medium.className} mb-3 flex items-center gap-2`}>
              Locked Achievements <Lock size={16} className="text-grey-3" />
            </h3>
            <div className="grid grid-cols-3 gap-x-4 gap-y-8">
              {/* Actual pending certificates from logic */}
              {pendingCertificates.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  isPending
                />
              ))}
              
              {/* Fill up to about 50 locked achievement skeletons */}
              {[...Array(50)].map((_, i) => (
                <CertificateCard
                  key={`locked-cert-${i}`}
                  certificate={{ name: "Secret Certificate", category: "locked" }}
                  isLocked
                />
              ))}
            </div>
          </div>

          {/* Empty state */}
          {earnedCertificates.length === 0 && pendingCertificates.length === 0 && (
            <div className="text-center py-8">
              <p className={`text-grey-3 ${Magnetik_Medium.className}`}>
                No certificates available
              </p>
            </div>
          )}
        </div>
      </ModalBody>
    </>
  );
};
