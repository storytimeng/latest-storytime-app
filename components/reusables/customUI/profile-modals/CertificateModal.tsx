"use client";

import React, { useState } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium, Magnetik_Regular } from "@/lib/font";
import { useUserAchievements } from "@/src/hooks/useUserAchievements";
import { Skeleton } from "@heroui/skeleton";
import { ChevronLeft, X, Lock } from "lucide-react";
import { Button } from "@heroui/button";

// Certificate card component
const CertificateCard = ({ 
  certificate, 
  isPending = false,
  onClick 
}: { 
  certificate: any; 
  isPending?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div 
      className={`relative cursor-pointer ${isPending ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* Certificate Image/Card */}
      <div className="relative bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-900 rounded-sm overflow-hidden aspect-[3/2]">
        {/* Certificate Content */}
        <div className="absolute inset-0 p-3 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] font-serif text-amber-900">
              <div className="font-bold">StoryTime</div>
            </div>
            <div className="text-[8px] text-center text-amber-900">
              <div className="font-bold">CERTIFICATE</div>
              <div className="text-[6px]">OF ACHIEVEMENT</div>
            </div>
          </div>
          
          {/* Badge */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center border-4 border-amber-900 relative">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[6px] font-bold text-white">
                  CELEBRATING
                </div>
                <div className="text-2xl font-bold text-white">
                  {certificate.count || "1"}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-bold text-white whitespace-nowrap">
                  {certificate.unit || "STORIES"}
                </div>
              </div>
              {/* Ribbon */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-8 bg-gradient-to-b from-orange-500 to-orange-600 clip-ribbon"></div>
            </div>
          </div>
          
          {/* Congratulations text */}
          <div className="text-center text-[8px] text-amber-900 font-serif italic">
            Congratulations
          </div>
        </div>
      </div>
      
      {/* Title */}
      <div className="text-center mt-2">
        <p className={`text-sm text-primary-colour ${Magnetik_Medium.className}`}>
          Celebrating
        </p>
        <p className={`text-sm text-primary-colour ${Magnetik_Medium.className}`}>
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
            <div className="bg-gradient-to-br from-amber-100 to-amber-50 border-4 border-amber-900 rounded-sm p-6 aspect-[3/2] flex flex-col">
              {/* Header */}
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
              
              {/* Badge */}
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
                    {/* Stars */}
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-white rounded-full"></div>
                      ))}
                    </div>
                  </div>
                  {/* Ribbon */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-orange-500 to-orange-600"></div>
                </div>
              </div>
              
              {/* Congratulations */}
              <div className="text-center text-sm text-amber-900 font-serif italic mt-4">
                <div className="text-lg">Congratulations</div>
                <div className="text-xs mt-2">Congratulations on writing {selectedCertificate.count} stories on Storytime.</div>
                <div className="text-xs">This is a big achievement in your creative writing journey.</div>
              </div>
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

          {/* Pending Certificates */}
          {pendingCertificates.length > 0 && (
            <div>
              <h3 className={`text-base ${Magnetik_Medium.className} mb-3 flex items-center gap-2`}>
                Pending Certificates <Lock size={16} className="text-grey-3" />
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {pendingCertificates.map((cert) => (
                  <CertificateCard
                    key={cert.id}
                    certificate={cert}
                    isPending
                  />
                ))}
              </div>
            </div>
          )}

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
