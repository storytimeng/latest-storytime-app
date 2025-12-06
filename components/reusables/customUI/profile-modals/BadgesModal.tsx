"use client";

import React, { useState } from "react";
import { ModalHeader, ModalBody } from "@heroui/modal";
import { Magnetik_Bold, Magnetik_Medium } from "@/lib/font";
import { useUserAchievements } from "@/src/hooks/useUserAchievements";
import { Skeleton } from "@heroui/skeleton";
import { ChevronLeft, Lock } from "lucide-react";
import { Button } from "@heroui/button";

// Badge designs mapping
const badgeDesigns: Record<string, { color: string; icon: string; name: string }> = {
  'innocent': { color: 'from-green-300 to-green-400', icon: '😇', name: 'Innocent' },
  'explorer': { color: 'from-green-500 to-green-600', icon: '🔍', name: 'Explorer' },
  'magician': { color: 'from-orange-400 to-orange-500', icon: '⭐', name: 'Magician' },
  'creator': { color: 'from-blue-400 to-blue-500', icon: '😎', name: 'Creator' },
  'hero': { color: 'from-yellow-400 to-yellow-500', icon: '🦸', name: 'Hero' },
  'ruler': { color: 'from-purple-500 to-purple-600', icon: '👑', name: 'Ruler' },
  'dangerous': { color: 'from-red-500 to-red-600', icon: '🔥', name: 'Dangerous' },
};

// Badge card component
const BadgeCard = ({ 
  badge, 
  isPending = false,
  onClick 
}: { 
  badge: any; 
  isPending?: boolean;
  onClick?: () => void;
}) => {
  const design = badgeDesigns[badge.category || 'innocent'] || badgeDesigns.innocent;
  
  return (
    <div 
      className={`relative cursor-pointer ${isPending ? 'opacity-60' : ''}`}
      onClick={onClick}
    >
      {/* Badge Circle */}
      <div className={`w-full aspect-square rounded-full bg-gradient-to-br ${design.color} flex items-center justify-center relative border-4 border-white shadow-lg`}>
        {/* Top text */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white uppercase tracking-wider">
          {design.name}
        </div>
        
        {/* Icon */}
        <div className="text-4xl">
          {design.icon}
        </div>
        
        {/* Bottom text */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white uppercase tracking-wider">
          {badge.category || 'Explorer'}
        </div>
        
        {/* Decorative stars */}
        <div className="absolute top-6 left-4 text-white text-xs">★</div>
        <div className="absolute top-6 right-4 text-white text-xs">★</div>
      </div>
      
      {/* Title */}
      <div className="text-center mt-2">
        <p className={`text-sm text-primary-colour ${Magnetik_Medium.className}`}>
          Celebrating
        </p>
        <p className={`text-sm text-primary-colour ${Magnetik_Medium.className}`}>
          {badge.name}
        </p>
      </div>
    </div>
  );
};

export const BadgesModal = () => {
  const { badges, isLoading } = useUserAchievements();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  // Parse badge data
  const parseBadge = (badge: any) => {
    return {
      ...badge,
      category: badge.category || 'explorer',
      name: badge.name || badge.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };
  };

  const earnedBadges = badges.map(parseBadge);
  
  // Mock pending badges (these would come from API in real implementation)
  const pendingBadges = [
    { id: 'magician', category: 'magician', name: '500 Stories' },
    { id: 'creator', category: 'creator', name: '1k Stories' },
    { id: 'hero', category: 'hero', name: '5k Stories' },
    { id: 'ruler', category: 'ruler', name: '10k Stories' },
    { id: 'dangerous', category: 'dangerous', name: '20k Stories' },
  ].filter(p => !earnedBadges.find(e => e.id === p.id));

  if (isLoading) {
    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className={`text-xl ${Magnetik_Bold.className}`}>Badges</h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="grid grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-full" />
            ))}
          </div>
        </ModalBody>
      </>
    );
  }

  // Detail view
  if (selectedBadge) {
    const design = badgeDesigns[selectedBadge.category || 'innocent'] || badgeDesigns.innocent;
    
    return (
      <>
        <ModalHeader className="flex items-center gap-3 pb-4">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onClick={() => setSelectedBadge(null)}
          >
            <ChevronLeft size={20} />
          </Button>
          <h2 className={`text-lg ${Magnetik_Bold.className} flex-1 text-center -ml-10`}>
            {design.name}
          </h2>
        </ModalHeader>
        <ModalBody className="pb-6">
          <div className="space-y-6">
            {/* Large Badge */}
            <div className="flex justify-center">
              <div className={`w-64 h-64 rounded-full bg-gradient-to-br ${design.color} flex items-center justify-center relative border-8 border-white shadow-xl`}>
                {/* Top text */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-base font-bold text-white uppercase tracking-wider">
                  {design.name}
                </div>
                
                {/* Icon */}
                <div className="text-8xl">
                  {design.icon}
                </div>
                
                {/* Bottom text */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-base font-bold text-white uppercase tracking-wider">
                  {selectedBadge.category || 'Explorer'}
                </div>
                
                {/* Decorative stars */}
                <div className="absolute top-16 left-12 text-white text-2xl">★</div>
                <div className="absolute top-16 right-12 text-white text-2xl">★</div>
              </div>
            </div>

            {/* Badge name */}
            <div className="text-center">
              <h3 className={`text-xl ${Magnetik_Bold.className}`}>
                Celebrating {selectedBadge.name}
              </h3>
            </div>

            {/* Obtained date */}
            <div className="bg-grey-5 rounded-lg p-4 text-center">
              <p className={`text-base ${Magnetik_Medium.className}`}>
                Obtained on {selectedBadge.earnedAt ? new Date(selectedBadge.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '16 Jun, 2024'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="bordered"
                className="flex-1 border-2 border-primary-colour"
                onClick={() => setSelectedBadge(null)}
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
        <h2 className={`text-xl ${Magnetik_Bold.className}`}>Badges</h2>
      </ModalHeader>
      <ModalBody className="pb-6">
        <div className="space-y-6">
          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="grid grid-cols-2 gap-6">
              {earnedBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  onClick={() => setSelectedBadge(badge)}
                />
              ))}
            </div>
          )}

          {/* Pending Badges */}
          {pendingBadges.length > 0 && (
            <div>
              <h3 className={`text-base ${Magnetik_Medium.className} mb-3 flex items-center gap-2`}>
                Pending Badges <Lock size={16} className="text-grey-3" />
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {pendingBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    isPending
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {earnedBadges.length === 0 && pendingBadges.length === 0 && (
            <div className="text-center py-8">
              <p className={`text-grey-3 ${Magnetik_Medium.className}`}>
                No badges available
              </p>
            </div>
          )}
        </div>
      </ModalBody>
    </>
  );
};
